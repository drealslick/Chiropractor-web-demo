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
7. [Stripe Connect: Receiving Patient Payments](#7-stripe-connect-receiving-patient-payments)
8. [Connecting Your Custom Domain](#8-connecting-your-custom-domain)
9. [Common Troubleshooting](#9-common-troubleshooting)

---

## 1. Prerequisites

Before starting, create accounts on the following platforms (all have free tiers):

| Service | Purpose | Account Link |
| :--- | :--- | :--- |
| **Google Cloud / Firebase** | Database, User Logins & Cloud Storage | [firebase.google.com](https://firebase.google.com/) |
| **Vercel** | Fast, secure website hosting | [vercel.com](https://vercel.com/) |
| **Stripe** | Credit card processing & bank payouts | [stripe.com](https://stripe.com/) |
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
*(Needed for administrative scripts and connecting the Operator Console)*

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

Your backend Cloud Functions need your secret API keys to process Stripe cards and send emails. Run these copy-pasteable commands in your terminal:

```bash
# 1. Generate a random 32-character setup token (e.g., my-secret-clinic-key-2026)
# Save this! You will use it once in Section 6 to claim clinic administrator rights.
firebase functions:config:set clinic.setup_token="PASTE_YOUR_RANDOM_CLINIC_SETUP_TOKEN"

# 2. Add your Stripe Secret Key (find this at dashboard.stripe.com/apikeys)
firebase functions:config:set stripe.secret_key="sk_live_YOUR_STRIPE_SECRET_KEY"

# 3. Add your Stripe Webhook Signing Secret (from dashboard.stripe.com/webhooks)
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_STRIPE_WEBHOOK_SECRET"

# 4. Add your Resend Email API Key (from resend.com/api-keys)
firebase functions:config:set resend.api_key="re_YOUR_RESEND_API_KEY"
```

After setting these values, redeploy functions so they take effect:
```bash
firebase deploy --only functions
```

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
Expand the **Environment Variables** panel in Vercel. Add the following variables:

#### Public Client Variables (Safe to be visible to browsers)
| Variable Name | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_CLINIC_ID` | Optional | `columbus-chiropractic` | The URL slug / tenant ID for this clinic. |
| `VITE_DEFAULT_PRESET` | Optional | `austin` | Visual styling preset (`austin`, `dallas`, `seattle`). |
| `VITE_FIREBASE_API_KEY` | **Required** | `AIzaSyCMxDCWnOM...` | Copied from Firebase Project Settings. |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Required** | `your-project.firebaseapp.com` | Copied from Firebase Project Settings. |
| `VITE_FIREBASE_PROJECT_ID` | **Required** | `your-project-id` | Copied from Firebase Project Settings. |
| `VITE_FIREBASE_STORAGE_BUCKET`| **Required**| `your-project.firebasestorage.app` | Copied from Firebase Project Settings. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| **Required** | `864509861788` | Copied from Firebase Project Settings. |
| `VITE_FIREBASE_APP_ID` | **Required** | `1:864509861788:web:...` | Copied from Firebase Project Settings. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Optional | `pk_live_...` | Your public Stripe key for front-end card inputs. |

#### Secret Server Variables (Kept private on Vercel)
| Variable Name | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `CLINIC_SETUP_TOKEN` | **Required** | `my-secret-clinic-key-2026` | Must match the token set in Section 4. |

### Step 5.3: Deploy
1. Click **Deploy**.
2. Wait 60–90 seconds for the build to finish.
3. Vercel will give you a live URL (e.g., `https://your-clinic.vercel.app`).

---

## 6. First-Run Setup: Claiming Your Clinic

*(Completed once by the clinic owner)*

When your site is first launched, you must claim it to become the **Verified Clinic Administrator**:

1. Open your live website in a browser.
2. Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on Mac) to open the **Staff Command Drawer**.
3. If the deployment is unclaimed, a gold **First-Time Deployment Claim** banner appears.
4. Enter:
   * **Clinic ID**: Choose your permanent clinic slug (e.g., `columbus-chiropractic`).
   * **Clinic Name**: Your practice name (e.g., `Columbus Chiropractic & Wellness`).
   * **Administrator Email**: Your personal work email.
   * **Administrator Password**: A secure password (minimum 8 characters).
   * **Setup Token**: The `CLINIC_SETUP_TOKEN` you created in Section 4.
5. Click **Verify Token & Claim Clinic Administrator**.
6. The system sets administrative custom claims on your account and redirects you into your **Clinic Practice Dashboard**.

---

## 7. Stripe Connect: Receiving Patient Payments

*(Completed by the clinic owner in the Practice Dashboard)*

Your patients can pay booking deposits or full visit fees online. To deposit these funds into your clinic's business bank account:

1. Log into your clinic website with your administrator account.
2. Open the **Agency / Practice Workspace** (`Cmd + Shift + C` or click the lock icon in the footer).
3. Navigate to **Settings & Tools** > **Payment Gateway** (or **Upfront Payments**).
4. Select your policy mode:
   * **Deposit Only**: Patient pays a small booking fee upfront (e.g., $25).
   * **Full Fee**: Patient pays the complete initial exam fee online (e.g., $85).
   * **Card on File / Hold**: Captures card details with $0 charged, protecting against no-shows.
   * **Flexible**: Patient chooses whether to pay online or at the clinic desk.
5. Click **Connect with Stripe**.
6. You will be redirected to Stripe’s secure onboarding page. Enter your practice details, tax ID, and business checking routing/account number.
7. Once finished, Stripe redirects you back to your workspace with a green **Stripe Connected & Verified** badge.

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
  3. Run `cd functions && npm install && npm run build` to confirm there are no syntax or dependency errors.

### Issue B: Stripe Webhook Errors / Payments Don't Update Appointments
* **Symptom**: A patient pays, but the appointment still says "Unpaid" or "Pending".
* **Fix**:
  1. Open [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks).
  2. Check your webhook endpoint URL. It must be formatted as:
     `https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/stripeWebhook`
  3. Ensure the webhook listens for: `payment_intent.succeeded`, `charge.refunded`, and `customer.subscription.updated`.
  4. Ensure your `stripe.webhook_secret` in Section 4 matches the secret displayed in your Stripe Dashboard.

### Issue C: Patient Signup / Login Fails
* **Symptom**: Error `auth/network-request-failed` or `auth/operation-not-allowed`.
* **Fix**:
  1. Open [Firebase Console > Authentication](https://console.firebase.google.com/).
  2. Under the **Sign-in method** tab, verify **Email/Password** is set to **Enabled**.
  3. Go to **Settings** > **Authorized domains** inside Firebase Authentication. Add your Vercel deployment URL (e.g., `your-clinic.vercel.app`) and your custom domain (e.g., `vancechiropractic.com`). If your domain is not on this list, Google will block logins for security.

### Issue D: Permission Denied on Firestore Database
* **Symptom**: Error `Missing or insufficient permissions` when viewing appointments.
* **Fix**:
  1. Open [Firebase Console > Firestore Database > Rules](https://console.firebase.google.com/).
  2. Confirm your rules have been published.
  3. If you just claimed the administrator account, sign out and sign back in once. This refreshes your browser's security token so it picks up your new `admin` custom claim.

---

## 📞 Support & Maintenance
For platform bugs or infrastructure updates, consult your software engineering team or contact your SaaS operator console.
