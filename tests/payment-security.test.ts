import { describe, expect, it } from 'vitest';
import {
  requireSignedWebhook,
  verifyPaymentForAppointment,
  verifySetupForAppointment,
  expectedCurrencyCode,
} from '../functions/src/paymentSecurity';

const appointment = {
  clinicId: 'columbus-chiropractic',
  stripePaymentIntentId: 'pi_verified',
  stripeSetupIntentId: 'seti_verified',
  priceAmount: 85,
  depositAmount: 25,
  amountPaid: 0,
  currency: '£',
};
const succeededIntent = {
  id: 'pi_verified',
  status: 'succeeded',
  amount_received: 8500,
  currency: 'gbp',
  metadata: {
    appointmentId: 'appt_123',
    clinicId: 'columbus-chiropractic',
    paymentChoice: 'full',
  },
};

describe('Stripe payment and booking trust boundaries', () => {
  it('requires a webhook secret, raw body, and a signature', () => {
    expect(() => requireSignedWebhook(Buffer.from('{}'), 't=123,v1=fake', undefined)).toThrow(/secret/i);
    expect(() => requireSignedWebhook(Buffer.from('{}'), null, 'whsec_test')).toThrow(/signature/i);
    expect(() => requireSignedWebhook({ type: 'payment_intent.succeeded' }, 't=123,v1=fake', 'whsec_test')).toThrow(/raw body/i);
    expect(() => requireSignedWebhook(Buffer.from('{}'), 't=123,v1=fake', 'whsec_test')).not.toThrow();
    // The real Stripe SDK's constructEvent must still validate the signature cryptographically.
  });

  it('maps currency symbols to real Stripe currency codes', () => {
    expect(expectedCurrencyCode('£')).toBe('gbp');
    expect(expectedCurrencyCode('EUR')).toBe('eur');
    expect(expectedCurrencyCode('$')).toBe('usd');
  });

  it('accepts a verified, correctly priced payment intent', () => {
    expect(() => verifyPaymentForAppointment(succeededIntent, appointment, 'appt_123', 'full')).not.toThrow();
  });

  it('denies a payment intent that belongs to another booking or clinic', () => {
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, id: 'pi_another' }, appointment, 'appt_123', 'full')).toThrow(/bound/i);
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, metadata: { ...succeededIntent.metadata, appointmentId: 'appt_attacker' } }, appointment, 'appt_123', 'full')).toThrow(/metadata/i);
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, metadata: { ...succeededIntent.metadata, clinicId: 'clinic_b' } }, appointment, 'appt_123', 'full')).toThrow(/metadata/i);
  });

  it('denies insufficient or wrong-currency payments', () => {
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, amount_received: 25 }, appointment, 'appt_123', 'full')).toThrow(/amount/i);
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, currency: 'usd' }, appointment, 'appt_123', 'full')).toThrow(/currency/i);
  });

  it('denies processing payments and choice substitutions', () => {
    expect(() => verifyPaymentForAppointment({ ...succeededIntent, status: 'processing' }, appointment, 'appt_123', 'full')).toThrow(/succeeded/i);
    expect(() => verifyPaymentForAppointment(succeededIntent, appointment, 'appt_123', 'deposit')).toThrow(/choice/i);
  });

  it('accepts a correctly priced deposit and rejects underpayment', () => {
    const deposit = { ...succeededIntent, amount_received: 2500, metadata: { ...succeededIntent.metadata, paymentChoice: 'deposit' } };
    expect(() => verifyPaymentForAppointment(deposit, appointment, 'appt_123', 'deposit')).not.toThrow();
    expect(() => verifyPaymentForAppointment({ ...deposit, amount_received: 1500 }, appointment, 'appt_123', 'deposit')).toThrow(/amount/i);
  });

  it('requires verified setup intent binding for zero-charge card-on-file', () => {
    const setup = { id: 'seti_verified', status: 'succeeded', metadata: { appointmentId: 'appt_123', clinicId: 'columbus-chiropractic', paymentChoice: 'card_on_file' } };
    expect(() => verifySetupForAppointment(setup, appointment, 'appt_123')).not.toThrow();
    expect(() => verifySetupForAppointment({ ...setup, status: 'requires_payment_method' }, appointment, 'appt_123')).toThrow();
    expect(() => verifySetupForAppointment({ ...setup, id: 'seti_wrong' }, appointment, 'appt_123')).toThrow();
  });
});
