# 🛡️ Firebase Setup & Architecture Guide (Practice OS)

This guide details the Firebase backend architecture for **Practice OS — Standalone Chiropractic Operating System**.

---

## 📋 System Architecture Overview

Practice OS uses Firebase for real-time appointment booking, patient portal authentication, and secure clinical records storage:

| Component | Technology | Configuration | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | Firebase Auth | `src/services/firebaseAuth.ts` | Email/password sign-in, password reset, patient & staff role claims. |
| **Database** | Cloud Firestore | `firestore.rules`, `firebase-blueprint.json` | Single-clinic collections for appointments, patient records, inquiries, and team profiles. |
| **Storage** | Firebase Storage | `storage.rules` | 5MB ceiling for clinical assets and headshots with image MIME validation. |
| **Serverless** | Cloud Functions | `functions/src/index.ts` | Direct Stripe webhook handler, transactional email dispatcher via Resend, and initial admin setup token validation. |

---

## 1. User Roles & Access Control

Practice OS supports three clear access tiers:
- **Patient**: Can access only their own appointments, intake forms, care plans, and personal profile.
- **Staff**: Receptionists and associates who manage appointments and patient check-ins.
- **Admin**: Clinic Directors who manage practice settings, billing parameters, team rosters, and financial reports.

---

## 2. Core Collections Structure

1. `clinic_config`: Practice profile, business hours, address, and Stripe integration keys.
2. `users`: User identities, verified email statuses, and access roles.
3. `appointments`: Booked consultations, clinical condition, attending doctor, and checkout status.
4. `inquiries`: Website contact requests and triage notes.
5. `conditions`: Treatable condition tracks, care pathways, and home exercises.
6. `teamMembers`: Practitioner roster, credentials, and headshot URLs.
7. `blogPosts`: Clinical articles and patient guides.
8. `testimonials`: Patient reviews and treatment outcomes.
9. `faqs`: Practice FAQs organized by Billing, First Visit, and Clinical Care.

---

## 3. Security Rules & Patient Privacy

Security rules in `firestore.rules` enforce strict patient privacy:
* **Patient Data Isolation**: Authenticated patients can strictly access documents where `resource.data.patientId == request.auth.uid`.
* **Staff Access**: Clinic staff can view appointments and manage bookings.
* **Admin Privilege**: Only clinic administrators can update practice settings and financial configurations.

---

## 4. First-Run Admin Setup Runbook

1. Set `CLINIC_SETUP_TOKEN=<your-secret-passphrase>` in your `functions/.env` file.
2. Open your deployed website with `?admin=true`.
3. Click **"Claim This Practice as First Admin"**.
4. Enter your secret passphrase and set your primary administrator email and password.
5. Practice OS locks administrative access to your account.

---

## 📋 Quick Setup Checklist

- [x] Firebase Project Registered
- [x] Firestore Database Enabled
- [x] Security Rules Applied (`firestore.rules`)
- [x] Storage Security Rules Applied (`storage.rules`)
- [x] Cloud Functions Deployed (`/functions`)
- [x] Data Seeded (`npm run migrate:firestore`)
