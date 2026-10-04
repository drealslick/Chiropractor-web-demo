# Practice OS — Rebrand Checklist

Default content is a **fictional Columbus, OH demo clinic**. Complete this list before taking real patients or publishing the site publicly.

---

## 1. Identity & contact

- [ ] Clinic legal / display name
- [ ] Primary phone and email
- [ ] Physical address(es), hours, parking notes
- [ ] Logo (`public/images/logo.jpg` or upload via admin Media Manager)
- [ ] Favicon / social share image (Open Graph in `index.html`)

**Where to edit**

| Item | Location |
| --- | --- |
| Default clinic + locations | `src/data/clinicData.ts` |
| Team bios / photos | `src/data/defaultTeamData.ts` |
| About page copy | `src/data/defaultAboutData.ts` |
| Pricing / fees defaults | `src/data/defaultPricingFees.ts` |
| SEO title & description | `index.html` (and admin SEO tools if enabled) |
| Schema.org clinic block | `index.html` JSON-LD |

After go-live, prefer changing copy in the **Admin panel** so Firestore becomes the source of truth.

---

## 2. Visual assets

Demo photos live under `public/images/`:

| File | Role |
| --- | --- |
| `clinic_hero_care.jpg` | Hero |
| `doctor_portrait.jpg` | Practitioner |
| `clinic_interior_room.jpg` | Clinic interior |
| `patient_michael_tennis.jpg` | Testimonial / story |
| `logo.jpg` | Logo |
| `*-placeholder.svg` | Fallbacks |

Replace with your own licensed photography. Keep each file under **~300 KB** (CI image budget). WebP is preferred when you can produce it; JPG is fine.

---

## 3. Environment (production)

- [ ] `VITE_DEMO_MODE=false` (Vercel + local `.env.local`)
- [ ] `VITE_APP_URL` = real canonical URL (`https://yourdomain.com`)
- [ ] Firebase web config points at **your** project
- [ ] Stripe **live** keys only when ready to charge real cards  
  - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`  
  - `STRIPE_SECRET_KEY=sk_live_...` in functions env / secrets
- [ ] Stripe webhook endpoint registered → `STRIPE_WEBHOOK_SECRET`
- [ ] Resend (or equivalent) from-address on your domain
- [ ] Firebase Auth **authorized domains** includes production domain

---

## 4. Legal & compliance

- [ ] Review and customize `TERMS_OF_USE.md` / site Terms page
- [ ] Review `MEDICAL_DISCLAIMER.md` with a licensed clinician
- [ ] If handling US PHI: BAA with Google Cloud + SMS/email vendors
- [ ] MFA enabled on Firebase / Google admin accounts
- [ ] Notifications contain **no** detailed diagnoses or clinical notes

---

## 5. Smoke test before launch

- [ ] Book a test appointment end-to-end
- [ ] Confirm appointment document in Firestore
- [ ] Admin can see and manage the booking
- [ ] Test payment in Stripe test mode (then live with a small real charge)
- [ ] Password reset email works
- [ ] Mobile layout on a real phone

---

## 6. Optional hardening

- [ ] Custom domain + SSL on Vercel
- [ ] Firestore automated backups enabled (see `docs/OPERATIONS.md`)
- [ ] GitHub Actions `FIREBASE_TOKEN` set for backend deploys
- [ ] Remove or archive unused demo blog posts / conditions content
