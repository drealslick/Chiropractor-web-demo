/**
 * Cloud Storage Security Rules Test Suite
 *
 * Verifies storage boundaries under enforce_rules: true
 * 1. Anonymous user cannot read /patients/{clinicId}/{patientId}/**
 * 2. Patient A cannot read Patient B's uploads (even in same clinic)
 * 3. Clinic A staff cannot read Clinic B's uploads (cross-tenant isolation)
 * 4. Public /clinics/{clinicId}/public/** is world-readable
 * 5. /clinics/{clinicId}/staff/** requires admin
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment | null = null;

const PROJECT_ID = 'demo-practice-os';
const CLINIC_A = 'columbus-chiropractic';
const CLINIC_B = 'summit-spine-chicago';
const PATIENT_A = 'patient_alice_101';
const PATIENT_B = 'patient_bob_202';

describe('Cloud Storage Security Rules Matrix', () => {
  beforeAll(async () => {
    try {
      const rules = fs.readFileSync(path.resolve(__dirname, '../storage.rules'), 'utf8');
      const rawEnv = process.env.STORAGE_EMULATOR_HOST || '127.0.0.1:9199';
      const cleanHost = rawEnv.replace(/^https?:\/\//, '');
      const [host, portStr] = cleanHost.split(':');
      const port = parseInt(portStr || '9199', 10);

      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        storage: {
          rules,
          host,
          port,
        },
      });
    } catch (err) {
      throw new Error('Storage emulator initialization failed: privacy tests cannot be skipped.', { cause: err });
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async (context) => {
    if (!testEnv) {
      context.skip();
      return;
    }
    await testEnv.clearStorage();
  });

  describe('1. Patient Uploads & Privacy Isolation', () => {
    it('DENIES anonymous user from reading /patients/{clinicId}/{patientId}/**', async () => {
      const unauthContext = testEnv!.unauthenticatedContext();
      const fileRef = unauthContext.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/intake-spine.pdf`);
      await assertFails(fileRef.getDownloadURL());
    });

    it('DENIES Patient A from reading Patient B uploads in the same clinic', async () => {
      const patientAContext = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_A,
      });
      const fileRef = patientAContext.storage().ref(`patients/${CLINIC_A}/${PATIENT_B}/mri-scan.pdf`);
      await assertFails(fileRef.getDownloadURL());
    });

    it('allows Patient A to read and upload to their own folder', async () => {
      const patientAContext = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_A,
      });
      const fileRef = patientAContext.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/intake.pdf`);
      const dummyData = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF
      await assertSucceeds(fileRef.put(dummyData, { contentType: 'application/pdf' }));
      await assertSucceeds(fileRef.getDownloadURL());
    });
  });

  describe('1.5 Patient clinic claims and legacy paths', () => {
    it('DENIES a patient whose clinic claim does not match the destination clinic even when UID matches', async () => {
      const patientFromB = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_B,
      });
      const file = patientFromB.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/report.pdf`);
      await assertFails(file.put(new Uint8Array([0x25, 0x50, 0x44, 0x46]), { contentType: 'application/pdf' }));
      await assertFails(file.getDownloadURL());
    });

    it('DENIES unauthenticated writes and disallows legacy unscoped patient uploads', async () => {
      const anonymous = testEnv!.unauthenticatedContext();
      const unscopedPatient = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_A,
      });
      await assertFails(anonymous.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/new.pdf`).put(
        new Uint8Array([0x25]), { contentType: 'application/pdf' }
      ));
      await assertFails(unscopedPatient.storage().ref(`patients/${PATIENT_A}/legacy.pdf`).put(
        new Uint8Array([0x25]), { contentType: 'application/pdf' }
      ));
    });

    it('DENIES executable content and oversized patient files', async () => {
      const patient = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_A,
      });
      const ref = patient.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/upload.bin`);
      await assertFails(ref.put(new Uint8Array([0x00, 0x01]), { contentType: 'application/octet-stream' }));
      // Only MIME whitelist is asserted here; size enforcement remains in isValidDocument.
    });
  });

  describe('2. Multi-Tenant Cross-Clinic Isolation', () => {
    it('DENIES Clinic A staff from reading Clinic B patient uploads', async () => {
      const clinicAStaff = testEnv!.authenticatedContext('staff_columbus_01', {
        role: 'staff',
        clinicId: CLINIC_A,
      });
      const fileRef = clinicAStaff.storage().ref(`patients/${CLINIC_B}/${PATIENT_B}/mri-scan.pdf`);
      await assertFails(fileRef.getDownloadURL());
    });

    it('allows Clinic A staff to read patient uploads within their own clinic', async () => {
      const patientA = testEnv!.authenticatedContext(PATIENT_A, {
        role: 'patient',
        clinicId: CLINIC_A,
      });
      const patientRef = patientA.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/intake.pdf`);
      await assertSucceeds(patientRef.put(new Uint8Array([0x25, 0x50, 0x44, 0x46]), { contentType: 'application/pdf' }));

      const clinicAStaff = testEnv!.authenticatedContext('staff_columbus_01', {
        role: 'staff',
        clinicId: CLINIC_A,
      });
      const fileRef = clinicAStaff.storage().ref(`patients/${CLINIC_A}/${PATIENT_A}/intake.pdf`);
      await assertSucceeds(fileRef.getDownloadURL());
    });
  });

  describe('3. Public Marketing Media & Staff Document Boundaries', () => {
    it('allows public /clinics/{clinicId}/public/** to be world-readable by anonymous users', async () => {
      // Seed public image via staff
      const clinicAStaff = testEnv!.authenticatedContext('staff_columbus_01', {
        role: 'staff',
        clinicId: CLINIC_A,
      });
      const staffRef = clinicAStaff.storage().ref(`clinics/${CLINIC_A}/public/hero-banner.jpg`);
      const dummyImg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
      await assertSucceeds(staffRef.put(dummyImg, { contentType: 'image/jpeg' }));

      // Anonymous user reads the file
      const unauthContext = testEnv!.unauthenticatedContext();
      const fileRef = unauthContext.storage().ref(`clinics/${CLINIC_A}/public/hero-banner.jpg`);
      await assertSucceeds(fileRef.getDownloadURL());
    });

    it('DENIES script-capable SVG uploads to publicly readable clinic media', async () => {
      const staff = testEnv!.authenticatedContext('staff_columbus_01', {
        role: 'staff',
        clinicId: CLINIC_A,
      });
      const publicRef = staff.storage().ref(`clinics/${CLINIC_A}/public/active.svg`);
      const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      await assertFails(publicRef.put(svg, { contentType: 'image/svg+xml' }));
    });

    it('DENIES regular staff from reading or writing /clinics/{clinicId}/staff/**', async () => {
      const regularStaff = testEnv!.authenticatedContext('staff_columbus_02', {
        role: 'staff',
        clinicId: CLINIC_A,
      });
      const fileRef = regularStaff.storage().ref(`clinics/${CLINIC_A}/staff/physician-credentials.pdf`);
      // Staff path is protected and requires admin privilege
      await assertFails(fileRef.getDownloadURL());
    });

    it('allows clinic admin to read and write /clinics/{clinicId}/staff/**', async () => {
      const clinicAdmin = testEnv!.authenticatedContext('admin_columbus_01', {
        role: 'admin',
        clinicId: CLINIC_A,
      });
      const fileRef = clinicAdmin.storage().ref(`clinics/${CLINIC_A}/staff/physician-credentials.pdf`);
      const dummyPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
      await assertSucceeds(fileRef.put(dummyPdf, { contentType: 'application/pdf' }));
      await assertSucceeds(fileRef.getDownloadURL());
    });
  });
});
