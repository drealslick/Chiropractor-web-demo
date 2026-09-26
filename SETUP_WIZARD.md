# Vance Health SaaS Suite: 3-Step Buyer Setup Wizard

Welcome! This guide ensures you or your developer can deploy, configure, and launch this professional clinic SaaS suite in **under 20 minutes**.

---

### Step 1: Deploy to Vercel (Frontend & Server)
1. Click the button below or import your repository into [Vercel](https://vercel.com):
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
2. Leave build settings at their defaults (Framework Preset: **Vite**, Output Directory: `dist`).
3. Proceed to Step 2 before adding environment variables.

---

### Step 2: Initialize Supabase & Run RLS Security Schema
1. Create a new project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and paste the contents of `SUPABASE_PRODUCTION_SCHEMA.sql` (found in this repository).
3. Click **Run** to set up:
   * Multi-tenant `clinics` and `clinic_users` isolation.
   * `appointments` table with **double-booking prevention constraints** (`unique_clinic_appointment_slot`).
   * **Row Level Security (RLS)** policies ensuring Clinic A can never access Clinic B's patient data.

---

### Step 3: Configure Environment Variables & Stripe Webhooks
In your Vercel project settings (`Settings` → `Environment Variables`), add the following keys:

| Variable Name | Description | Where to find |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Public Key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role (Backend) | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | Stripe Dashboard → Webhooks (`payment_intent.succeeded`) |
| `RESEND_API_KEY` | Resend Transactional Email Key | Resend Dashboard → API Keys |
| `TWILIO_ACCOUNT_SID` | Twilio SMS Account SID | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Twilio Console |

#### Setting Up Stripe Webhooks:
1. In your Stripe Dashboard, go to **Webhooks** → **Add Endpoint**.
2. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe` (or your Supabase Edge Function URL).
3. Select event: `payment_intent.succeeded`.
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`. This ensures bookings are automatically confirmed and secured even if a patient closes their browser during checkout!

---

### You Are Live! 🚀
Your multi-tenant clinic SaaS suite is fully configured, secured with Row Level Security, protected against double bookings, and wired for real-time payments and notifications.
