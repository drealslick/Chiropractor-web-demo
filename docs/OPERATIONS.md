# Practice OS — Operational Playbook & Runbook (Phase 9)

## Table of Contents
1. [Architecture & Deployment Overview](#1-architecture--deployment-overview)
2. [Deploying to a New Staging or Production Firebase Project](#2-deploying-to-a-new-staging-or-production-firebase-project)
3. [Secret & Key Rotation Runbook](#3-secret--key-rotation-runbook)
4. [Firestore Backup, Retention & Disaster Recovery](#4-firestore-backup-retention--disaster-recovery)
5. [Rollback & Zero-Downtime Deployment Procedures](#5-rollback--zero-downtime-deployment-procedures)
6. [Operational Visibility, Audit Logs & Alerting](#6-operational-visibility-audit-logs--alerting)
7. [Escalation Matrix & Responsibility Handover](#7-escalation-matrix--responsibility-handover)

---

## 1. Architecture & Deployment Overview

Practice OS is built on a serverless, decoupled architecture:
* **Frontend**: React 19 SPA + Vite + Tailwind CSS v4 + Static Route Prerenderer.
* **Backend Runtime**: Firebase Cloud Functions (Node.js 20 engine).
* **Database & Storage**: Cloud Firestore (NoSQL, structured schemas) + Firebase Storage.
* **Authentication**: Firebase Auth (Email/Password, Google OAuth, Custom Claims RBAC).
* **CI/CD Pipeline**: GitHub Actions (`.github/workflows/ci.yml` and `.github/workflows/deploy-firebase.yml`).

---

## 2. Deploying to a New Staging or Production Firebase Project

### Step 1: Project Provisioning
1. Create a fresh project in the [Firebase Console](https://console.firebase.google.com/):
   ```bash
   firebase projects:create practiva-staging-20261003 --display-name "Practiva Staging 2026"
   ```
2. Enable Firestore in Native Mode and Storage.
3. Enable Authentication providers (Email/Password & Google Sign-In).

### Step 2: Configure Environment Variables & Secrets
1. **Frontend Environment Variables (`.env` or GitHub Secrets)**:
   * `VITE_FIREBASE_API_KEY`: Firebase Client Web API Key
   * `VITE_FIREBASE_PROJECT_ID`: `practiva-staging-20261003`
   * `VITE_FIREBASE_AUTH_DOMAIN`: `practiva-staging-20261003.firebaseapp.com`
   * `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_test_...`

2. **Backend Cloud Secret Manager Secrets**:
   Set secrets for Firebase Functions via GCP Secret Manager:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   firebase functions:secrets:set RESEND_API_KEY
   firebase functions:secrets:set TWILIO_AUTH_TOKEN
   ```

### Step 3: Run Deployment Sequence
```bash
# 1. Install & Build
npm ci
npm --prefix functions ci
npm run build
npm --prefix functions run build

# 2. Deploy Security Rules & Indexes
firebase deploy --only firestore:rules,firestore:indexes,storage --project practiva-staging-20261003

# 3. Deploy Cloud Functions (Node 20 Runtime)
firebase deploy --only functions --project practiva-staging-20261003
```

---

## 3. Secret & Key Rotation Runbook

### A. Stripe API Keys & Webhook Signing Secrets
1. Log into [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers > API Keys** and generate a new Secret Key.
3. Update GCP Secret Manager:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   ```
4. Re-deploy Cloud Functions to pull the new secret:
   ```bash
   firebase deploy --only functions
   ```
5. Revoke old Stripe key after verifying successful booking test transaction.

### B. Resend Email & Twilio SMS API Keys
1. Issue new API token in provider dashboard.
2. Update secret:
   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```
3. Test transactional email trigger (`sendBookingConfirmation`).

---

## 4. Firestore Backup, Retention & Disaster Recovery

### Automatic Scheduled Backups
Practice OS configures Google Cloud Firestore Daily Backups with a **30-day retention policy**:
```bash
gcloud firestore backups schedules create \
  --database='(default)' \
  --recurrence=daily \
  --retention=30d
```

### Manual Backup Rehearsal
To create an instant export before a major schema or code migration:
```bash
gcloud firestore export gs://practiva-staging-20261003-backups/manual-$(date +%Y%m%d)
```

### Recovery & Restoration Procedure
In the event of accidental data corruption:
```bash
# 1. Identify backup timestamp
gcloud firestore backups list --location=us-central1

# 2. Restore to clean target database or point-in-time
gcloud firestore database restore \
  --source-backup=projects/practiva-staging-20261003/locations/us-central1/backups/BACKUP_ID \
  --destination-database=restored-db
```

---

## 5. Rollback & Zero-Downtime Deployment Procedures

### Immediate Function Rollback
If a newly deployed Cloud Function introduces a regression:
1. Re-deploy previous revision from git commit tag:
   ```bash
   git checkout tags/v1.0.0-stable
   npm --prefix functions ci && npm --prefix functions run build
   firebase deploy --only functions --project practiva-staging-20261003
   ```
2. **Rule Compatibility**: `firestore.rules` are strictly backwards-compatible. Rolling back functions will never break database authorization.

---

## 6. Operational Visibility, Audit Logs & Alerting

### Structured Logging Standards
All Cloud Functions utilize structured JSON log output with severity levels (`INFO`, `WARN`, `ERROR`):
* `booking_write_failure`: Logs redacted payload, timestamp, and error code.
* `payment_reconciliation_mismatch`: Triggers alert when Stripe event amount differs from clinic service fee.
* `auth_rbac_denied`: Audit log generated whenever an unauthorized user attempts admin functions.

### Cloud Monitoring Alerts
Configure GCP Log Metrics for:
1. Function Error Rate > 2% over 5-minute window.
2. Webhook Signature Failures > 5 occurrences in 10 minutes.

---

## 7. Escalation Matrix & Responsibility Handover

| Responsibility Area | Buyer / Operating Clinic | Platform Maintainer |
| :--- | :--- | :--- |
| **Domain & SSL Setup** | Primary Owner | Documentation support |
| **Stripe / Resend Accounts** | Primary Owner | Setup guides provided |
| **Firebase Billing & Usage** | Primary Owner | Provisioning scripts |
| **Security Rule Audits** | Maintainer provided | Certified v1.0.0 audit |
| **Data Backups & Compliance** | Operating Admin | Automated retention |
