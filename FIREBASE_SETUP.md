# 🛡️ Firebase Production Setup & Architecture Guide

This document details the production-ready Firebase backend architecture implemented for **Vance Health / Apex Spine Engine**, fulfilling the complete multi-tenant clinical specification.

---

## 📋 Deliverable Matrix Overview

| Module | Status | Deliverables / Files | Description |
| :--- | :---: | :--- | :--- |
| **1. Firebase Auth** | ✅ | `src/services/firebaseAuth.ts`, `src/services/firebaseSync.ts` | Email/password auth, email verification, password reset, role claims, and immediate token refresh. |
| **2. Firestore Data Model** | ✅ | `firebase-blueprint.json`, `firestore.indexes.json` | 9 multi-tenant collections, composite indexes for high-speed clinician queries, denormalized records. |
| **3. Security Rules** | ✅ | `firestore.rules`, `tests/firestore.rules.test.ts` | Multi-tenant isolation by `clinicId`, strict patient record isolation, staff theme restriction, test suite. |
| **4. Firebase Storage** | ✅ | `storage.rules`, `src/utils/imageCompression.ts` | Isolated bucket paths `/clinics/{clinicId}/*`, 5MB upload ceiling, MIME type verification, client compression. |
| **5. Cloud Functions** | ✅ | `functions/package.json`, `functions/src/index.ts` | Stripe webhook listener (`payment_intent.succeeded`), Resend email dispatcher, Auth onCreate trigger, cleanup cron. |
| **6. Data Migration** | ✅ | `scripts/migrate-to-firestore.ts` | One-touch migration populating clinic config, conditions, team members, testimonials, FAQs, and appointments. |
| **7. Documentation** | ✅ | `FIREBASE_SETUP.md`, `.env.example` | Architecture runbook, emulator guide, gotchas avoidance, acceptance test plan, and handoff checklist. |

---

## 1. Firebase Authentication & Multi-Tenant Roles

### User Roles & Custom Claims
Every user belongs to a specific `clinicId` and holds one of three roles:
- **`patient`**: Can view and manage their own appointments, care plan, intake forms, and personal profile.
- **`staff`**: Receptionists and associates who manage appointments, patient check-ins, and inquiries for their assigned `clinicId`. Cannot alter theme, financial accounts, or clinic settings.
- **`admin`**: Clinic Directors and Practice Owners who possess full administrative privileges, including clinic settings, Stripe Connect, doctor rosters, and financial reports.

### Token Refresh Architecture (Resolving Gotcha #3)
Custom claims are stored inside the user's signed JWT token. Normally, Firebase Auth only refreshes tokens once every 60 minutes.
In `src/services/firebaseAuth.ts`, the `forceRefreshToken()` function calls `getIdToken(user, true)` on promotion or login, forcing an immediate server handshake so promoted users gain immediate access without having to wait.

---

## 2. Firestore Data Model & Composite Indexes

### The 9 Collections:
1. `clinics/{clinicId}`: Clinic profile, address, theme settings, Stripe Account ID, branding.
2. `users/{userId}`: User identity, email verification status, clinic tenancy (`clinicId`), and assigned role.
3. `appointments/{appointmentId}`: Booked consultations, clinical condition, doctor info, payment status.
4. `inquiries/{inquiryId}`: Website inquiries, intake leads, triage notes.
5. `conditions/{conditionId}`: Treatable conditions, clinical rehab milestones, prescribed frequency, exercises.
6. `teamMembers/{memberId}`: Doctors, qualifications, GCC credentials, specialties, headshot URLs.
7. `blogPosts/{postId}`: Clinical articles, patient recovery guides, SEO metadata.
8. `testimonials/{testimonialId}`: Verified patient reviews, star ratings, condition outcomes.
9. `faqs/{faqId}`: Practice FAQs categorized by Billing, First Visit, Insurance, and Clinical Care.

### Denormalization Strategy
Firestore charges per document read. To prevent N+1 queries when loading the patient portal or booking agenda, key entities are denormalized onto `appointments`:
* `doctorName`: Embedded on the appointment doc (avoids fetching `teamMembers/{doctorId}`).
* `conditionName`: Embedded on the appointment doc (avoids fetching `conditions/{conditionId}`).
* `patientName` & `patientEmail`: Embedded directly for instant lookup and receipt generation.

### Composite Indexes (`firestore.indexes.json`)
The following composite indexes are configured for multi-field queries:
- `appointments`: `clinicId` (ASC), `doctorId` (ASC), `date` (ASC)
- `appointments`: `clinicId` (ASC), `patientId` (ASC), `date` (DESC)
- `conditions`: `clinicId` (ASC), `specialistDoctorId` (ASC), `name` (ASC)
- `inquiries`: `clinicId` (ASC), `status` (ASC), `createdAt` (DESC)
- `blogPosts`: `clinicId` (ASC), `published` (ASC), `publishedAt` (DESC)

---

## 3. Firestore Security Rules & Testing

The security rules in `firestore.rules` enforce multi-tenant isolation:
* **Patient Isolation**: Patients are authenticated and can ONLY access documents where `resource.data.patientId == request.auth.uid`. Cross-patient snooping is blocked.
* **Clinic Tenancy**: Staff can only access records where `resource.data.clinicId == request.auth.token.clinicId`.
* **Theme & Settings Lockdown**: Only users with the `admin` role can write to `clinics/{clinicId}`. Staff attempts to mutate theme or Stripe keys will be rejected by Firestore.

### Security Rules Test Suite
Located in `tests/firestore.rules.test.ts`.  
Run unit tests with the Firebase Local Emulator:
```bash
npm install -D @firebase/rules-unit-testing vitest
npx vitest run tests/firestore.rules.test.ts
```

---

## 4. Firebase Storage Rules (`storage.rules`)

Storage is partitioned with:
* Clinic assets: `/clinics/{clinicId}/{allPaths=**}` (readable publicly, writable only by clinic staff).
* Max file size: 5MB ceiling enforced via `request.resource.size < 5 * 1024 * 1024`.
* Content type verification: `request.resource.contentType.matches('image/.*')`.

---

## 5. Cloud Functions (Node.js)

Located in `/functions`:
1. `stripeWebhook`: Listens for `payment_intent.succeeded` and `charge.refunded`. Automatically updates Firestore appointment payment status and triggers payment receipts.
2. `sendTransactionalEmail`: Authenticated callable function utilizing **Resend** for booking confirmations, cancellations, and clinic alerts.
3. `onUserCreated`: Firebase Auth trigger that automatically creates the user's Firestore record in `users/{uid}` and assigns their default role.
4. `cleanupStaleDemoSessions`: Scheduled cron job running every 24 hours to purge expired draft sessions older than 30 days.

---

## 6. Data Migration Script

To migrate existing seed data and Supabase records directly into Firestore:
```bash
npm run migrate:firestore
```
This script initializes:
- Primary clinic tenant: `clinic_apex_columbus`
- Clinical condition tracks & home rehab plans
- Clinician roster (Dr. Sarah Vance, Dr. Marcus Reed)
- Patient reviews, FAQs, and sample appointments

---

## 🚨 The 5 Firebase Gotchas & How We Solved Them

### Gotcha 1: "Security Rules That Look Right But Aren't"
* **The Trap**: Writing `allow read, write: if request.auth != null;` which permits any logged-in patient to read other clinics' medical appointments.
* **Our Fix**: Granular rules in `firestore.rules` verifying `resource.data.patientId == request.auth.uid` for patient collections, and verifying `request.auth.token.clinicId == clinicId` for staff. Backed by `tests/firestore.rules.test.ts`.

### Gotcha 2: "Firestore Query Limits & Missing Composite Indexes"
* **The Trap**: Querying appointments by doctor and date range fails in production if composite indexes are missing.
* **Our Fix**: Defined and created `firestore.indexes.json` with multi-field indexes deployed to the project.

### Gotcha 3: "Custom Claims Require Token Refresh"
* **The Trap**: Promoting a receptionist to admin doesn't take effect for 1 hour because cached JWT tokens don't refresh automatically.
* **Our Fix**: Implemented `forceRefreshToken()` in `src/services/firebaseAuth.ts` which calls `getIdToken(user, true)` on promotion to refresh claims immediately.

### Gotcha 4: "Read/Write Cost Runaway"
* **The Trap**: Reading 500 documents to display a single dashboard schedule.
* **Our Fix**: Denormalized patient and doctor display names directly onto appointment documents, indexed by `clinicId` + `date` to strictly limit read operations.

### Gotcha 5: "Vendor Lock-In"
* **The Trap**: Complex proprietary NoSQL structures that cannot be extracted.
* **Our Fix**: Schema defined in `firebase-blueprint.json` mirroring our normalized relational model (`SUPABASE_PRODUCTION_SCHEMA.sql`). Migration scripts provide two-way portability.

---

## 🧪 Acceptance Testing Plan

Run these verification tests:

### 1. Auth & Patient Isolation Tests
1. **Patient Sign-Up**: Register a new patient account (`testpatient@example.com`) in the Patient Portal.
2. **Password Reset**: Click "Forgot Password?" and verify that Firebase sends a reset link to the email.
3. **Cross-Patient URL Tampering**: Log in as Patient A. Try accessing Patient B's appointment ID (`VH-5182-M93L`). Verify access is denied.

### 2. Clinic Staff & Multi-Tenant Tests
1. Log in as a staff member of `clinic_apex_columbus`.
2. Verify access to appointments for `clinic_apex_columbus`.
3. Try to update clinic theme or branding → verify permission denied (only admin can update).

### 3. Realtime Cross-Device Test
1. Open the patient booking portal on a mobile device and complete a booking.
2. Open the Practice Admin agenda on a desktop browser.
3. Verify the new appointment appears in real-time via Cloud Firestore.

---

## 📋 Handoff Deliverables Checklist

- [x] Firebase Project Configured: `brave-trilogy-ft8c4`
- [x] Firestore Database: `ai-studio-columbuschiropra-e1a46cd1-f2d1-4a04-8ca2-8be7b23c1054`
- [x] Firestore Blueprint Schema: `firebase-blueprint.json` (9 Collections)
- [x] Firestore Security Rules: `firestore.rules` (Multi-tenant + Patient Isolation)
- [x] Rules Test Suite: `tests/firestore.rules.test.ts`
- [x] Storage Security Rules: `storage.rules` (5MB Limit, Image MIME validation)
- [x] Composite Indexes: `firestore.indexes.json`
- [x] Cloud Functions: `/functions` (Stripe Webhook, Resend Emailer, Auth Trigger, Cron)
- [x] Data Migration Script: `scripts/migrate-to-firestore.ts` & `npm run migrate:firestore`
- [x] Comprehensive Setup & Runbook: `FIREBASE_SETUP.md`
