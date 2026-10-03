"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupAppointmentSecurely = exports.cleanupStaleDemoSessions = exports.removeStaffMember = exports.updateStaffRole = exports.acceptStaffInvitation = exports.inviteStaffMember = exports.processScheduledReminders = exports.sendAutomatedNotification = exports.sendTransactionalEmail = exports.stripeWebhook = exports.reserveAppointmentSlot = exports.cancelAppointmentSlot = exports.rescheduleAppointmentSlot = exports.confirmAppointmentHold = exports.executeAuthoritativeBooking = exports.bookAppointment = exports.refundAppointmentPayment = exports.chargeNoShowFee = exports.createPaymentIntent = exports.setClinicUserRole = exports.ensureUserClaims = exports.claimInitialClinicAdmin = exports.onUserCreated = exports.getResend = exports.getStripe = exports.setTestTwilioHandler = exports.setTestResendInstance = exports.setTestStripeInstance = exports.getDb = void 0;
exports.escapeHtml = escapeHtml;
exports.resolveClinicBranding = resolveClinicBranding;
exports.checkAndIncrementRateLimit = checkAndIncrementRateLimit;
exports.createPaymentIntentHandler = createPaymentIntentHandler;
exports.chargeNoShowFeeHandler = chargeNoShowFeeHandler;
exports.refundAppointmentPaymentHandler = refundAppointmentPaymentHandler;
exports.stripeWebhookHandler = stripeWebhookHandler;
exports.sendEmailHelper = sendEmailHelper;
exports.sendTransactionalEmailHandler = sendTransactionalEmailHandler;
exports.sendAutomatedNotificationHandler = sendAutomatedNotificationHandler;
exports.processScheduledRemindersHandler = processScheduledRemindersHandler;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const crypto = require("crypto");
const stripe_1 = require("stripe");
const resend_1 = require("resend");
if (!admin.apps.length) {
    admin.initializeApp();
}
const getDb = () => (0, firestore_1.getFirestore)();
exports.getDb = getDb;
// Dynamic proxy so db always uses the active Firestore emulator instance
const db = new Proxy({}, {
    get: (_target, prop) => {
        const firestore = (0, firestore_1.getFirestore)();
        const val = firestore[prop];
        return typeof val === 'function' ? val.bind(firestore) : val;
    },
});
// Safe config reader (handles both process.env and legacy functions.config gracefully)
const getEnvConfig = (key) => {
    if (process.env[key])
        return process.env[key];
    try {
        const cfg = functions.config?.();
        if (key === 'CLINIC_SETUP_TOKEN')
            return cfg?.clinic?.setup_token;
        if (key === 'STRIPE_SECRET_KEY')
            return cfg?.stripe?.secret_key;
        if (key === 'STRIPE_PUBLISHABLE_KEY')
            return cfg?.stripe?.publishable_key;
        if (key === 'STRIPE_WEBHOOK_SECRET')
            return cfg?.stripe?.webhook_secret;
        if (key === 'RESEND_API_KEY')
            return cfg?.resend?.api_key;
        if (key === 'APP_URL')
            return cfg?.app?.url;
        if (key === 'TWILIO_ACCOUNT_SID')
            return cfg?.twilio?.account_sid;
        if (key === 'TWILIO_AUTH_TOKEN')
            return cfg?.twilio?.auth_token;
        if (key === 'TWILIO_PHONE_NUMBER')
            return cfg?.twilio?.phone_number;
    }
    catch {
        // functions.config() is unavailable in v2 / node test env
    }
    return undefined;
};
// 1. Initialize Stripe, Resend & Twilio from Environment Config
let customStripeInstance = null;
const setTestStripeInstance = (instance) => {
    customStripeInstance = instance;
};
exports.setTestStripeInstance = setTestStripeInstance;
let customResendInstance = null;
const setTestResendInstance = (instance) => {
    customResendInstance = instance;
};
exports.setTestResendInstance = setTestResendInstance;
let customTwilioHandler = null;
const setTestTwilioHandler = (handler) => {
    customTwilioHandler = handler;
};
exports.setTestTwilioHandler = setTestTwilioHandler;
const getStripe = () => {
    if (customStripeInstance)
        return customStripeInstance;
    const apiKey = getEnvConfig('STRIPE_SECRET_KEY');
    if (!apiKey)
        throw new Error('STRIPE_SECRET_KEY is not configured');
    return new stripe_1.default(apiKey, { apiVersion: '2023-10-16' });
};
exports.getStripe = getStripe;
const getResend = () => {
    if (customResendInstance)
        return customResendInstance;
    const apiKey = getEnvConfig('RESEND_API_KEY');
    if (!apiKey)
        throw new Error('RESEND_API_KEY is not configured');
    return new resend_1.Resend(apiKey);
};
exports.getResend = getResend;
function escapeHtml(str) {
    if (typeof str !== 'string')
        return String(str || '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
async function resolveClinicBranding(clinicId) {
    const sanitizedClinicId = (clinicId || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'default_clinic';
    const [clinicDoc, settingsDoc] = await Promise.all([
        db.collection('clinics').doc(sanitizedClinicId).get(),
        db.collection('clinic_settings').doc(sanitizedClinicId).get(),
    ]);
    const clinicData = clinicDoc.exists ? clinicDoc.data() : null;
    const settingsData = settingsDoc.exists ? settingsDoc.data() : null;
    const clinicName = clinicData?.name || settingsData?.clinicName || 'Chiropractic Care';
    const emailSender = settingsData?.emailFrom || getEnvConfig('RESEND_FROM_EMAIL');
    if (!emailSender) {
        throw new functions.https.HttpsError('failed-precondition', 'Sender email is not configured. Set RESEND_FROM_EMAIL in functions/.env or configure emailFrom in clinic settings.');
    }
    const fromFormatted = `${clinicName} Appointments <${emailSender}>`;
    const smsSender = settingsData?.twilioPhoneNumber || getEnvConfig('TWILIO_PHONE_NUMBER') || '';
    const clinicAddress = clinicData?.address || settingsData?.clinicAddress || '';
    const clinicPhone = clinicData?.phone || settingsData?.clinicPhone || '';
    const timezone = clinicData?.timezone || settingsData?.timezone || 'Europe/London';
    return {
        clinicId: sanitizedClinicId,
        clinicName,
        emailSender,
        fromFormatted,
        smsSender,
        clinicAddress,
        clinicPhone,
        timezone,
    };
}
/**
 * Combined Multi-Tier Rate Limiter
 * Enforces per-caller, per-clinic, and per-recipient limits atomically via Firestore Transaction
 */
async function checkAndIncrementRateLimit(params) {
    const { clinicId, callerUid, recipient, channel, isSuperAdmin } = params;
    if (isSuperAdmin)
        return;
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    const sanitizedRecipient = recipient.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const limitsToCheck = [
        ...(callerUid
            ? [
                {
                    docRef: db.doc(`clinic_notifications_ratelimit/caller_${callerUid}_${channel}`),
                    max: 30,
                    errorMsg: 'Caller notification rate limit exceeded (30/hour).',
                },
            ]
            : []),
        {
            docRef: db.doc(`clinic_notifications_ratelimit/clinic_${clinicId}_${channel}`),
            max: 100,
            errorMsg: 'Clinic notification rate limit exceeded (100/hour).',
        },
        {
            docRef: db.doc(`clinic_notifications_ratelimit/recipient_${sanitizedRecipient}_${channel}`),
            max: 10,
            errorMsg: 'Recipient notification rate limit exceeded (10/hour).',
        },
    ];
    await db.runTransaction(async (transaction) => {
        // 1. Transactional Reads First (Firestore requires all reads before any writes)
        const snapshots = await Promise.all(limitsToCheck.map((l) => transaction.get(l.docRef)));
        // 2. Validate all tiers
        const updates = [];
        for (let i = 0; i < limitsToCheck.length; i++) {
            const limit = limitsToCheck[i];
            const snap = snapshots[i];
            let count = 0;
            let windowStart = now;
            if (snap.exists) {
                const data = snap.data();
                windowStart = data.windowStart || now;
                if (now - windowStart < ONE_HOUR) {
                    count = data.count || 0;
                    if (count >= limit.max) {
                        throw new functions.https.HttpsError('resource-exhausted', limit.errorMsg);
                    }
                }
                else {
                    windowStart = now;
                    count = 0;
                }
            }
            updates.push({
                docRef: limit.docRef,
                count: count + 1,
                windowStart,
            });
        }
        // 3. Transactional Writes
        for (const update of updates) {
            transaction.set(update.docRef, {
                count: update.count,
                windowStart: update.windowStart,
                lastDispatchedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
    });
}
// 2. Helper to resolve APP_URL scoped strictly to email dispatchers
const resolveAppUrl = () => {
    const url = (getEnvConfig('APP_URL') || '').trim();
    if (!url) {
        throw new functions.https.HttpsError('failed-precondition', 'APP_URL is not configured. Email links will be broken. Set functions.config().app.url or APP_URL in functions/.env.');
    }
    return url.replace(/\/$/, '');
};
/**
 * 3. Firebase Auth Trigger: onUserCreated
 * Automatically initializes a user profile doc with dynamic clinicId and sets default role claims
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    const email = user.email || '';
    // 1. Dynamic Clinic Tenancy Discovery (Never silently default to demo clinic)
    let clinicId = user.customClaims?.clinicId;
    if (!clinicId) {
        try {
            // Option C: Check deployment active clinic configuration doc
            const configSnap = await db.doc('clinic_config/active').get();
            if (configSnap.exists && configSnap.data()?.primaryClinicId) {
                clinicId = configSnap.data().primaryClinicId;
            }
            else {
                // Fallback: Check if user's email domain matches a registered clinic
                const domain = email.includes('@') ? email.split('@')[1] : '';
                if (domain) {
                    const matchSnap = await db.collection('clinics').where('emailDomain', '==', domain).limit(1).get();
                    if (!matchSnap.empty) {
                        clinicId = matchSnap.docs[0].id;
                    }
                }
            }
        }
        catch (err) {
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
    }
    catch (claimErr) {
        functions.logger.error(`Failed to set custom claims for user ${user.uid}:`, claimErr);
    }
    // 3. Create user document in Firestore under users/{uid}
    try {
        const userDocRef = db.collection('users').doc(user.uid);
        await userDocRef.set({
            uid: user.uid,
            email,
            displayName: user.displayName || email.split('@')[0],
            role,
            clinicId,
            emailVerified: user.emailVerified || false,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    catch (docErr) {
        functions.logger.error(`Failed to create users doc for ${user.uid}:`, docErr);
    }
    functions.logger.info(`Initialized user profile in Firestore for UID: ${user.uid} with clinicId: ${clinicId}`);
});
// Helper: Constant-time comparison using fixed-length SHA-256 digests
function safeCompareTokens(provided, expected) {
    try {
        const hashA = crypto.createHash('sha256').update(provided).digest();
        const hashB = crypto.createHash('sha256').update(expected).digest();
        return crypto.timingSafeEqual(hashA, hashB);
    }
    catch {
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
exports.claimInitialClinicAdmin = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to claim clinic.');
    }
    const { setupToken, clinicId, clinicName } = data;
    if (!setupToken || typeof setupToken !== 'string' || setupToken.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Deployment Setup Token is required to claim this clinic.');
    }
    if (!clinicId || typeof clinicId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Valid clinicId is required.');
    }
    const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const activeConfigRef = db.doc('clinic_config/active');
    const privateConfigRef = db.doc('clinic_config_private/active');
    // Atomic per-caller rate limiting prevents trivial shared lockout across independent users
    const rateLimitRef = db.doc(`clinic_config_private/claim_rate_limit_${context.auth.uid}`);
    // Verify setup token against environment variable or stored private hash
    const expectedEnvToken = getEnvConfig('CLINIC_SETUP_TOKEN');
    // Check rate limiting before starting transaction
    const rateLimitDoc = await rateLimitRef.get();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let failedAttempts = 0;
    let windowStart = now;
    if (rateLimitDoc.exists) {
        const rData = rateLimitDoc.data();
        windowStart = rData.windowStart || now;
        if (now - windowStart < oneHour) {
            failedAttempts = rData.failedAttempts || 0;
            if (failedAttempts >= 5) {
                throw new functions.https.HttpsError('resource-exhausted', 'Too many failed claim attempts on this account. Temporarily locked for 1 hour to prevent brute force.');
            }
        }
        else {
            windowStart = now;
            failedAttempts = 0;
        }
    }
    const privateDoc = await privateConfigRef.get();
    // STRICT REQUIREMENT: Fail immediately if no setup token is configured on the server
    if (!expectedEnvToken && (!privateDoc.exists || !privateDoc.data()?.setupTokenHash)) {
        throw new functions.https.HttpsError('failed-precondition', 'CLINIC_SETUP_TOKEN is not configured on the deployment environment. Admin claim rejected for security.');
    }
    // 2. Timing-Safe Token Verification
    let tokenValid = false;
    if (expectedEnvToken) {
        tokenValid = safeCompareTokens(setupToken.trim(), expectedEnvToken.trim());
    }
    else if (privateDoc.exists && privateDoc.data()?.setupTokenHash) {
        const providedHash = crypto.createHash('sha256').update(setupToken.trim()).digest('hex');
        tokenValid = safeCompareTokens(providedHash, privateDoc.data().setupTokenHash);
    }
    if (!tokenValid) {
        // Increment failed attempt counter OUTSIDE transaction so write persists
        await rateLimitRef.set({
            failedAttempts: failedAttempts + 1,
            windowStart,
            lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
            lastAttemptByUid: context.auth.uid,
        }, { merge: true });
        throw new functions.https.HttpsError('permission-denied', `Invalid setup token (${failedAttempts + 1}/5 attempts used). Please check CLINIC_SETUP_TOKEN from your deployment environment variables.`);
    }
    // 3. Transactionally record the claim
    const claimResult = await db.runTransaction(async (transaction) => {
        const configDoc = await transaction.get(activeConfigRef);
        const privateDocSnap = await transaction.get(privateConfigRef);
        if (configDoc.exists && configDoc.data()?.adminClaimed === true) {
            // Allow verified claimant to resume after a partial failure
            const isClaimantResuming = privateDocSnap.exists && privateDocSnap.data()?.primaryAdminUid === context.auth.uid;
            if (!isClaimantResuming) {
                throw new functions.https.HttpsError('failed-precondition', 'This clinic deployment has already been claimed by a primary administrator.');
            }
        }
        // Reset rate limit on successful authentication
        transaction.delete(rateLimitRef);
        // 4. Write public clinic configuration (safe for public reading by patient portal)
        transaction.set(activeConfigRef, {
            primaryClinicId: sanitizedClinicId,
            clinicName: clinicName?.trim() || 'Primary Practice',
            adminClaimed: true,
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 5. Write sensitive admin details to private configuration (admin-only access)
        transaction.set(privateConfigRef, {
            primaryClinicId: sanitizedClinicId,
            primaryAdminUid: context.auth.uid,
            primaryAdminEmail: context.auth.token.email || '',
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
            setupTokenHash: admin.firestore.FieldValue.delete(),
        }, { merge: true });
        // 6. Update user profile document in Firestore
        const userDocRef = db.collection('users').doc(context.auth.uid);
        transaction.set(userDocRef, {
            role: 'admin',
            clinicId: sanitizedClinicId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Record member in clinics/{clinicId}/members/{uid}
        const memberDocRef = db.collection('clinics').doc(sanitizedClinicId).collection('members').doc(context.auth.uid);
        transaction.set(memberDocRef, {
            userId: context.auth.uid,
            email: context.auth.token.email || '',
            role: 'admin',
            status: 'active',
            isPrimaryOwner: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        functions.logger.info(`Clinic claimed in transaction by verified admin UID: ${context.auth.uid} for clinicId: ${sanitizedClinicId}`);
        return {
            claimedClinicId: sanitizedClinicId,
        };
    });
    // 7. Set cryptographic Custom Claims via Firebase Admin SDK OUTSIDE the retried transaction
    await admin.auth().setCustomUserClaims(context.auth.uid, {
        role: 'admin',
        clinicId: claimResult.claimedClinicId,
    });
    return {
        success: true,
        clinicId: claimResult.claimedClinicId,
        role: 'admin',
        message: 'Clinic deployment successfully claimed. You are now the primary clinic administrator.',
    };
});
/**
 * 2.2. Login-Time Self-Healing Callable Function: ensureUserClaims
 * If onUserCreated partially failed or a network blip caused missing claims,
 * this function re-reads the user's Firestore profile and re-applies claims.
 */
exports.ensureUserClaims = functions.https.onCall(async (data, context) => {
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
        const userData = userDoc.data();
        storedRole = userData.role || 'patient';
        storedClinicId = userData.clinicId || 'unassigned';
    }
    else {
        // Try to resolve from active clinic config
        const configSnap = await db.doc('clinic_config/active').get();
        if (configSnap.exists && configSnap.data()?.primaryClinicId) {
            storedClinicId = configSnap.data().primaryClinicId;
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
exports.setClinicUserRole = functions.https.onCall(async (data, context) => {
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
        throw new functions.https.HttpsError('permission-denied', 'Cannot modify users outside your authorized clinic tenant or grant roles in another clinic.');
    }
    // 3. Set cryptographic Custom Claims via Firebase Admin SDK
    await admin.auth().setCustomUserClaims(targetUid, {
        role,
        clinicId,
    });
    // 4. Synchronize user profile in Firestore
    await db.collection('users').doc(targetUid).set({
        role,
        clinicId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: context.auth.uid,
    }, { merge: true });
    functions.logger.info(`Updated custom claims for UID: ${targetUid} to role: ${role}, clinicId: ${clinicId}`);
    return { success: true, targetUid, role, clinicId };
});
/**
 * 3. Stripe Integration: createPaymentIntent
 * Creates a Stripe PaymentIntent or SetupIntent for clinic bookings.
 * - Integer minor units calculations
 * - Authoritative pricing from server records
 * - Deposit, Full Payment, Remaining Balance, and Card-on-File (SetupIntent) support
 * - Stable idempotency keys and concurrency protection
 */
async function createPaymentIntentHandler(data, context) {
    const { clinicId, appointmentId, currency = 'gbp', paymentChoice = 'full', patientEmail, patientName, serviceTitle, serviceId, attempt = 1, } = data;
    if (!clinicId || typeof clinicId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId is required.');
    }
    const isDemoEnv = process.env.DEMO_MODE === 'true';
    const stripeApiKey = getEnvConfig('STRIPE_SECRET_KEY');
    if (!stripeApiKey && !customStripeInstance) {
        if (isDemoEnv) {
            return {
                isDemoMode: true,
                reason: 'stripe_secret_missing',
                message: 'STRIPE_SECRET_KEY is not configured on the server. Falling back to simulated preview.',
            };
        }
        throw new functions.https.HttpsError('failed-precondition', 'Stripe payments are not configured on this deployment. Real charges cannot be processed.');
    }
    // Look up clinic settings for Stripe Connect account
    const sanitizedClinicId = clinicId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const [settingsDoc, clinicDoc] = await Promise.all([
        db.collection('clinic_settings').doc(sanitizedClinicId).get(),
        db.collection('clinics').doc(sanitizedClinicId).get(),
    ]);
    const stripeAccountId = settingsDoc.data()?.stripeAccountId || clinicDoc.data()?.stripeAccountId;
    // If clinic has not connected a Stripe account, return demo mode ONLY in demo environment
    if (!stripeAccountId && !process.env.FORCE_DIRECT_STRIPE && !customStripeInstance) {
        if (isDemoEnv) {
            return {
                isDemoMode: true,
                reason: 'clinic_not_connected',
                message: 'Clinic has not connected their Stripe account yet. Falling back to simulated preview.',
            };
        }
        throw new functions.https.HttpsError('failed-precondition', 'Clinic has not connected a Stripe processing account.');
    }
    // Authoritative Server-Side Pricing Resolution
    let serverPrice = 85;
    let serverDeposit = 25;
    let existingAmountPaid = 0;
    let existingPaymentStatus = 'unpaid';
    if (appointmentId && typeof appointmentId === 'string') {
        const apptDoc = await db.collection('appointments').doc(appointmentId).get();
        if (apptDoc.exists) {
            const apptData = apptDoc.data();
            existingAmountPaid = typeof apptData.amountPaid === 'number' ? apptData.amountPaid : 0;
            existingPaymentStatus = apptData.paymentStatus || 'unpaid';
            // Idempotency check: Reject duplicate payment if already settled in full
            if (existingPaymentStatus === 'paid_full') {
                throw new functions.https.HttpsError('already-exists', 'Payment has already been recorded and settled in full for this appointment.');
            }
            if (paymentChoice === 'deposit' && existingPaymentStatus === 'deposit_paid') {
                throw new functions.https.HttpsError('already-exists', 'Deposit has already been paid for this appointment.');
            }
            if (typeof apptData.priceAmount === 'number' && apptData.priceAmount > 0) {
                serverPrice = apptData.priceAmount;
            }
            if (typeof apptData.depositAmount === 'number' && apptData.depositAmount > 0) {
                serverDeposit = apptData.depositAmount;
            }
        }
    }
    else if (clinicDoc.exists) {
        const services = clinicDoc.data()?.services || [];
        const matchedService = services.find((s) => s.id === serviceId || s.title === serviceTitle);
        if (matchedService && typeof matchedService.price === 'number') {
            serverPrice = matchedService.price;
            serverDeposit = matchedService.deposit || 25;
        }
    }
    // 0. PAY ON ARRIVAL (Zero Stripe API Calls)
    if (paymentChoice === 'pay_on_arrival' || paymentChoice === 'pay_at_clinic') {
        if (appointmentId) {
            await db.collection('appointments').doc(appointmentId).set({
                priceAmount: serverPrice,
                depositAmount: serverDeposit,
                currency: currency.toLowerCase(),
                paymentChoice: 'pay_on_arrival',
                paymentStatus: 'unpaid',
                amountPaid: 0,
                remainingBalance: serverPrice,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        return {
            isDemoMode: false,
            isPayOnArrival: true,
            amount: 0,
            currency: currency.toLowerCase(),
            message: 'Pay on arrival selected; no upfront payment charged.',
        };
    }
    const stripe = (0, exports.getStripe)();
    const publishableKey = getEnvConfig('STRIPE_PUBLISHABLE_KEY') || '';
    try {
        // 1. CARD-ON-FILE / ZERO-CHARGE SETUP INTENT
        if (paymentChoice === 'card_hold' || paymentChoice === 'card_on_file' || paymentChoice === 'setup_only') {
            // Find or create customer for card-on-file binding
            let customerId;
            if (patientEmail) {
                const existingCustomers = await stripe.customers.list({ email: patientEmail, limit: 1 });
                if (existingCustomers.data.length > 0) {
                    customerId = existingCustomers.data[0].id;
                }
                else {
                    const newCustomer = await stripe.customers.create({
                        email: patientEmail,
                        name: patientName || 'Patient',
                        metadata: { clinicId: sanitizedClinicId },
                    });
                    customerId = newCustomer.id;
                }
            }
            const setupIntentParams = {
                usage: 'off_session',
                payment_method_types: ['card'],
                customer: customerId,
                metadata: {
                    appointmentId: appointmentId || `appt_${Date.now()}`,
                    clinicId: sanitizedClinicId,
                    patientName: patientName || 'Patient',
                    patientEmail: patientEmail || '',
                    paymentChoice: 'card_on_file',
                },
            };
            if (stripeAccountId) {
                setupIntentParams.on_behalf_of = stripeAccountId;
            }
            const setupIntent = await stripe.setupIntents.create(setupIntentParams, {
                idempotencyKey: `si_${appointmentId || 'anon'}_${attempt}`,
            });
            // Persist snapshot to appointment if exists
            if (appointmentId) {
                await db.collection('appointments').doc(appointmentId).set({
                    priceAmount: serverPrice,
                    depositAmount: serverDeposit,
                    currency: currency.toLowerCase(),
                    stripeCustomerId: customerId || null,
                    stripeSetupIntentId: setupIntent.id,
                    paymentChoice: 'card_on_file',
                    paymentStatus: 'unpaid',
                    amountPaid: 0,
                    cardOnFile: true,
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
            return {
                isDemoMode: false,
                isSetupIntent: true,
                clientSecret: setupIntent.client_secret,
                setupIntentId: setupIntent.id,
                publishableKey,
                stripeAccountId: stripeAccountId || null,
                amount: 0,
                currency: currency.toLowerCase(),
            };
        }
        // 2. PAYMENT INTENTS (Full, Deposit, Balance)
        let authoritativeAmount = serverPrice;
        if (paymentChoice === 'deposit') {
            authoritativeAmount = serverDeposit;
        }
        else if (paymentChoice === 'balance') {
            authoritativeAmount = Math.max(0, serverPrice - existingAmountPaid);
            if (authoritativeAmount <= 0) {
                throw new functions.https.HttpsError('failed-precondition', 'No remaining balance is due for this appointment.');
            }
        }
        const amountInMinorUnits = Math.round(authoritativeAmount * 100);
        const paymentIntentParams = {
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
                priceAmount: String(serverPrice),
                depositAmount: String(serverDeposit),
            },
        };
        if (stripeAccountId) {
            paymentIntentParams.on_behalf_of = stripeAccountId;
            paymentIntentParams.transfer_data = {
                destination: stripeAccountId,
            };
        }
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams, {
            idempotencyKey: `pi_${appointmentId || 'anon'}_${paymentChoice}_${attempt}`,
        });
        // Lock price snapshot into appointment record in Firestore
        if (appointmentId) {
            await db.collection('appointments').doc(appointmentId).set({
                priceAmount: serverPrice,
                depositAmount: serverDeposit,
                currency: currency.toLowerCase(),
                stripePaymentIntentId: paymentIntent.id,
                paymentChoice,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        return {
            isDemoMode: false,
            isSetupIntent: false,
            clientSecret: paymentIntent.client_secret,
            publishableKey,
            stripeAccountId: stripeAccountId || null,
            paymentIntentId: paymentIntent.id,
            amount: amountInMinorUnits,
            currency: currency.toLowerCase(),
        };
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        functions.logger.error('Failed to create Stripe Intent:', err);
        throw new functions.https.HttpsError('internal', err.message || 'Failed to initialize payment.');
    }
}
exports.createPaymentIntent = functions.https.onCall(createPaymentIntentHandler);
/**
 * 3.04. Callable Cloud Function: chargeNoShowFee
 * Allows authorized clinic staff/admin to charge an authorized off-session no-show fee
 * against the patient's card saved on file.
 */
async function chargeNoShowFeeHandler(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const role = context.auth.token?.role;
    const userClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isSuperAdmin && role !== 'admin' && role !== 'staff') {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can charge no-show fees.');
    }
    const { appointmentId, feeAmount = 50, reason = 'No-show without 24h prior cancellation' } = data;
    if (!appointmentId || typeof appointmentId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Valid appointmentId is required.');
    }
    const apptRef = db.collection('appointments').doc(appointmentId);
    const apptSnap = await apptRef.get();
    if (!apptSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Appointment record not found.');
    }
    const apptData = apptSnap.data();
    if (!isSuperAdmin && apptData.clinicId !== userClinicId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot charge no-show fee for another clinic tenant.');
    }
    if (apptData.noShowFeeCharged === true) {
        throw new functions.https.HttpsError('already-exists', 'No-show fee has already been charged for this appointment.');
    }
    const paymentMethodId = apptData.stripePaymentMethodId;
    const customerId = apptData.stripeCustomerId;
    if (!paymentMethodId && !customerId) {
        throw new functions.https.HttpsError('failed-precondition', 'No saved card on file found for this appointment.');
    }
    const stripe = (0, exports.getStripe)();
    const feeInMinorUnits = Math.round(Number(feeAmount) * 100);
    const currency = (apptData.currency || 'gbp').toLowerCase();
    try {
        const paymentIntentParams = {
            amount: feeInMinorUnits,
            currency,
            customer: customerId || undefined,
            payment_method: paymentMethodId || undefined,
            off_session: true,
            confirm: true,
            metadata: {
                appointmentId,
                clinicId: apptData.clinicId,
                type: 'no_show_fee',
                reason,
                chargedBy: context.auth.uid,
            },
        };
        const pi = await stripe.paymentIntents.create(paymentIntentParams, {
            idempotencyKey: `noshow_${appointmentId}`,
        });
        if (pi.status === 'succeeded') {
            const receiptEntry = {
                id: `rcpt_ns_${pi.id}`,
                type: 'no_show_fee',
                amount: Number(feeAmount),
                currency,
                paymentIntentId: pi.id,
                date: new Date().toISOString(),
                reason,
            };
            await apptRef.set({
                status: 'no_show',
                noShowFeeCharged: true,
                noShowFeeAmount: Number(feeAmount),
                noShowPaymentIntentId: pi.id,
                noShowChargedAt: firestore_1.FieldValue.serverTimestamp(),
                noShowChargedBy: context.auth.uid,
                receipts: firestore_1.FieldValue.arrayUnion(receiptEntry),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            return {
                success: true,
                status: 'succeeded',
                paymentIntentId: pi.id,
                amount: Number(feeAmount),
            };
        }
        else if (pi.status === 'requires_action' || pi.status === 'requires_payment_method') {
            await apptRef.set({
                noShowFeeStatus: 'action_required',
                noShowPaymentIntentId: pi.id,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            return {
                success: false,
                status: pi.status,
                clientSecret: pi.client_secret,
                message: 'Card requires patient 3D Secure authentication.',
            };
        }
        else {
            throw new Error(`PaymentIntent status: ${pi.status}`);
        }
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        functions.logger.error(`No-show fee charge failed for appointment ${appointmentId}:`, err);
        throw new functions.https.HttpsError('internal', err.message || 'Failed to charge no-show fee.');
    }
}
exports.chargeNoShowFee = functions.https.onCall(chargeNoShowFeeHandler);
/**
 * 3.05. Callable Cloud Function: refundAppointmentPayment
 * Allows authorized clinic staff/admin to issue a verified full or partial refund through Stripe.
 */
async function refundAppointmentPaymentHandler(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const role = context.auth.token?.role;
    const userClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isSuperAdmin && role !== 'admin' && role !== 'staff') {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can issue refunds.');
    }
    const { appointmentId, amount, reason } = data;
    if (!appointmentId || typeof appointmentId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Valid appointmentId is required.');
    }
    const apptRef = db.collection('appointments').doc(appointmentId);
    const apptSnap = await apptRef.get();
    if (!apptSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Appointment record not found.');
    }
    const apptData = apptSnap.data();
    if (!isSuperAdmin && apptData.clinicId !== userClinicId) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot refund appointment from another clinic tenant.');
    }
    const paymentIntentId = apptData.stripePaymentIntentId;
    if (!paymentIntentId) {
        throw new functions.https.HttpsError('failed-precondition', 'No Stripe payment intent recorded for this appointment.');
    }
    const totalPaid = typeof apptData.amountPaid === 'number' ? apptData.amountPaid : 0;
    const priorRefunds = typeof apptData.refundAmount === 'number' ? apptData.refundAmount : 0;
    const maxRefundable = Math.max(0, totalPaid - priorRefunds);
    if (maxRefundable <= 0 || apptData.paymentStatus === 'refunded') {
        return { success: true, message: 'Appointment already fully refunded.', status: 'already_refunded' };
    }
    if (amount !== undefined && amount !== null) {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || amount > maxRefundable) {
            throw new functions.https.HttpsError('invalid-argument', `Refund amount cannot exceed refundable balance (${maxRefundable}) or be negative.`);
        }
    }
    // Determine refund amount (default to full remaining balance if unspecified)
    const requestedAmount = typeof amount === 'number' ? amount : maxRefundable;
    const refundMinorUnits = Math.round(requestedAmount * 100);
    const stripe = (0, exports.getStripe)();
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: refundMinorUnits,
            reason: reason === 'duplicate' ? 'duplicate' : 'requested_by_customer',
            metadata: {
                appointmentId,
                refundedBy: context.auth.uid,
                requestedAmount: String(requestedAmount),
            },
        });
        const newTotalRefunded = priorRefunds + requestedAmount;
        const isFullRefund = newTotalRefunded >= totalPaid;
        const receiptEntry = {
            id: `rcpt_rf_${refund.id}`,
            type: 'refund',
            amount: requestedAmount,
            currency: apptData.currency || 'gbp',
            refundId: refund.id,
            date: new Date().toISOString(),
            reason: reason || 'Patient refund',
            refundedBy: context.auth.uid,
        };
        await apptRef.set({
            paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
            refundId: refund.id,
            refundAmount: newTotalRefunded,
            refundedAt: firestore_1.FieldValue.serverTimestamp(),
            refundedBy: context.auth.uid,
            receipts: firestore_1.FieldValue.arrayUnion(receiptEntry),
        }, { merge: true });
        return {
            success: true,
            refundId: refund.id,
            amount: requestedAmount,
            totalRefunded: newTotalRefunded,
            isFullRefund,
            status: refund.status,
        };
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError)
            throw err;
        functions.logger.error(`Stripe refund failed for appointment ${appointmentId}:`, err);
        throw new functions.https.HttpsError('internal', err.message || 'Refund processing failed.');
    }
}
exports.refundAppointmentPayment = functions.https.onCall(refundAppointmentPaymentHandler);
var booking_1 = require("./booking");
Object.defineProperty(exports, "bookAppointment", { enumerable: true, get: function () { return booking_1.bookAppointment; } });
Object.defineProperty(exports, "executeAuthoritativeBooking", { enumerable: true, get: function () { return booking_1.executeAuthoritativeBooking; } });
Object.defineProperty(exports, "confirmAppointmentHold", { enumerable: true, get: function () { return booking_1.confirmAppointmentHold; } });
Object.defineProperty(exports, "rescheduleAppointmentSlot", { enumerable: true, get: function () { return booking_1.rescheduleAppointmentSlot; } });
Object.defineProperty(exports, "cancelAppointmentSlot", { enumerable: true, get: function () { return booking_1.cancelAppointmentSlot; } });
const booking_2 = require("./booking");
/**
 * Backward-compatible alias for existing clients and tests
 */
exports.reserveAppointmentSlot = booking_2.bookAppointment;
/**
 * 3.1. Stripe Webhook Handler
 * Listens for payment_intent.succeeded, payment_failed, setup_intent.succeeded,
 * and charge.refunded events, updates Firestore appointments, and triggers receipts
 */
async function stripeWebhookHandler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const sig = req.headers ? req.headers['stripe-signature'] : undefined;
    const webhookSecret = getEnvConfig('STRIPE_WEBHOOK_SECRET');
    let event;
    const stripe = (0, exports.getStripe)();
    if (req.rawBody && sig && webhookSecret) {
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        }
        catch (err) {
            functions.logger.error('Stripe webhook signature verification failed:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
    }
    else if (req.body && req.body.type && req.body.id) {
        event = req.body;
    }
    else {
        functions.logger.error('Stripe webhook error: Missing stripe-signature Header.');
        res.status(400).send('Missing stripe-signature Header');
        return;
    }
    try {
        // Webhook Deduplication: Check if event was already processed
        const docId = event.id.startsWith('evt_') ? event.id : `evt_${event.id}`;
        const eventRef = db.collection('idempotency_keys').doc(docId);
        const eventSnap = await eventRef.get();
        if (eventSnap.exists) {
            functions.logger.info(`Stripe event ${event.id} already processed. Deduplicating.`);
            res.status(200).json({ received: true, deduplicated: true });
            return;
        }
        // Record event as processed
        await eventRef.set({
            eventId: event.id,
            type: event.type,
            processedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const appointmentId = paymentIntent.metadata?.appointmentId;
                const paymentChoice = paymentIntent.metadata?.paymentChoice || 'full';
                if (appointmentId) {
                    const apptRef = db.collection('appointments').doc(appointmentId);
                    let confirmationSuccess = true;
                    let conflictReason = '';
                    await db.runTransaction(async (transaction) => {
                        const apptSnap = await transaction.get(apptRef);
                        if (!apptSnap.exists) {
                            confirmationSuccess = false;
                            conflictReason = 'appointment_missing';
                            return;
                        }
                        const apptData = apptSnap.data();
                        // Idempotency check: if already settled in full for this payment intent, short-circuit
                        if (apptData.stripePaymentIntentId === paymentIntent.id &&
                            (apptData.paymentStatus === 'paid_full' || (paymentChoice === 'deposit' && apptData.paymentStatus === 'deposit_paid'))) {
                            return;
                        }
                        // Check if hold is expired or slot occupied by someone else in schedules
                        if (apptData.status === 'hold_expired') {
                            confirmationSuccess = false;
                            conflictReason = 'hold_expired_slot_reclaimed';
                            transaction.set(apptRef, {
                                status: 'hold_expired_conflict',
                                conflictReason: 'Late payment received after checkout hold expired.',
                                stripePaymentIntentId: paymentIntent.id,
                                refundRequired: true,
                                updatedAt: firestore_1.FieldValue.serverTimestamp(),
                            }, { merge: true });
                            return;
                        }
                        if (apptData.practitionerId && apptData.date) {
                            const scheduleRef = db.collection('schedules').doc(`${apptData.clinicId}_${apptData.practitionerId}_${apptData.date}`);
                            const scheduleSnap = await transaction.get(scheduleRef);
                            if (scheduleSnap.exists) {
                                const intervals = scheduleSnap.data()?.intervals || [];
                                const targetIdx = intervals.findIndex((i) => i.appointmentId === appointmentId);
                                // If interval was removed or usurped:
                                if (targetIdx === -1) {
                                    confirmationSuccess = false;
                                    conflictReason = 'slot_reclaimed_by_other_patient';
                                    transaction.set(apptRef, {
                                        status: 'hold_expired_conflict',
                                        conflictReason: 'Late payment received after checkout hold expired and was claimed by another patient.',
                                        stripePaymentIntentId: paymentIntent.id,
                                        refundRequired: true,
                                        updatedAt: firestore_1.FieldValue.serverTimestamp(),
                                    }, { merge: true });
                                    return;
                                }
                                // Upgrade hold to confirmed
                                intervals[targetIdx].status = 'confirmed';
                                intervals[targetIdx].expiresAt = null;
                                transaction.update(scheduleRef, {
                                    intervals,
                                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                                });
                            }
                        }
                        const receivedAmountDollars = paymentIntent.amount_received / 100;
                        const fullPrice = typeof apptData.priceAmount === 'number' ? apptData.priceAmount : 85;
                        const priorAmountPaid = typeof apptData.amountPaid === 'number' ? apptData.amountPaid : 0;
                        const totalPaid = paymentChoice === 'balance' ? priorAmountPaid + receivedAmountDollars : receivedAmountDollars;
                        const isDeposit = paymentChoice === 'deposit';
                        const remainingBalance = isDeposit ? Math.max(0, fullPrice - totalPaid) : 0;
                        const newPaymentStatus = isDeposit ? 'deposit_paid' : 'paid_full';
                        const receiptEntry = {
                            id: `rcpt_${paymentIntent.id}`,
                            type: 'payment',
                            amount: receivedAmountDollars,
                            currency: paymentIntent.currency,
                            paymentIntentId: paymentIntent.id,
                            paymentChoice,
                            date: new Date().toISOString(),
                            status: 'succeeded',
                        };
                        // Mark appointment as confirmed with durable receipt snapshot
                        transaction.set(apptRef, {
                            status: 'confirmed',
                            paymentStatus: newPaymentStatus,
                            stripePaymentIntentId: paymentIntent.id,
                            paidAt: firestore_1.FieldValue.serverTimestamp(),
                            amountPaid: totalPaid,
                            remainingBalance,
                            currency: paymentIntent.currency,
                            receipts: firestore_1.FieldValue.arrayUnion(receiptEntry),
                            updatedAt: firestore_1.FieldValue.serverTimestamp(),
                        }, { merge: true });
                    });
                    if (!confirmationSuccess) {
                        functions.logger.warn(`Stripe payment received for expired/occupied hold ${appointmentId}: ${conflictReason}`);
                        // Guard against double-refund on webhook retry
                        const freshSnap = await apptRef.get();
                        if (freshSnap.data()?.refundIssuedAutomatically === true) {
                            functions.logger.info(`Refund already issued for ${appointmentId}, skipping`);
                            res.status(200).json({ received: true, status: 'already_refunded' });
                            return;
                        }
                        try {
                            await stripe.refunds.create({
                                payment_intent: paymentIntent.id,
                                reason: 'requested_by_customer',
                                metadata: { automatedRefundReason: 'hold_expired_slot_reclaimed', appointmentId },
                            }, { idempotencyKey: `refund_${appointmentId}` });
                            await apptRef.set({ refundIssuedAutomatically: true }, { merge: true });
                        }
                        catch (refErr) {
                            functions.logger.error('Failed to automatically refund expired hold:', refErr);
                        }
                        res.status(200).json({ received: true, status: 'hold_expired_refunded', conflictReason });
                        return;
                    }
                    // Dispatch confirmation email
                    const apptDoc = await apptRef.get();
                    const apptData = apptDoc.data();
                    const patientEmail = apptData?.patientEmail || paymentIntent.receipt_email || paymentIntent.metadata?.patientEmail;
                    const patientName = apptData?.patientName || paymentIntent.metadata?.patientName || 'Patient';
                    const doctorName = apptData?.doctorName || 'Attending Clinician';
                    const serviceTitle = apptData?.serviceTitle || paymentIntent.metadata?.serviceTitle || 'Chiropractic Consultation';
                    const apptDate = apptData?.date || 'Confirmed Date';
                    const apptTime = apptData?.time || 'Confirmed Time';
                    const clinicId = apptData?.clinicId || paymentIntent.metadata?.clinicId;
                    if (patientEmail && apptData?.emailConsent !== false) {
                        const branding = await resolveClinicBranding(clinicId);
                        const safePatientName = escapeHtml(patientName);
                        const safeDoctorName = escapeHtml(doctorName);
                        const safeServiceTitle = escapeHtml(serviceTitle);
                        const safeClinicName = escapeHtml(branding.clinicName);
                        const currencySymbol = (paymentIntent.currency || 'gbp').toUpperCase() === 'GBP' ? '£' : '$';
                        await sendEmailHelper({
                            to: patientEmail,
                            subject: `Booking & Payment Confirmed - ${safeClinicName}`,
                            clinicId,
                            appointmentId,
                            eventType: 'booking_confirmation',
                            deduplicationKey: `notif_webhook_conf_${appointmentId}_${paymentIntent.id}`,
                            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 16px; background-color: #ffffff; color: #1c1917;">
                  <div style="background-color: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Payment & Booking Confirmed</h2>
                  </div>
                  <p>Dear ${safePatientName},</p>
                  <p>Thank you for choosing ${safeClinicName}. Your payment of <strong>${currencySymbol}${(paymentIntent.amount_received / 100).toFixed(2)}</strong> for your appointment has been successfully received.</p>
                  
                  <div style="background-color: #f5f5f4; padding: 16px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 4px 0;"><strong>Service:</strong> ${safeServiceTitle}</p>
                    <p style="margin: 4px 0;"><strong>Practitioner:</strong> Dr. ${safeDoctorName}</p>
                    <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${escapeHtml(apptDate)} at ${escapeHtml(apptTime)}</p>
                    <p style="margin: 4px 0;"><strong>Location:</strong> ${escapeHtml(branding.clinicAddress)}</p>
                    <p style="margin: 4px 0;"><strong>Reference ID:</strong> <code>${escapeHtml(appointmentId)}</code></p>
                    <p style="margin: 4px 0;"><strong>Payment ID:</strong> <code>${escapeHtml(paymentIntent.id)}</code></p>
                  </div>

                  <p style="font-size: 13px; color: #78716c;">If you need to reschedule, please give us at least 24 hours notice. We look forward to seeing you!</p>
                </div>
              `,
                        });
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const appointmentId = paymentIntent.metadata?.appointmentId;
                if (appointmentId) {
                    const apptRef = db.collection('appointments').doc(appointmentId);
                    const apptSnap = await apptRef.get();
                    if (apptSnap.exists) {
                        const apptData = apptSnap.data();
                        // Never regress settled status if out-of-order event arrives
                        if (apptData.paymentStatus !== 'paid_full' && apptData.paymentStatus !== 'deposit_paid') {
                            await apptRef.set({
                                paymentStatus: 'failed',
                                paymentFailureReason: paymentIntent.last_payment_error?.message || 'Card payment authorization failed.',
                                updatedAt: firestore_1.FieldValue.serverTimestamp(),
                            }, { merge: true });
                        }
                    }
                }
                break;
            }
            case 'setup_intent.succeeded': {
                const setupIntent = event.data.object;
                const appointmentId = setupIntent.metadata?.appointmentId;
                if (appointmentId) {
                    await db.collection('appointments').doc(appointmentId).set({
                        cardOnFile: true,
                        stripePaymentMethodId: setupIntent.payment_method || null,
                        stripeCustomerId: setupIntent.customer || null,
                        updatedAt: firestore_1.FieldValue.serverTimestamp(),
                    }, { merge: true });
                }
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object;
                const appointmentId = charge.metadata?.appointmentId;
                if (appointmentId) {
                    const apptRef = db.collection('appointments').doc(appointmentId);
                    const isFull = charge.amount_refunded >= charge.amount;
                    const receiptEntry = {
                        id: `rcpt_rf_${charge.refunds?.data[0]?.id || Date.now()}`,
                        type: 'refund',
                        amount: charge.amount_refunded / 100,
                        currency: charge.currency,
                        refundId: charge.refunds?.data[0]?.id || '',
                        date: new Date().toISOString(),
                        reason: 'Stripe charge refunded',
                    };
                    await apptRef.set({
                        paymentStatus: isFull ? 'refunded' : 'partially_refunded',
                        refundAmount: charge.amount_refunded / 100,
                        refundedAt: firestore_1.FieldValue.serverTimestamp(),
                        refundId: charge.refunds?.data[0]?.id || '',
                        receipts: firestore_1.FieldValue.arrayUnion(receiptEntry),
                    }, { merge: true });
                }
                break;
            }
            default:
                functions.logger.info(`Unhandled event type: ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (err) {
        functions.logger.error('Error handling Stripe webhook event:', err);
        res.status(500).send('Internal Server Error');
    }
}
exports.stripeWebhook = functions.https.onRequest(stripeWebhookHandler);
async function sendEmailHelper(options) {
    const { to, subject, html, clinicId, from, deduplicationKey, appointmentId, eventType = 'adhoc' } = options;
    const cleanRecipient = (to || '').trim().toLowerCase();
    // Deduplication guard
    if (deduplicationKey) {
        const dedupRef = db.collection('notification_deliveries').doc(deduplicationKey);
        const dedupSnap = await dedupRef.get();
        if (dedupSnap.exists && (dedupSnap.data()?.status === 'delivered' || dedupSnap.data()?.status === 'accepted')) {
            functions.logger.info(`Notification ${deduplicationKey} already delivered. Deduplicating.`);
            return { id: dedupSnap.data()?.providerMessageId || 'dedup_cached', alreadyDelivered: true };
        }
    }
    const branding = await resolveClinicBranding(clinicId);
    const fromSender = from || branding.fromFormatted;
    const deliveryRef = deduplicationKey
        ? db.collection('notification_deliveries').doc(deduplicationKey)
        : db.collection('notification_deliveries').doc();
    // Record queued
    await deliveryRef.set({
        id: deliveryRef.id,
        clinicId: branding.clinicId,
        appointmentId: appointmentId || null,
        recipient: cleanRecipient,
        channel: 'email',
        eventType,
        status: 'queued',
        provider: 'resend',
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        lastAttemptAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    try {
        const resend = (0, exports.getResend)();
        const result = await resend.emails.send({
            from: fromSender,
            to: [cleanRecipient],
            subject,
            html,
        });
        if (result.error) {
            functions.logger.error(`Resend provider returned error for ${cleanRecipient}:`, result.error);
            await deliveryRef.set({
                status: 'failed',
                errorMessage: result.error.message || 'Resend provider rejected email',
                failedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            return null;
        }
        const providerId = result.data?.id || result.id || `msg_${Date.now()}`;
        await deliveryRef.set({
            status: 'delivered',
            providerMessageId: providerId,
            deliveredAt: firestore_1.FieldValue.serverTimestamp(),
            errorMessage: null,
        }, { merge: true });
        functions.logger.info(`Email dispatched successfully to ${cleanRecipient}: ${providerId}`);
        return { id: providerId, ...result };
    }
    catch (error) {
        functions.logger.error(`Failed to send email to ${cleanRecipient}:`, error);
        await deliveryRef.set({
            status: 'failed',
            errorMessage: error.message || 'Unknown email delivery error',
            failedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return null;
    }
}
/**
 * 5. Callable Cloud Function: sendTransactionalEmail
 * Allows client frontend (admin staff / booking flow) to trigger authenticated notification emails
 */
async function sendTransactionalEmailHandler(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to trigger emails.');
    }
    const { type, recipientEmail, patientName, date, time, doctorName, appointmentId, clinicId } = data;
    if (!type) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing email notification type.');
    }
    let targetRecipient = recipientEmail;
    let resolvedClinicId = clinicId;
    let resolvedDoctorName = doctorName;
    let resolvedDate = date;
    let resolvedTime = time;
    let resolvedPatientName = patientName;
    const role = context.auth.token?.role;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    const callerClinicId = context.auth.token?.clinicId;
    if (appointmentId) {
        const apptDoc = await db.collection('appointments').doc(appointmentId).get();
        if (!apptDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Referenced appointment does not exist.');
        }
        const apptData = apptDoc.data();
        // Discard arbitrary client values: ALWAYS bind to stored appointment records
        targetRecipient = apptData.patientEmail;
        resolvedClinicId = apptData.clinicId;
        resolvedDoctorName = apptData.doctorName || doctorName || 'Attending Clinician';
        resolvedDate = apptData.date || date;
        resolvedTime = apptData.time || time;
        resolvedPatientName = apptData.patientName || patientName || 'Patient';
        // Consent check
        if (apptData.emailConsent === false) {
            return { success: false, reason: 'opted_out', message: 'Patient has opted out of email notifications.' };
        }
        // Caller authorization: Must be appointment patient owner OR staff/admin/practitioner of that appointment's clinic OR superAdmin
        const isOwner = apptData.patientId === context.auth.uid;
        const isClinicStaff = callerClinicId === apptData.clinicId && ['staff', 'admin', 'practitioner'].includes(role);
        if (!isOwner && !isClinicStaff && !isSuperAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized caller for appointment notification.');
        }
    }
    else {
        // Ad-hoc dispatch requires staff/admin role
        if (role !== 'staff' && role !== 'admin' && !isSuperAdmin) {
            throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can trigger ad-hoc email dispatch.');
        }
        resolvedClinicId = callerClinicId || clinicId;
    }
    if (!targetRecipient || typeof targetRecipient !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetRecipient.trim())) {
        throw new functions.https.HttpsError('invalid-argument', 'Valid recipient email could not be determined.');
    }
    const cleanRecipient = targetRecipient.trim().toLowerCase();
    // Rate limiting check
    await checkAndIncrementRateLimit({
        clinicId: resolvedClinicId || 'default_clinic',
        callerUid: context.auth.uid,
        recipient: cleanRecipient,
        channel: 'email',
        isSuperAdmin,
    });
    const branding = await resolveClinicBranding(resolvedClinicId);
    const appBaseUrl = resolveAppUrl();
    const safePatientName = escapeHtml(resolvedPatientName || 'Patient');
    const safeDoctorName = escapeHtml(resolvedDoctorName || 'Attending Clinician');
    const safeDate = escapeHtml(resolvedDate || '');
    const safeTime = escapeHtml(resolvedTime || '');
    const safeApptId = escapeHtml(appointmentId || '');
    const safeClinicName = escapeHtml(branding.clinicName);
    const safeClinicAddress = escapeHtml(branding.clinicAddress);
    const safeClinicPhone = escapeHtml(branding.clinicPhone);
    let subject = `${branding.clinicName} - Appointment Update`;
    let html = `<p>Hello ${safePatientName}, your appointment has an update.</p>`;
    if (type === 'booking_confirmation') {
        subject = `Appointment Confirmed - ${safeDate} at ${safeTime}`;
        html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="color: #064e3b; margin-top: 0;">Appointment Confirmed</h2>
        <p>Hi <strong>${safePatientName}</strong>,</p>
        <p>Your clinical consultation has been confirmed at ${safeClinicName}.</p>
        <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Date:</strong> ${safeDate}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${safeTime}</p>
          <p style="margin: 4px 0;"><strong>Attending Clinician:</strong> ${safeDoctorName}</p>
          <p style="margin: 4px 0;"><strong>Location:</strong> ${safeClinicAddress}</p>
          <p style="margin: 4px 0;"><strong>Contact:</strong> ${safeClinicPhone}</p>
          <p style="margin: 4px 0;"><strong>Reference ID:</strong> <code>${safeApptId}</code></p>
        </div>
        <p>You can access your interactive care plan, home exercises, and calendar download via your <a href="${appBaseUrl}/portal" style="color: #064e3b; font-weight: 600; text-decoration: underline;">Patient Portal</a>.</p>
      </div>
    `;
    }
    else if (type === 'cancellation') {
        subject = `Appointment Cancelled - ${safeApptId}`;
        html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="color: #991b1b; margin-top: 0;">Appointment Cancelled</h2>
        <p>Hi <strong>${safePatientName}</strong>,</p>
        <p>Your appointment on <strong>${safeDate} at ${safeTime}</strong> with ${safeDoctorName} at ${safeClinicName} has been cancelled as requested.</p>
        <p>If you need to reschedule or rebook, please visit your <a href="${appBaseUrl}" style="color: #059669; font-weight: 600;">Patient Portal</a> or call us at ${safeClinicPhone}.</p>
      </div>
    `;
    }
    else if (type === 'reschedule') {
        subject = `Appointment Rescheduled - ${safeDate} at ${safeTime}`;
        html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
        <h2 style="color: #064e3b; margin-top: 0;">Appointment Rescheduled</h2>
        <p>Hi <strong>${safePatientName}</strong>,</p>
        <p>Your appointment has been successfully updated to <strong>${safeDate} at ${safeTime}</strong> with ${safeDoctorName} at ${safeClinicName}.</p>
        <p>Reference ID: <code>${safeApptId}</code></p>
      </div>
    `;
    }
    const dedupKey = appointmentId ? `notif_${type}_${appointmentId}_email` : undefined;
    const result = await sendEmailHelper({
        to: cleanRecipient,
        subject,
        html,
        clinicId: resolvedClinicId,
        appointmentId: appointmentId || undefined,
        eventType: type,
        deduplicationKey: dedupKey,
    });
    return { success: !!result, result, targetRecipient: cleanRecipient, clinicName: branding.clinicName };
}
exports.sendTransactionalEmail = functions.https.onCall(sendTransactionalEmailHandler);
/**
 * 6. Callable Cloud Function: sendAutomatedNotification
 * Server-side SMS & Email dispatcher for Twilio & Resend
 */
async function sendAutomatedNotificationHandler(data, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to dispatch notifications.');
    }
    const role = context.auth.token?.role;
    if (role !== 'staff' && role !== 'admin' && context.auth.token?.superAdmin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic staff or admin can dispatch notifications.');
    }
    const { channel, recipient, messageText, subject, clinicName, appointmentId, eventType = 'adhoc', deduplicationKey } = data;
    if (!recipient || !channel || !messageText) {
        throw new functions.https.HttpsError('invalid-argument', 'channel, recipient, and messageText are required.');
    }
    if (channel !== 'sms' && channel !== 'email') {
        throw new functions.https.HttpsError('invalid-argument', 'channel must be sms or email.');
    }
    const callerClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    let targetClinicId = callerClinicId || 'default_clinic';
    if (appointmentId) {
        const apptDoc = await db.collection('appointments').doc(appointmentId).get();
        if (!apptDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Referenced appointment does not exist.');
        }
        const apptData = apptDoc.data();
        if (!isSuperAdmin && apptData.clinicId !== callerClinicId) {
            throw new functions.https.HttpsError('permission-denied', 'Cannot dispatch notifications for another clinic tenant.');
        }
        targetClinicId = apptData.clinicId;
        // Consent check
        if (channel === 'sms' && apptData.smsConsent === false) {
            return { success: false, reason: 'opted_out', message: 'Patient has opted out of SMS notifications.' };
        }
        if (channel === 'email' && apptData.emailConsent === false) {
            return { success: false, reason: 'opted_out', message: 'Patient has opted out of Email notifications.' };
        }
    }
    // Recipient format validation
    const cleanRecipient = recipient.trim();
    if (channel === 'sms') {
        // E.164 phone validation
        const phoneRegex = /^\+?[1-9]\d{6,14}$/;
        if (!phoneRegex.test(cleanRecipient.replace(/[\s()-]/g, ''))) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format. Must be a valid telephone number.');
        }
    }
    else if (channel === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanRecipient)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid email address format.');
        }
    }
    // Combined rate limiting check
    await checkAndIncrementRateLimit({
        clinicId: targetClinicId,
        callerUid: context.auth.uid,
        recipient: cleanRecipient,
        channel,
        isSuperAdmin,
    });
    const branding = await resolveClinicBranding(targetClinicId);
    const resolvedClinicName = clinicName || branding.clinicName;
    const effectiveDedupKey = deduplicationKey || (appointmentId ? `notif_${eventType}_${appointmentId}_${channel}` : undefined);
    // 1. Channel = SMS via Twilio
    if (channel === 'sms') {
        // Deduplication check
        if (effectiveDedupKey) {
            const dedupRef = db.collection('notification_deliveries').doc(effectiveDedupKey);
            const dedupSnap = await dedupRef.get();
            if (dedupSnap.exists && (dedupSnap.data()?.status === 'delivered' || dedupSnap.data()?.status === 'accepted')) {
                functions.logger.info(`SMS ${effectiveDedupKey} already delivered. Deduplicating.`);
                return { success: true, alreadyDelivered: true, sid: dedupSnap.data()?.providerMessageId };
            }
        }
        const deliveryRef = effectiveDedupKey
            ? db.collection('notification_deliveries').doc(effectiveDedupKey)
            : db.collection('notification_deliveries').doc();
        await deliveryRef.set({
            id: deliveryRef.id,
            clinicId: targetClinicId,
            appointmentId: appointmentId || null,
            recipient: cleanRecipient,
            channel: 'sms',
            eventType,
            status: 'queued',
            provider: 'twilio',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            lastAttemptAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        // Custom test Twilio handler override
        if (customTwilioHandler) {
            try {
                const testRes = await customTwilioHandler({
                    to: cleanRecipient,
                    from: branding.smsSender,
                    body: messageText,
                });
                if (testRes?.error || testRes?.status === 'failed') {
                    await deliveryRef.set({
                        status: 'failed',
                        errorMessage: testRes.message || 'Twilio test handler rejected dispatch',
                        failedAt: firestore_1.FieldValue.serverTimestamp(),
                    }, { merge: true });
                    throw new functions.https.HttpsError('internal', testRes.message || 'Twilio test handler rejected dispatch');
                }
                const sid = testRes?.sid || `SM_test_${Date.now()}`;
                await deliveryRef.set({
                    status: 'delivered',
                    providerMessageId: sid,
                    deliveredAt: firestore_1.FieldValue.serverTimestamp(),
                    errorMessage: null,
                }, { merge: true });
                return {
                    success: true,
                    mode: 'test',
                    channel: 'sms',
                    sid,
                    message: `SMS dispatched via test handler (SID: ${sid})`,
                    clinicName: resolvedClinicName,
                };
            }
            catch (err) {
                if (err instanceof functions.https.HttpsError)
                    throw err;
                await deliveryRef.set({
                    status: 'failed',
                    errorMessage: err.message,
                    failedAt: firestore_1.FieldValue.serverTimestamp(),
                }, { merge: true });
                throw new functions.https.HttpsError('internal', err.message || 'SMS test dispatch failed');
            }
        }
        const accountSid = getEnvConfig('TWILIO_ACCOUNT_SID');
        const authToken = getEnvConfig('TWILIO_AUTH_TOKEN');
        const fromPhone = branding.smsSender || getEnvConfig('TWILIO_PHONE_NUMBER');
        if (!accountSid || !authToken || !fromPhone) {
            await deliveryRef.set({
                status: 'failed',
                errorMessage: 'Twilio credentials not configured on deployment',
                failedAt: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            throw new functions.https.HttpsError('failed-precondition', 'Twilio SMS credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) are not configured on this deployment. Cannot send live SMS.');
        }
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
            const formData = new URLSearchParams();
            formData.append('To', cleanRecipient);
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
            const twilioRes = await response.json();
            if (response.ok && (twilioRes.status === 'queued' || twilioRes.status === 'sent' || twilioRes.sid)) {
                await deliveryRef.set({
                    status: 'delivered',
                    providerMessageId: twilioRes.sid,
                    deliveredAt: firestore_1.FieldValue.serverTimestamp(),
                    errorMessage: null,
                }, { merge: true });
                return {
                    success: true,
                    mode: 'live',
                    channel: 'sms',
                    sid: twilioRes.sid,
                    message: `Live Twilio SMS queued (SID: ${twilioRes.sid})`,
                    clinicName: resolvedClinicName,
                };
            }
            else {
                const errorMsg = twilioRes.message || `Twilio HTTP error ${response.status}`;
                await deliveryRef.set({
                    status: 'failed',
                    errorMessage: errorMsg,
                    failedAt: firestore_1.FieldValue.serverTimestamp(),
                }, { merge: true });
                throw new Error(errorMsg);
            }
        }
        catch (err) {
            functions.logger.error('Twilio dispatch error:', err);
            throw new functions.https.HttpsError('internal', err.message || 'SMS dispatch failed');
        }
    }
    // 2. Channel = Email via Resend
    if (channel === 'email') {
        try {
            const appBaseUrl = resolveAppUrl();
            const safeClinicName = escapeHtml(resolvedClinicName);
            const safeMessage = escapeHtml(messageText);
            const res = await sendEmailHelper({
                to: cleanRecipient,
                subject: subject || `${safeClinicName} Notification`,
                clinicId: targetClinicId,
                appointmentId: appointmentId || undefined,
                eventType,
                deduplicationKey: effectiveDedupKey,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background-color: #ffffff; color: #1c1917;">
            <div style="background-color: #064e3b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 20px;">${safeClinicName}</h2>
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
                recipient: cleanRecipient,
                result: res,
                clinicName: resolvedClinicName,
            };
        }
        catch (err) {
            functions.logger.error('Resend email error:', err);
            throw new functions.https.HttpsError('internal', err.message || 'Email dispatch failed');
        }
    }
    return { success: false, message: 'Unsupported channel' };
}
exports.sendAutomatedNotification = functions.https.onCall(sendAutomatedNotificationHandler);
/**
 * 6.05. Scheduled Reminders: processScheduledReminders
 * Sweeps appointments for upcoming 24h reminders and dispatches verified notifications
 */
async function processScheduledRemindersHandler(data, context) {
    // Allow admin/staff auth or internal cron trigger
    if (context.auth) {
        const role = context.auth.token?.role;
        if (role !== 'admin' && role !== 'staff' && context.auth.token?.superAdmin !== true) {
            throw new functions.https.HttpsError('permission-denied', 'Unauthorized to trigger scheduled reminders.');
        }
    }
    const { targetDate } = data || {};
    let query = db.collection('appointments').where('status', '==', 'confirmed');
    if (targetDate) {
        query = query.where('date', '==', targetDate);
    }
    const snap = await query.get();
    let processedCount = 0;
    let dispatchedCount = 0;
    for (const doc of snap.docs) {
        const appt = doc.data();
        processedCount++;
        // Skip if already sent or cancelled
        if (appt.reminder24hSent === true || appt.status === 'cancelled' || appt.status === 'hold_expired') {
            continue;
        }
        const branding = await resolveClinicBranding(appt.clinicId);
        const dedupKey = `notif_reminder_24h_${doc.id}_email`;
        if (appt.patientEmail && appt.emailConsent !== false) {
            const emailResult = await sendEmailHelper({
                to: appt.patientEmail,
                subject: `Appointment Reminder: Tomorrow at ${appt.time} - ${branding.clinicName}`,
                clinicId: appt.clinicId,
                appointmentId: doc.id,
                eventType: 'reminder_24h',
                deduplicationKey: dedupKey,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px;">
            <h2 style="color: #064e3b; margin-top: 0;">24-Hour Appointment Reminder</h2>
            <p>Hi <strong>${escapeHtml(appt.patientName || 'Patient')}</strong>,</p>
            <p>This is a friendly reminder of your upcoming consultation at <strong>${escapeHtml(branding.clinicName)}</strong>.</p>
            <div style="background-color: #f5f5f4; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${escapeHtml(appt.date)}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${escapeHtml(appt.time)}</p>
              <p style="margin: 4px 0;"><strong>Attending Clinician:</strong> ${escapeHtml(appt.doctorName || 'Dr. Alistair Vance')}</p>
              <p style="margin: 4px 0;"><strong>Address:</strong> ${escapeHtml(branding.clinicAddress)}</p>
            </div>
            <p style="font-size: 12px; color: #78716c;">Please arrive 10 minutes early. If you need to reschedule, please notify us at least 24 hours in advance.</p>
          </div>
        `,
            });
            if (emailResult) {
                await doc.ref.set({
                    reminder24hSent: true,
                    reminder24hSentAt: firestore_1.FieldValue.serverTimestamp(),
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                }, { merge: true });
                dispatchedCount++;
            }
        }
    }
    return { success: true, processedCount, dispatchedCount };
}
exports.processScheduledReminders = functions.https.onCall(processScheduledRemindersHandler);
/**
 * 6.1. Callable Cloud Function: inviteStaffMember
 * Allows clinic admins to send verified invitations with designated roles
 */
exports.inviteStaffMember = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { clinicId, email, role, name, title } = data;
    if (!clinicId || !email || !role) {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId, email, and role are required.');
    }
    const callerRole = context.auth.token?.role;
    const callerClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isSuperAdmin && (callerRole !== 'admin' || callerClinicId !== clinicId)) {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic administrators can invite staff members.');
    }
    const allowedRoles = ['admin', 'staff', 'practitioner', 'editor'];
    if (!allowedRoles.includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
    }
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const inviteId = `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const inviteRef = db.collection('clinics').doc(clinicId).collection('invitations').doc(inviteId);
    await inviteRef.set({
        id: inviteId,
        clinicId,
        email: email.trim().toLowerCase(),
        role,
        name: name?.trim() || '',
        title: title?.trim() || '',
        token: inviteToken,
        status: 'pending',
        invitedBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days validity
    });
    return {
        success: true,
        inviteId,
        token: inviteToken,
        message: `Invitation issued for ${email} with role ${role}.`,
    };
});
/**
 * 6.2. Callable Cloud Function: acceptStaffInvitation
 * Allows an authenticated user possessing an invitation token to activate their staff membership
 */
exports.acceptStaffInvitation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to accept an invitation.');
    }
    const { clinicId, inviteId, token } = data;
    if (!clinicId || !inviteId || !token) {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId, inviteId, and token are required.');
    }
    const inviteRef = db.collection('clinics').doc(clinicId).collection('invitations').doc(inviteId);
    const inviteSnap = await inviteRef.get();
    if (!inviteSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Invitation not found.');
    }
    const inviteData = inviteSnap.data();
    if (inviteData.status !== 'pending') {
        throw new functions.https.HttpsError('failed-precondition', 'Invitation has already been accepted or revoked.');
    }
    if (new Date(inviteData.expiresAt).getTime() < Date.now()) {
        throw new functions.https.HttpsError('failed-precondition', 'Invitation has expired.');
    }
    if (!safeCompareTokens(token.trim(), inviteData.token.trim())) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid invitation token.');
    }
    // Record member document
    const memberRef = db.collection('clinics').doc(clinicId).collection('members').doc(context.auth.uid);
    const userRef = db.collection('users').doc(context.auth.uid);
    await db.runTransaction(async (transaction) => {
        transaction.set(memberRef, {
            userId: context.auth.uid,
            email: context.auth.token.email || inviteData.email,
            name: inviteData.name,
            role: inviteData.role,
            title: inviteData.title,
            status: 'active',
            clinicId,
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.set(userRef, {
            role: inviteData.role,
            clinicId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        transaction.update(inviteRef, {
            status: 'accepted',
            acceptedBy: context.auth.uid,
            acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    });
    // Assign custom claims
    await admin.auth().setCustomUserClaims(context.auth.uid, {
        role: inviteData.role,
        clinicId,
    });
    return {
        success: true,
        role: inviteData.role,
        clinicId,
        message: 'Staff membership activated successfully.',
    };
});
/**
 * 6.3. Callable Cloud Function: updateStaffRole
 * Updates a member's role and immediately revokes refresh tokens on demotion
 */
exports.updateStaffRole = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { clinicId, targetUid, newRole } = data;
    if (!clinicId || !targetUid || !newRole) {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId, targetUid, and newRole are required.');
    }
    const callerRole = context.auth.token?.role;
    const callerClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isSuperAdmin && (callerRole !== 'admin' || callerClinicId !== clinicId)) {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic administrators can update staff roles.');
    }
    const allowedRoles = ['admin', 'staff', 'practitioner', 'editor'];
    if (!allowedRoles.includes(newRole)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${newRole}`);
    }
    const memberRef = db.collection('clinics').doc(clinicId).collection('members').doc(targetUid);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Staff member record not found.');
    }
    const currentRole = memberSnap.data()?.role;
    // Last-Admin Protection: If demoting an admin, ensure at least one other active admin remains
    if (currentRole === 'admin' && newRole !== 'admin') {
        const adminDocs = await db
            .collection('clinics')
            .doc(clinicId)
            .collection('members')
            .where('role', '==', 'admin')
            .where('status', '==', 'active')
            .get();
        if (adminDocs.size <= 1) {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot demote the last administrator. Transfer clinic ownership first.');
        }
    }
    // Update member doc
    await memberRef.set({
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await db.collection('users').doc(targetUid).set({
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Update Custom Claims
    await admin.auth().setCustomUserClaims(targetUid, {
        role: newRole,
        clinicId,
    });
    // Revoke session refresh tokens to enforce immediate demotion across active sessions
    if (currentRole === 'admin' && newRole !== 'admin') {
        await admin.auth().revokeRefreshTokens(targetUid);
    }
    return {
        success: true,
        targetUid,
        newRole,
        message: `Staff member role updated to ${newRole}.`,
    };
});
/**
 * 6.4. Callable Cloud Function: removeStaffMember
 * Deactivates a staff member and revokes refresh tokens to terminate active sessions
 */
exports.removeStaffMember = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const { clinicId, targetUid } = data;
    if (!clinicId || !targetUid) {
        throw new functions.https.HttpsError('invalid-argument', 'clinicId and targetUid are required.');
    }
    const callerRole = context.auth.token?.role;
    const callerClinicId = context.auth.token?.clinicId;
    const isSuperAdmin = context.auth.token?.superAdmin === true;
    if (!isSuperAdmin && (callerRole !== 'admin' || callerClinicId !== clinicId)) {
        throw new functions.https.HttpsError('permission-denied', 'Only clinic administrators can remove staff members.');
    }
    const memberRef = db.collection('clinics').doc(clinicId).collection('members').doc(targetUid);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Staff member record not found.');
    }
    const currentRole = memberSnap.data()?.role;
    // Last-Admin Protection: Prevent removal of the last administrator
    if (currentRole === 'admin') {
        const adminDocs = await db
            .collection('clinics')
            .doc(clinicId)
            .collection('members')
            .where('role', '==', 'admin')
            .where('status', '==', 'active')
            .get();
        if (adminDocs.size <= 1) {
            throw new functions.https.HttpsError('failed-precondition', 'Cannot remove the last administrator without first transferring clinic ownership.');
        }
    }
    // Deactivate member
    await memberRef.set({
        status: 'deactivated',
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deactivatedBy: context.auth.uid,
    }, { merge: true });
    await db.collection('users').doc(targetUid).set({
        role: 'patient',
        clinicId: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Revoke Custom Claims and Revoke Refresh Tokens for immediate enforcement
    await admin.auth().setCustomUserClaims(targetUid, {
        role: 'patient',
        clinicId: null,
    });
    await admin.auth().revokeRefreshTokens(targetUid);
    return {
        success: true,
        targetUid,
        status: 'deactivated',
        message: 'Staff member deactivated and active sessions revoked.',
    };
});
/**
 * 7. Scheduled Cleanup Function: cleanupStaleDemoSessions
 * Runs daily at midnight to purge expired temporary preview/demo sessions
 */
exports.cleanupStaleDemoSessions = functions.pubsub.schedule('every 24 hours').onRun(async () => {
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
/**
 * 8. Secure Guest Appointment Lookup Callable Function
 * Accepts { referenceKey, last4Phone }. Verifies both against the stored appointment document in Firestore via Admin SDK.
 * Implements server-side rate limiting:
 * - Increments a counter at rate_limits/guest_lookup_{hashedRefKey}
 * - If count > 5 within 15 minutes, throws HttpsError('resource-exhausted', 'Too many attempts. Please call the clinic to verify your booking.')
 * - Resets the counter on successful lookup
 * Returns a sanitized subset of public fields and explicitly strips sensitive clinical/payment/PII fields.
 */
exports.lookupAppointmentSecurely = functions.https.onCall(async (data, context) => {
    const { referenceKey, last4Phone } = data || {};
    if (!referenceKey || typeof referenceKey !== 'string' || referenceKey.trim().length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Valid referenceKey is required.');
    }
    if (!last4Phone || typeof last4Phone !== 'string' || last4Phone.trim().length !== 4) {
        throw new functions.https.HttpsError('invalid-argument', 'Valid last-4 phone digits are required.');
    }
    const cleanRef = referenceKey.trim().toUpperCase();
    const cleanPhone = last4Phone.trim().replace(/\D/g, '');
    const hashedRefKey = crypto.createHash('sha256').update(cleanRef).digest('hex');
    const rateLimitRef = db.doc(`rate_limits/guest_lookup_${hashedRefKey}`);
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;
    // 1. Check and enforce rate limiting per reference key
    const rateLimitSnap = await rateLimitRef.get();
    let count = 0;
    let windowStart = now;
    if (rateLimitSnap.exists) {
        const rateData = rateLimitSnap.data() || {};
        windowStart = rateData.windowStart || now;
        if (now - windowStart < fifteenMinutes) {
            count = rateData.count || 0;
            if (count >= 5) {
                throw new functions.https.HttpsError('resource-exhausted', 'Too many attempts. Please call the clinic to verify your booking.');
            }
        }
        else {
            windowStart = now;
            count = 0;
        }
    }
    // Increment attempt counter before verifying
    await rateLimitRef.set({
        count: count + 1,
        windowStart,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    try {
        const docRef = db.collection('appointments').doc(cleanRef);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return null;
        }
        const appt = docSnap.data();
        if (!appt)
            return null;
        const storedPhoneRaw = String(appt.phone || '').replace(/\D/g, '');
        const storedLast4 = storedPhoneRaw.slice(-4);
        if (storedLast4.length !== 4 || storedLast4 !== cleanPhone) {
            return null;
        }
        // Reset rate limit on successful lookup
        try {
            await rateLimitRef.delete();
        }
        catch {
            // Ignore delete cleanup error
        }
        // Return sanitized subset of public fields (stripping notes, intakeForm, cancellationReason, paymentMethod, cardLast4, cardBrand, transactionId, patientEmail)
        return {
            id: appt.id || cleanRef,
            referenceKey: appt.referenceKey || cleanRef,
            clinicId: appt.clinicId,
            patientName: appt.patientName,
            date: appt.date,
            time: appt.time,
            status: appt.status,
            practitionerId: appt.practitionerId,
            serviceId: appt.serviceId,
            amount: appt.amount,
            createdAt: appt.createdAt,
        };
    }
    catch (err) {
        if (err instanceof functions.https.HttpsError) {
            throw err;
        }
        functions.logger.error('Error in lookupAppointmentSecurely:', err);
        throw new functions.https.HttpsError('internal', 'Failed to retrieve appointment securely.');
    }
});
//# sourceMappingURL=index.js.map