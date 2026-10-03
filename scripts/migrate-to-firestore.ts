/**
 * Idempotent Data Migration & Reconciliation Script: Local / Staging -> Cloud Firestore
 *
 * Usage:
 *   # Dry-run audit (does NOT write to Firestore):
 *   npx tsx scripts/migrate-to-firestore.ts --dry-run
 *
 *   # Execute migration:
 *   npx tsx scripts/migrate-to-firestore.ts
 *
 * Guarantees:
 * 1. Idempotent execution (safe to run multiple times).
 * 2. Never infers patient account ownership from an unverified email address.
 * 3. Never turns a client-supplied "paid" value into a trusted payment unless accompanied
 *    by a verified gateway transaction ID (e.g. pi_...).
 * 4. Flags ambiguous clinic ownership, unverified payment provenance, and unlinked guests.
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const isDryRun = process.argv.includes('--dry-run');

// Read Firebase Config from Environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

const PRIMARY_CLINIC_ID = process.env.VITE_CLINIC_ID || 'columbus-chiropractic';

interface MigrationAuditRecord {
  collection: string;
  id: string;
  status: 'valid' | 'flagged';
  flags: string[];
  data: Record<string, any>;
}

async function runMigration() {
  console.log('====================================================');
  console.log(`🚀 Practice OS Idempotent Migration Pipeline`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Audit Only — No Writes)' : '⚡ LIVE WRITE'}`);
  console.log(`Target Clinic Tenant: ${PRIMARY_CLINIC_ID}`);
  console.log('====================================================\n');

  let db: any = null;
  let auth: any = null;

  if (!isDryRun) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.error('❌ Cannot run live migration: Firebase credentials missing in environment.');
      process.exit(1);
    }
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {}, process.env.VITE_FIREBASE_DATABASE_ID || '(default)');
  }

  const auditLog: MigrationAuditRecord[] = [];

  // 1. Audit / Migrate Clinic Organization
  const clinicEntity = {
    id: PRIMARY_CLINIC_ID,
    name: 'Columbus Chiropractic Care',
    slug: 'columbus-chiropractic',
    phone: '(614) 555-0192',
    email: 'care@columbuschiropractic.com',
    address: '1200 N High St, Suite 250',
    city: 'Columbus',
    state: 'OH',
    zip: '43201',
    active: true,
    currency: 'gbp',
    currencySymbol: '£',
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
  };

  auditLog.push({
    collection: 'clinics',
    id: clinicEntity.id,
    status: 'valid',
    flags: [],
    data: clinicEntity,
  });

  // 2. Audit / Migrate Conditions
  const conditions = [
    {
      id: 'cond_lower_back',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Lower Back Pain & Lumbar Dysfunction',
      slug: 'lower-back-pain',
      description: 'Evidence-based decompression and spinal manipulation for acute and chronic lumbar strain.',
    },
    {
      id: 'cond_sciatica',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Sciatica & Radiculopathy',
      slug: 'sciatica-decompression',
      description: 'Nerve glide flossing and sacroiliac joint re-alignment to relieve pinching and sharp radiant leg pain.',
    },
    {
      id: 'cond_cervical',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Neck Pain, Posture & Cervicogenic Headaches',
      slug: 'neck-posture-headaches',
      description: 'Ergonomic alignment and upper cervical mobilization to eliminate tension headaches.',
    },
  ];

  for (const cond of conditions) {
    auditLog.push({
      collection: 'conditions',
      id: cond.id,
      status: 'valid',
      flags: [],
      data: cond,
    });
  }

  // 3. Audit Candidate Appointments with Provenance & Linkage Checks
  const rawAppointments = [
    {
      id: 'COL-5182-M93L',
      clinicId: PRIMARY_CLINIC_ID,
      patientId: 'patient_synthetic_01',
      patientName: 'Jane Synthetic',
      patientEmail: 'jane.synthetic@example.local',
      date: '2026-10-20',
      time: '11:00 AM',
      serviceTitle: 'Initial Consultation & Diagnostic Assessment',
      status: 'confirmed',
      paymentStatus: 'paid_full',
      transactionId: 'pi_3PtestVerifiedStripe001', // Real Gateway Provenance
      priceAmount: 85,
      amountPaid: 85,
    },
    {
      id: 'UNVERIFIED-PAY-002',
      clinicId: PRIMARY_CLINIC_ID,
      patientName: 'Bob Unverified',
      patientEmail: 'bob@example.local',
      date: '2026-10-22',
      time: '02:00 PM',
      serviceTitle: 'Follow-Up Adjustment',
      status: 'new',
      paymentStatus: 'paid_full',
      transactionId: undefined, // Missing gateway provenance!
      priceAmount: 55,
    },
    {
      id: 'AMBIGUOUS-TENANT-003',
      clinicId: '', // Missing tenant boundary!
      patientName: 'Alice Stray',
      patientEmail: 'alice@external.local',
      date: '2026-10-25',
      time: '09:30 AM',
      serviceTitle: 'Consultation',
      status: 'new',
      paymentStatus: 'unpaid',
    },
  ];

  for (const raw of rawAppointments) {
    const flags: string[] = [];
    let isFlagged = false;

    // Check 1: Tenant Boundary
    const resolvedClinicId = raw.clinicId || PRIMARY_CLINIC_ID;
    if (!raw.clinicId) {
      flags.push('AMBIGUOUS_CLINIC_OWNERSHIP: Missing explicit clinicId. Defaulting to PRIMARY_CLINIC_ID requires operator review.');
      isFlagged = true;
    }

    // Check 2: Payment Provenance Verification
    let reconciledPaymentStatus = raw.paymentStatus;
    if (raw.paymentStatus === 'paid_full' || raw.paymentStatus === 'deposit_paid') {
      const hasGatewayProof = raw.transactionId && raw.transactionId.startsWith('pi_');
      if (!hasGatewayProof) {
        flags.push(
          `UNVERIFIED_PAYMENT_PROVENANCE: Record claims '${raw.paymentStatus}' without verified Stripe transactionId. Reconciling to 'unpaid'.`
        );
        reconciledPaymentStatus = 'unpaid';
        isFlagged = true;
      }
    }

    // Check 3: Patient Linkage Verification
    let reconciledPatientId = raw.patientId;
    if (!raw.patientId && raw.patientEmail) {
      flags.push(
        'UNVERIFIED_PATIENT_LINKAGE: Guest booking with email only. Not linked to any auth account to prevent identity assumption.'
      );
      reconciledPatientId = undefined;
    }

    const sanitizedRecord = {
      ...raw,
      clinicId: resolvedClinicId,
      patientId: reconciledPatientId,
      paymentStatus: reconciledPaymentStatus,
      schemaVersion: 1,
      reconciledAt: new Date().toISOString(),
    };

    auditLog.push({
      collection: 'appointments',
      id: raw.id,
      status: isFlagged ? 'flagged' : 'valid',
      flags,
      data: sanitizedRecord,
    });
  }

  // 4. Output Reconciliation Report
  console.log('📋 MIGRATION AUDIT REPORT:\n');
  let validCount = 0;
  let flaggedCount = 0;

  for (const record of auditLog) {
    if (record.status === 'valid') {
      validCount++;
      console.log(`  ✓ [VALID] [${record.collection}] ${record.id}`);
    } else {
      flaggedCount++;
      console.warn(`  ⚠️ [FLAGGED] [${record.collection}] ${record.id}`);
      for (const flag of record.flags) {
        console.warn(`     └── ${flag}`);
      }
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total Inspected Records: ${auditLog.length}`);
  console.log(`Valid Records:           ${validCount}`);
  console.log(`Flagged for Review:      ${flaggedCount}`);
  console.log('----------------------------------------------------\n');

  if (isDryRun) {
    console.log('🔍 Dry run complete. No writes were executed on Cloud Firestore.');
    return;
  }

  // 5. Execute Live Migration Writes
  console.log('🚀 Executing idempotent live writes to Firestore...');
  for (const record of auditLog) {
    const docRef = doc(db, record.collection, record.id);
    await setDoc(docRef, record.data, { merge: true });
    console.log(`  ✓ Written: [${record.collection}] ${record.id}`);
  }

  console.log('\n✅ Live Migration finished successfully.');
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
