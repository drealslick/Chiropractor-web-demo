# Practice OS | Clinic Patient Portal & Management Platform

A complete, production-grade web application and patient booking portal built for private practices, chiropractic clinics, and physical therapy centers.

This guide provides step-by-step instructions for deploying and launching your clinic platform. 

> **Audience Note:** Written for clinic owners and practice managers. Where a technical step requires developer tools or a terminal, it is explicitly flagged with **[Developer Required]**.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step-by-Step Firebase Setup](#2-step-by-step-firebase-setup)
3. [Deploying Database Rules, Indexes & Backend [Developer Required]](#3-deploying-database-rules-indexes--backend-developer-required)
4. [Backend Secrets & Configuration [Developer Required]](#4-backend-secrets--configuration-developer-required)
5. [Vercel Frontend Deployment](#5-vercel-frontend-deployment)
6. [First-Run Setup: Claiming Your Clinic](#6-first-run-setup-claiming-your-clinic)
7. [Stripe Direct Payments: Receiving Patient Funds](#7-stripe-direct-payments-receiving-patient-funds)
8. [Connecting Your Custom Domain](#8-connecting-your-custom-domain)
9. [Common Troubleshooting](#9-common-troubleshooting)

---

## 1. Prerequisites

Before starting, create accounts on the following platforms (all have free tiers):

| Service | Purpose | Account Link |
| :--- | :--- | :--- |
| **Google Cloud / Firebase** | Database, User Logins & Cloud Storage | [firebase.google.com](https://firebase.google.com/) |
| **Vercel** | Fast, secure website hosting | [vercel.com](https://vercel.com/) |
| **Stripe** | Direct credit card processing & bank payouts | [stripe.com](https://stripe.com/) |
| **Resend** | Automated email delivery (receipts, appointment reminders) | [resend.com](https://resend.com/) |
| **Twilio** *(Optional)* | Automated SMS text message reminders | [twilio.com](https://twilio.com/) |

### Tools Required on Your Computer [Developer Required]
If you are doing the command-line setup yourself:
* **Node.js (v20 or higher)**: [nodejs.org](https://nodejs.org/)
* **Firebase CLI**: Installed by running `npm install -g firebase-tools`
* **Git**: Installed by running your operating system package manager or installer

---

## 2. Step-by-Step Firebase Setup

*(Can be completed entirely in your web browser by a non-technical clinic owner)*

### Step 2.1: Create a Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and sign in with your clinic's Google account.
2. Click **Add project** (or **Create a project**).
3. Enter your clinic name (e.g., `Practiva Health` or `Vance Chiropractic`).
4. Turn off Google Analytics (optional, saves setup time) and click **Create project**.
5. Wait 10 seconds for Google to finish provisioning, then click **Continue**.

### Step 2.2: Enable Authentication (Patient & Staff Logins)
1. In the left-hand sidebar, click **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Toggle the first switch **Enable** to ON (leave "Email link (passwordless sign-in)" OFF).
5. Click **Save**.

### Step 2.3: Enable Cloud Firestore (Clinic Database)
1. In the left sidebar, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. **Database ID**: Leave as `(default)`.
4. **Location**: Choose the region closest to your clinic (e.g., `nam5 (us-central)` for US or `eur3 (europe-west)` for UK/EU).
5. **Security rules**: Select **Start in production mode** (we will load your secure rules next).
6. Click **Create**.

### Step 2.4: Enable Cloud Storage (Photos, Logos & Documents)
1. In the left sidebar, click **Build** > **Storage**.
2. Click **Get Started**.
3. Select **Start in production mode** and choose the same region as Firestore.
4. Click **Done**.

### Step 2.5: Upgrade to the Blaze Plan
*(Cloud Functions and Stripe webhooks require the Google Cloud Blaze "Pay as you go" plan. Google provides a generous free monthly quota—typical small-to-medium clinics pay $0.00/month).*

1. At the bottom of the left sidebar, look for the word **Spark** and click **Upgrade**.
2. Select the **Blaze** plan.
3. Link your credit card or Google Cloud Billing account.
4. Set a monthly budget alert (e.g., $15.00) so Google emails you if usage ever exceeds the free tier.

### Step 2.6: Generate a Service Account Key
*(Needed for administrative scripts and backend verification)*

1. Click the **Gear icon ⚙️** next to *Project Overview* in the top-left, then click **Project settings**.
2. Click the **Service accounts** tab.
3. Click the blue button labeled **Generate new private key**.
4. Confirm by clicking **Generate key**.
5. A `.json` file will download to your computer. Store this securely—it grants administrative access to your database. Never commit this file to GitHub!

### Step 2.7: Copy Your Web App Credentials
1. Still in **Project settings**, scroll down to the section titled **Your apps**.
2. Click the Web icon **`</>`**.
3. Enter an App nickname (e.g., `Clinic Website`) and click **Register app**.
4. Firebase will display a code block with `const firebaseConfig = { ... }`.
5. Keep this tab open or copy the values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). You will paste these into Vercel in Section 5.

---

## 3. Deploying Database Rules, Indexes & Backend [Developer Required]

Run these commands in your computer terminal from the root folder of this project.

### Step 3.1: Log into Firebase CLI
```bash
firebase login
```
*(Your web browser will open. Sign in with the Google account that owns the Firebase project).*

### Step 3.2: Connect Your Project
Replace `your-project-id` with your real project ID from Firebase Project Settings:
```bash
firebase use your-project-id
```

### Step 3.3: Deploy Firestore Security Rules & Indexes
This deploys multi-tenant data isolation rules and search indexes:
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Step 3.4: Deploy Storage Rules
This locks down medical intake uploads and patient photos:
```bash
firebase deploy --only storage
```

### Step 3.5: Build & Deploy Cloud Functions
```bash
# 1. Install functions dependencies
cd functions
npm install

# 2. Compile TypeScript code
npm run build

# 3. Return to root folder and deploy
cd ..
firebase deploy --only functions
```

---

## 4. Backend Secrets & Configuration [Developer Required]

This repository uses **`firebase-functions` v5**. In v5, environment secrets are stored in a `functions/.env` file instead of deprecated CLI commands.

### Step 4.1: Create Your `functions/.env` File
In your terminal, navigate to the `functions` directory and copy the template:
```bash
cd functions
cp .env.example .env
```

### Step 4.2: Add Your Keys to `functions/.env`
Open `functions/.env` in any text editor and fill in your values:

```env
# 1. Secret Setup Token (Create a random 32-character string, e.g., my-secret-clinic-key-2026)
# Save this! You will type this once into your browser in Section 6 to claim admin rights.
CLINIC_SETUP_TOKEN=PASTE_YOUR_RANDOM_CLINIC_SETUP_TOKEN

# 2. Stripe Direct Keys (from dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY

# 3. Direct Stripe flag (bypasses Connect OAuth so funds go directly into your bank)
FORCE_DIRECT_STRIPE=true

# 4. Stripe Webhook Secret (from dashboard.stripe.com/webhooks — see Section 7)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET

# 5. Resend Email API Key (from resend.com/api-keys)
RESEND_API_KEY=re_YOUR_RESEND_API_KEY

# 6. Twilio SMS (Optional - leave blank if not sending SMS reminders)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Step 4.3: Deploy the Updated Functions
From your project root folder:
```bash
cd ..
firebase deploy --only functions
```
Firebase will automatically package your `.env` variables and upload them securely to your Cloud Functions runtime.

*(Note for legacy setups: If you prefer using CLI commands, `firebase functions:config:set stripe.secret_key="..." clinic.setup_token="..." resend.api_key="..."` is also supported as a fallback in code).*

---

## 5. Vercel Frontend Deployment

*(Can be completed by a non-technical clinic owner in the Vercel Dashboard)*

### Step 5.1: Import Your Repository
1. Log in to [vercel.com](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Select your Git repository and click **Import**.
4. **Framework Preset**: Select **Vite**.
5. **Root Directory**: Leave as `./`.

### Step 5.2: Configure Environment Variables
Expand the **Environment Variables** panel in Vercel. Add the following public variables:

| Variable Name | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_CLINIC_ID` | Optional | `columbus-chiropractic` | The URL slug / tenant ID for this clinic. |
| `VITE_DEFAULT_PRESET` | Optional | `austin` | Visual styling preset (`austin`, `dallas`, `seattle`). |
| `VITE_FIREBASE_API_KEY` | **Required** | `AIzaSyCMxDCWnOM...` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Required** | `your-project.firebaseapp.com` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_FIREBASE_PROJECT_ID` | **Required** | `your-project-id` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_FIREBASE_STORAGE_BUCKET`| **Required**| `your-project.firebasestorage.app` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| **Required** | `864509861788` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_FIREBASE_APP_ID` | **Required** | `1:864509861788:web:...` | Copied from Firebase Project Settings (Step 2.7). |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | `pk_live_...` | Your public Stripe key for front-end card inputs. |

> **Security Note:** You do **not** add `CLINIC_SETUP_TOKEN` or any secret keys (`sk_live_...`) to Vercel. All secret keys remain strictly on the backend in Firebase. The browser never sees them.

### Step 5.3: Deploy Your Site
1. Click **Deploy**.
2. Wait 60–90 seconds for the build to finish.
3. Vercel will give you a live URL (e.g., `https://your-clinic.vercel.app`).

### Step 5.4: Authorize Your Domain in Firebase (Mandatory)
Firebase Authentication blocks logins and patient signups by default unless your domain is explicitly authorized.

1. Open [Firebase Console](https://console.firebase.google.com/) and select your project.
2. In the left sidebar, click **Build** > **Authentication**.
3. Click the **Settings** tab at the top, then select **Authorized domains** in the submenu.
4. Click **Add domain**.
5. Add your Vercel URL: `your-clinic.vercel.app` (do not include `https://`).
6. If you have a custom domain, add that too: `yourclinic.com` and `www.yourclinic.com`.
7. Click **Done**.

> ⚠️ **Warning:** If you skip this step, patient bookings and staff logins will fail with an `auth/unauthorized-domain` error.

---

## 6. First-Run Setup: Claiming Your Clinic

*(Completed once by the clinic owner)*

When your site is first launched, you must claim it to become the **Verified Clinic Administrator**:

1. Open your live website in a browser (e.g., `https://your-clinic.vercel.app`).
2. Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on Mac) to open the **Staff Command Drawer**.
3. Because the deployment is unclaimed, a gold **First-Time Deployment Claim** banner appears.
4. Enter:
   * **Clinic ID**: Choose your permanent clinic slug (e.g., `columbus-chiropractic`).
   * **Clinic Name**: Your practice name (e.g., `Columbus Chiropractic & Wellness`).
   * **Administrator Email**: Your personal work email.
   * **Administrator Password**: A secure password (minimum 8 characters).
   * **Setup Token**: The `CLINIC_SETUP_TOKEN` you created in Section 4.
5. Click **Verify Token & Claim Clinic Administrator**.
6. The system verifies your token via Cloud Functions, assigns administrative claims to your user profile, and opens your **Clinic Practice Dashboard**.

---

## 7. Stripe Direct Payments: Receiving Patient Funds

All patient booking deposits and consultation charges are deposited directly into your clinic’s own Stripe business checking account.

### Step 7.1: Get Your Stripe API Keys
1. Log into your Stripe Dashboard at [dashboard.stripe.com](https://dashboard.stripe.com/).
2. In the search bar at the top, type **API keys** (or go to **Developers** > **API keys**).
3. Copy your **Publishable key** (`pk_live_...` or `pk_test_...`).
4. Reveal and copy your **Secret key** (`sk_live_...` or `sk_test_...`).

### Step 7.2: Create Your Webhook Endpoint
Webhooks notify your booking system immediately when a card payment succeeds or when an appointment deposit is refunded.

1. In your Stripe Dashboard, go to **Developers** > **Webhooks** ([dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)).
2. Click **Add an endpoint**.
3. In the **Endpoint URL** box, paste your Cloud Function URL:
   ```text
   https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook
   ```
   *(Replace `YOUR_REGION` with your function region like `us-central1` and `YOUR_PROJECT_ID` with your Firebase project ID).*
4. Click **Select events to listen to** and select:
   * `payment_intent.succeeded`
   * `payment_intent.payment_failed`
   * `charge.refunded`
5. Click **Add endpoint**.
6. In the top-right corner of the webhook details page, click **Reveal** under **Signing secret**.
7. Copy this string (starts with `whsec_...`).

### Step 7.3: Save Keys in Your Backend
Add your keys to `functions/.env` as shown in Section 4:
```env
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET
FORCE_DIRECT_STRIPE=true
```
Run `firebase deploy --only functions` so the backend applies them.

### Step 7.4: Add Publishable Key to Vercel
In your Vercel Project Settings > **Environment Variables**, set:
```text
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_YOUR_PUBLISHABLE_KEY
```
Redeploy Vercel (or trigger a new build) to activate online card payments.

### Step 7.5: Select Your Upfront Payment Policy
1. Open your clinic website and press `Cmd + Shift + C` (or click the lock icon in the footer).
2. Go to **Settings & Tools** > **Payment Gateway**.
3. Choose your desired policy:
   * **Deposit Only**: Patients pay an upfront booking fee (e.g., $25) to secure their slot.
   * **Full Fee**: Patients pay the entire consultation fee online (e.g., $85).
   * **Card on File / Hold**: Captures card details with $0 charged, protecting against no-shows.
   * **Flexible**: Gives the patient the choice to pay online or at the front desk.
4. Click **Save Policy**.

---

## 8. Connecting Your Custom Domain

*(Can be done by the clinic owner in Vercel and your domain registrar like GoDaddy, Namecheap, or Google Domains)*

1. Log in to [vercel.com](https://vercel.com/) and click on your clinic project.
2. Click **Settings** (top navigation) > **Domains** (left sidebar).
3. Type your custom domain (e.g., `www.vancechiropractic.com`) and click **Add**.
4. Vercel will provide DNS records:
   * **A Record**: Name `@`, Value `76.76.21.21`
   * **CNAME Record**: Name `www`, Value `cname.vercel-dns.com`
5. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and open **DNS Management**.
6. Add the two records shown by Vercel.
7. Return to Vercel and click **Refresh**. Within 5–15 minutes, Vercel will automatically provision a free SSL certificate (`https://`).

---

## 9. Common Troubleshooting

### Issue A: Cloud Functions Fail to Deploy
* **Symptom**: Terminal error `HTTP Error: 403` or `Billing account not configured`.
* **Fix**: 
  1. Open Firebase Console and verify the project shows **Blaze** plan at the bottom left.
  2. If deploying from a local terminal, ensure you ran `firebase login` with the exact Google email that owns the Firebase project.
  3. Run `cd functions && npm install && npm run build` to confirm there are no TypeScript or dependency errors.

### Issue B: Stripe Webhook Errors / Payments Don't Update Appointments
* **Symptom**: A patient pays, but the appointment still says "Unpaid" or "Pending".
* **Fix**:
  1. Open [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks).
  2. Check your webhook endpoint URL. It must be formatted as:
     `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
  3. Verify the signing secret in `functions/.env` (`STRIPE_WEBHOOK_SECRET`) matches the secret shown in Stripe.

### Issue C: Permission Denied on Firestore Database
* **Symptom**: Error `Missing or insufficient permissions` when viewing appointments.
* **Fix**:
  1. Open [Firebase Console > Firestore Database > Rules](https://console.firebase.google.com/).
  2. Confirm your rules have been published.
  3. If you just claimed the administrator account, sign out and sign back in once. This refreshes your browser's security token so it picks up your new `admin` custom claim.

### Issue D: Patient Signup / Login Fails
* **Symptom**: Error `auth/unauthorized-domain` or `auth/operation-not-allowed`.
* **Fix**:
  1. Re-read **Step 5.4**. Make sure both `your-clinic.vercel.app` and your custom domain are added to **Firebase Console > Authentication > Settings > Authorized domains**.
  2. Under **Sign-in method**, confirm **Email/Password** is enabled.

---

## 📞 Support & Maintenance
For platform bugs or infrastructure updates, contact the developer who deployed your site.
