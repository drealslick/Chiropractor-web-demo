# Practice OS: 3-Step Buyer Setup Wizard

Welcome! This quickstart guide walks you or your developer through deploying, configuring, and launching your standalone clinic management platform in **under 15 minutes**.

---

### Step 1: Initialize Firebase (Web Console)
1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and click **Add project**.
2. Enable **Authentication** (Sign-in method → **Email/Password**).
3. Enable **Cloud Firestore** in production mode.
4. Enable **Cloud Storage**.
5. Switch project to the **Blaze** plan (pay-as-you-go; free tier covers standard clinic traffic).
6. Under **Project Settings > General > Your apps**, click **Web (`</>`)** to register your web app and copy your Firebase config keys.

---

### Step 2: Deploy Cloud Functions & Database Security Rules
In your local terminal:
```bash
# 1. Install dependencies & configure backend secrets
cd functions
cp .env.example .env
npm install
npm run build
cd ..

# 2. Deploy rules, indexes, and Cloud Functions to Firebase
firebase deploy
```

---

### Step 3: Deploy Frontend to Vercel
1. Import your repository into [Vercel](https://vercel.com) (Framework Preset: **Vite**, Output Directory: `dist`).
2. Add your environment variables (from your Firebase Web App configuration):
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
   * `VITE_CLINIC_ID` (optional, defaults to your clinic slug)
   * `VITE_STRIPE_PUBLISHABLE_KEY` (optional, for patient card checkout)
3. Click **Deploy**.
4. In **Firebase Console > Authentication > Settings > Authorized domains**, add your Vercel deployment URL.

---

### Step 4: Claim Admin Rights
1. Open your live deployment URL in your browser with `?admin=true` appended (e.g. `https://your-clinic.vercel.app/?admin=true`).
2. Enter your `CLINIC_SETUP_TOKEN` (the passphrase you set in `functions/.env`).
3. Set your clinic administrator email and password.

🚀 **Your clinic platform is live, secured with cryptographic JWT claims, and ready for patient bookings!**
For deep architectural details, see [README.md](./README.md) and [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).
