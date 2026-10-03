/**
 * Phase 0: Synthetic Fixtures & Isolated Test Data
 * 
 * Strict boundary rules:
 * - Uses synthetic, non-PII test identifiers.
 * - Multi-tenant isolation: clinic_columbus vs clinic_summit.
 * - Integer minor units for prices (£85.00 -> 8500, deposit £25.00 -> 2500).
 * - Distinguishes clinicId (organization/branch), locationId, and practitionerId.
 */

export interface SyntheticClinic {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
  services: Array<{
    id: string;
    title: string;
    durationMinutes: number;
    price: number; // integer minor units in cents/pence (e.g. 8500 = £85.00)
    deposit: number; // integer minor units (e.g. 2500 = £25.00)
  }>;
  locations: Array<{
    id: string;
    name: string;
    address: string;
  }>;
}

export const SYNTHETIC_CLINICS: Record<string, SyntheticClinic> = {
  columbus: {
    id: 'columbus-chiropractic',
    name: 'Columbus Chiropractic Care',
    currency: 'gbp',
    currencySymbol: '£',
    services: [
      {
        id: 'initial-consultation',
        title: 'Initial Consultation & Diagnostic Assessment',
        durationMinutes: 45,
        price: 8500,
        deposit: 2500,
      },
      {
        id: 'followup-adjustment',
        title: 'Follow-Up Spinal Adjustment & Therapy',
        durationMinutes: 30,
        price: 5500,
        deposit: 2000,
      },
    ],
    locations: [
      {
        id: 'loc_downtown',
        name: 'Downtown Practice',
        address: '1200 N High St, Suite 250, Columbus, OH 43201',
      },
    ],
  },
  summit: {
    id: 'summit-spine-chicago',
    name: 'Summit Spine Chicago',
    currency: 'usd',
    currencySymbol: '$',
    services: [
      {
        id: 'chicago-initial',
        title: 'Chicago Initial Comprehensive Intake',
        durationMinutes: 45,
        price: 9500,
        deposit: 3000,
      },
    ],
    locations: [
      {
        id: 'loc_loop',
        name: 'The Loop Clinic',
        address: '200 S Michigan Ave, Chicago, IL 60604',
      },
    ],
  },
};

export const SYNTHETIC_ACTORS = {
  superAdmin: {
    uid: 'user_super_admin_001',
    email: 'ops@platform.local',
    claims: { superAdmin: true },
  },
  columbusAdmin: {
    uid: 'user_admin_columbus_001',
    email: 'dr.marcus@columbus.local',
    claims: { role: 'admin', clinicId: 'columbus-chiropractic' },
  },
  columbusStaff: {
    uid: 'user_staff_columbus_001',
    email: 'reception@columbus.local',
    claims: { role: 'staff', clinicId: 'columbus-chiropractic' },
  },
  columbusPractitioner: {
    uid: 'user_doc_columbus_001',
    email: 'dr.elena@columbus.local',
    claims: { role: 'practitioner', clinicId: 'columbus-chiropractic' },
  },
  summitAdmin: {
    uid: 'user_admin_summit_001',
    email: 'director@summit.local',
    claims: { role: 'admin', clinicId: 'summit-spine-chicago' },
  },
  patientAlice: {
    uid: 'patient_alice_101',
    email: 'alice.synthetic@test.local',
    claims: { role: 'patient', clinicId: 'columbus-chiropractic' },
  },
  patientBob: {
    uid: 'patient_bob_202',
    email: 'bob.synthetic@test.local',
    claims: { role: 'patient', clinicId: 'columbus-chiropractic' },
  },
  attacker: {
    uid: 'unauthorized_attacker_666',
    email: 'intruder@rogue.local',
    claims: { role: 'patient', clinicId: 'foreign-clinic' },
  },
};
