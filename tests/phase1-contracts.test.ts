/**
 * Phase 1: Contracts, Mode Decoupling & Validator Test Suite
 */

import { describe, it, expect } from 'vitest';
import { validateAppointmentInput, validateInquiryInput, normalizeEmail, normalizePhone } from '../src/lib/validators';
import { getAppMode, isExplicitDemo } from '../src/lib/mode';
import { appointmentsProvider } from '../src/lib/data-provider';

describe('Phase 1: Input Validation & Contract Invariants', () => {
  describe('1. validateAppointmentInput', () => {
    it('rejects input containing forbidden authority fields like paymentStatus: paid_full', () => {
      const forgedInput = {
        clinicId: 'columbus-chiropractic',
        name: 'Eve Attacker',
        email: 'eve@rogue.local',
        phone: '6145550199',
        date: '2026-10-25',
        time: '10:00 AM',
        paymentStatus: 'paid_full', // Forged authority status
      };

      const result = validateAppointmentInput(forgedInput);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('paymentStatus'))).toBe(true);
    });

    it('rejects input containing amountPaid or claims', () => {
      const forgedInput = {
        clinicId: 'columbus-chiropractic',
        name: 'Eve Attacker',
        email: 'eve@rogue.local',
        phone: '6145550199',
        date: '2026-10-25',
        time: '10:00 AM',
        amountPaid: 85,
        claims: { admin: true },
      };

      const result = validateAppointmentInput(forgedInput);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('validates and normalizes valid appointment intake input', () => {
      const validInput = {
        clinicId: 'columbus-chiropractic',
        name: 'Jane Doe',
        email: '  JANE.DOE@Example.COM  ',
        phone: '(614) 555-0199',
        date: '2026-10-25',
        time: '10:00 AM',
        serviceTitle: 'Initial Consultation',
        durationMinutes: 45,
      };

      const result = validateAppointmentInput(validInput);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('jane.doe@example.com');
      expect(result.data?.name).toBe('Jane Doe');
      expect(result.data?.clinicId).toBe('columbus-chiropractic');
    });

    it('rejects appointments with invalid email or phone number', () => {
      const invalidEmail = {
        clinicId: 'columbus-chiropractic',
        name: 'Jane Doe',
        email: 'not-an-email',
        phone: '123',
        date: '2026-10-25',
        time: '10:00 AM',
      };

      const result = validateAppointmentInput(invalidEmail);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.includes('email'))).toBe(true);
      expect(result.errors?.some((e) => e.includes('phone'))).toBe(true);
    });
  });

  describe('2. validateInquiryInput', () => {
    it('validates inquiry messages and requires valid contact details', () => {
      const invalidInquiry = {
        clinicId: 'columbus-chiropractic',
        name: '',
        email: 'invalid',
        message: 'hi',
      };

      const result = validateInquiryInput(invalidInquiry);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(1);
    });

    it('accepts well-formed patient inquiries', () => {
      const validInquiry = {
        clinicId: 'columbus-chiropractic',
        name: 'Michael Thompson',
        email: 'michael.t@example.com',
        phone: '6145550192',
        message: 'I have severe lower back pain and would like to know if you accept Bupa insurance.',
      };

      const result = validateInquiryInput(validInquiry);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Michael Thompson');
      expect(result.data?.email).toBe('michael.t@example.com');
    });
  });

  describe('3. Mode & State Invariants', () => {
    it('normalizes email addresses to lowercased trimmed strings', () => {
      expect(normalizeEmail('  PATIENT@EXAMPLE.COM ')).toBe('patient@example.com');
      expect(normalizeEmail('')).toBe('');
    });

    it('normalizes phone strings by trimming whitespace', () => {
      expect(normalizePhone('  +1 (614) 555-0192  ')).toBe('+1 (614) 555-0192');
    });

    it('rejects appointment creation with explicit validation error via appointmentsProvider', async () => {
      const invalidBooking: any = {
        name: 'Incomplete Booking',
        // missing email, phone, date, time
      };

      const result = await appointmentsProvider.create('columbus-chiropractic', invalidBooking);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
