# Practice OS — Buyer Setup Wizard

Deploy and claim your clinic platform. Expect **45–90 minutes** the first time if Firebase/Stripe are new to you. An agency that already has accounts can finish faster.

> This is a **deployable clinic template**, not a managed SaaS. You (or your developer) own the Firebase project, Stripe account, and domain.

---

## Prerequisites

- Node.js **≥ 20** and npm **≥ 10**
- A Google account (for Firebase)
- A [Stripe](https://stripe.com) account (test mode is fine to start)
- Optional: [Resend](https://resend.com) (email) and/or [Twilio](https://twilio.com) (SMS)
- A Vercel account (or any static host for the Vite `dist/` output)
- Firebase CLI: `npm install -g firebase-tools`

---

## Step 1 — Firebase project

1. Open [console.firebase.google.com](https://console.firebase.google.com/) → **Add project**.
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Enable **Cloud Firestore** (production mode is fine; rules deploy from this repo).
4. Enable **Cloud Storage**.
5. Upgrade the project to the **Blaze** (pay-as-you-go) plan. The free tier covers light clinic traffic; Functions require Blaze.
6. Project Settings → General → **Your apps** → add a **Web** app. Copy the config values (apiKey, authDomain, projectId, etc.).
7. Locally:
   ```bash
   firebase login
   firebase use --add   # select the project you just created
   ```

---

## Step 2 — Backend secrets & deploy

```bash
git clone https://github.com/drealslick/Chiropractor-web-demo.git
cd Chiropractor-web-demo

npm ci
npm --prefix functions ci

# Frontend env
cp .env.example .env.local
# Edit .env.local with Firebase web config + Stripe publishable key
# Set VITE_DEMO_MODE=false for a real clinic

# Backend env
cp functions/.env.example functions/.env
# Edit functions/.env:
#   CLINIC_SETUP_TOKEN   → long random passphrase (you will use this once)
#   STRIPE_SECRET_KEY    → sk_test_... or sk_live_...
#   STRIPE_WEBHOOK_SECRET → from Stripe webhook endpoint (can add after first deploy)
#   RESEND_API_KEY / RESEND_FROM_EMAIL (optional but recommended)
#   APP_URL              → your final site URL (Vercel URL is fine at first)
```

Deploy rules, indexes, storage rules, and Cloud Functions:

```bash
npm --prefix functions run build
firebase deploy
```

**GitHub Actions (optional):**  
Repo secret `FIREBASE_TOKEN` is required for the deploy workflow. Generate with:

```bash
firebase login:ci
```

Paste the token into GitHub → Settings → Secrets → Actions → `FIREBASE_TOKEN`.

For production key rotation, prefer Firebase/GCP Secret Manager (see `docs/OPERATIONS.md`). First-time setup with `functions/.env` is enough to go live.

---

## Step 3 — Frontend (Vercel)

1. Import this repository into [Vercel](https://vercel.com)  
   - Framework: **Vite**  
   - Build command: `npm run build`  
   - Output: `dist`
2. Add environment variables (same values as `.env.local`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (your Vercel URL, e.g. `https://your-clinic.vercel.app`)
   - `VITE_DEMO_MODE=false`
   - `VITE_CLINIC_ID` (optional clinic slug)
3. Deploy.
4. Firebase Console → Authentication → Settings → **Authorized domains** → add your Vercel domain.

---

## Step 4 — Claim admin

1. Open `https://YOUR-DOMAIN/?admin=true`
2. Enter the `CLINIC_SETUP_TOKEN` from `functions/.env`
3. Set the clinic administrator email and password

You should now have a secured admin account with JWT role claims.

---

## Step 5 — Before real patients

Complete **[REBRAND_CHECKLIST.md](./REBRAND_CHECKLIST.md)** (name, phone, address, logo, team, SEO, live Stripe keys, demo mode off).

Run a test booking and confirm it appears in Firestore. Send a test email if Resend is configured.

---

## Compliance note

Practice OS is a **technology template**. Deploying it does **not** make you HIPAA-compliant. If you handle PHI in the US, you must execute BAAs with Google Cloud (Firebase) and any SMS/email providers, enforce MFA on admin accounts, and keep clinical detail out of notifications. See `MEDICAL_DISCLAIMER.md` and `docs/LEGAL_AND_LICENSE.md`.

---

## Need more detail?

| Doc | Use when |
| --- | --- |
| [REBRAND_CHECKLIST.md](./REBRAND_CHECKLIST.md) | Turning the Columbus demo into your clinic |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Deeper Firebase architecture |
| [docs/OPERATIONS.md](./docs/OPERATIONS.md) | Secrets rotation, backups, runbook |
| [docs/CLINIC_LAUNCH_GUIDE.md](./docs/CLINIC_LAUNCH_GUIDE.md) | Full launch playbook |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Local development |
