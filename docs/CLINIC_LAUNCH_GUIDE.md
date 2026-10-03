# Practice OS — Configured-Clinic Deployment & Launch Guide (Deliverable 2)

This guide provides clinic owners, practice managers, and operators with step-by-step instructions for launching, managing, and maintaining their custom Practice OS portal.

---

## 1. Account & Domain Ownership Checklist

Before go-live, the clinic owner MUST establish direct ownership of all primary service accounts. Do not rely on third-party contractor credentials for live clinic operations.

* [ ] **Domain Name & DNS**: Registered under clinic account (e.g. Namecheap, Cloudflare, GoDaddy).
* [ ] **Hosting Account**: Vercel, Netlify, or Firebase Hosting account owned by clinic.
* [ ] **Firebase / GCP Account**: Google Cloud account under clinic domain (`admin@yourclinic.com`).
* [ ] **Stripe Account**: Verified merchant account with active bank payout routing.
* [ ] **Resend Account**: Email domain verification (`bounce.yourclinic.com`, `mail.yourclinic.com`).
* [ ] **Twilio Account**: Verified A2P 10DLC brand registration for transactional SMS notifications.

---

## 2. Estimated Recurring Service Costs

Practice OS is engineered on pay-as-you-go serverless architecture. Operational costs scale directly with clinic volume:

| Service Provider | Free Tier / Base Included | Estimated Monthly Cost (100–500 Patients/Mo) |
| :--- | :--- | :--- |
| **Firebase (GCP)** | 50k reads/day, 20k writes/day | **$0.00 – $5.00 / mo** |
| **Vercel / Netlify** | Free hobby plan included | **$0.00 – $20.00 / mo** |
| **Stripe** | No monthly fee | **2.9% + $0.30 per transaction** |
| **Resend Email** | 3,000 emails / month free | **$0.00 – $20.00 / mo** |
| **Twilio SMS** | Trial credits included | **~$0.0079 / SMS message** |
| **Total Estimated Fixed Overhead** | — | **$0.00 – $45.00 / mo** |

---

## 3. HIPAA, BAA & Compliance Disclaimers

> 🚨 **CRITICAL COMPLIANCE NOTICE FOR CLINIC OPERATORS**
> 
> Practice OS is an open-architecture technology template. Deploying Practice OS does **NOT** automatically constitute HIPAA compliance or certification.
> 
> **Clinic Operator Prerequisites**:
> 1. **Business Associate Agreements (BAA)**: If handling Protected Health Information (PHI) in the United States, clinic operators MUST sign a BAA with Google Cloud (GCP/Firebase) and Twilio before collecting patient data.
> 2. **Authentication Enforcements**: Enforce Multi-Factor Authentication (MFA) on all Firebase and Google Cloud administrator accounts.
> 3. **PHI Minimization**: Transactional emails and SMS messages MUST NOT include detailed medical diagnostic information or clinical treatment notes. Keep notifications limited to date, time, practitioner name, and clinic address.

---

## 4. Clinic Operator Daily Workflows

### A. Initializing Your Clinic Admin Account
1. Visit your live domain (`https://yourclinic.com/portal`).
2. Register a new account using the clinic owner's email address.
3. Execute the initial admin claim setup via the secure setup setup drawer or terminal helper:
   ```bash
   # System automatically elevates first registered user if clinic has no existing admin
   ```
4. Access the **Practice Management Admin Panel** to manage appointments, practitioners, and services.

### B. Managing Patient Appointments
* **View Schedule**: Access the calendar tab in the Patient Portal / Admin view.
* **Reschedule / Cancel**: Click any appointment block to modify time, assign a practitioner, or process refunds.
* **Charge No-Show Fee**: Click appointment card -> Select "Process No-Show Fee". This securely executes a card charge via Stripe.

### C. Inviting Staff Members
1. Go to **Admin > Staff Management**.
2. Click **Invite Team Member**.
3. Enter practitioner email, name, title, and select role (`staff` or `admin`).
4. An invitation token is generated and emailed to the staff member.

---

## 5. Pre-Launch Readiness Checklist

* [ ] Custom clinic domain connected with SSL (`https://...`).
* [ ] Production Stripe keys (`pk_live_...` & `STRIPE_SECRET_KEY`) set and tested.
* [ ] Custom clinic branding, logo, address, phone number, and operating hours verified in `src/data/clinicData.ts`.
* [ ] `VITE_DEMO_MODE` set to `false` in production environment.
* [ ] Test booking submitted and verified in Firestore database.
* [ ] Test transactional email and SMS received successfully.
