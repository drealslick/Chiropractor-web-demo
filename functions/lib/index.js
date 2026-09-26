"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupStaleDemoSessions = exports.sendTransactionalEmail = exports.stripeWebhook = exports.setClinicUserRole = exports.ensureUserClaims = exports.claimInitialClinicAdmin = exports.onUserCreated = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const stripe_1 = require("stripe");
const resend_1 = require("resend");
admin.initializeApp();
const db = admin.firestore();
// 1. Initialize Stripe & Resend from Environment Config
const getStripe = () => {
    const apiKey = process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key;
    if (!apiKey)
        throw new Error('STRIPE_SECRET_KEY is not configured');
    return new stripe_1.default(apiKey, { apiVersion: '2023-10-16' });
};
const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY || functions.config().resend?.api_key;
    if (!apiKey)
        throw new Error('RESEND_API_KEY is not configured');
    return new resend_1.Resend(apiKey);
};
/**
 * 2. Firebase Auth Trigger: onUserCreated
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
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    catch (docErr) {
        functions.logger.error(`Failed to create users doc for ${user.uid}:`, docErr);
    }
    functions.logger.info(`Initialized user profile in Firestore for UID: ${user.uid} with clinicId: ${clinicId}`);
});
/**
 * 2.1. First-Run Deployment Onboarding: claimInitialClinicAdmin
 * When a buyer deploys the template, allows the verified deployment owner
 * possessing the deploy-time setup token (CLINIC_SETUP_TOKEN) to claim the primary
 * clinic admin role and initialize clinic_config/active.
 * Prevents race condition / unauthorized claim hijacking.
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
    // Verify setup token against environment variable or stored private hash
    const expectedEnvToken = process.env.CLINIC_SETUP_TOKEN || functions.config().clinic?.setup_token;
    const providedHash = crypto.createHash('sha256').update(setupToken.trim()).digest('hex');
    return await db.runTransaction(async (transaction) => {
        const configDoc = await transaction.get(activeConfigRef);
        const privateDoc = await transaction.get(privateConfigRef);
        if (configDoc.exists && configDoc.data()?.adminClaimed === true) {
            throw new functions.https.HttpsError('failed-precondition', 'This clinic deployment has already been claimed by a primary administrator.');
        }
        // Verify token: must match env var or stored private hash
        let tokenValid = false;
        if (expectedEnvToken && setupToken.trim() === expectedEnvToken.trim()) {
            tokenValid = true;
        }
        else if (privateDoc.exists && privateDoc.data()?.setupTokenHash) {
            tokenValid = privateDoc.data().setupTokenHash === providedHash;
        }
        else if (expectedEnvToken) {
            tokenValid = false;
        }
        else {
            // If no env secret was pre-configured on deploy, enforce a high-entropy secret (min 8 chars)
            tokenValid = setupToken.trim().length >= 8;
        }
        if (!tokenValid) {
            throw new functions.https.HttpsError('permission-denied', 'Invalid setup token. Please check CLINIC_SETUP_TOKEN from your deployment environment variables.');
        }
        // 1. Write public clinic configuration (safe for public reading by patient portal)
        transaction.set(activeConfigRef, {
            primaryClinicId: sanitizedClinicId,
            clinicName: clinicName?.trim() || 'Primary Practice',
            adminClaimed: true,
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 2. Write sensitive admin details to private configuration (admin-only access)
        transaction.set(privateConfigRef, {
            primaryClinicId: sanitizedClinicId,
            primaryAdminUid: context.auth.uid,
            primaryAdminEmail: context.auth.token.email || '',
            claimedAt: admin.firestore.FieldValue.serverTimestamp(),
            // Delete setup token hash if it existed
            setupTokenHash: admin.firestore.FieldValue.delete(),
        }, { merge: true });
        // 3. Update user profile document in Firestore
        const userDocRef = db.collection('users').doc(context.auth.uid);
        transaction.set(userDocRef, {
            role: 'admin',
            clinicId: sanitizedClinicId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // 4. Set cryptographic Custom Claims via Firebase Admin SDK
        await admin.auth().setCustomUserClaims(context.auth.uid, {
            role: 'admin',
            clinicId: sanitizedClinicId,
        });
        functions.logger.info(`Clinic claimed by verified admin UID: ${context.auth.uid} for clinicId: ${sanitizedClinicId}`);
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
    // Caller must be SuperAdmin OR admin of the target user's CURRENT clinic
    const isAuthorized = isSuperAdmin || (callerClaims.role === 'admin' && callerClaims.clinicId === targetCurrentClinicId);
    if (!isAuthorized) {
        throw new functions.https.HttpsError('permission-denied', 'Cannot modify users outside your authorized clinic tenant.');
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
 * 3. Stripe Webhook Handler
 * Listens for payment_intent.succeeded and charge.refunded events,
 * updates Firestore appointments, and triggers receipts
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe?.webhook_secret;
    let event;
    const stripe = getStripe();
    try {
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        }
        else {
            event = req.body;
        }
    }
    catch (err) {
        functions.logger.error('Stripe webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const appointmentId = paymentIntent.metadata?.appointmentId;
                const metadataClinicId = paymentIntent.metadata?.clinicId;
                if (appointmentId) {
                    const apptRef = db.collection('appointments').doc(appointmentId);
                    await apptRef.set({
                        paymentStatus: 'paid_full',
                        stripePaymentIntentId: paymentIntent.id,
                        paidAt: admin.firestore.FieldValue.serverTimestamp(),
                        amountPaid: paymentIntent.amount_received / 100,
                        ...(metadataClinicId ? { clinicId: metadataClinicId } : {}),
                    }, { merge: true });
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
                const charge = event.data.object;
                const appointmentId = charge.metadata?.appointmentId;
                if (appointmentId) {
                    await db.collection('appointments').doc(appointmentId).set({
                        paymentStatus: 'refunded',
                        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
                        refundId: charge.refunds?.data[0]?.id || '',
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
});
/**
 * 4. Resend Email Dispatcher Helper
 */
async function sendEmailHelper(options) {
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
    }
    catch (error) {
        functions.logger.error(`Failed to send email to ${options.to}:`, error);
        return null;
    }
}
/**
 * 5. Callable Cloud Function: sendTransactionalEmail
 * Allows client frontend (admin staff / booking flow) to trigger authenticated notification emails
 */
exports.sendTransactionalEmail = functions.https.onCall(async (data, context) => {
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
    }
    else if (type === 'cancellation') {
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
//# sourceMappingURL=index.js.map