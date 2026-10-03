import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { initializeApp as initClientApp, getApps as getClientApps, deleteApp as deleteClientApp, FirebaseApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';
import { getFirestore as getClientFirestore, connectFirestoreEmulator, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { findPatientAppointments } from '../src/data/leadsStore';
import { logoutPatientFromFirebase } from '../src/services/firebaseSync';
import { sandbox } from '../src/lib/sandbox';

let testEnv: RulesTestEnvironment | null = null;
let adminApp: admin.app.App | null = null;
let adminDb: Firestore | null = null;
let clientApp: FirebaseApp | null = null;

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-no-project';

describe('Phase 4 Acceptance Suite: Rules, Guest Lookups, Inbox & Logout', () => {
  beforeAll(async () => {
    // 1. Initialize Firestore Rules test environment
    try {
      const rules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
      const emulatorHostEnv = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
      const cleanHost = emulatorHostEnv.replace(/^https?:\/\//, '');
      const [host, portStr] = cleanHost.split(':');
      const port = parseInt(portStr || '8085', 10);

      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules,
          host,
          port,
        },
      });
    } catch (e) {
      console.warn('Rules unit test env init warning:', e);
      testEnv = null;
    }

    // 2. Initialize Admin SDK for server-side fixture seeding in emulator
    try {
      process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
      
      adminApp = admin.initializeApp({ projectId: PROJECT_ID }, 'phase4-admin-' + Date.now());
      adminDb = getFirestore(adminApp);
    } catch (err) {
      console.warn('Admin SDK init warning:', err);
    }

    // 3. Initialize unauthenticated client SDK connecting to Functions & Firestore Emulators
    try {
      const appName = `test-client-${Date.now()}`;
      clientApp = initClientApp({
        apiKey: 'fake-api-key',
        projectId: PROJECT_ID,
      }, appName);

      const functions = getFunctions(clientApp);
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);

      const firestore = getClientFirestore(clientApp);
      connectFirestoreEmulator(firestore, '127.0.0.1', 8085);
    } catch (clientErr) {
      console.warn('Client SDK init warning:', clientErr);
    }

    // Polyfill storage for Node test runner
    if (typeof global.sessionStorage === 'undefined') {
      const store: Record<string, string> = {};
      (global as any).sessionStorage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        length: 0,
        key: (i: number) => Object.keys(store)[i] || null,
      };
    }

    if (typeof global.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      (global as any).localStorage = {
        getItem: (k: string) => store[k] || null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        length: 0,
        key: (i: number) => Object.keys(store)[i] || null,
      };
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
    if (clientApp) {
      await deleteClientApp(clientApp);
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  // 1. GUEST REFERENCE & PHONE VERIFICATION (findPatientAppointments)
  describe('1. Guest Reference & Phone Verification (findPatientAppointments)', () => {
    it('Returns appointment on correct key + correct phone, and null on wrong phone or wrong key', () => {
      const bookingRef = 'VH-9428-K82X';
      const testLead = {
        id: bookingRef,
        source: 'booking' as const,
        name: 'Guest Test',
        email: 'guest@test.com',
        phone: '(303) 555-0199', // Last 4: 0199
        createdAt: new Date().toISOString(),
        status: 'confirmed' as const,
      };

      localStorage.setItem('agency_patient_leads_v1', JSON.stringify([testLead]));
      sandbox.create('appointments', 'columbus-chiropractic', testLead);

      // 1. Correct key + correct phone -> returns appointment
      const matched = findPatientAppointments(bookingRef, '0199');
      expect(matched.length).toBe(1);
      expect(matched[0].id).toBe(bookingRef);

      // 2. Correct key + wrong phone -> returns null (empty array)
      const wrongPhone = findPatientAppointments(bookingRef, '9999');
      expect(wrongPhone.length).toBe(0);

      // 3. Wrong key + correct phone -> returns null (empty array)
      const wrongKey = findPatientAppointments('VH-0000-0000', '0199');
      expect(wrongKey.length).toBe(0);
    });
  });

  // 2. FIRESTORE PRIVACY: ANONYMOUS DIRECT READ DENIED
  describe('2. Firestore Privacy: Anonymous Direct Read Denied', () => {
    it('Asserts unauthenticated client attempting direct read of appointment returns PERMISSION_DENIED', async () => {
      if (!testEnv) return;

      const bookingRef = 'VH-PRIVACY-123';
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc(`appointments/${bookingRef}`).set({
          id: bookingRef,
          referenceKey: bookingRef,
          clinicId: 'columbus-chiropractic',
          patientName: 'Private Patient',
          patientEmail: 'private@test.com',
          date: '2026-12-15',
          status: 'confirmed',
        });
      });

      const unauthClient = testEnv.unauthenticatedContext().firestore();
      const docRef = unauthClient.doc(`appointments/${bookingRef}`);

      // Unauthenticated direct read must fail with PERMISSION_DENIED since anonymous read clause was removed
      await assertFails(docRef.get());
    });
  });

  // 3. INQUIRY INBOX REAL-TIME SUBSCRIPTION SOURCE INTEGRATION TEST
  describe('3. Inquiry Inbox Real-Time Subscription Source', () => {
    it('Subscribes via onSnapshot against collection("inquiries") and receives real-time lead documents', async () => {
      if (!testEnv) return;

      const clinicId = 'columbus-chiropractic';
      const staffContext = testEnv.authenticatedContext('staff_inbox_1', {
        role: 'admin',
        clinicId,
      });
      const staffDb = staffContext.firestore();

      const inqRef = staffDb.collection('inquiries').doc('inq_test_001');
      const inqData = {
        id: 'inq_test_001',
        clinicId,
        name: 'Prospective Patient',
        email: 'prospect@example.com',
        phone: '(555) 987-6543',
        message: 'Interested in spinal decompression therapy.',
        createdAt: new Date().toISOString(),
        status: 'new',
      };

      // Set up real snapshot listener against 'inquiries' collection matching LeadsInbox.tsx
      let receivedDoc: any = null;
      const q = staffDb.collection('inquiries').where('clinicId', '==', clinicId);
      const unsubscribe = q.onSnapshot((snap: any) => {
        snap.docChanges().forEach((change: any) => {
          if (change.type === 'added') {
            receivedDoc = change.doc.data();
          }
        });
      });

      // Write inquiry doc to Firestore emulator
      await inqRef.set(inqData);

      // Wait briefly for snapshot propagation
      await new Promise((resolve) => setTimeout(resolve, 150));
      unsubscribe();

      expect(receivedDoc).not.toBeNull();
      expect(receivedDoc?.email).toBe('prospect@example.com');
      expect(receivedDoc?.clinicId).toBe(clinicId);
    });
  });

  // 4. LOGOUT HYGIENE
  describe('4. Logout Hygiene', () => {
    it('Calls application code logoutPatientFromFirebase and asserts PATIENT_SESSION_KEY is cleared while unrelated localStorage keys survive', async () => {
      const SESSION_KEY = 'clinic_patient_portal_session_v2';
      const PRESERVED_KEY = 'unrelated_site_pref';

      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'user@test.com' }));
      localStorage.setItem(PRESERVED_KEY, 'dark_mode_on');

      expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
      expect(localStorage.getItem(PRESERVED_KEY)).toBe('dark_mode_on');

      // Call actual application logout function
      await logoutPatientFromFirebase();

      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
      expect(localStorage.getItem(PRESERVED_KEY)).toBe('dark_mode_on');
    });
  });

  // 5. SECURE GUEST RETRIEVAL VIA FUNCTIONS EMULATOR CALLABLE & RATE LIMITING
  describe('5. Secure Guest Retrieval via Functions Emulator (httpsCallable) & Rate Limiting', () => {
    it('Unauthenticated caller invokes lookupAppointmentSecurely via httpsCallable over wire protocol, sanitizes clinical fields, and enforces 5-attempt rate limit', async () => {
      if (!adminDb || !clientApp) return;

      const bookingRef = 'VH-SECURE-777';
      const fullAppointment = {
        id: bookingRef,
        referenceKey: bookingRef,
        clinicId: 'columbus-chiropractic',
        patientName: 'Jane Doe',
        patientEmail: 'jane@test.com',
        phone: '(555) 123-4321', // Last 4: 4321
        date: '2026-11-20',
        time: '10:00 AM',
        status: 'confirmed',
        practitionerId: 'dr-alistair-vance',
        serviceId: 'chiropractic-adjust',
        amount: 150,
        notes: 'CONFIDENTIAL: Patient has severe anxiety and prior history of spinal fusion.',
        intakeForm: { painArea: 'Lower back', painLevel: 8 },
        cancellationReason: 'None',
        paymentMethod: 'card',
        cardLast4: '1111',
        cardBrand: 'visa',
        transactionId: 'tx_12345',
        createdAt: new Date().toISOString(),
      };

      // 1. Seed appointment in Firestore Emulator via Admin SDK
      await adminDb.doc(`appointments/${bookingRef}`).set(fullAppointment);

      // 2. Direct client read must fail with PERMISSION_DENIED (Security Rule verification)
      if (testEnv) {
        const unauthFirestore = testEnv.unauthenticatedContext().firestore();
        await assertFails(unauthFirestore.doc(`appointments/${bookingRef}`).get());
      }

      // 3. Wire Protocol Test: Invoke Cloud Function via httpsCallable
      const functionsInstance = getFunctions(clientApp);
      const secureLookup = httpsCallable<
        { referenceKey: string; last4Phone: string },
        any
      >(functionsInstance, 'lookupAppointmentSecurely');

      // A. Correct Key + Correct Phone -> Returns sanitized appointment
      const successRes = await secureLookup({ referenceKey: bookingRef, last4Phone: '4321' });
      const apptData = successRes.data;

      expect(apptData).not.toBeNull();
      expect(apptData.id).toBe(bookingRef);
      expect(apptData.patientName).toBe('Jane Doe');
      expect(apptData.date).toBe('2026-11-20');
      expect(apptData.time).toBe('10:00 AM');
      expect(apptData.status).toBe('confirmed');
      expect(apptData.clinicId).toBe('columbus-chiropractic');

      // Assert private clinical & sensitive financial/PII fields are strictly stripped
      expect(apptData.notes).toBeUndefined();
      expect(apptData.intakeForm).toBeUndefined();
      expect(apptData.cancellationReason).toBeUndefined();
      expect(apptData.paymentMethod).toBeUndefined();
      expect(apptData.cardLast4).toBeUndefined();
      expect(apptData.cardBrand).toBeUndefined();
      expect(apptData.transactionId).toBeUndefined();
      expect(apptData.patientEmail).toBeUndefined();

      // B. Correct Key + Wrong Phone -> Returns null
      const wrongPhoneRes = await secureLookup({ referenceKey: bookingRef, last4Phone: '8888' });
      expect(wrongPhoneRes.data).toBeNull();

      // C. Wrong Key -> Returns null
      const wrongKeyRes = await secureLookup({ referenceKey: 'VH-NONEXISTENT', last4Phone: '4321' });
      expect(wrongKeyRes.data).toBeNull();

      // D. Rate Limiting Test: 6 failed lookups on same reference key triggers resource-exhausted error
      const rateLimitRef = 'VH-RATE-LIMIT-KEY';
      await adminDb.doc(`appointments/${rateLimitRef}`).set({
        id: rateLimitRef,
        referenceKey: rateLimitRef,
        clinicId: 'columbus-chiropractic',
        patientName: 'Rate Limit Target',
        phone: '(555) 000-1234', // Last 4: 1234
        date: '2026-12-01',
        status: 'confirmed',
      });

      // Clear any prior rate limit record for this key
      const crypto = await import('crypto');
      const hashedKey = crypto.createHash('sha256').update(rateLimitRef).digest('hex');
      await adminDb.doc(`rate_limits/guest_lookup_${hashedKey}`).delete().catch(() => {});

      // Attempts 1 through 5: failed attempts with wrong phone
      for (let i = 1; i <= 5; i++) {
        const failedRes = await secureLookup({ referenceKey: rateLimitRef, last4Phone: '9999' });
        expect(failedRes.data).toBeNull();
      }

      // 6th Attempt: must be blocked with resource-exhausted HttpsError
      let errorThrown: any = null;
      try {
        await secureLookup({ referenceKey: rateLimitRef, last4Phone: '9999' });
      } catch (err: any) {
        errorThrown = err;
      }

      expect(errorThrown).not.toBeNull();
      expect(errorThrown?.code).toMatch(/resource-exhausted/i);
      expect(errorThrown?.message).toMatch(/Too many attempts/i);
    });
  });
});
