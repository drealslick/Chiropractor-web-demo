import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// Make sure GOOGLE_APPLICATION_CREDENTIALS points to your serviceAccountKey.json
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

interface UserClaimAssignment {
  email: string;
  role: 'admin' | 'staff' | 'patient';
  clinicId: string;
}

/**
 * Define your user assignments here:
 */
const USERS_TO_CONFIGURE: UserClaimAssignment[] = [
  // Example entries — update with your real users:
  // { email: 'doctor@vancechiro.com', role: 'admin', clinicId: 'columbus-chiropractic' },
  // { email: 'frontdesk@vancechiro.com', role: 'staff', clinicId: 'columbus-chiropractic' },
  // { email: 'patient@gmail.com', role: 'patient', clinicId: 'columbus-chiropractic' },
];

async function assignCustomClaims() {
  console.log(`Starting custom claims assignment for ${USERS_TO_CONFIGURE.length} users...`);

  for (const item of USERS_TO_CONFIGURE) {
    try {
      const user = await auth.getUserByEmail(item.email.trim().toLowerCase());
      
      // 1. Set Custom Claims on Firebase Auth token
      await auth.setCustomUserClaims(user.uid, {
        role: item.role,
        clinicId: item.clinicId,
        superAdmin: item.role === 'admin' && item.clinicId === 'operator',
      });

      // 2. Mirror into Firestore users/{uid} document for client discovery
      await db.collection('users').doc(user.uid).set(
        {
          uid: user.uid,
          email: item.email.trim().toLowerCase(),
          role: item.role,
          clinicId: item.clinicId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`✅ Successfully set claims for ${item.email}: role=${item.role}, clinicId=${item.clinicId}`);
    } catch (error: any) {
      console.error(`❌ Failed to set claims for ${item.email}:`, error.message);
    }
  }

  console.log('Finished assigning claims.');
}

// Do not auto-run until reviewed
// assignCustomClaims();
