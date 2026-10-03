# Comprehensive Role & Field-Level Permission Matrix

This document defines the authoritative security boundaries across all Practice OS actors. Permissions govern direct database rules, callable Cloud Functions, and Cloud Storage paths—not merely user interface elements.

---

## 1. Actor Definitions

| Actor | Identification / Credential | Scope Boundary |
| :--- | :--- | :--- |
| **Anonymous User** | Unauthenticated | Public marketing pages, public clinician bios, guest intake form. |
| **Patient (Guest / Auth)** | Verified UID (`role: 'patient'`, `clinicId`) or Scoped Token | Strictly limited to their own appointments, invoices, and intake. |
| **Staff (Receptionist)** | Custom Claim `role: 'staff'`, `clinicId` + Active Member doc | Clinic scheduling, appointment check-ins, patient directory. |
| **Practitioner (Doctor)**| Custom Claim `role: 'practitioner'`, `clinicId` + Active Member | Clinical charting, diagnostic records, patient intake reviews. |
| **Content Editor** | Custom Claim `role: 'editor'`, `clinicId` + Active Member | Blog posts, marketing copy, SEO metadata, condition articles. |
| **Clinic Administrator**| Custom Claim `role: 'admin'`, `clinicId` + Active Member | Financial settings, Stripe Connect, team accounts, clinic theme. |
| **Super Administrator** | Custom Claim `superAdmin: true` | Multi-tenant diagnostics, deployment provisioning, audit log. |

---

## 2. Resource & Collection Permission Matrix

| Firestore Collection | Anonymous | Patient | Staff | Practitioner | Editor | Clinic Admin | Super Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/clinics/{clinicId}` | Read (Public) | Read (Public) | Read | Read | Read | Read / Write | Read / Write |
| `/clinic_settings/{clinicId}` | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | Read / Write | Read / Write |
| `/clinic_config/active` | Read (Public) | Read (Public) | Read | Read | Read | Read / Update* | Read / Write |
| `/clinic_config_private/*` | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | Read / Write |
| `/clinics/{clinicId}/members/*` | **DENIED** | **DENIED** | Read | Read | **DENIED** | Read / Write | Read / Write |
| `/clinics/{clinicId}/invitations/*` | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | Read / Write | Read / Write |
| `/appointments/{id}` | Create (Unpaid only) | Read/Edit Own* | Read / Update | Read / Update | **DENIED** | Read / Write | Read / Write |
| `/inquiries/{id}` | Create | **DENIED** | Read / Update | Read / Update | **DENIED** | Read / Write | Read / Write |
| `/conditions/*` | Read (Public) | Read (Public) | Read / Write | Read / Write | Read / Write | Read / Write | Read / Write |
| `/teamMembers/*` (Public Bios) | Read (Public) | Read (Public) | Read / Write | Read / Write | Read / Write | Read / Write | Read / Write |
| `/blogPosts/*` | Read (Public) | Read (Public) | Read / Write | Read / Write | Read / Write | Read / Write | Read / Write |
| `/invoices/{id}` | **DENIED** | Read Own | Read Clinic | Read Clinic | **DENIED** | Read Clinic | Read / Write |
| `/reservations/{id}` | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | Admin SDK Only |
| `/operator_audit_log/{id}` | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | **DENIED** | Admin SDK Only |

*\*Notes on scoped edits:*
* `appointments`: Patients may only update symptom notes, contact details, or requested timeslot on their own booking. Mutation of `paymentStatus`, `amountPaid`, `transactionId`, `priceAmount`, `clinicId`, or `patientId` is rejected.
* `clinic_config/active`: Primary clinic ID is immutable once set; only super admin can alter multi-tenant platform bindings.

---

## 3. Field-Level Sensitivity Specification

### 3.1. Appointments (`/appointments/{appointmentId}`)
* **Public / Guest Writable (Create Only)**: `clinicId`, `patientName`, `patientEmail`, `patientPhone`, `date`, `time`, `serviceType`, `serviceTitle`, `durationMinutes`, `notes`.
* **Immutable Client Fields**: `paymentStatus` (must be `'unpaid'` if submitted by client; authoritative paid statuses require server webhook/handler), `amountPaid` (must be 0 or omitted), `transactionId` (omitted), `priceAmount` (server catalog resolved).
* **Staff Visible / Editable**: Scheduling status (`new`, `confirmed`, `checked_in`, `cancelled`), cancellation reasons, internal practitioner notes.
* **Patient Visible**: Service description, scheduled date/time, attending doctor name, payment receipt summary. Patients CANNOT read internal clinician diagnostic tags or staff notes.

### 3.2. Clinic Settings (`/clinic_settings/{clinicId}`)
* **Admin-Only Private Fields**: `stripeAccountId`, `stripePublishableKey`, `stripeConnectedEmail`, `webhookSecret`, `smsQuota`, `ehrApiKey`.
* **Public Equivalents (in `/clinics/{clinicId}`)**: `name`, `address`, `phone`, `currency`, `currencySymbol`, `services`, `theme`.

---

## 4. Cloud Storage Permission Boundaries

| Storage Bucket Path | Read Access | Write Access | Validation Rules |
| :--- | :--- | :--- | :--- |
| `/clinics/{clinicId}/public/**` | **Public** | Clinic Staff / Admin | Image MIME types (`image/*`), max 5MB. |
| `/clinics/{clinicId}/staff/**` | Clinic Staff / Admin | Clinic Admin | Image / PDF, max 10MB. |
| `/patients/{clinicId}/{patientId}/**` | Patient Owner OR Same-Clinic Staff | Patient Owner OR Same-Clinic Staff | Image / PDF, max 10MB. Strictly isolated by `clinicId` and `patientId`. |
| `/patients/{patientId}/**` | Authenticated Patient Owner Only | Authenticated Patient Owner Only | PDF / Image, max 10MB. |

---

## 5. Session Revocation & Stale Claim Invalidation

1. When a staff member is demoted, deactivated, or removed:
   * Their membership document (`clinics/{clinicId}/members/{uid}`) is updated to `status: 'deactivated'`.
   * Custom claims are removed (`admin.auth().setCustomUserClaims(uid, { role: 'patient' })`).
   * **Active Session Revocation**: `admin.auth().revokeRefreshTokens(uid)` is invoked immediately.
   * Callables and rules check `auth_time` and active membership document state to reject operations from previously issued JWTs.
2. Last Administrator Protection:
   * A clinic admin cannot remove themselves or demote their role if they are the sole administrator.
   * Ownership transfer must be executed first to prevent orphaned clinic organizations.
