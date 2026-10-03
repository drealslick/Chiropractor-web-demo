# Practice OS — Modern Chiropractic & Physical Therapy Practice Engine

Practice OS is a production-grade, full-stack web application and patient management platform engineered specifically for modern chiropractic clinics, physical therapy studios, and sports rehabilitation practices.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node 20 Firebase Cloud Functions**, **Cloud Firestore**, and **Stripe Elements**.

---

## Table of Contents

1. [Key Features & Capabilities](#key-features--capabilities)
2. [Quickstart & Local Development](#quickstart--local-development)
3. [Verified Build & Test Commands](#verified-build--test-commands)
4. [Architecture & Performance Budgets](#architecture--performance-budgets)
5. [Documentation Index](#documentation-index)
6. [License & Disclaimers](#license--disclaimers)

---

## Key Features & Capabilities

- **Patient Online Booking System**: Real-time slot availability, deposit calculation, hold expirations, and atomic Firestore transactions.
- **Patient Portal (`/portal`)**: Secure self-service portal for managing appointments, reviewing intake records, viewing invoices, and making online payments.
- **Clinic Administration Panel**: Manage team schedules, staff roles, service catalogs, no-show fees, and patient messaging.
- **Stripe Payment Integration**: Deposit collection via Stripe Elements, card pre-authorization, refund processing, and automated webhook handling.
- **Multi-Route Prerenderer**: Pre-renders static HTML routes with Schema.org JSON-LD structured data for SEO indexing.
- **Performance & Accessibility Audited**: Scanned with Axe-Core and enforced performance budgets (<600 kB gzipped initial transfer).

---

## Quickstart & Local Development

### Prerequisites

- **Node.js**: `>=20.0.0`
- **npm**: `>=10.0.0`

### 1. Installation

```bash
git clone https://github.com/drealslick/Chiropractor-web-demo.git
cd Chiropractor-web-demo

# Install root & functions dependencies deterministically
npm ci
npm --prefix functions ci
```

### 2. Clinic photography

Replace the placeholder SVGs in `public/images/` with your own clinic images. Recommended: licensed photography or your own clinical photos.

### 3. Environment configuration

```bash
cp .env.example .env.local
# Edit .env.local with Firebase client keys and Stripe publishable key

cp functions/.env.example functions/.env
# Edit functions/.env with Stripe secret, Resend, setup token, etc.
```

### 4. Launch local development server

```bash
npm run dev
# App launches at http://localhost:3000
```

For production-style deployment steps, see [SETUP_WIZARD.md](SETUP_WIZARD.md).

---

## Verified Build & Test Commands

| Command | Description |
| --- | --- |
| `npm run build` | TypeScript check, Vite production build, multi-route prerenderer |
| `npm run typecheck` | TypeScript validation (root project) |
| `npm run build:functions` | Compile Cloud Functions for Node 20 |
| `npm run test` | Full Vitest suite |
| `npm run test:rules` | Firestore security rules unit tests |
| `npm run test:security` | Authorization boundaries and XSS prevention regressions |
| `npm run test:handlers` | Cloud Functions callable handler tests |
| `npm run test:ci` | typecheck + full test suite (CI entrypoint) |

---

## Architecture & Performance Budgets

- **Initial load transfer**: Enforced at **< 600 kB gzipped** in CI.
- **Asset optimization**: Prefer optimized WebP imagery with `<picture>` fallbacks where applicable.
- **Code splitting**: Admin management UI is split into dedicated chunks to keep the patient-facing bundle light.

---

## Documentation Index

| Doc | Purpose |
| --- | --- |
| [SETUP_WIZARD.md](SETUP_WIZARD.md) | 3-step buyer / deploy setup |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Firebase project configuration |
| [CLIENT-LAUNCH.md](CLIENT-LAUNCH.md) | Client go-live checklist |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | Deployment, key rotation, backups, recovery |
| [docs/FEATURE_MATRIX.md](docs/FEATURE_MATRIX.md) | Feature vs demo matrix, RBAC, schemas |
| [docs/AGENCY_GUIDE.md](docs/AGENCY_GUIDE.md) | White-label / agency handoff |
| [docs/CLINIC_LAUNCH_GUIDE.md](docs/CLINIC_LAUNCH_GUIDE.md) | Single-clinic launch, costs, HIPAA notes |
| [docs/LEGAL_AND_LICENSE.md](docs/LEGAL_AND_LICENSE.md) | License wording, asset provenance |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local setup and contribution guidelines |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

Root legal files: [LICENSE](LICENSE), [MEDICAL_DISCLAIMER.md](MEDICAL_DISCLAIMER.md), [TERMS_OF_USE.md](TERMS_OF_USE.md).

---

## License & Disclaimers

See [LICENSE](LICENSE) and [docs/LEGAL_AND_LICENSE.md](docs/LEGAL_AND_LICENSE.md).

Sample clinic datasets, provider bios, and testimonials are **fictional fixtures** for demonstration. Medical content must be reviewed by a licensed healthcare professional before public deployment. See [MEDICAL_DISCLAIMER.md](MEDICAL_DISCLAIMER.md).
