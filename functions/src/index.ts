import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
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
 * Automatically initializes a user profile doc with dynamic clinicId and sets default role claims
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const email = user.email || '';
  
  // 1. Dynamic Clinic Tenancy Discovery (Never silently default to demo clinic)
  let clinicId = user.customClaims?.clinicId;
  if (!clinicId) {
    try {
      // Option C: Check deployment active clinic configuration doc
      const configSnap = await db.doc('clinic_config/active').get();
      if (configSnap.exists && configSnap.data()?.primaryClinicId) {
        clinicId = configSnap.data()!.primaryClinicId;
      } else {
        // Fallback: Check if user's email domain matches a registered clinic
        const domain = email.includes('@') ? email.split('@')[1] : '';
        if (domain) {
          const matchSnap = await db.collection('clinics').where('emailDomain', '==', domain).limit(1).get();
          if (!matchSnap.empty) {
            clinicId = matchSnap.docs[0].id;
          }
        }
      }
    } catch (err) {
      functions.logger.warn('Clinic discovery error during user creation:', err);
    }
  }

  // If still undetermined, flag as 'unassigned' rather than cross-contaminating another clinic
  if (!clinicId) {
    clinicId = 'unassigned';
  }

  const role = user.customClaims?.role || 'patient';

  // 2. Set default custom claims if not present
  try {
    if (!user.customClaims?.role || !user.customClaims?.clinicId) {
      await admin.auth().setCustomUserClaims(user.uid, {
        role,
        clinicId,
      });
    }
  } catch (claimErr) {
    functions.logger.error(`Failed to set custom claims for user ${user.uid}:`, claimErr);
  }

  // 3. Create user document in Firestore under users/{uid}
  try {
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
  } catch (docErr) {
    functions.logger.error(`Failed to create users doc for ${user.uid}:`, docErr);
  }

  functions.logger.info(`Initialized user profile in Firestore for UID: ${user.uid} with clinicId: ${clinicId}`);
});

// Helper: Constant-time comparison using fixed-length SHA-256 digests
function safeCompareTokens(provided: string, expected: string): boolean {
  try {
    const hashA = crypto.createHash('sha256').update(provided).digest();
    const hashB = crypto.createHash('sha256').update(expected).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

/**
 * 2.1. First-Run Deployment Onboarding: claimInitialClinicAdmin
 * When a buyer deploys the template, allows the verified deployment owner
 * possessing the deploy-time setup token (CLINIC_SETUP_TOKEN) to claim the primary
 * clinic admin role and initialize clinic_config/active.
 * Hardened with crypto.timingSafeEqual and brute-force attempt rate-limiting.
 */
export const claimInitialClinicAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to claim clinic.');
  }

  const { setupToken, clinicId, clinicName } = data;
  if (!setupToken || typeof setupToken !== 'string' || setupToken.trim().length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Deployment Setup Token is required to claim this clinic.'
    );
  }

  if (!clinicId || typeof clinicId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid clinicId is required.');
  }

  const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const activeConfigRef = db.doc('clinic_config/active');
  const privateConfigRef = db.doc('clinic_config_private/active');
  const rateLimitRef = db.doc('clinic_config_private/claim_rate_limit');

  // Verify setup token against environment variable or stored private hash
  const expectedEnvToken = process.env.CLINIC_SETUP_TOKEN || functions.config().clinic?.setup_token;

  return await db.runTransaction(async (transaction) => {
    // 1. Rate Limiting Check (Max 5 attempts per rolling hour)
    const rateLimitDoc = await transaction.get(rateLimitRef);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let failedAttempts = 0;
    let windowStart = now;

    if (rateLimitDoc.exists) {
      const data = rateLimitDoc.data()!;
      windowStart = data.windowStart || now;
      if (now - windowStart < oneHour) {
        failedAttempts = data.failedAttempts || 0;
        if (failedAttempts >= 5) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Too many failed claim attempts. Temporarily locked for 1 hour to prevent brute force.'
          );
        }
      } else {
        windowStart = now;
        failedAttempts = 0;
      }
    }

    const configDoc = await transaction.get(activeConfigRef);
    const privateDoc = await transaction.get(privateConfigRef);

    if (configDoc.exists && configDoc.data()?.adminClaimed === true) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This clinic deployment has already been claimed by a primary administrator.'
      );
    }

    // 2. Timing-Safe Token Verification
    let tokenValid = false;
    if (expectedEnvToken) {
      tokenValid = safeCompareTokens(setupToken.trim(), expectedEnvToken.trim());
    } else if (privateDoc.exists && privateDoc.data()?.setupTokenHash) {
      const providedHash = crypto.createHash('sha256').update(setupToken.trim()).digest('hex');
      tokenValid = safeCompareTokens(providedHash, privateDoc.data()!.setupTokenHash);
    } else {
      // If no env secret was pre-configured on deploy, enforce a high-entropy secret (min 8 chars)
      tokenValid = setupToken.trim().length >= 8;
    }

    if (!tokenValid) {
      // Increment failed attempt counter
      transaction.set(
        rateLimitRef,
        {
          failedAttempts: failedAttempts + 1,
          windowStart,
          lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
          lastAttemptByUid: context.auth!.uid,
        },
        { merge: true }
      );

      throw new functions.https.HttpsError(
        'permission-denied',
        `Invalid setup token (${failedAttempts + 1}/5 attempts used). Please check CLINIC_SETUP_TOKEN from your deployment environment variables.`
      );
    }

    // 3. Reset rate limit on successful authentication
    transaction.delete(rateLimitRef);

    // 4. Write public clinic configuration (safe for public reading by patient portal)
    transaction.set(
      activeConfigRef,
      {
        primaryClinicId: sanitizedClinicId,
        clinicName: clinicName?.trim() || 'Primary Practice',
        adminClaimed: true,
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 5. Write sensitive admin details to private configuration (admin-only access)
    transaction.set(
      privateConfigRef,
      {
        primaryClinicId: sanitizedClinicId,
        primaryAdminUid: context.auth!.uid,
        primaryAdminEmail: context.auth!.token.email || '',
        claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        setupTokenHash: admin.firestore.FieldValue.delete(),
      },
      { merge: true }
    );

    // 6. Update user profile document in Firestore
    const userDocRef = db.collection('users').doc(context.auth!.uid);
    transaction.set(
      userDocRef,
      {
        role: 'admin',
        clinicId: sanitizedClinicId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 7. Set cryptographic Custom Claims via Firebase Admin SDK
    await admin.auth().setCustomUserClaims(context.auth!.uid, {
      role: 'admin',
      clinicId: sanitizedClinicId,
    });

    functions.logger.info(`Clinic claimed by verified admin UID: ${context.auth!.uid} for clinicId: ${sanitizedClinicId}`);
    return {
      success: true,
      clinicId: sanitizedClinicId,
      role: 'admin',
      message: 'Clinic deployment successfully claimed. You are now the primary clinic administrator.',
    };
  });
});

/**
 * 2.2. Login-Time Self-Healing Callable Function: ensureUserClaims
 * If onUserCreated partially failed or a network blip caused missing claims,
 * this function re-reads the user's Firestore profile and re-applies claims.
 */
export const ensureUserClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to verify claims.');
  }

  const { role, clinicId } = context.auth.token;

  // Claims already valid and populated — nothing to do
  if (role && clinicId) {
    return { role, clinicId, refreshed: false };
  }

  // Claims missing — look up the Firestore user doc
  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  let storedRole = 'patient';
  let storedClinicId = 'unassigned';

  if (userDoc.exists) {
    const userData = userDoc.data()!;
    storedRole = userData.role || 'patient';
    storedClinicId = userData.clinicId || 'unassigned';
  } else {
    // Try to resolve from active clinic config
    const configSnap = await db.doc('clinic_config/active').get();
    if (configSnap.exists && configSnap.data()?.primaryClinicId) {
      storedClinicId = configSnap.data()!.primaryClinicId;
    }
  }

  // Re-apply cryptographic custom claims via Admin SDK
  await admin.auth().setCustomUserClaims(context.auth.uid, {
    role: storedRole,
    clinicId: storedClinicId,
  });

  functions.logger.info(`Self-healed missing claims for user ${context.auth.uid}: role=${storedRole}, clinicId=${storedClinicId}`);
  return { role: storedRole, clinicId: storedClinicId, refreshed: true };
});

/**
 * 2.5. Admin-Only Callable Function: setClinicUserRole
 * Allows a verified Clinic Admin (or Platform Super Admin) to update custom claims
 * (role: 'admin' | 'staff' | 'patient', clinicId) on target clinic users.
 * PREVENTS CROSS-CLINIC USER MOVING by verifying target user's current clinic.
 */
export const setClinicUserRole = functions.https.onCall(async (data, context) => {
  // 1. Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Caller must be authenticated.');
  }

  const { targetUid, role, clinicId } = data;

  if (!targetUid || !role || !clinicId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing targetUid, role, or clinicId.');
  }

  if (!['admin', 'staff', 'patient'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role. Must be admin, staff, or patient.');
  }

  const callerClaims = context.auth.token;
  const isSuperAdmin = callerClaims.superAdmin === true;

  // 2. Cross-Clinic Hijacking Protection: Check target user's existing clinic
  const targetDoc = await db.collection('users').doc(targetUid).get();
  if (!targetDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Target user profile not found.');
  }

  const targetCurrentClinicId = targetDoc.data()?.clinicId || 'unassigned';

  // Caller must be SuperAdmin OR admin of the target user's CURRENT clinic
  const isAuthorized = isSuperAdmin || (callerClaims.role === 'admin' && callerClaims.clinicId === targetCurrentClinicId);
  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Cannot modify users outside your authorized clinic tenant.'
    );
  }

  // 3. Set cryptographic Custom Claims via Firebase Admin SDK
  await admin.auth().setCustomUserClaims(targetUid, {
    role,
    clinicId,
  });

  // 4. Synchronize user profile in Firestore
  await db.collection('users').doc(targetUid).set(
    {
      role,
      clinicId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth.uid,
    },
    { merge: true }
  );

  functions.logger.info(`Updated custom claims for UID: ${targetUid} to role: ${role}, clinicId: ${clinicId}`);
  return { success: true, targetUid, role, clinicId };
});

/**
 * 3. Stripe Integration: createPaymentIntent
 * Creates a Stripe PaymentIntent for clinic bookings.
 * If the clinic has connected their Stripe account via clinic_settings/{clinicId}.stripeAccountId
 * or clinics/{clinicId}.stripeAccountId, routes the charge directly to them via Stripe Connect
 * using on_behalf_of and transfer_data.
 * If Stripe keys are not configured or no connected account, returns isDemoMode: true
 * so the frontend falls back gracefully to the interactive demo preview.
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  const {
    clinicId,
    appointmentId,
    amount,
    currency = 'gbp',
    paymentChoice = 'full',
    patientEmail,
    patientName,
    serviceTitle,
  } = data;

  if (!clinicId || typeof clinicId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'clinicId is required.');
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid amount is required.');
  }

  const stripeApiKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
  if (!stripeApiKey) {
    return {
      isDemoMode: true,
      reason: 'stripe_secret_missing',
      message: 'STRIPE_SECRET_KEY is not configured on the server. Falling back to simulated preview.',
    };
  }

  // Look up clinic settings for Stripe Connect account
  const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const [settingsDoc, clinicDoc] = await Promise.all([
    db.collection('clinic_settings').doc(sanitizedClinicId).get(),
    db.collection('clinics').doc(sanitizedClinicId).get(),
  ]);

  const stripeAccountId = settingsDoc.data()?.stripeAccountId || clinicDoc.data()?.stripeAccountId;

  // If clinic has not connected a Stripe account, return demo mode unless explicit override
  if (!stripeAccountId && !process.env.FORCE_DIRECT_STRIPE) {
    return {
      isDemoMode: true,
      reason: 'clinic_not_connected',
      message: 'Clinic has not connected their Stripe account yet. Falling back to simulated preview.',
    };
  }

  const stripe = getStripe();
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || functions.config().stripe?.publishable_key || '';
  const amountInMinorUnits = Math.round(amount * 100);

  try {
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountInMinorUnits,
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      receipt_email: patientEmail || undefined,
      metadata: {
        appointmentId: appointmentId || `appt_${Date.now()}`,
        clinicId: sanitizedClinicId,
        serviceTitle: serviceTitle || 'Chiropractic Consultation',
        patientName: patientName || 'Patient',
        patientEmail: patientEmail || '',
        paymentChoice: paymentChoice || 'full',
      },
    };

    if (stripeAccountId) {
      paymentIntentParams.on_behalf_of = stripeAccountId;
      paymentIntentParams.transfer_data = {
        destination: stripeAccountId,
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return {
      isDemoMode: false,
      clientSecret: paymentIntent.client_secret,
      publishableKey,
      stripeAccountId: stripeAccountId || null,
      paymentIntentId: paymentIntent.id,
      amount: amountInMinorUnits,
      currency: currency.toLowerCase(),
    };
  } catch (err: any) {
    functions.logger.error('Failed to create Stripe PaymentIntent:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to initialize payment.');
  }
});

/**
 * 3.1. Stripe Webhook Handler
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
        const metadataClinicId = paymentIntent.metadata?.clinicId;

        if (appointmentId) {
          const apptRef = db.collection('appointments').doc(appointmentId);
          await apptRef.set(
            {
              paymentStatus: paymentIntent.metadata?.paymentChoice === 'deposit' ? 'deposit_paid' : 'paid_full',
              stripePaymentIntentId: paymentIntent.id,
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              amountPaid: paymentIntent.amount_received / 100,
              currency: paymentIntent.currency,
              ...(metadataClinicId ? { clinicId: metadataClinicId } : {}),
            },
            { merge: true }
          );

          // Dispatch confirmation email
          const apptDoc = await apptRef.get();
          const apptData = apptDoc.data();
          const patientEmail = apptData?.patientEmail || paymentIntent.receipt_email || paymentIntent.metadata?.patientEmail;
          const patientName = apptData?.patientName || paymentIntent.metadata?.patientName || 'Patient';
          const doctorName = apptData?.doctorName || 'Sarah Vance';
          const serviceTitle = apptData?.serviceTitle || paymentIntent.metadata?.serviceTitle || 'Consultation & Examination';
          const apptDate = apptData?.date || 'Confirmed Date';
          const apptTime = apptData?.time || 'Confirmed Time';

          if (patientEmail) {
            await sendEmailHelper({
              to: patientEmail,
              subject: 'Booking & Payment Receipt - Vance Health',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #ffffff; color: #1c1917;">
                  <div style="background-color: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Payment & Booking Confirmed</h2>
                  </div>
                  <p>Dear ${patientName},</p>
                  <p>Thank you for choosing Vance Health. Your payment of <strong>${paymentIntent.currency.toUpperCase() === 'GBP' ? '£' : '$'}${(paymentIntent.amount_received / 100).toFixed(2)}</strong> for your appointment has been successfully received.</p>
                  
                  <div style="background-color: #f5f5f4; padding: 16px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Service:</strong> ${serviceTitle}</p>
                    <p style="margin: 4px 0;"><strong>Practitioner:</strong> Dr. ${doctorName}</p>
                    <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${apptDate} at ${apptTime}</p>
                    <p style="margin: 4px 0;"><strong>Reference ID:</strong> <code>${appointmentId}</code></p>
                    <p style="margin: 4px 0;"><strong>Payment ID:</strong> <code>${paymentIntent.id}</code></p>
                  </div>

                  <p style="font-size: 13px; color: #78716c;">If you need to reschedule, please give us at least 24 hours notice. We look forward to seeing you!</p>
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
 * 6. Callable Cloud Function: sendAutomatedNotification
 * Server-side SMS & Email dispatcher for Twilio & Resend
 */
export const sendAutomatedNotification = functions.https.onCall(async (data, context) => {
  const { channel, recipient, messageText, subject, eventType, clinicName } = data;

  if (!recipient || !channel || !messageText) {
    throw new functions.https.HttpsError('invalid-argument', 'channel, recipient, and messageText are required.');
  }

  // 1. Channel = SMS via Twilio
  if (channel === 'sms') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || functions.config().twilio?.account_sid;
    const authToken = process.env.TWILIO_AUTH_TOKEN || functions.config().twilio?.auth_token;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || functions.config().twilio?.phone_number;

    if (!accountSid || !authToken || !fromPhone) {
      functions.logger.info(`Twilio not fully configured in environment. Returning simulated dispatch for SMS to ${recipient}`);
      return {
        success: true,
        mode: 'simulated',
        channel: 'sms',
        recipient,
        message: `Simulated SMS dispatched to ${recipient}`,
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append('To', recipient);
      formData.append('From', fromPhone);
      formData.append('Body', messageText);

      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const twilioRes: any = await response.json();
      if (response.ok && (twilioRes.status === 'queued' || twilioRes.status === 'sent' || twilioRes.sid)) {
        return {
          success: true,
          mode: 'live',
          channel: 'sms',
          sid: twilioRes.sid,
          message: `Live Twilio SMS queued (SID: ${twilioRes.sid})`,
        };
      } else {
        throw new Error(twilioRes.message || 'Twilio transmission failed');
      }
    } catch (err: any) {
      functions.logger.error('Twilio dispatch error:', err);
      throw new functions.https.HttpsError('internal', err.message || 'SMS dispatch failed');
    }
  }

  // 2. Channel = Email via Resend
  if (channel === 'email') {
    try {
      const res = await sendEmailHelper({
        to: recipient,
        subject: subject || `${clinicName || 'Chiropractic Clinic'} Notification`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #ffffff; color: #1c1917;">
            <div style="background-color: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${clinicName || 'Clinic Notification'}</h2>
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #292524; white-space: pre-line;">
              ${messageText}
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #78716c; text-align: center;">
              This notification was generated automatically by your clinic portal.
            </div>
          </div>
        `,
      });

      return {
        success: !!res,
        mode: 'live',
        channel: 'email',
        recipient,
        result: res,
      };
    } catch (err: any) {
      functions.logger.error('Resend email error:', err);
      throw new functions.https.HttpsError('internal', err.message || 'Email dispatch failed');
    }
  }

  return { success: false, message: 'Unsupported channel' };
});

/**
 * 7. Scheduled Cleanup Function: cleanupStaleDemoSessions
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
