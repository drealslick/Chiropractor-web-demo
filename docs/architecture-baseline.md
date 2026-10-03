# Architecture Baseline & Technical Contracts

## 1. Architectural Decisions & Scope

### 1.1. Deployment & Multi-Tenant Model
* **Ownership**: Single purchaser-owned Firebase project deployment serving one primary clinic organization with one or more physical practice branches.
* **Identifier Boundaries**:
  * `clinicId`: Organization tenant boundary (e.g. `columbus-chiropractic`). Required on all tenant documents. Cross-tenant reads and mutations are denied at the rules layer.
  * `locationId`: Physical branch facility within the clinic (e.g. `loc_downtown`).
  * `practitionerId`: Clinical provider UID or slug (e.g. `user_doc_columbus_001`). Authenticated staff membership is separate from public marketing biographies.
* **Custom Claims**: Admin and staff privileges are derived from cryptographically signed Firebase Auth Custom Claims (`role`, `clinicId`), never from untrusted client document attributes.

### 1.2. Toolchain & Runtime Pinning
* **Package Manager**: `npm` (standardized across root and `functions/`). Both `package-lock.json` and `functions/package-lock.json` are committed.
* **Node Runtime**: Node 20 LTS (`"engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }` in root, `"node": "20"` in `functions/`).
* **Deterministic Builds**: Backend build is defined as `rm -rf lib && tsc` in `functions/package.json` to prevent stale output deployment.

### 1.3. Patient Security & Authentication
* **Guest Booking**: Permitted for initial appointment intake without forced account registration.
* **Access Boundary**: Scoped token or verified authentication is required to access medical notes, intake forms, receipts, and clinical records. A booking ID alone cannot authorize viewing another patient's medical details.

### 1.4. Financial & Payment Model
* **Currency Authority**: Currency symbol and ISO currency code (e.g. `gbp`, `usd`) are set in the server-managed clinic catalog.
* **Integer Minor Units**: Monetary values in backend handlers are stored and transferred as integer minor units (e.g. £85.00 -> 8500 cents/pence).
* **Price Authority**: `createPaymentIntent` calculates prices authoritatively from the clinic catalog (`clinics/{clinicId}`) or verified appointment record, discarding client-supplied arbitrary amount inputs.
* **Payment Choices**:
  * `full`: Full consultation fee charged upfront.
  * `deposit`: Partial reservation deposit charged upfront; balance due at reception.
  * `clinic_cash`: Pay on arrival at reception.
  * `card_hold`: Card pre-authorization / no-show protection with explicit consent.

### 1.5. Content & SEO Architecture
* **Single Source of Truth**: Unified metadata model in `scripts/prerender.ts` and `src/data/clinicData.ts`.
* **Prerender Pipeline**: Generates real static `#root` markup, canonical links, and Schema.org `MedicalClinic` JSON-LD graphs at build time.

---

## 2. Route Inventory

| Route | Purpose | Access Control | Status |
| :--- | :--- | :--- | :--- |
| `/` | Clinic Homepage & Hero Intake | Public | Implemented |
| `/conditions` | Clinical Conditions Directory | Public | Implemented |
| `/conditions/:conditionId` | Evidence-Based Treatment Detail | Public | Implemented |
| `/first-visit` | What to Expect & Intake Protocol | Public | Implemented |
| `/about` | Clinic Heritage & Philosophy | Public | Implemented |
| `/team` | Clinical Team Directory | Public | Implemented |
| `/team/:memberSlug` | Practitioner Bio & Credentials | Public | Implemented |
| `/pricing` | Itemized Fee Schedule & Plans | Public | Implemented |
| `/blog` | Patient Education & Clinical Articles | Public | Implemented |
| `/blog/:slug` | Article Detail & Citations | Public | Implemented |
| `/contact` | Directions, Map & Direct Message | Public | Implemented |
| `/portal` | Patient Self-Service Portal | Scoped / Auth | Repaired (Truthful receipts, no fake license) |
| `/privacy` | GDPR & HIPAA Privacy Policy | Public | Implemented |
| `/terms` | Treatment Terms & Cancellation Policy | Public | Implemented |

---

## 3. Cloud Functions & Callable Inventory

| Callable / Trigger | Purpose | Authority Level | Status |
| :--- | :--- | :--- | :--- |
| `onUserCreated` | Auth Trigger for default user profile | Server Trigger | Implemented |
| `claimInitialClinicAdmin` | First-run deployment admin onboarding | Deployment Token + Auth | Repaired (Claims outside transaction, timingSafeEqual) |
| `createPaymentIntent` | Stripe PaymentIntent creation | Server Price Authority | Repaired (No client price, idempotency, fail-closed) |
| `stripeWebhook` | Stripe webhook processing | Signature Verified | Repaired (Real settlement, metadata checks) |
| `refundAppointmentPayment` | Process refund via Stripe | Staff/Admin (Same Clinic) | Implemented (Real Stripe refund call) |
| `reserveAppointmentSlot` | Transactional slot reservation | Server Locked | Implemented (Double-booking prevention lock) |
| `cancelAppointmentSlot` | Appointment cancellation & lock release | Patient Owner / Staff | Implemented (Atomic lock cleanup) |
| `sendAutomatedNotification` | SMS/Email notification dispatcher | Staff/Admin (Same Clinic) | Repaired (Fail-closed on missing keys, rate-limited) |

---

## 4. Firestore Collections & Security Rules Matrix

| Collection | Read Rule | Write Rule | Notes |
| :--- | :--- | :--- | :--- |
| `/clinic_config/active` | Public | SuperAdmin only | Immutable `primaryClinicId` |
| `/clinic_config_private/*` | SuperAdmin only | SuperAdmin only | Contains deployment setup secrets |
| `/clinics/{clinicId}` | Public | Clinic Admin / SuperAdmin | Public practice details & service catalog |
| `/clinic_settings/{clinicId}` | Clinic Admin (Same Clinic) | Clinic Admin (Same Clinic) | Contains Stripe Account ID |
| `/clinic_settings_private/{clinicId}` | Clinic Admin (Same Clinic) | Clinic Admin (Same Clinic) | Private credentials |
| `/appointments/{id}` | Patient Owner or Clinic Staff | Server / Staff for status | `paymentStatus` client mutation denied |
| `/patient_leads/{id}` | Clinic Staff (Same Clinic) | Public create, Staff update | Patient contact inquiries |
| `/patient_inquiries/{id}` | Clinic Staff (Same Clinic) | Public create, Staff update | Private contact form |
| `/reservations/{key}` | False (Server only) | False (Server only) | Transactional concurrency lock |
| `/clinic_notifications_ratelimit/{id}` | False (Server only) | False (Server only) | Hourly dispatch rate-limiter |
| `/operator_audit_log/{id}` | False (Server only) | False (Server only) | Audit compliance trail |
