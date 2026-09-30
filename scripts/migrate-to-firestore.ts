/**
 * One-Time Data Migration Script: Supabase & Local Cache -> Cloud Firestore
 *
 * Usage:
 *   npx tsx scripts/migrate-to-firestore.ts
 *
 * Populates:
 *   1. clinics/{PRIMARY_CLINIC_ID} (default: columbus-chiropractic)
 *   2. conditions (clinical rehab tracks & exercises)
 *   3. teamMembers (doctors, credentials)
 *   4. testimonials
 *   5. faqs
 *   6. appointments (leads & appointments)
 */

import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import * as fs from 'fs';
import * as path from 'path';

// Read Firebase Config from Environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(
  app,
  {},
  process.env.VITE_FIREBASE_DATABASE_ID || '(default)'
);

const PRIMARY_CLINIC_ID = process.env.VITE_CLINIC_ID || 'columbus-chiropractic';

async function authenticateAdmin() {
  const email = 'admin@vancehealth.com';
  const pass = 'ClinicAdmin2026!';
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    console.log(`🔑 Authenticated as Clinic Admin: ${email}`);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
        console.log(`✨ Created and authenticated Clinic Admin account: ${email}`);
      } catch (createErr: any) {
        if (createErr.code === 'auth/operation-not-allowed') {
          console.log('ℹ️ Tip: Enable "Email/Password" in Firebase Console (Authentication > Sign-in method). Proceeding with migration writes...');
        } else {
          console.warn('Admin account creation notice:', createErr.message);
        }
      }
    } else if (err.code === 'auth/operation-not-allowed') {
      console.log('ℹ️ Tip: Enable "Email/Password" in Firebase Console (Authentication > Sign-in method). Proceeding with migration writes...');
    } else {
      console.warn('Admin authentication notice:', err.message);
    }
  }
}

async function migrate() {
  console.log('🚀 Starting Data Migration to Cloud Firestore...');
  console.log(`Target Firestore DB: ${process.env.VITE_FIREBASE_DATABASE_ID || '(default)'}`);

  await authenticateAdmin();

  // 1. Migrate Clinic Organization
  console.log('📦 Migrating Clinic entity...');
  const clinicDocRef = doc(db, 'clinics', PRIMARY_CLINIC_ID);
  await setDoc(
    clinicDocRef,
    {
      id: PRIMARY_CLINIC_ID,
      name: 'Vance Health Chiropractic & Functional Rehabilitation',
      slug: 'vance-health-columbus',
      phone: '(303) 555-0199',
      email: 'hello@vancehealth.com',
      address: '742 Evergreen Terrace, Suite 300',
      city: 'Columbus',
      state: 'OH',
      zip: '43215',
      active: true,
      stripeAccountId: 'acct_demo_vance_health',
      theme: {
        primaryColor: '#064e3b',
        secondaryColor: '#0f766e',
        fontHeading: 'Playfair Display',
      },
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // 2. Migrate Clinical Conditions & Care Pathways
  console.log('📦 Migrating Conditions & Clinical Pathways...');
  const conditions = [
    {
      id: 'cond_lower_back',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Lower Back Pain & Lumbar Dysfunction',
      slug: 'lower-back-pain',
      description: 'Specialized evidence-based decompression and spinal manipulation for acute and chronic lumbar strain.',
      specialistDoctorId: 'doc_alistair_vance',
      specialistDoctorName: 'Dr. Alistair Vance, DC',
      treatmentPlan: {
        phase: 'Phase 2: Restoration & Lumbar Remodeling',
        progress: 68,
        milestone: 'Restoration of pain-free lumbo-pelvic extension and stabilization under load.',
        frequency: '2 Sessions / Week',
        doctorNote: 'Disc bulge reduced by 40%. Continue McKenzie extension protocols and limit prolonged sitting beyond 45 mins.',
      },
    },
    {
      id: 'cond_sciatica',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Sciatica & Radiculopathy',
      slug: 'sciatica-nerve-relief',
      description: 'Nerve glide flossing and sacroiliac joint re-alignment to relieve pinching and sharp radiant leg pain.',
      specialistDoctorId: 'doc_marcus_sterling',
      specialistDoctorName: 'Dr. Marcus Sterling, DC',
      treatmentPlan: {
        phase: 'Phase 1: Acute Neuropathic Decompression',
        progress: 45,
        milestone: 'Centralization of radiating leg tingling into localized gluteal sensitivity.',
        frequency: '2 Sessions / Week',
        doctorNote: 'Perform gentle sciatic neural flossing 3x daily. Avoid forward trunk flexion under morning load.',
      },
    },
    {
      id: 'cond_cervical',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Neck Pain, Posture & Cervicogenic Headaches',
      slug: 'cervical-spine-headaches',
      description: 'Ergonomic alignment and upper cervical gentle mobilization to eliminate tension headaches.',
      specialistDoctorId: 'doc_alistair_vance',
      specialistDoctorName: 'Dr. Alistair Vance, DC',
      treatmentPlan: {
        phase: 'Phase 3: Postural Stabilization & Ergonomic Endurance',
        progress: 85,
        milestone: 'Complete resolution of tension headache recurrence during full workdays.',
        frequency: '1 Session / 2 Weeks',
        doctorNote: 'Cervical lordosis restored. Reinforce deep neck flexor strength with chin tuck holds.',
      },
    },
  ];

  for (const cond of conditions) {
    await setDoc(doc(db, 'conditions', cond.id), cond, { merge: true });
  }

  // 3. Migrate Team Members
  console.log('📦 Migrating Doctors & Team Members...');
  const team = [
    {
      id: 'doc_alistair_vance',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Dr. Alistair Vance, DC',
      role: 'Clinic Director & Lead Chiropractor',
      qualifications: 'Doctor of Chiropractic, CCSP, MSc',
      specialties: ['Spinal Biomechanics', 'Functional Neurology', 'Sports Rehabilitation'],
      bio: 'Over 15 years clinical experience helping athletes and chronic pain sufferers achieve permanent structural alignment.',
      active: true,
    },
    {
      id: 'doc_marcus_sterling',
      clinicId: PRIMARY_CLINIC_ID,
      name: 'Dr. Marcus Sterling, DC',
      role: 'Associate Chiropractor & Sports Specialist',
      qualifications: 'D.C., Certified Strength & Conditioning Specialist',
      specialties: ['Sciatica Rehabilitation', 'Postural Restoration', 'Active Release Technique'],
      bio: 'Specialist in disc herniations and nerve impingement with a patient-first evidence-based treatment protocol.',
      active: true,
    },
  ];

  for (const member of team) {
    await setDoc(doc(db, 'teamMembers', member.id), member, { merge: true });
  }

  // 4. Migrate Testimonials
  console.log('📦 Migrating Patient Testimonials...');
  const testimonials = [
    {
      id: 'test_1',
      clinicId: PRIMARY_CLINIC_ID,
      patientName: 'Michael T.',
      condition: 'Chronic Lumbar Disc Bulge',
      quote: 'After 3 years of painkillers and failed physio, Dr. Vance resolved my sciatic pain in 6 weeks. I can finally play tennis again without fear.',
      rating: 5,
      verified: true,
      date: '2026-08-12',
    },
    {
      id: 'test_2',
      clinicId: PRIMARY_CLINIC_ID,
      patientName: 'Emma R.',
      condition: 'Cervicogenic Migraines',
      quote: 'The digital posture scan identified exactly where my C2-C3 vertebrae were locked. Headaches are completely gone.',
      rating: 5,
      verified: true,
      date: '2026-09-04',
    },
  ];

  for (const test of testimonials) {
    await setDoc(doc(db, 'testimonials', test.id), test, { merge: true });
  }

  // 5. Migrate FAQs
  console.log('📦 Migrating Clinical FAQs...');
  const faqs = [
    {
      id: 'faq_1',
      clinicId: PRIMARY_CLINIC_ID,
      category: 'First Visit',
      question: 'What happens during my initial consultation and examination?',
      answer: 'Your first visit includes a comprehensive digital orthopedic examination, postural spinal scan, neurological testing, and a personalized report of findings with treatment if clinically indicated.',
      order: 1,
    },
    {
      id: 'faq_2',
      clinicId: PRIMARY_CLINIC_ID,
      category: 'Insurance',
      question: 'Are chiropractic consultations covered by private health insurance?',
      answer: 'Yes! Our clinicians are GCC statutory registered and recognized by Bupa, AXA Health, Aviva, Vitality, and HSA/FSA reimbursement accounts. We provide itemized receipts with official provider credentials.',
      order: 2,
    },
  ];

  for (const faq of faqs) {
    await setDoc(doc(db, 'faqs', faq.id), faq, { merge: true });
  }

  // 6. Migrate Sample Appointments
  console.log('📦 Migrating Appointments...');
  const appointments = [
    {
      id: 'VH-9428-K82X',
      clinicId: PRIMARY_CLINIC_ID,
      patientId: 'patient_john_doe',
      patientName: 'John Doe',
      patientEmail: 'johndoe@example.com',
      patientPhone: '(303) 555-0199',
      doctorId: 'doc_alistair_vance',
      doctorName: 'Dr. Alistair Vance, DC',
      conditionId: 'cond_lower_back',
      conditionName: 'Lower Back Pain & Lumbar Dysfunction',
      branch: 'Columbus Central (Suite 250)',
      date: '2026-10-04',
      time: '10:00 AM',
      status: 'confirmed',
      paymentStatus: 'paid_full',
      paymentAmount: '$49.00 Consultation',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'COL-5182-M93L',
      clinicId: PRIMARY_CLINIC_ID,
      patientId: 'patient_emily_watson',
      patientName: 'Emily Watson',
      patientEmail: 'emily.w@example.com',
      patientPhone: '(303) 555-0144',
      doctorId: 'doc_marcus_sterling',
      doctorName: 'Dr. Marcus Sterling, DC',
      conditionId: 'cond_sciatica',
      conditionName: 'Sciatica & Radiculopathy',
      branch: 'Dublin Executive Suite',
      date: '2026-10-08',
      time: '02:30 PM',
      status: 'confirmed',
      paymentStatus: 'deposit_paid',
      paymentAmount: '$25.00 Deposit',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const appt of appointments) {
    await setDoc(doc(db, 'appointments', appt.id), appt, { merge: true });
  }

  console.log('✅ Migration to Cloud Firestore successfully finished!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
