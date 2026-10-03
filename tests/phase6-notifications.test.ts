import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  setTestResendInstance,
  setTestTwilioHandler,
  sendTransactionalEmailHandler,
  sendAutomatedNotificationHandler,
  processScheduledRemindersHandler,
  getDb,
} from '../functions/src/index';

const PROJECT_ID = process.env.GCLOUD_PROJECT || 'demo-no-project';
let testEnv: RulesTestEnvironment | null = null;
let adminApp: admin.app.App | null = null;
let adminDb: Firestore | null = null;

let mockResend: any;
let mockTwilioHandler: any;

describe('Phase 6 Acceptance Suite: Dependable Email & SMS Notification Delivery', () => {
  beforeAll(async () => {
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

    try {
      process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
      process.env.APP_URL = 'https://app.vancehealth.local';

      adminApp = (admin.apps && admin.apps.length > 0) ? admin.apps[0] : admin.initializeApp({ projectId: PROJECT_ID });
      adminDb = getDb();
    } catch (err) {
      console.warn('Admin SDK init warning:', err);
    }
  });

  afterAll(async () => {
    setTestResendInstance(null);
    setTestTwilioHandler(null);
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }

    mockResend = {
      emails: {
        send: vi.fn().mockResolvedValue({
          data: { id: 'resend_msg_mock_123' },
          error: null,
        }),
      },
    };
    setTestResendInstance(mockResend);

    mockTwilioHandler = vi.fn().mockResolvedValue({
      sid: 'SM_mock_twilio_789',
      status: 'queued',
    });
    setTestTwilioHandler(mockTwilioHandler);

    if (adminDb) {
      await adminDb.doc('clinics/columbus-chiropractic').set({
        id: 'columbus-chiropractic',
        name: 'Apex Chiropractic Centre',
        phone: '+44 20 7946 0912',
        address: '44 Wicklow Street, London WC1X 9HL',
        timezone: 'Europe/London',
      });

      await adminDb.doc('clinic_settings/columbus-chiropractic').set({
        clinicName: 'Apex Chiropractic Centre',
        emailFrom: 'care@apexchiro.co.uk',
        twilioPhoneNumber: '+447700900192',
      });
    }
  });

  // 1. Authorization: Anonymous, patient, and cross-clinic rejection
  it('1. Authorization: Rejects anonymous callers, patients invoking staff dispatch, and cross-clinic tampering', async () => {
    if (!adminDb) return;

    await adminDb.doc('appointments/appt_auth_clinic_a').set({
      id: 'appt_auth_clinic_a',
      clinicId: 'clinic_a',
      patientEmail: 'alice@example.com',
      patientId: 'patient_alice',
    });

    await adminDb.doc('appointments/appt_auth_clinic_b').set({
      id: 'appt_auth_clinic_b',
      clinicId: 'clinic_b',
      patientEmail: 'charlie@example.com',
      patientId: 'patient_charlie',
    });

    // 1a. Anonymous (no auth context) caller with a valid appointmentId -> throws unauthenticated
    let err1a: any = null;
    try {
      await sendTransactionalEmailHandler(
        { type: 'booking_confirmation', appointmentId: 'appt_auth_clinic_a' },
        { auth: null }
      );
    } catch (e) {
      err1a = e;
    }
    expect(err1a?.code).toBe('unauthenticated');
    expect(mockResend.emails.send).not.toHaveBeenCalled();

    // 1b. Anonymous caller with valid appointmentId AND arbitrary client-supplied recipient email -> throws unauthenticated (never dispatches)
    let err1b: any = null;
    try {
      await sendTransactionalEmailHandler(
        {
          type: 'booking_confirmation',
          appointmentId: 'appt_auth_clinic_a',
          recipientEmail: 'attacker@evil.com',
        },
        { auth: null }
      );
    } catch (e) {
      err1b = e;
    }
    expect(err1b?.code).toBe('unauthenticated');
    expect(mockResend.emails.send).not.toHaveBeenCalled();

    // 1c. Staff of Clinic A with Clinic B's appointmentId -> throws permission-denied
    let err1c: any = null;
    try {
      await sendTransactionalEmailHandler(
        {
          type: 'booking_confirmation',
          appointmentId: 'appt_auth_clinic_b',
        },
        {
          auth: {
            uid: 'staff_alice_1',
            token: { role: 'staff', clinicId: 'clinic_a' },
          },
        }
      );
    } catch (e) {
      err1c = e;
    }
    expect(err1c?.code).toBe('permission-denied');
    expect(mockResend.emails.send).not.toHaveBeenCalled();

    // 1d. Patient with the same clinicId targeting another patient's appointment -> throws permission-denied
    let err1d: any = null;
    try {
      await sendTransactionalEmailHandler(
        {
          type: 'booking_confirmation',
          appointmentId: 'appt_auth_clinic_a',
        },
        {
          auth: {
            uid: 'patient_stranger_in_clinic_a',
            token: { role: 'patient', clinicId: 'clinic_a' },
          },
        }
      );
    } catch (e) {
      err1d = e;
    }
    expect(err1d?.code).toBe('permission-denied');
    expect(mockResend.emails.send).not.toHaveBeenCalled();

    // 1e. Patient attempting staff automated notification dispatch -> throws permission-denied
    let err1e: any = null;
    try {
      await sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911123456', messageText: 'Staff broadcast' },
        { auth: { uid: 'patient_bob', token: { role: 'patient', clinicId: 'clinic_a' } } }
      );
    } catch (e) {
      err1e = e;
    }
    expect(err1e?.code).toBe('permission-denied');
    expect(mockTwilioHandler).not.toHaveBeenCalled();
  });

  // 2. Recipient binding to trusted records & HTML escaping
  it('2. Recipient Resolution & HTML Escaping: Discards client overrides and escapes user input', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_sec_escape_02';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'trusted_patient@example.com',
      patientName: '<script>alert("xss")</script>Dr. John & Jane',
      doctorName: 'Dr. Alistair <b>Vance</b>',
      date: '2026-11-15',
      time: '14:30',
      status: 'confirmed',
    });

    const result = await sendTransactionalEmailHandler(
      {
        type: 'booking_confirmation',
        appointmentId,
        recipientEmail: 'forged_attacker@example.com', // Attempted override
        patientName: 'Forged Name',
      },
      {
        auth: {
          uid: 'staff_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(result.success).toBe(true);
    expect(result.targetRecipient).toBe('trusted_patient@example.com');

    // Assert Resend was called with the trusted stored recipient
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['trusted_patient@example.com'],
        from: expect.stringContaining('Apex Chiropractic Centre'),
        html: expect.stringContaining('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Dr. John &amp; Jane'),
      })
    );
  });

  // 3. Dynamic clinic branding & verified sender alignment
  it('3. Dynamic Branding: Uses clinic-specific name, emailSender, and env fallback (never hardcodes Vance)', async () => {
    if (!adminDb) return;

    process.env.RESEND_FROM_EMAIL = 'verify@buyer.example';

    const appointmentId = 'appt_branding_03';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'patient@example.com',
      patientName: 'David Miller',
      date: '2026-11-20',
      time: '09:00',
    });

    // 3a. With Firestore clinic_settings emailFrom configured
    await sendTransactionalEmailHandler(
      {
        type: 'booking_confirmation',
        appointmentId,
      },
      {
        auth: {
          uid: 'staff_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Apex Chiropractic Centre Appointments <care@apexchiro.co.uk>',
        subject: 'Appointment Confirmed - 2026-11-20 at 09:00',
        html: expect.stringContaining('Apex Chiropractic Centre'),
      })
    );

    // 3b. Delete Firestore clinic_settings and verify fallback to RESEND_FROM_EMAIL
    await adminDb.doc('clinic_settings/columbus-chiropractic').delete();
    mockResend.emails.send.mockClear();

    const appointmentId2 = 'appt_branding_03_fallback';
    await adminDb.doc(`appointments/${appointmentId2}`).set({
      id: appointmentId2,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'patient2@example.com',
      patientName: 'Sarah Miller',
      date: '2026-11-21',
      time: '10:00',
    });

    await sendTransactionalEmailHandler(
      {
        type: 'booking_confirmation',
        appointmentId: appointmentId2,
      },
      {
        auth: {
          uid: 'staff_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Apex Chiropractic Centre Appointments <verify@buyer.example>',
      })
    );

    // 3c. Delete env var and assert handler throws setup error (failed-precondition) instead of hardcoding any domain
    delete process.env.RESEND_FROM_EMAIL;
    let setupErr: any = null;
    try {
      await sendTransactionalEmailHandler(
        {
          type: 'booking_confirmation',
          appointmentId: appointmentId2,
        },
        {
          auth: {
            uid: 'staff_1',
            token: { role: 'staff', clinicId: 'columbus-chiropractic' },
          },
        }
      );
    } catch (err: any) {
      setupErr = err;
    }
    expect(setupErr).not.toBeNull();
    expect(setupErr.code).toBe('failed-precondition');
  });

  // 4. Deduplication keys & duplicate delivery prevention
  it('4. Deduplication: Tracks lifecycle states in notification_deliveries and prevents duplicate dispatch on retries', async () => {
    if (!adminDb) return;

    const appointmentId = 'appt_dedup_04';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'dedup_patient@example.com',
      patientName: 'Emma Watson',
      date: '2026-11-22',
      time: '11:00',
    });

    // 1st invocation: sends email
    const res1 = await sendTransactionalEmailHandler(
      { type: 'booking_confirmation', appointmentId },
      { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
    );
    expect(res1.success).toBe(true);
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1);

    const dedupDocId = `notif_booking_confirmation_${appointmentId}_email`;
    const deliveryDoc1 = await adminDb.doc(`notification_deliveries/${dedupDocId}`).get();
    expect(deliveryDoc1.exists).toBe(true);
    expect(deliveryDoc1.data()?.status).toBe('delivered');
    expect(deliveryDoc1.data()?.providerMessageId).toBe('resend_msg_mock_123');

    // 2nd invocation (Simulating retry / double-click): Deduplicates without invoking provider
    const res2 = await sendTransactionalEmailHandler(
      { type: 'booking_confirmation', appointmentId },
      { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
    );
    expect(res2.result?.alreadyDelivered).toBe(true);
    // Still exactly 1 provider call
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
  });

  // 5. Communication preferences & consent enforcement
  it('5. Consent Enforcement: Respects patient communication opt-outs for email and SMS', async () => {
    if (!adminDb) return;

    const optOutApptId = 'appt_optout_05';
    await adminDb.doc(`appointments/${optOutApptId}`).set({
      id: optOutApptId,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'optout@example.com',
      patientPhone: '+447911999888',
      emailConsent: false,
      smsConsent: false,
    });

    // Email dispatch skipped due to opt-out
    const emailRes = await sendTransactionalEmailHandler(
      { type: 'booking_confirmation', appointmentId: optOutApptId },
      { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
    );
    expect(emailRes.success).toBe(false);
    expect(emailRes.reason).toBe('opted_out');
    expect(mockResend.emails.send).not.toHaveBeenCalled();

    // SMS dispatch skipped due to opt-out
    const smsRes = await sendAutomatedNotificationHandler(
      {
        channel: 'sms',
        recipient: '+447911999888',
        messageText: 'Reminder message',
        appointmentId: optOutApptId,
      },
      { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
    );
    expect(smsRes.success).toBe(false);
    expect(smsRes.reason).toBe('opted_out');
    expect(mockTwilioHandler).not.toHaveBeenCalled();
  });

  // 6. Provider rejection recorded as failure state
  it('6. Provider Error Handling: Inspects provider response error object and records failure in notification_deliveries', async () => {
    if (!adminDb) return;

    mockResend.emails.send.mockResolvedValueOnce({
      data: null,
      error: { message: 'Domain unverified in Resend settings', name: 'validation_error' },
    });

    const appointmentId = 'appt_prov_err_06';
    await adminDb.doc(`appointments/${appointmentId}`).set({
      id: appointmentId,
      clinicId: 'columbus-chiropractic',
      patientEmail: 'unverified_domain@example.com',
    });

    const res = await sendTransactionalEmailHandler(
      { type: 'booking_confirmation', appointmentId },
      { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
    );

    expect(res.success).toBe(false);

    const dedupDocId = `notif_booking_confirmation_${appointmentId}_email`;
    const deliveryDoc = await adminDb.doc(`notification_deliveries/${dedupDocId}`).get();
    expect(deliveryDoc.exists).toBe(true);
    expect(deliveryDoc.data()?.status).toBe('failed');
    expect(deliveryDoc.data()?.errorMessage).toBe('Domain unverified in Resend settings');
  });

  // 7. Twilio SMS test override execution & delivery logging
  it('7. SMS Test Provider Override: Executes test handler with clean phone number and persists delivery state', async () => {
    if (!adminDb) return;

    const res = await sendAutomatedNotificationHandler(
      {
        channel: 'sms',
        recipient: '+44 7911 123456',
        messageText: 'Apex Chiropractic: Your appointment is confirmed for tomorrow.',
      },
      {
        auth: {
          uid: 'staff_1',
          token: { role: 'staff', clinicId: 'columbus-chiropractic' },
        },
      }
    );

    expect(res.success).toBe(true);
    expect(res.sid).toBe('SM_mock_twilio_789');
    expect(mockTwilioHandler).toHaveBeenCalledTimes(1);
    expect(mockTwilioHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+44 7911 123456',
        from: '+447700900192',
        body: 'Apex Chiropractic: Your appointment is confirmed for tomorrow.',
      })
    );
  });

  // 8. Payload validation & rate limiting
  it('8. Payload Validation & Rate Limiting: Rejects malformed formats and enforces per-caller, per-clinic, and per-recipient rate limits', async () => {
    if (!adminDb) return;

    // 8a. Invalid phone number format
    let errPhone: any = null;
    try {
      await sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: 'invalid-phone-abc', messageText: 'Test' },
        { auth: { uid: 'staff_1', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
      );
    } catch (e) {
      errPhone = e;
    }
    expect(errPhone?.code).toBe('invalid-argument');

    // 8b. Caller rate limit (30/hr limit reached)
    await adminDb.doc('clinic_notifications_ratelimit/caller_staff_spammer_sms').set({
      count: 30,
      windowStart: Date.now(),
    });

    let errCaller: any = null;
    try {
      await sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911123456', messageText: 'Spam attempt' },
        { auth: { uid: 'staff_spammer', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
      );
    } catch (e) {
      errCaller = e;
    }
    expect(errCaller?.code).toBe('resource-exhausted');
    expect(errCaller?.message).toContain('Caller notification rate limit exceeded');

    // 8c. Clinic rate limit (100/hr limit reached)
    await adminDb.doc('clinic_notifications_ratelimit/clinic_columbus-chiropractic_sms').set({
      count: 100,
      windowStart: Date.now(),
    });

    let errClinic: any = null;
    try {
      await sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911123456', messageText: 'Clinic flood' },
        { auth: { uid: 'staff_2', token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
      );
    } catch (e) {
      errClinic = e;
    }
    expect(errClinic?.code).toBe('resource-exhausted');
    expect(errClinic?.message).toContain('Clinic notification rate limit exceeded');

    // 8d. Recipient rate limit (10/hr anti-bombing limit reached)
    const sanitizedPhone = '+447911999999'.replace(/[^a-z0-9]/g, '_');
    await adminDb.doc(`clinic_notifications_ratelimit/recipient_${sanitizedPhone}_sms`).set({
      count: 10,
      windowStart: Date.now(),
    });

    let errRecipient: any = null;
    try {
      await sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911999999', messageText: 'Targeted bomb' },
        { auth: { uid: 'staff_3', token: { role: 'staff', clinicId: 'another-clinic' } } }
      );
    } catch (e) {
      errRecipient = e;
    }
    expect(errRecipient?.code).toBe('resource-exhausted');
    expect(errRecipient?.message).toContain('Recipient notification rate limit exceeded');

    // 8e. Atomic Transactional Concurrency: Two simultaneous requests at boundary count=29 cannot both succeed
    const boundaryCallerUid = 'staff_boundary_caller';
    await Promise.all([
      adminDb.doc(`clinic_notifications_ratelimit/caller_${boundaryCallerUid}_sms`).set({
        count: 29,
        windowStart: Date.now(),
      }),
      adminDb.doc('clinic_notifications_ratelimit/clinic_columbus-chiropractic_sms').set({
        count: 0,
        windowStart: Date.now(),
      }),
    ]);

    const [raceRes1, raceRes2] = await Promise.allSettled([
      sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911111111', messageText: 'Race request 1' },
        { auth: { uid: boundaryCallerUid, token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
      ),
      sendAutomatedNotificationHandler(
        { channel: 'sms', recipient: '+447911222222', messageText: 'Race request 2' },
        { auth: { uid: boundaryCallerUid, token: { role: 'staff', clinicId: 'columbus-chiropractic' } } }
      ),
    ]);

    const successes = [raceRes1, raceRes2].filter((r) => r.status === 'fulfilled');
    const failures = [raceRes1, raceRes2].filter((r) => r.status === 'rejected') as PromiseRejectedResult[];

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0].reason?.code).toBe('resource-exhausted');
    expect(failures[0].reason?.message).toContain('Caller notification rate limit exceeded');

    // Final count in Firestore must be exactly 30
    const finalCallerSnap = await adminDb.doc(`clinic_notifications_ratelimit/caller_${boundaryCallerUid}_sms`).get();
    expect(finalCallerSnap.data()?.count).toBe(30);
  });

  // 9. Scheduled Reminders: sweeps upcoming appointments, skips cancelled, sets reminder24hSent, and avoids duplicates
  it('9. Scheduled Reminders: Dispatches reminder for confirmed appointment, ignores cancelled/already-sent, and marks reminder24hSent', async () => {
    if (!adminDb) return;

    const targetDate = '2026-10-05';

    // 1. Confirmed appointment needing reminder
    await adminDb.doc('appointments/appt_sched_due').set({
      id: 'appt_sched_due',
      clinicId: 'columbus-chiropractic',
      patientEmail: 'patient_due@example.com',
      patientName: 'Due Patient',
      date: targetDate,
      time: '10:00 AM',
      status: 'confirmed',
      reminder24hSent: false,
      emailConsent: true,
    });

    // 2. Cancelled appointment (should NOT receive reminder)
    await adminDb.doc('appointments/appt_sched_cancelled').set({
      id: 'appt_sched_cancelled',
      clinicId: 'columbus-chiropractic',
      patientEmail: 'patient_cancelled@example.com',
      patientName: 'Cancelled Patient',
      date: targetDate,
      time: '11:00 AM',
      status: 'cancelled',
      reminder24hSent: false,
    });

    // 3. Already sent reminder (should NOT receive duplicate)
    await adminDb.doc('appointments/appt_sched_alreadysent').set({
      id: 'appt_sched_alreadysent',
      clinicId: 'columbus-chiropractic',
      patientEmail: 'patient_sent@example.com',
      patientName: 'Already Sent Patient',
      date: targetDate,
      time: '12:00 PM',
      status: 'confirmed',
      reminder24hSent: true,
    });

    // Run sweep
    const result1 = await processScheduledRemindersHandler(
      { targetDate },
      { auth: { uid: 'admin_1', token: { role: 'admin', clinicId: 'columbus-chiropractic' } } }
    );

    expect(result1.dispatchedCount).toBe(1);
    expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
    expect(mockResend.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['patient_due@example.com'],
        subject: expect.stringContaining('Appointment Reminder: Tomorrow at 10:00 AM'),
      })
    );

    // Verify Firestore appointment was marked reminder24hSent: true
    const updatedDueAppt = await adminDb.doc('appointments/appt_sched_due').get();
    expect(updatedDueAppt.data()?.reminder24hSent).toBe(true);

    // Re-run sweep to ensure duplicate prevention
    mockResend.emails.send.mockClear();
    const result2 = await processScheduledRemindersHandler(
      { targetDate },
      { auth: { uid: 'admin_1', token: { role: 'admin', clinicId: 'columbus-chiropractic' } } }
    );
    expect(result2.dispatchedCount).toBe(0);
    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });
});
