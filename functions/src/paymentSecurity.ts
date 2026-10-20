/**
 * Shared payment trust boundary. Never derive "paid" from client callbacks or
 * unsigned webhook JSON. This module deliberately has no Firebase dependency.
 */
export type PaymentChoice = 'full' | 'deposit' | 'balance';

export function expectedCurrencyCode(value: unknown): string {
  const normalized = String(value ?? '').trim().toLowerCase();
  const known: Record<string, string> = { '£': 'gbp', '€': 'eur', '$': 'usd' };
  return known[normalized] || normalized;
}

export function requireSignedWebhook(
  rawBody: unknown,
  signature: unknown,
  secret: unknown
): asserts rawBody is Buffer {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Stripe webhook signing secret is not configured');
  }
  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    throw new Error('Stripe webhook raw body is required');
  }
  if (typeof signature !== 'string' || !signature) {
    throw new Error('Stripe webhook signature is required');
  }
}

export function verifyPaymentForAppointment(
  intent: {
    id: string;
    status: string;
    amount_received: number;
    currency: string;
    metadata?: Record<string, string> | null;
  },
  appointment: {
    clinicId?: string;
    stripePaymentIntentId?: string;
    priceAmount?: number;
    depositAmount?: number;
    amountPaid?: number;
    currency?: string;
  },
  appointmentId: string,
  choice: PaymentChoice
): void {
  if (!appointment.stripePaymentIntentId || intent.id !== appointment.stripePaymentIntentId) {
    throw new Error('PaymentIntent is not bound to this appointment');
  }
  if (intent.metadata?.appointmentId !== appointmentId || intent.metadata?.clinicId !== appointment.clinicId) {
    throw new Error('PaymentIntent metadata does not match appointment');
  }
  if (intent.metadata?.paymentChoice !== choice) {
    throw new Error('PaymentIntent payment choice does not match');
  }
  if (intent.status !== 'succeeded') {
    throw new Error('PaymentIntent has not succeeded');
  }
  const fullPrice = appointment.priceAmount;
  if (typeof fullPrice !== 'number' || !Number.isFinite(fullPrice) || fullPrice <= 0) {
    throw new Error('Appointment price is invalid');
  }
  const deposit = appointment.depositAmount;
  const previousPaid = appointment.amountPaid || 0;
  const expectedMajor = choice === 'deposit'
    ? deposit
    : choice === 'balance'
      ? fullPrice - previousPaid
      : fullPrice;
  if (typeof expectedMajor !== 'number' || !Number.isFinite(expectedMajor) || expectedMajor <= 0) {
    throw new Error('Expected payment amount is invalid');
  }
  if (!Number.isInteger(intent.amount_received) || intent.amount_received !== Math.round(expectedMajor * 100)) {
    throw new Error('Received Stripe amount differs from the server price');
  }
  if (!appointment.currency || expectedCurrencyCode(intent.currency) !== expectedCurrencyCode(appointment.currency)) {
    throw new Error('Stripe currency differs from appointment currency');
  }
}

export function verifySetupForAppointment(
  intent: {
    id: string;
    status: string;
    metadata?: Record<string, string> | null;
  },
  appointment: { clinicId?: string; stripeSetupIntentId?: string },
  appointmentId: string
): void {
  if (intent.id !== appointment.stripeSetupIntentId ||
      intent.metadata?.appointmentId !== appointmentId ||
      intent.metadata?.clinicId !== appointment.clinicId ||
      intent.metadata?.paymentChoice !== 'card_on_file' ||
      intent.status !== 'succeeded') {
    throw new Error('Card setup is not verified for this appointment');
  }
}
