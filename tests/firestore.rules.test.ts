/**
 * Firestore Security Rules Test Suite
 *
 * Tests data isolation, multi-tenant boundaries, and role permissions:
 * 1. Patients can only read their own appointments
 * 2. Patients cannot read another patient's appointment
 * 3. Patients cannot modify clinic settings/theme
 * 4. Staff can read and manage their own clinic's appointments
 * 5. Staff CANNOT modify clinic theme/settings (Admin-only privilege)
 * 6. Cross-tenant isolation: Clinic A staff cannot access Clinic B appointments
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

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'brave-trilogy-ft8c4';
const CLINIC_A = 'clinic_apex_columbus';
const CLINIC_B = 'clinic_summit_chicago';

describe('Firestore Security Rules Matrix', () => {
  beforeAll(async () => {
    const rules = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  describe('1. Patient Isolation', () => {
    it('allows a patient to read their own appointment', async () => {
      const patientId = 'patient_john_123';
      const patientContext = testEnv.authenticatedContext(patientId, {
        role: 'patient',
        clinicId: CLINIC_A,
      });

      // Seed appointment
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc('appointments/appt_101').set({
          id: 'appt_101',
          clinicId: CLINIC_A,
          patientId: patientId,
          doctorName: 'Dr. Sarah Vance',
          date: '2026-10-15',
        });
      });

      const docRef = patientContext.firestore().doc('appointments/appt_101');
      await assertSucceeds(docRef.get());
    });

    it('DENIES a patient from reading another patient’s appointment', async () => {
      const patientA = 'patient_john_123';
      const patientB = 'patient_mary_456';
      const patientBContext = testEnv.authenticatedContext(patientB, {
        role: 'patient',
        clinicId: CLINIC_A,
      });

      // Seed Patient A's appointment
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc('appointments/appt_101').set({
          id: 'appt_101',
          clinicId: CLINIC_A,
          patientId: patientA,
          doctorName: 'Dr. Sarah Vance',
        });
      });

      const docRef = patientBContext.firestore().doc('appointments/appt_101');
      await assertFails(docRef.get());
    });

    it('DENIES a patient from updating clinic settings or theme', async () => {
      const patientContext = testEnv.authenticatedContext('patient_john_123', {
        role: 'patient',
        clinicId: CLINIC_A,
      });

      const clinicRef = patientContext.firestore().doc(`clinics/${CLINIC_A}`);
      await assertFails(clinicRef.update({ theme: { primaryColor: '#ff0000' } }));
    });
  });

  describe('2. Staff vs Admin Permission Boundaries', () => {
    it('DENIES clinic staff from modifying clinic theme/settings (Admin-only)', async () => {
      const staffContext = testEnv.authenticatedContext('staff_receptionist_1', {
        role: 'staff',
        clinicId: CLINIC_A,
      });

      const clinicRef = staffContext.firestore().doc(`clinics/${CLINIC_A}`);
      await assertFails(clinicRef.update({ theme: { primaryColor: '#0000ff' } }));
    });

    it('ALLOWS clinic admin to modify clinic theme/settings', async () => {
      const adminContext = testEnv.authenticatedContext('admin_dr_vance', {
        role: 'admin',
        admin: true,
        clinicId: CLINIC_A,
      });

      const clinicRef = adminContext.firestore().doc(`clinics/${CLINIC_A}`);
      await assertSucceeds(clinicRef.update({ theme: { primaryColor: '#059669' } }));
    });

    it('allows clinic staff to read and update appointments for their clinic', async () => {
      const staffContext = testEnv.authenticatedContext('staff_receptionist_1', {
        role: 'staff',
        clinicId: CLINIC_A,
      });

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc('appointments/appt_102').set({
          id: 'appt_102',
          clinicId: CLINIC_A,
          patientId: 'patient_jane_999',
          status: 'confirmed',
        });
      });

      const docRef = staffContext.firestore().doc('appointments/appt_102');
      await assertSucceeds(docRef.get());
      await assertSucceeds(docRef.update({ status: 'completed' }));
    });
  });

  describe('3. Multi-Tenant Cross-Clinic Isolation', () => {
    it('DENIES Clinic B staff from accessing Clinic A appointments', async () => {
      const clinicBStaff = testEnv.authenticatedContext('staff_clinic_b', {
        role: 'staff',
        clinicId: CLINIC_B,
      });

      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc('appointments/appt_clinic_a').set({
          id: 'appt_clinic_a',
          clinicId: CLINIC_A,
          patientId: 'patient_a',
        });
      });

      const docRef = clinicBStaff.firestore().doc('appointments/appt_clinic_a');
      await assertFails(docRef.get());
    });
  });
});
