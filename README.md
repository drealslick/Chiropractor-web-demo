# Practice OS — Chiropractic & PT Practice Engine

**Deployable clinic template** for modern chiropractic, physical therapy, and sports rehab practices.

Not a hosted multi-tenant SaaS. You (or your agency) own the Firebase project, Stripe account, and domain. Includes an interactive **demo mode** for sales pitches without touching live data.

**Stack:** React 19 · Vite · Tailwind CSS v4 · Firebase (Auth, Firestore, Functions, Storage) · Stripe Elements

---

## What you get

- Patient online booking (real-time slots, deposits, holds)
- Patient portal (`/portal`) — appointments, intake, invoices, payments
- Clinic admin panel — schedules, staff, services, messaging
- Stripe deposits / refunds / webhooks
- Multi-route prerender + Schema.org JSON-LD for SEO
- Firestore security rules with JWT role claims
- Demo sandbox (`VITE_DEMO_MODE=true`) for safe demos

Default content is a **fictional Columbus, OH clinic**. Rebrand before public launch — see [REBRAND_CHECKLIST.md](./REBRAND_CHECKLIST.md).

---

## Quickstart

**Prerequisites:** Node.js ≥ 20, npm ≥ 10, Firebase CLI

```bash
git clone https://github.com/drealslick/Chiropractor-web-demo.git
cd Chiropractor-web-demo
npm ci
npm --prefix functions ci
cp .env.example .env.local
# Fill Firebase + Stripe keys; leave VITE_DEMO_MODE=true for local sandbox demos
npm run dev
# http://localhost:3000
```

**Production deploy:** follow [SETUP_WIZARD.md](./SETUP_WIZARD.md) (Firebase → functions → Vercel → claim admin → rebrand).

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local Vite server (port 3000) |
| `npm run build` | Typecheck + production build + prerender |
| `npm run build:functions` | Compile Cloud Functions |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Full Vitest suite |
| `npm run test:rules` | Firestore rules tests |
| `npm run test:security` | Auth / XSS regression tests |
| `npm run test:handlers` | Callable functions tests |
| `npm run test:ci` | typecheck + tests |

---

## Documentation

| Doc | Purpose |
| --- | --- |
| [SETUP_WIZARD.md](./SETUP_WIZARD.md) | End-to-end deploy & admin claim |
| [REBRAND_CHECKLIST.md](./REBRAND_CHECKLIST.md) | Turn demo clinic into your clinic |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase architecture |
| [CLIENT-LAUNCH.md](./CLIENT-LAUNCH.md) | Go-live checklist |
| [docs/OPERATIONS.md](./docs/OPERATIONS.md) | Secrets, backups, runbook |
| [docs/FEATURE_MATRIX.md](./docs/FEATURE_MATRIX.md) | Features vs demo fixtures |
| [docs/README.md](./docs/README.md) | Full docs index |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development guidelines |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

Legal: [LICENSE](./LICENSE) · [MEDICAL_DISCLAIMER.md](./MEDICAL_DISCLAIMER.md) · [TERMS_OF_USE.md](./TERMS_OF_USE.md) · [docs/LEGAL_AND_LICENSE.md](./docs/LEGAL_AND_LICENSE.md)

---

## Compliance

Practice OS is a **technology template**. Shipping it does not grant HIPAA certification or a BAA. Clinic operators handling PHI must execute BAAs with Google Cloud and messaging providers, enforce MFA, and keep clinical detail out of SMS/email. See the medical disclaimer.

---

## License

Proprietary — see [LICENSE](./LICENSE). Sample clinic data and testimonials are fictional fixtures for demonstration only.
