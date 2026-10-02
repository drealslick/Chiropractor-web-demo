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

// 2. Helper to resolve APP_URL scoped strictly to email dispatchers
const resolveAppUrl = (): string => {
  const url = (process.env.APP_URL || (functions.config().app && functions.config().app.url) || '').trim();
  if (!url) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'APP_URL is not configured. Email links will be broken. Set functions.config().app.url or APP_URL in functions/.env.'
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

  // Check rate limiting before starting transaction
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  let failedAttempts = 0;
  let windowStart = now;

  if (rateLimitDoc.exists) {
    const rData = rateLimitDoc.data()!;
    windowStart = rData.windowStart || now;
    if (now - windowStart < oneHour) {
      failedAttempts = rData.failedAttempts || 0;
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

  const privateDoc = await privateConfigRef.get();

  // STRICT REQUIREMENT: Fail immediately if no setup token is configured on the server
  if (!expectedEnvToken && (!privateDoc.exists || !privateDoc.data()?.setupTokenHash)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'CLINIC_SETUP_TOKEN is not configured on the deployment environment. Admin claim rejected for security.'
    );
  }

  // 2. Timing-Safe Token Verification
  let tokenValid = false;
  if (expectedEnvToken) {
    tokenValid = safeCompareTokens(setupToken.trim(), expectedEnvToken.trim());
  } else if (privateDoc.exists && privateDoc.data()?.setupTokenHash) {
    const providedHash = crypto.createHash('sha256').update(setupToken.trim()).digest('hex');
    tokenValid = safeCompareTokens(providedHash, privateDoc.data()!.setupTokenHash);
  }

  if (!tokenValid) {
    // Increment failed attempt counter OUTSIDE transaction so write persists
    await rateLimitRef.set(
      {
        failedAttempts: failedAttempts + 1,
        windowStart,
        lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAttemptByUid: context.auth.uid,
      },
      { merge: true }
    );

    throw new functions.https.HttpsError(
      'permission-denied',
      `Invalid setup token (${failedAttempts + 1}/5 attempts used). Please check CLINIC_SETUP_TOKEN from your deployment environment variables.`
    );
  }

  return await db.runTransaction(async (transaction) => {
    const configDoc = await transaction.get(activeConfigRef);

    if (configDoc.exists && configDoc.data()?.adminClaimed === true) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This clinic deployment has already been claimed by a primary administrator.'
      );
    }

    // Reset rate limit on successful authentication
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

    functions.logger.info(`Clinic claimed in transaction by verified admin UID: ${context.auth!.uid} for clinicId: ${sanitizedClinicId}`);
    return {
      success: true,
      clinicId: sanitizedClinicId,
      role: 'admin',
    };
  });

  // 7. Set cryptographic Custom Claims via Firebase Admin SDK OUTSIDE the retried transaction
  await admin.auth().setCustomUserClaims(context.auth!.uid, {
    role: 'admin',
    clinicId: sanitizedClinicId,
  });

  return {
    success: true,
    clinicId: sanitizedClinicId,
    role: 'admin',
    message: 'Clinic deployment successfully claimed. You are now the primary clinic administrator.',
  };
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

  // Caller must be SuperAdmin OR admin of both target user's CURRENT clinic AND requested destination clinic
  const isAuthorized = isSuperAdmin || (callerClaims.role === 'admin' && callerClaims.clinicId === targetCurrentClinicId && callerClaims.clinicId === clinicId);
  if (!isAuthorized) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Cannot modify users outside your authorized clinic tenant or grant roles in another clinic.'
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
    currency = 'gbp',
    paymentChoice = 'full',
    patientEmail,
    patientName,
    serviceTitle,
    serviceId,
  } = data;

  if (!clinicId || typeof clinicId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'clinicId is required.');
  }

  const isDemoEnv = process.env.DEMO_MODE === 'true';
  const stripeApiKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
  if (!stripeApiKey) {
    if (isDemoEnv) {
      return {
        isDemoMode: true,
        reason: 'stripe_secret_missing',
        message: 'STRIPE_SECRET_KEY is not configured on the server. Falling back to simulated preview.',
      };
    }
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Stripe payments are not configured on this deployment. Real charges cannot be processed.'
    );
  }

  // Look up clinic settings for Stripe Connect account
  const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const [settingsDoc, clinicDoc] = await Promise.all([
    db.collection('clinic_settings').doc(sanitizedClinicId).get(),
    db.collection('clinics').doc(sanitizedClinicId).get(),
  ]);

  const stripeAccountId = settingsDoc.data()?.stripeAccountId || clinicDoc.data()?.stripeAccountId;

  // If clinic has not connected a Stripe account, return demo mode ONLY in demo environment
  if (!stripeAccountId && !process.env.FORCE_DIRECT_STRIPE) {
    if (isDemoEnv) {
      return {
        isDemoMode: true,
        reason: 'clinic_not_connected',
        message: 'Clinic has not connected their Stripe account yet. Falling back to simulated preview.',
      };
    }
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Clinic has not connected a Stripe processing account.'
    );
  }

  // Server-side authoritative price resolution
  let serverPrice = 85;
  let serverDeposit = 25;

  if (appointmentId && typeof appointmentId === 'string') {
    const apptDoc = await db.collection('appointments').doc(appointmentId).get();
    if (apptDoc.exists) {
      const apptData = apptDoc.data()!;
      // Idempotency check: Reject duplicate payment if already settled
      if (apptData.paymentStatus === 'paid_full' || (paymentChoice === 'deposit' && apptData.paymentStatus === 'deposit_paid')) {
        throw new functions.https.HttpsError(
          'already-exists',
          'Payment has already been recorded and settled for this appointment.'
        );
      }
      if (typeof apptData.priceAmount === 'number' && apptData.priceAmount > 0) {
        serverPrice = apptData.priceAmount;
      }
      if (typeof apptData.depositAmount === 'number' && apptData.depositAmount > 0) {
        serverDeposit = apptData.depositAmount;
      }
    }
  } else if (clinicDoc.exists) {
    const services = clinicDoc.data()?.services || [];
    const matchedService = services.find((s: any) => s.id === serviceId || s.title === serviceTitle);
    if (matchedService && typeof matchedService.price === 'number') {
      serverPrice = matchedService.price;
      serverDeposit = matchedService.deposit || 25;
    }
  }

  const authoritativeAmount = paymentChoice === 'deposit' ? serverDeposit : serverPrice;
  const amountInMinorUnits = Math.round(authoritativeAmount * 100);

  const stripe = getStripe();
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || functions.config().stripe?.publishable_key || '';

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
        expectedAmount: String(authoritativeAmount),
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
 * 3.05. Callable Cloud Function: refundAppointmentPayment
 * Allows authorized clinic staff/admin to issue a verified refund through Stripe.
 */
export const refundAppointmentPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const role = context.auth.token?.role;
  const userClinicId = context.auth.token?.clinicId;
  const isSuperAdmin = context.auth.token?.superAdmin === true;

  if (!isSuperAdmin && role !== 'admin' && role !== 'staff') {
    throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can issue refunds.');
  }

  const { appointmentId, reason } = data;
  if (!appointmentId || typeof appointmentId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Valid appointmentId is required.');
  }

  const apptRef = db.collection('appointments').doc(appointmentId);
  const apptSnap = await apptRef.get();
  if (!apptSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Appointment record not found.');
  }

  const apptData = apptSnap.data()!;
  if (!isSuperAdmin && apptData.clinicId !== userClinicId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot refund appointment from another clinic tenant.');
  }

  const paymentIntentId = apptData.stripePaymentIntentId;
  if (!paymentIntentId) {
    throw new functions.https.HttpsError('failed-precondition', 'No Stripe payment intent recorded for this appointment.');
  }

  if (apptData.paymentStatus === 'refunded') {
    return { success: true, message: 'Appointment already refunded.', status: 'already_refunded' };
  }

  const stripe = getStripe();
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason === 'duplicate' ? 'duplicate' : 'requested_by_customer',
      metadata: {
        appointmentId,
        refundedBy: context.auth.uid,
      },
    });

    await apptRef.set(
      {
        paymentStatus: 'refunded',
        refundId: refund.id,
        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
        refundedBy: context.auth.uid,
      },
      { merge: true }
    );

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    };
  } catch (err: any) {
    functions.logger.error(`Stripe refund failed for appointment ${appointmentId}:`, err);
    throw new functions.https.HttpsError('internal', err.message || 'Refund processing failed.');
  }
});

/**
 * 3.06. Callable Cloud Function: reserveAppointmentSlot
 * Enforces transactional clinician/day interval reservations and prevents double-booking.
 */
export const reserveAppointmentSlot = functions.https.onCall(async (data, context) => {
  const {
    clinicId,
    practitionerId,
    date,
    time,
    duration = 45,
    serviceId,
    serviceTitle,
    patientName,
    patientEmail,
    patientPhone,
    notes,
  } = data;

  if (!clinicId || !date || !time || !patientName || !patientEmail) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'clinicId, date, time, patientName, and patientEmail are required.'
    );
  }

  const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const sanitizedDate = date.trim();
  const sanitizedTime = time.trim();
  const practitionerKey = (practitionerId || 'unassigned').trim();

  // Reservation interval key
  const lockKey = `${sanitizedClinicId}_${practitionerKey}_${sanitizedDate}_${sanitizedTime.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const lockRef = db.collection('reservations').doc(lockKey);
  const apptRef = db.collection('appointments').doc();

  // Run transaction to acquire slot reservation lock
  await db.runTransaction(async (transaction) => {
    const lockDoc = await transaction.get(lockRef);
    if (lockDoc.exists) {
      const lockData = lockDoc.data();
      if (lockData?.status === 'active' || lockData?.status === 'confirmed') {
        throw new functions.https.HttpsError(
          'already-exists',
          'This appointment time slot has already been reserved. Please choose another time.'
        );
      }
    }

    // Lookup clinic service price authority
    const clinicDoc = await transaction.get(db.collection('clinics').doc(sanitizedClinicId));
    let servicePrice = 85;
    let depositPrice = 25;
    if (clinicDoc.exists) {
      const services = clinicDoc.data()?.services || [];
      const match = services.find((s: any) => s.id === serviceId || s.title === serviceTitle);
      if (match && typeof match.price === 'number') {
        servicePrice = match.price;
        depositPrice = match.deposit || 25;
      }
    }

    const patientUid = context.auth ? context.auth.uid : null;

    // Create reservation lock
    transaction.set(lockRef, {
      clinicId: sanitizedClinicId,
      practitionerId: practitionerKey,
      date: sanitizedDate,
      time: sanitizedTime,
      appointmentId: apptRef.id,
      patientEmail,
      patientUid,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create appointment record with server-validated authority
    transaction.set(apptRef, {
      id: apptRef.id,
      clinicId: sanitizedClinicId,
      practitionerId: practitionerKey,
      date: sanitizedDate,
      time: sanitizedTime,
      durationMinutes: duration,
      serviceId: serviceId || 'initial-consultation',
      serviceTitle: serviceTitle || 'Initial Diagnostic Consultation & Assessment',
      priceAmount: servicePrice,
      depositAmount: depositPrice,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim().toLowerCase(),
      patientPhone: patientPhone?.trim() || '',
      patientId: patientUid,
      notes: notes?.trim() || '',
      status: 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return {
    success: true,
    appointmentId: apptRef.id,
    date: sanitizedDate,
    time: sanitizedTime,
  };
});

/**
 * 3.07. Callable Cloud Function: cancelAppointmentSlot
 * Safely cancels appointment and releases the clinician interval reservation lock.
 */
export const cancelAppointmentSlot = functions.https.onCall(async (data, context) => {
  const { appointmentId, reason } = data;
  if (!appointmentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid appointmentId is required.');
  }

  const apptRef = db.collection('appointments').doc(appointmentId);
  const apptSnap = await apptRef.get();
  if (!apptSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Appointment not found.');
  }

  const apptData = apptSnap.data()!;
  
  // Authorization: patient owner or clinic staff/admin
  if (context.auth) {
    const isOwner = apptData.patientId === context.auth.uid;
    const isStaff = context.auth.token?.clinicId === apptData.clinicId && ['staff', 'admin'].includes(context.auth.token?.role);
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isOwner && !isStaff && !isSuperAdmin) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized to cancel this appointment.');
    }
  }

  const practitionerKey = apptData.practitionerId || 'unassigned';
  const lockKey = `${apptData.clinicId}_${practitionerKey}_${apptData.date}_${(apptData.time || '').replace(/[^a-zA-Z0-9]/g, '_')}`;
  const lockRef = db.collection('reservations').doc(lockKey);

  await db.runTransaction(async (transaction) => {
    transaction.set(apptRef, {
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelReason: reason || 'Cancelled via patient portal',
    }, { merge: true });

    transaction.delete(lockRef);
  });

  return { success: true, appointmentId };
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

  if (!webhookSecret) {
    functions.logger.error('Stripe webhook error: STRIPE_WEBHOOK_SECRET is not configured on server.');
    res.status(500).send('Webhook Secret Not Configured');
    return;
  }

  if (!sig) {
    functions.logger.error('Stripe webhook error: Missing stripe-signature header.');
    res.status(400).send('Missing stripe-signature Header');
    return;
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
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
          const existingSnap = await apptRef.get();
          
          if (existingSnap.exists) {
            const existingData = existingSnap.data()!;
            // Idempotency check: if already processed for this payment intent, short-circuit
            if (existingData.stripePaymentIntentId === paymentIntent.id && (existingData.paymentStatus === 'paid_full' || existingData.paymentStatus === 'deposit_paid')) {
              res.status(200).json({ received: true, status: 'already_processed' });
              return;
            }
          }

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
          const doctorName = apptData?.doctorName || 'Dr. Alistair Vance';
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

  // Authorization check: Require context.auth or valid appointment lookup
  if (context.auth) {
    const role = context.auth.token?.role;
    if (!role) {
      throw new functions.https.HttpsError('permission-denied', 'Unauthorized caller role.');
    }
  } else if (appointmentId) {
    const apptDoc = await db.collection('appointments').doc(appointmentId).get();
    if (!apptDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Invalid appointment reference.');
    }
  } else {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated or supply a valid appointment reference.');
  }

  const appBaseUrl = resolveAppUrl();
  let subject = 'Appointment Update - Vance Health';
  let html = `<p>Hello ${patientName}, your appointment has an update.</p>`;

  if (type === 'booking_confirmation') {
    subject = `Appointment Confirmed - ${date} at ${time}`;
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="color: #064e3b; margin-top: 0;">Appointment Confirmed</h2>
        <p>Hi <strong>${patientName}</strong>,</p>
        <p>Your clinical consultation has been confirmed at Columbus Chiropractic Care.</p>
        <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 4px 0;"><strong>Attending Clinician:</strong> ${doctorName || 'Dr. Alistair Vance'}</p>
          <p style="margin: 4px 0;"><strong>Reference ID:</strong> <code>${appointmentId}</code></p>
        </div>
        <p>You can access your interactive care plan, home exercises, and calendar download via your <a href="${appBaseUrl}/portal" style="color: #064e3b; font-weight: 600; text-decoration: underline;">Patient Portal</a>.</p>
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
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to dispatch notifications.');
  }

  const role = context.auth.token?.role;
  if (role !== 'staff' && role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can dispatch notifications.');
  }

  const { channel, recipient, messageText, subject, clinicName } = data;

  if (!recipient || !channel || !messageText) {
    throw new functions.https.HttpsError('invalid-argument', 'channel, recipient, and messageText are required.');
  }

  const callerClinicId = context.auth.token?.clinicId;
  const isSuperAdmin = context.auth.token?.superAdmin === true;

  // Rate limiting: max 50 dispatches per hour per clinic
  if (callerClinicId && !isSuperAdmin) {
    const rateLimitRef = db.collection('clinic_notifications_ratelimit').doc(callerClinicId);
    const rateSnap = await rateLimitRef.get();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let count = 0;
    let windowStart = now;

    if (rateSnap.exists) {
      const r = rateSnap.data()!;
      windowStart = r.windowStart || now;
      if (now - windowStart < oneHour) {
        count = r.count || 0;
        if (count >= 50) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Notification rate limit exceeded (50 notifications/hour). Please wait before dispatching more.'
          );
        }
      } else {
        windowStart = now;
        count = 0;
      }
    }

    await rateLimitRef.set({ count: count + 1, windowStart, lastDispatchedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }

  // 1. Channel = SMS via Twilio
  if (channel === 'sms') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || functions.config().twilio?.account_sid;
    const authToken = process.env.TWILIO_AUTH_TOKEN || functions.config().twilio?.auth_token;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER || functions.config().twilio?.phone_number;

    if (!accountSid || !authToken || !fromPhone) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Twilio SMS credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not configured on this deployment. Cannot send live SMS.'
      );
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
              ${messageText}
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
