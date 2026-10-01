import * as functions from 'firebase-functions/v1';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as crypto from 'crypto';
import Stripe from 'stripe';
import { Resend } from 'resend';

initializeApp();
const db = getFirestore();

// 1. Initialize Stripe & Resend from Environment Config
const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(apiKey, { apiVersion: '2023-10-16' });
};

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
  return new Resend(apiKey);
};

// 2. Helper to resolve APP_URL scoped strictly to email dispatchers
const resolveAppUrl = (): string => {
  const url = (process.env.APP_URL || '').trim();
  if (!url) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'APP_URL is not configured. Email links will be broken. Set APP_URL in functions/.env.'
    );
  }
  return url.replace(/\/$/, '');
};

/**
 * 3. Firebase Auth Trigger: onUserCreated
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

  // 3. Create user document in Firestore under users/{uid}
  try {
    const userDocRef = db.collection('users').doc(user.uid);
    await userDocRef.create(
      {
        uid: user.uid,
        email,
        displayName: user.displayName || email.split('@')[0],
        role,
        clinicId,
        emailVerified: user.emailVerified || false,
        createdAt: FieldValue.serverTimestamp(),
      }
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
  const expectedEnvToken = process.env.CLINIC_SETUP_TOKEN;

  const result = await db.runTransaction(async (transaction) => {
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
      if (privateDoc.data()?.primaryAdminUid === context.auth!.uid) return {success:true,clinicId:configDoc.data()!.primaryClinicId,role:'admin',message:'Administrator access restored.'};
      throw new functions.https.HttpsError('failed-precondition','This deployment is already claimed.');
    }

    // 2. Timing-Safe Token Verification
    let tokenValid = false;
    if (expectedEnvToken) {
      tokenValid = safeCompareTokens(setupToken.trim(), expectedEnvToken.trim());
    } else if (privateDoc.exists && privateDoc.data()?.setupTokenHash) {
      const providedHash = crypto.createHash('sha256').update(setupToken.trim()).digest('hex');
      tokenValid = safeCompareTokens(providedHash, privateDoc.data()!.setupTokenHash);
    } else {
      throw new functions.https.HttpsError('failed-precondition', 'Configure CLINIC_SETUP_TOKEN before claiming this deployment.');
    }

    if (!tokenValid) {
      // Increment failed attempt counter
      transaction.set(
        rateLimitRef,
        {
          failedAttempts: failedAttempts + 1,
          windowStart,
          lastAttemptAt: FieldValue.serverTimestamp(),
          lastAttemptByUid: context.auth!.uid,
        },
        { merge: true }
      );

      return { success: false, clinicId: sanitizedClinicId, role: 'admin', message: 'Invalid setup token.' };
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
        claimedAt: FieldValue.serverTimestamp(),
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
        claimedAt: FieldValue.serverTimestamp(),
        setupTokenHash: FieldValue.delete(),
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
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    functions.logger.info(`Clinic claimed by verified admin UID: ${context.auth!.uid} for clinicId: ${sanitizedClinicId}`);
    return {
      success: true,
      clinicId: sanitizedClinicId,
      role: 'admin',
      message: 'Clinic deployment successfully claimed. You are now the primary clinic administrator.',
    };
  });
  if (!result.success) throw new functions.https.HttpsError('permission-denied', result.message);
  // Auth side effects must not execute inside a transaction callback that may retry.
  await getAuth().setCustomUserClaims(context.auth.uid, { role: 'admin', clinicId: result.clinicId });
  return result;
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
  if (role && clinicId && clinicId !== 'unassigned') {
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

  if (storedClinicId === 'unassigned') { const config = await db.doc('clinic_config/active').get(); storedClinicId = config.data()?.primaryClinicId || 'unassigned'; }
  await db.doc(`users/${context.auth.uid}`).set({role:storedRole,clinicId:storedClinicId}, {merge:true});

  // Re-apply cryptographic custom claims via Admin SDK
  await getAuth().setCustomUserClaims(context.auth.uid, {
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

  if (!['admin', 'staff', 'editor', 'patient'].includes(role)) {
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
  const isAuthorized = isSuperAdmin || (callerClaims.role === 'admin' && callerClaims.clinicId === targetCurrentClinicId && clinicId === callerClaims.clinicId);
  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Cannot modify users outside your authorized clinic tenant.'
    );
  }

  // 3. Set cryptographic Custom Claims via Firebase Admin SDK
  await getAuth().setCustomUserClaims(targetUid, {
    role,
    clinicId,
  });

  // 4. Synchronize user profile in Firestore
  await db.collection('users').doc(targetUid).set(
    {
      role,
      clinicId,
      updatedAt: FieldValue.serverTimestamp(),
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
 * Configuration and authorization failures never simulate a payment.
 */
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  const appointment = await authorizedAppointment(data.appointmentId, context);
  if (!['full', 'deposit'].includes(data.paymentChoice)) {
    throw new functions.https.HttpsError('invalid-argument', 'Choose full payment or deposit.');
  }
  if (['cancelled', 'archived'].includes(appointment.status) || appointment.amountPaid > 0) {
    throw new functions.https.HttpsError('failed-precondition', 'This appointment cannot accept another payment.');
  }
  const settings = (await db.doc(`clinic_settings/${appointment.clinicId}`).get()).data() || {};
  const amount = data.paymentChoice === 'deposit' ? appointment.depositMinor : appointment.priceMinor;
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new functions.https.HttpsError('failed-precondition', 'Configure the service price before collecting payment.');
  const stripe = getStripe();
  await db.runTransaction(async tx => {
    const ref = db.doc(`appointments/${data.appointmentId}`);
    const current = (await tx.get(ref)).data()!;
    if (current.paymentChoice && current.paymentChoice !== data.paymentChoice) throw new functions.https.HttpsError('failed-precondition', 'A payment is already initialized. Complete the original payment or contact the clinic.');
    if (current.amountPaid || ['cancelled','archived'].includes(current.status)) throw new functions.https.HttpsError('failed-precondition', 'Appointment cannot accept payment.');
    tx.update(ref,{paymentChoice:data.paymentChoice,expectedPaymentMinor:amount});
  });
  const intent = await stripe.paymentIntents.create({
    amount, currency: appointment.currency,
    payment_method_types: ['card'],
    receipt_email: appointment.email || undefined,
    metadata: { appointmentId: data.appointmentId, clinicId: appointment.clinicId, paymentChoice: data.paymentChoice },
    ...(settings.stripeAccountId ? { on_behalf_of: settings.stripeAccountId, transfer_data: { destination: settings.stripeAccountId } } : {}),
  }, { idempotencyKey: `booking-${data.appointmentId}-${data.paymentChoice}-${amount}-${appointment.currency}` });
  // Persist the exact expected intent before exposing its client secret.
  await db.doc(`appointments/${data.appointmentId}`).update({
    stripePaymentIntentId: intent.id, expectedPaymentMinor: amount, paymentChoice: data.paymentChoice,
  });
  return { clientSecret: intent.client_secret, paymentIntentId: intent.id, amount,
    currency: appointment.currency, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' };
});

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  if (!secret || typeof signature !== 'string') { res.status(400).send('Webhook signature required'); return; }
  let event: Stripe.Event;
  try { event = getStripe().webhooks.constructEvent(req.rawBody, signature, secret); }
  catch { res.status(400).send('Invalid webhook signature'); return; }
  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const id = intent.metadata.appointmentId;
      if (!id || id.includes('/')) { res.status(400).send('Invalid appointment'); return; }
      await settlePayment(intent);
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const matches = await db.collection('appointments').where('stripePaymentIntentId', '==', charge.payment_intent).get();
      for (const doc of matches.docs) {
        if (charge.refunded && charge.amount_refunded === charge.amount && doc.data().currency === charge.currency) {
          await doc.ref.update({ paymentStatus: 'refunded', amountPaid: 0, paymentAmount: '0.00', refundedAt: FieldValue.serverTimestamp() });
        }
      }
    }
    res.status(200).json({ received: true });
  } catch (error) { functions.logger.error('Webhook reconciliation failed', error); res.status(500).send('Reconciliation failed'); }
});

export const refundAppointment = functions.https.onCall(async (data, context) => {
  const a = await authorizedAppointment(data.appointmentId, context, true);
  if (!a.stripePaymentIntentId || !a.amountPaid) throw new functions.https.HttpsError('failed-precondition', 'No settled card payment to refund.');
  const refund = await getStripe().refunds.create({ payment_intent: a.stripePaymentIntentId }, { idempotencyKey: `refund-${a.stripePaymentIntentId}` });
  if (refund.status !== 'succeeded') throw new functions.https.HttpsError('unavailable', 'Refund pending; wait for settlement before retrying.');
  await db.doc(`appointments/${data.appointmentId}`).update({ paymentStatus: 'refunded', amountPaid: 0, paymentAmount: '0.00', refundId: refund.id });
  return { success: true };
});

async function authorizedAppointment(id: unknown, context: functions.https.CallableContext, staffOnly = false) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in first.');
  if (typeof id !== 'string' || !id || id.includes('/')) throw new functions.https.HttpsError('invalid-argument', 'Appointment reference required.');
  const a = (await db.doc(`appointments/${id}`).get()).data();
  const staff = a && context.auth.token.clinicId === a.clinicId && ['admin', 'staff'].includes(context.auth.token.role);
  if (!a || !(staff || (!staffOnly && a.patientId === context.auth.uid))) throw new functions.https.HttpsError('permission-denied', 'Appointment access denied.');
  return a;
}

async function authorizeNotification(data: any, context: functions.https.CallableContext) {
  const a = await authorizedAppointment(data.appointmentId, context, true);
  const recipient = data.recipient || data.recipientEmail;
  if (recipient !== a.email && recipient !== a.phone) throw new functions.https.HttpsError('permission-denied', 'Use the appointment contact details.');
  const ref = db.doc(`notification_limits/${context.auth!.uid}`);
  await db.runTransaction(async tx => {
    const previous = (await tx.get(ref)).data();
    const now = Date.now();
    const count = previous && now - previous.start < 3600000 ? previous.count : 0;
    if (count >= 30) throw new functions.https.HttpsError('resource-exhausted', 'Hourly notification limit reached.');
    tx.set(ref, { count: count + 1, start: count ? previous!.start : now });
  });
}

/**
 * 4. Resend Email Dispatcher Helper
 */
async function sendEmailHelper(options: { to: string; subject: string; html: string }) {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM || (() => { throw new Error('MAIL_FROM is not configured'); })(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
    });
    if (result.error) throw new Error(result.error.message);
    functions.logger.info('Email accepted by provider');
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
  await authorizeNotification(data, context);
  const appointment = await authorizedAppointment(data.appointmentId, context, true);
  const clinic = (await db.doc(`clinics/${appointment.clinicId}`).get()).data();
  const escape = (value: unknown) => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
  const recipientEmail = appointment.email;
  const state = data.type === 'cancellation' ? 'Appointment cancelled' : 'Appointment details';
  const subject = `${state} - ${clinic?.name || 'Clinic'}`;
  const html = `<h2>${escape(state)}</h2><p>Hello ${escape(appointment.name)},</p>
    <p>${escape(clinic?.name)}: ${escape(appointment.date)} at ${escape(appointment.time)} with ${escape(appointment.practitionerName)}.</p>
    <p>Reference: ${escape(appointment.id)}</p><p><a href="${escape(resolveAppUrl())}/portal">Open your patient portal</a></p>`;

  const result = await sendEmailHelper({ to: recipientEmail, subject, html });
  return { success: !!result, result };
});

/**
 * 6. Callable Cloud Function: sendAutomatedNotification
 * Server-side SMS & Email dispatcher for Twilio & Resend
 */
export const sendAutomatedNotification = functions.https.onCall(async (data, context) => {
  await authorizeNotification(data, context);
  const { channel, recipient, messageText, subject, clinicName } = data;
  const safeMessage = String(messageText).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

  if (!recipient || !channel || !messageText) {
    throw new functions.https.HttpsError('invalid-argument', 'channel, recipient, and messageText are required.');
  }

  // 1. Channel = SMS via Twilio
  if (channel === 'sms') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) throw new functions.https.HttpsError('failed-precondition', 'SMS provider is not configured.');

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
      const appBaseUrl = resolveAppUrl();
      const res = await sendEmailHelper({
        to: recipient,
        subject: subject || `${clinicName || 'Chiropractic Clinic'} Notification`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #ffffff; color: #1c1917;">
            <div style="background-color: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${clinicName || 'Clinic Notification'}</h2>
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #292524; white-space: pre-line;">
              ${safeMessage}
            </div>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4; font-size: 11px; color: #78716c; text-align: center;">
              This notification was generated automatically by your clinic portal.<br><a href="${appBaseUrl}" style="color: #059669; text-decoration: underline; margin-top: 6px; display: inline-block;">Access Clinic Portal</a>
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

// Central appointment mutation boundary; clients never write settlement or reservations directly.
import { bookingHandlers } from './booking';
const bookings = bookingHandlers(db);
export const mutateAppointment = functions.https.onCall(bookings.mutate);
export const getAvailability = functions.https.onCall(bookings.availability);

export const recordCashPayment = functions.https.onCall(async (data, context) => {
  await authorizedAppointment(data.appointmentId, context, true);
  await db.runTransaction(async tx => {
    const ref = db.doc(`appointments/${data.appointmentId}`);
    const a = (await tx.get(ref)).data()!;
    if (!a.priceMinor || a.amountPaid || a.paymentChoice || a.stripePaymentIntentId || ['cancelled','archived'].includes(a.status)) throw new functions.https.HttpsError('failed-precondition', 'This booking cannot be marked as a new cash payment.');
    tx.update(ref, {paymentStatus:'paid_full',paymentMethod:'clinic_cash',amountPaid:a.priceMinor/100,
      paymentAmount:new Intl.NumberFormat('en-US',{style:'currency',currency:a.currency}).format(a.priceMinor/100),paidAt:FieldValue.serverTimestamp()});
  });
  return {success:true};
});

async function settlePayment(intent: Stripe.PaymentIntent) {
  await db.runTransaction(async tx => {
        const ref = db.doc(`appointments/${intent.metadata.appointmentId}`);
        const snap = await tx.get(ref);
        const a = snap.data();
        if (!a || a.clinicId !== intent.metadata.clinicId || a.stripePaymentIntentId !== intent.id ||
          a.expectedPaymentMinor !== intent.amount_received || a.currency !== intent.currency || intent.status !== 'succeeded') {
          throw new Error('Payment does not match the stored appointment');
        }
        if (a.paymentStatus === 'refunded' || a.amountPaid === intent.amount_received / 100) return;
        tx.update(ref, { paymentStatus: a.paymentChoice === 'deposit' ? 'deposit_paid' : 'paid_full',
          amountPaid: intent.amount_received / 100, paymentMethod: 'card', transactionId: intent.id,
          paymentAmount: new Intl.NumberFormat('en-US', { style: 'currency', currency: a.currency }).format(intent.amount_received / 100),
          paidAt: FieldValue.serverTimestamp() });
      });
}

export const verifyAppointmentPayment = functions.https.onCall(async (data, context) => {
  const a = await authorizedAppointment(data.appointmentId, context);
  if (!a.stripePaymentIntentId) throw new functions.https.HttpsError('failed-precondition','No payment exists for this appointment.');
  const intent = await getStripe().paymentIntents.retrieve(a.stripePaymentIntentId);
  if (intent.status !== 'succeeded') throw new functions.https.HttpsError('failed-precondition','Payment is not settled yet.');
  await settlePayment(intent);
  return (await db.doc(`appointments/${data.appointmentId}`).get()).data();
});

export const assignClinicMember = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') throw new functions.https.HttpsError('permission-denied','Administrator access required.');
  const user = await getAuth().getUserByEmail(String(data.email).trim().toLowerCase());
  if (user.uid === context.auth.uid) throw new functions.https.HttpsError('failed-precondition','Use another administrator to change your own role.');
  const profile = (await db.doc(`users/${user.uid}`).get()).data();
  const clinicId = context.auth.token.clinicId;
  if (profile?.clinicId !== clinicId || !['admin','staff','editor','patient'].includes(data.role)) throw new functions.https.HttpsError('permission-denied','Choose a registered account in this clinic.');
  await getAuth().setCustomUserClaims(user.uid,{role:data.role,clinicId});
  await db.doc(`users/${user.uid}`).update({role:data.role,email:user.email || '',displayName:user.displayName || profile?.name || ''});
  return {id:user.uid,name:user.displayName || profile?.name || user.email,email:user.email,role:data.role};
});
export const listClinicMembers = functions.https.onCall(async (_data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin') throw new functions.https.HttpsError('permission-denied','Administrator access required.');
  const users = await db.collection('users').where('clinicId','==',context.auth.token.clinicId).get();
  return users.docs.filter(d=>['admin','staff','editor'].includes(d.data().role)).map(d=>({id:d.id,name:d.data().displayName || d.data().name || '',email:d.data().email || '',role:d.data().role,title:'Clinic team',isCurrentUser:d.id===context.auth!.uid}));
});

// Reports configuration presence only; never exposes credentials or claims delivery.
export const getIntegrationStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'admin' || context.auth.token.clinicId !== data.clinicId) throw new functions.https.HttpsError('permission-denied','Clinic administrator access required.');
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    email: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM && process.env.APP_URL),
    sms: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
  };
});
