import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { Resend } from 'resend';

admin.initializeApp();
const db = admin.firestore();

// 1. Initialize Stripe & Resend from Environment Config
const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(apiKey, { apiVersion: '2023-10-16' });
};

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY || functions.config().resend?.api_key;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(apiKey);
};

/**
 * 2. Firebase Auth Trigger: onUserCreated
 * Automatically initializes a user profile doc with clinicId and sets default role claims
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email || '';
  const clinicId = user.customClaims?.clinicId || 'clinic_apex_columbus';
  const role = user.customClaims?.role || 'patient';

  // Set default custom claims if not present
  if (!user.customClaims?.role) {
    await admin.auth().setCustomUserClaims(user.uid, {
      role,
      clinicId,
      admin: role === 'admin',
    });
  }

  // Create user document in Firestore
  const userDocRef = db.collection('users').doc(user.uid);
  await userDocRef.set(
    {
      uid: user.uid,
      email,
      displayName: user.displayName || email.split('@')[0],
      role,
      clinicId,
      emailVerified: user.emailVerified || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  functions.logger.info(`Initialized user profile in Firestore for UID: ${user.uid} with clinicId: ${clinicId}`);
});

/**
 * 3. Stripe Webhook Handler
 * Listens for payment_intent.succeeded and charge.refunded events,
 * updates Firestore appointments, and triggers receipts
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    functions.logger.error('Stripe webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const appointmentId = paymentIntent.metadata?.appointmentId;
        const clinicId = paymentIntent.metadata?.clinicId || 'clinic_apex_columbus';

        if (appointmentId) {
          const apptRef = db.collection('appointments').doc(appointmentId);
          await apptRef.set(
            {
              paymentStatus: 'paid_full',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              amountPaid: paymentIntent.amount_received / 100,
            },
            { merge: true }
          );

          // Dispatch confirmation email
          const apptDoc = await apptRef.get();
          const apptData = apptDoc.data();
          if (apptData?.patientEmail) {
            await sendEmailHelper({
              to: apptData.patientEmail,
              subject: 'Booking & Payment Receipt - Vance Health',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px;">
                  <h2 style="color: #064e3b;">Payment Confirmed</h2>
                  <p>Dear ${apptData.patientName || 'Patient'},</p>
                  <p>Your payment of <strong>£${(paymentIntent.amount_received / 100).toFixed(2)}</strong> for your appointment on <strong>${apptData.date} at ${apptData.time}</strong> has been successfully processed.</p>
                  <p>Doctor: Dr. ${apptData.doctorName || 'Sarah Vance'}</p>
                  <p>Reference ID: <code>${appointmentId}</code></p>
                </div>
              `,
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const appointmentId = charge.metadata?.appointmentId;

        if (appointmentId) {
          await db.collection('appointments').doc(appointmentId).set(
            {
              paymentStatus: 'refunded',
              refundedAt: admin.firestore.FieldValue.serverTimestamp(),
              refundId: charge.refunds?.data[0]?.id || '',
            },
            { merge: true }
          );
        }
        break;
      }

      default:
        functions.logger.info(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    functions.logger.error('Error handling Stripe webhook event:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * 4. Resend Email Dispatcher Helper
 */
async function sendEmailHelper(options: { to: string; subject: string; html: string }) {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: 'Vance Health Appointments <appointments@vancehealth.com>',
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });
    functions.logger.info(`Email dispatched successfully to ${options.to}:`, result);
    return result;
  } catch (error) {
    functions.logger.error(`Failed to send email to ${options.to}:`, error);
    return null;
  }
}

/**
 * 5. Callable Cloud Function: sendTransactionalEmail
 * Allows client frontend (admin staff / booking flow) to trigger authenticated notification emails
 */
export const sendTransactionalEmail = functions.https.onCall(async (data, context) => {
  const { type, recipientEmail, patientName, date, time, doctorName, appointmentId } = data;

  if (!recipientEmail || !type) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing recipientEmail or type');
  }

  let subject = 'Appointment Update - Vance Health';
  let html = `<p>Hello ${patientName}, your appointment has an update.</p>`;

  if (type === 'booking_confirmation') {
    subject = `Appointment Confirmed - ${date} at ${time}`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="color: #064e3b; margin-top: 0;">Appointment Confirmed</h2>
        <p>Hi <strong>${patientName}</strong>,</p>
        <p>Your clinical consultation has been confirmed at Vance Health.</p>
        <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 4px 0;"><strong>Attending Clinician:</strong> ${doctorName || 'Dr. Sarah Vance'}</p>
          <p style="margin: 4px 0;"><strong>Reference ID:</strong> <code>${appointmentId}</code></p>
        </div>
        <p>You can access your interactive care plan, home exercises, and calendar download via your Patient Portal.</p>
      </div>
    `;
  } else if (type === 'cancellation') {
    subject = `Appointment Cancelled - ${appointmentId}`;
    html = `<p>Hi ${patientName}, your appointment on ${date} at ${time} has been cancelled as requested.</p>`;
  }

  const result = await sendEmailHelper({ to: recipientEmail, subject, html });
  return { success: !!result, result };
});

/**
 * 6. Scheduled Cleanup Function: cleanupStaleDemoSessions
 * Runs daily at midnight to purge expired temporary preview/demo sessions
 */
export const cleanupStaleDemoSessions = functions.pubsub.schedule('every 24 hours').onRun(async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const snapshot = await db
    .collection('appointments')
    .where('status', '==', 'draft')
    .where('createdAt', '<', thirtyDaysAgo.toISOString())
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  functions.logger.info(`Purged ${snapshot.size} stale demo appointments from Firestore.`);
});
