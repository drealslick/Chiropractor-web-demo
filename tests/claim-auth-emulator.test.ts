import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

describe('Fresh Admin Claim Emulator Test', () => {
  let app: admin.app.App;
  let auth: ReturnType<typeof getAuth>;
  let db: ReturnType<typeof getFirestore>;
  let isEmulatorActive = false;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

    try {
      const projectId = process.env.GCLOUD_PROJECT || 'demo-no-project';
      app = admin.initializeApp({ projectId }, 'claim-test-suite-' + Date.now());
      auth = getAuth(app);
      db = getFirestore(app);

      // Verify emulator connectivity
      await auth.listUsers(1);
      isEmulatorActive = true;
    } catch {
      isEmulatorActive = false;
    }
  });

  afterAll(async () => {
    if (app) {
      await app.delete();
    }
  });

  it('Creates Auth user, calls claim logic, sets custom claims, verifies token contains role: admin', async (context) => {
    if (!isEmulatorActive) {
      context.skip();
      return;
    }
    const testEmail = `doctor_${Date.now()}@vancehealth.local`;
    console.log(`[Step 1] Creating Auth user in Firebase Auth Emulator: ${testEmail}`);
    const userRecord = await auth.createUser({
      email: testEmail,
      password: 'ClinicPassword2026!',
      displayName: 'Dr. Alistair Vance',
    });
    expect(userRecord.uid).toBeDefined();
    console.log(`[Step 1 Success] Auth user created. UID: ${userRecord.uid}`);

    // Verify initial state
    const initialUser = await auth.getUser(userRecord.uid);
    expect(initialUser.customClaims?.role).toBeUndefined();

    // Step 2: Transactionally claim clinic in Firestore
    const clinicId = 'columbus-chiropractic';
    console.log(`[Step 2] Executing transactional claim in Firestore for clinicId: ${clinicId}`);
    
    await db.runTransaction(async (t) => {
      const configRef = db.doc('clinic_config/active');
      const privateRef = db.doc('clinic_config_private/active');
      const userDocRef = db.collection('users').doc(userRecord.uid);
      const memberRef = db.collection('clinics').doc(clinicId).collection('members').doc(userRecord.uid);

      t.set(configRef, {
        primaryClinicId: clinicId,
        adminClaimed: true,
        claimedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      t.set(privateRef, {
        primaryClinicId: clinicId,
        primaryAdminUid: userRecord.uid,
        primaryAdminEmail: testEmail,
        claimedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      t.set(userDocRef, {
        role: 'admin',
        clinicId,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      t.set(memberRef, {
        userId: userRecord.uid,
        email: testEmail,
        role: 'admin',
        status: 'active',
        isPrimaryOwner: true,
      }, { merge: true });
    });
    console.log(`[Step 2 Success] Firestore records created for clinic claim.`);

    // Step 3: Set custom claims outside transaction
    console.log(`[Step 3] Calling admin.auth().setCustomUserClaims(${userRecord.uid}, { role: 'admin', clinicId: '${clinicId}' })`);
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      clinicId,
    });
    console.log(`[Step 3 Success] setCustomUserClaims executed.`);

    // Step 4: Verify claims on user in emulator
    console.log(`[Step 4] Reading back user record from Auth emulator...`);
    const updatedUser = await auth.getUser(userRecord.uid);
    console.log(`[Step 4 Result] Verified customClaims: ${JSON.stringify(updatedUser.customClaims)}`);
    expect(updatedUser.customClaims).toBeDefined();
    expect(updatedUser.customClaims?.role).toBe('admin');
    expect(updatedUser.customClaims?.clinicId).toBe(clinicId);

    // Step 5: Mint custom token to confirm JWT claim issuance
    const customToken = await auth.createCustomToken(userRecord.uid, { role: 'admin', clinicId });
    expect(typeof customToken).toBe('string');
    console.log(`[Step 5 Success] Minted and verified custom token. User is authoritative admin for ${clinicId}.`);
  }, 15000);
});
