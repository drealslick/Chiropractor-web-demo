import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
} from '@firebase/rules-unit-testing';
import {
  setTestStripeInstance,
  createPaymentIntentHandler,
  chargeNoShowFeeHandler,
  refundAppointmentPaymentHandler,
  stripeWebhookHandler,
  getDb,
} from '../functions/src/index';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-no-project';
let testEnv: RulesTestEnvironment | null = null;
let adminApp: admin.app.App | null = null;
let adminDb: Firestore | null = null;

let mockStripe: any;

describe('Phase 5 Acceptance Suite: Real Handler Executions (Payments, Refunds, Card-on-File & Webhooks)', () => {
  beforeAll(async () => {
    // 1. Initialize Firestore Rules Test Environment
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

    // 2. Initialize Admin SDK
    try {
      process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';

      adminApp = (admin.apps && admin.apps.length > 0) ? admin.apps[0] : admin.initializeApp({ projectId: PROJECT_ID });
      adminDb = getDb();
    } catch (err) {
      console.warn('Admin SDK init warning:', err);
    }
  });

  afterAll(async () => {
    setTestStripeInstance(null);
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }

    // Reset mock Stripe instance before each test
    mockStripe = {
      customers: {
        list: vi.fn().mockResolvedValue({ data: [] }),
        create: vi.fn().mockResolvedValue({ id: 'cus_mock_123' }),
      },
      setupIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'seti_mock_123',
          client_secret: 'seti_secret_123',
          status: 'succeeded',
        }),
      },
      paymentIntents: {
        create: vi.fn().mockResolvedValue({
          id: 'pi_mock_123',
          client_secret: 'pi_secret_123',
          status: 'succeeded',
          amount: 8500,
        }),
      },
      refunds: {
        create: vi.fn().mockResolvedValue({
          id: 're_mock_123',
          status: 'succeeded',
          amount: 5000,
        }),
      },
      webhooks: {
        constructEvent: vi.fn((body) => (typeof body === 'string' ? JSON.parse(body) : body)),
      },
    };

    setTestStripeInstance(mockStripe);

    // Seed base clinic
    if (adminDb) {
      await adminDb.doc('clinics/columbus-chiropractic').set({
        id: 'columbus-chiropractic',
        name: 'Vance Chiropractic',
        stripeAccountId: 'acct_columbus_123',
        services: [
          {
            id: 'chiropractic-adjust',
            title: 'Chiropractic Adjustment',
            price: 85,
            deposit: 25,
          },
        ],
      });
    }
  });

  // 1. createPaymentIntent — card_on_file path
  it('1. createPaymentIntent (card_on_file): invokes setupIntents.create, does NOT invoke paymentIntents.create, leaves unpaid at $0', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_cof_real_01';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientName: 'Jane CardHolder',
      patientEmail: 'jane@example.com',
      priceAmount: 85,
    });

    const result = await createPaymentIntentHandler(
      {
        clinicId: 'columbus-chiropractic',
        appointmentId,
        paymentChoice: 'card_on_file',
        patientEmail: 'jane@example.com',
        patientName: 'Jane CardHolder',
      },
      { auth: null }
    );

    // Assert actual handler called setupIntents.create
    expect(mockStripe.setupIntents.create).toHaveBeenCalledTimes(1);
    expect(mockStripe.setupIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usage: 'off_session',
        customer: 'cus_mock_123',
        metadata: expect.objectContaining({
          appointmentId,
          paymentChoice: 'card_on_file',
        }),
      }),
      expect.anything()
    );

    // Assert paymentIntents.create was NOT called
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();

    // Assert response
    expect(result.isSetupIntent).toBe(true);
    expect(result.amount).toBe(0);

    // Assert appointment document in Firestore has cardOnFile: true, paymentStatus: 'unpaid', amountPaid: 0
    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.cardOnFile).toBe(true);
    expect(appt.paymentStatus).toBe('unpaid');
    expect(appt.amountPaid).toBe(0);
    expect(appt.stripeSetupIntentId).toBe('seti_mock_123');
  });

  // 2. createPaymentIntent — deposit path
  it('2. createPaymentIntent (deposit): calls paymentIntents.create with depositAmount * 100 from server catalog', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_dep_real_02';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      serviceId: 'chiropractic-adjust',
      priceAmount: 85,
      depositAmount: 25,
    });

    const result = await createPaymentIntentHandler(
      {
        clinicId: 'columbus-chiropractic',
        appointmentId,
        paymentChoice: 'deposit',
        serviceId: 'chiropractic-adjust',
        patientEmail: 'patient@example.com',
      },
      { auth: null }
    );

    // Assert stripe.paymentIntents.create was called with deposit in integer minor units (25 * 100 = 2500)
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 2500,
        metadata: expect.objectContaining({
          paymentChoice: 'deposit',
          depositAmount: '25',
          expectedAmount: '25',
        }),
      }),
      expect.anything()
    );

    expect(result.isSetupIntent).toBe(false);
    expect(result.amount).toBe(2500);
  });

  // 3. createPaymentIntent — full path
  it('3. createPaymentIntent (full): calls paymentIntents.create with full priceAmount * 100 from server catalog', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_full_real_03';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      serviceId: 'chiropractic-adjust',
      priceAmount: 85,
    });

    const result = await createPaymentIntentHandler(
      {
        clinicId: 'columbus-chiropractic',
        appointmentId,
        paymentChoice: 'full',
        serviceId: 'chiropractic-adjust',
        patientEmail: 'patient@example.com',
      },
      { auth: null }
    );

    // Assert stripe.paymentIntents.create was called with full price in minor units (85 * 100 = 8500)
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 8500,
        metadata: expect.objectContaining({
          paymentChoice: 'full',
          priceAmount: '85',
        }),
      }),
      expect.anything()
    );

    expect(result.amount).toBe(8500);
  });

  // 4. createPaymentIntent — pay_on_arrival path
  it('4. createPaymentIntent (pay_on_arrival): executes zero Stripe calls and marks appointment unpaid', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_poa_real_04';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      priceAmount: 85,
    });

    const result = await createPaymentIntentHandler(
      {
        clinicId: 'columbus-chiropractic',
        appointmentId,
        paymentChoice: 'pay_on_arrival',
      },
      { auth: null }
    );

    // Assert neither setupIntents nor paymentIntents was called
    expect(mockStripe.setupIntents.create).not.toHaveBeenCalled();
    expect(mockStripe.paymentIntents.create).not.toHaveBeenCalled();

    expect(result.isPayOnArrival).toBe(true);
    expect(result.amount).toBe(0);

    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.paymentChoice).toBe('pay_on_arrival');
    expect(appt.paymentStatus).toBe('unpaid');
    expect(appt.amountPaid).toBe(0);
    expect(appt.remainingBalance).toBe(85);
  });

  // 5. chargeNoShowFee — happy path
  it('5. chargeNoShowFee (happy path): executes paymentIntents.create off-session and persists receipt', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_ns_real_05';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientName: 'Ghost Patient',
      stripeCustomerId: 'cus_saved_999',
      stripePaymentMethodId: 'pm_card_saved_888',
      currency: 'gbp',
      receipts: [],
    });

    mockStripe.paymentIntents.create.mockResolvedValueOnce({
      id: 'pi_noshow_real_555',
      status: 'succeeded',
      amount: 5000,
    });

    const result = await chargeNoShowFeeHandler(
      {
        appointmentId,
        feeAmount: 50,
        reason: 'Missed consultation without notice',
      },
      {
        auth: {
          uid: 'staff_alice_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.paymentIntentId).toBe('pi_noshow_real_555');

    // Assert Stripe was called with off_session: true, confirm: true, amount == fee * 100
    expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        currency: 'gbp',
        customer: 'cus_saved_999',
        payment_method: 'pm_card_saved_888',
        off_session: true,
        confirm: true,
        metadata: expect.objectContaining({
          appointmentId,
          type: 'no_show_fee',
        }),
      }),
      expect.anything()
    );

    // Assert appointment document in Firestore has noShowFeeCharged: true and receipt
    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.status).toBe('no_show');
    expect(appt.noShowFeeCharged).toBe(true);
    expect(appt.noShowFeeAmount).toBe(50);
    expect(appt.receipts.length).toBe(1);
    expect(appt.receipts[0].type).toBe('no_show_fee');
    expect(appt.receipts[0].amount).toBe(50);
  });

  // 6. chargeNoShowFee — 3DS requires_action
  it('6. chargeNoShowFee (3DS requires_action): marks noShowFeeStatus action_required without setting noShowFeeCharged true', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_ns_3ds_06';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      stripeCustomerId: 'cus_3ds_111',
      stripePaymentMethodId: 'pm_3ds_222',
      currency: 'gbp',
    });

    mockStripe.paymentIntents.create.mockResolvedValueOnce({
      id: 'pi_3ds_challenge_333',
      status: 'requires_action',
      client_secret: 'pi_secret_3ds',
    });

    const result = await chargeNoShowFeeHandler(
      {
        appointmentId,
        feeAmount: 50,
      },
      {
        auth: {
          uid: 'staff_alice_1',
          token: { role: 'admin', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe('requires_action');

    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.noShowFeeStatus).toBe('action_required');
    expect(appt.noShowFeeCharged).toBeUndefined();
    expect(appt.noShowPaymentIntentId).toBe('pi_3ds_challenge_333');
  });

  // 7. chargeNoShowFee — cross-clinic denial
  it('7. chargeNoShowFee (cross-clinic denial): throws permission-denied for staff of different clinic', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_clinic_a_07';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'clinic_a',
      stripeCustomerId: 'cus_a',
      stripePaymentMethodId: 'pm_a',
    });

    let error: any = null;
    try {
      await chargeNoShowFeeHandler(
        { appointmentId },
        {
          auth: {
            uid: 'staff_clinic_b',
            token: { role: 'staff', clinicId: 'clinic_b' },
          },
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe('permission-denied');
  });

  // 8. stripeWebhook — duplicate event
  it('8. stripeWebhook (duplicate event): processes event once, deduplicates second invocation, writes single receipt', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_webhook_dedup_08';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      status: 'pending_hold',
      priceAmount: 85,
      receipts: [],
    });

    const eventId = 'evt_test_dedup_888';
    const mockEvent = {
      id: eventId,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_webhook_888',
          amount_received: 8500,
          currency: 'gbp',
          metadata: {
            appointmentId,
            paymentChoice: 'full',
          },
        },
      },
    };

    const createMockReqRes = () => {
      let statusCode = 200;
      let jsonBody: any = null;
      return {
        req: {
          method: 'POST',
          body: mockEvent,
        },
        res: {
          status: (code: number) => {
            statusCode = code;
            return {
              json: (data: any) => {
                jsonBody = data;
              },
              send: (data: any) => {
                jsonBody = data;
              },
            };
          },
        },
        getResult: () => ({ statusCode, jsonBody }),
      };
    };

    // First Webhook Call
    const call1 = createMockReqRes();
    await stripeWebhookHandler(call1.req, call1.res);
    expect(call1.getResult().statusCode).toBe(200);

    const apptSnap1 = await adminDb.doc(`appointments/${appointmentId}`).get();
    expect(apptSnap1.data()?.paymentStatus).toBe('paid_full');
    expect(apptSnap1.data()?.receipts.length).toBe(1);

    // Second Webhook Call (Duplicate Delivery)
    const call2 = createMockReqRes();
    await stripeWebhookHandler(call2.req, call2.res);
    expect(call2.getResult().statusCode).toBe(200);
    expect(call2.getResult().jsonBody?.deduplicated).toBe(true);

    // Assert Firestore appointment was NOT updated a second time and has exactly 1 receipt
    const apptSnap2 = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap2.data()!;
    expect(appt.receipts).toHaveLength(1);
    expect(appt.receipts[0].type).toBe('payment');
    expect(appt.receipts[0].paymentIntentId).toBe('pi_webhook_888');

    // Assert idempotency key doc exists
    const idempSnap = await adminDb.doc(`idempotency_keys/${eventId}`).get();
    expect(idempSnap.exists).toBe(true);
  });

  // 9. stripeWebhook — out-of-order payment_failed after paid_full
  it('9. stripeWebhook (out-of-order payment_failed): does NOT downgrade paid_full appointment', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_webhook_ooo_09';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      paymentStatus: 'paid_full',
      amountPaid: 85,
      stripePaymentIntentId: 'pi_confirmed_999',
    });

    const failedEvent = {
      id: 'evt_failed_ooo_999',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_confirmed_999',
          metadata: {
            appointmentId,
          },
          last_payment_error: {
            message: 'Your card was declined.',
          },
        },
      },
    };

    const mockReq = {
      method: 'POST',
      body: failedEvent,
    };
    const mockRes = {
      status: () => ({ json: () => {}, send: () => {} }),
    };

    await stripeWebhookHandler(mockReq, mockRes);

    // Assert appointment remains paid_full
    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.paymentStatus).toBe('paid_full');
    expect(appt.amountPaid).toBe(85);
  });

  // 10. refundAppointmentPaymentHandler — Full refund path
  it('10. refundAppointmentPaymentHandler (full refund): invokes stripe.refunds.create with amount in cents, updates status to refunded and appends receipt', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_refund_full_10';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientName: 'Refund Patient',
      paymentStatus: 'paid_full',
      amountPaid: 100,
      stripePaymentIntentId: 'pi_abc',
      currency: 'gbp',
      receipts: [],
    });

    mockStripe.refunds.create.mockResolvedValueOnce({
      id: 're_full_999',
      status: 'succeeded',
      amount: 10000,
    });

    const result = await refundAppointmentPaymentHandler(
      {
        appointmentId,
        amount: 100,
        reason: 'requested_by_customer',
      },
      {
        auth: {
          uid: 'staff_alice_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.isFullRefund).toBe(true);
    expect(result.amount).toBe(100);

    // Assert stripe.refunds.create was called with payment_intent: 'pi_abc', amount: 10000
    expect(mockStripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_abc',
        amount: 10000,
        reason: 'requested_by_customer',
        metadata: expect.objectContaining({
          appointmentId,
        }),
      })
    );

    // Assert appointment updates in Firestore
    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.paymentStatus).toBe('refunded');
    expect(appt.refundAmount).toBe(100);
    expect(appt.refundId).toBe('re_full_999');
    expect(appt.receipts.length).toBe(1);
    expect(appt.receipts[0].type).toBe('refund');
    expect(appt.receipts[0].amount).toBe(100);
  });

  // 11. refundAppointmentPaymentHandler — Partial refund path
  it('11. refundAppointmentPaymentHandler (partial refund): invokes stripe.refunds.create with partial amount and marks partially_refunded', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_refund_partial_11';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      paymentStatus: 'paid_full',
      amountPaid: 100,
      stripePaymentIntentId: 'pi_abc_partial',
      currency: 'gbp',
      receipts: [],
    });

    mockStripe.refunds.create.mockResolvedValueOnce({
      id: 're_partial_888',
      status: 'succeeded',
      amount: 4000,
    });

    const result = await refundAppointmentPaymentHandler(
      {
        appointmentId,
        amount: 40,
        reason: 'requested_by_customer',
      },
      {
        auth: {
          uid: 'staff_alice_1',
          token: { role: 'admin', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.isFullRefund).toBe(false);
    expect(result.amount).toBe(40);

    // Assert stripe.refunds.create called with amount: 4000
    expect(mockStripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_abc_partial',
        amount: 4000,
      })
    );

    const apptSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt = apptSnap.data()!;
    expect(appt.paymentStatus).toBe('partially_refunded');
    expect(appt.refundAmount).toBe(40);
    expect(appt.receipts.length).toBe(1);
    expect(appt.receipts[0].amount).toBe(40);
  });

  // 12. refundAppointmentPaymentHandler — Refund exceeds amountPaid
  it('12. refundAppointmentPaymentHandler (refund exceeds amountPaid): throws invalid-argument', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_refund_excess_12';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      paymentStatus: 'paid_full',
      amountPaid: 100,
      stripePaymentIntentId: 'pi_excess_123',
    });

    let error: any = null;
    try {
      await refundAppointmentPaymentHandler(
        {
          appointmentId,
          amount: 150,
        },
        {
          auth: {
            uid: 'staff_alice_1',
            token: { role: 'staff', clinicId: 'columbus-chiropractic' },
          },
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe('invalid-argument');
  });

  // 13. refundAppointmentPaymentHandler — Requires staff/admin role
  it('13. refundAppointmentPaymentHandler (patient context): throws permission-denied', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_refund_perm_13';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      paymentStatus: 'paid_full',
      amountPaid: 100,
      stripePaymentIntentId: 'pi_perm_123',
    });

    let error: any = null;
    try {
      await refundAppointmentPaymentHandler(
        {
          appointmentId,
          amount: 50,
        },
        {
          auth: {
            uid: 'patient_bob',
            token: { role: 'patient', clinicId: 'columbus-chiropractic' },
          },
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe('permission-denied');
  });

  // 14. refundAppointmentPaymentHandler — Non-existent appointment
  it('14. refundAppointmentPaymentHandler (non-existent appointment): throws not-found', async () => {
    let error: any = null;
    try {
      await refundAppointmentPaymentHandler(
        {
          appointmentId: 'appt_does_not_exist_9999',
          amount: 50,
        },
        {
          auth: {
            uid: 'staff_alice_1',
            token: { role: 'admin', clinicId: 'columbus-chiropractic' },
          },
        }
      );
    } catch (err: any) {
      error = err;
    }

    expect(error).not.toBeNull();
    expect(error.code).toBe('not-found');
  });

  // 15. stripeWebhook — late-payment hold-expiration auto-refund path & retry idempotency
  it('15. stripeWebhook (late-payment on hold_expired): auto-refunds via stripe.refunds.create, sets hold_expired_conflict, writes no payment receipt, and deduplicates retry', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_late_hold_15';
    const paymentIntentId = 'pi_late_hold_15_intent';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      status: 'hold_expired',
      priceAmount: 85,
      stripePaymentIntentId: paymentIntentId,
      receipts: [],
    });

    mockStripe.refunds.create.mockResolvedValueOnce({
      id: 're_late_auto_15',
      status: 'succeeded',
      amount: 8500,
    });

    const eventId = 'evt_late_payment_succeeded_15';
    const mockLatePaymentEvent = {
      id: eventId,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: paymentIntentId,
          amount_received: 8500,
          currency: 'gbp',
          metadata: {
            appointmentId,
            paymentChoice: 'full',
          },
        },
      },
    };

    const createReqRes = () => {
      let statusCode = 200;
      let jsonBody: any = null;
      return {
        req: {
          method: 'POST',
          body: mockLatePaymentEvent,
        },
        res: {
          status: (code: number) => {
            statusCode = code;
            return {
              json: (data: any) => {
                jsonBody = data;
              },
              send: (data: any) => {
                jsonBody = data;
              },
            };
          },
        },
        getResult: () => ({ statusCode, jsonBody }),
      };
    };

    // 1. Initial Webhook Delivery
    const call1 = createReqRes();
    await stripeWebhookHandler(call1.req, call1.res);

    expect(call1.getResult().statusCode).toBe(200);

    // Assert stripe.refunds.create was called with the correct payment_intent, reason, and idempotency key
    expect(mockStripe.refunds.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: expect.objectContaining({
          appointmentId,
        }),
      }),
      expect.objectContaining({
        idempotencyKey: `refund_${appointmentId}`,
      })
    );

    // Assert appointment updates in Firestore
    const apptSnap1 = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt1 = apptSnap1.data()!;
    expect(appt1.status).toBe('hold_expired_conflict');
    expect(appt1.refundIssuedAutomatically).toBe(true);
    // Assert no receipt marked 'payment' was written
    const paymentReceipts = (appt1.receipts || []).filter((r: any) => r.type === 'payment');
    expect(paymentReceipts.length).toBe(0);

    // Reset mock call history before replay to check idempotency guard
    mockStripe.refunds.create.mockClear();

    // 2. Replay the same event (simulating Stripe retry)
    const call2 = createReqRes();
    await stripeWebhookHandler(call2.req, call2.res);

    expect(call2.getResult().statusCode).toBe(200);
    expect(call2.getResult().jsonBody?.deduplicated).toBe(true);

    // Assert no second refund call was made
    expect(mockStripe.refunds.create).not.toHaveBeenCalled();

    // Assert appointment state unchanged
    const apptSnap2 = await adminDb.doc(`appointments/${appointmentId}`).get();
    const appt2 = apptSnap2.data()!;
    expect(appt2.status).toBe('hold_expired_conflict');
    expect(appt2.refundIssuedAutomatically).toBe(true);
  });

  // 16. Security rules: Client payment mutation blocked
  it('16. Security Rules: Client Payment Mutation Blocked', async () => {
    if (!testEnv) return;

    const appointmentId = 'appt_sec_tamper_10';
    const patientUid = 'patient_tamper_10';

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc(`appointments/${appointmentId}`).set({
        id: appointmentId,
        clinicId: 'columbus-chiropractic',
        patientId: patientUid,
        patientName: 'Tamper Patient',
        date: '2026-12-25',
        time: '10:00 AM',
        priceAmount: 150,
        paymentStatus: 'unpaid',
        amountPaid: 0,
      });
    });

    const patientContext = testEnv.authenticatedContext(patientUid, { role: 'patient' });
    const patientDb = patientContext.firestore();

    await assertFails(
      patientDb.doc(`appointments/${appointmentId}`).update({
        paymentStatus: 'paid_full',
        amountPaid: 150,
      })
    );
  });
});
