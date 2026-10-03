# Practice OS — Modern Chiropractic & Physical Therapy Practice Engine

Practice OS is a production-grade, full-stack web application and patient management platform engineered specifically for modern chiropractic clinics, physical therapy studios, and sports rehabilitation practices.

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node 20 Firebase Cloud Functions**, **Cloud Firestore**, and **Stripe Elements**.

---

## 📋 Table of Contents
1. [Key Features & Capabilities](#-key-features--capabilities)
2. [Quickstart & Local Development](#-quickstart--local-development)
3. [Verified Build & Test Commands](#-verified-build--test-commands)
4. [Architecture & Performance Budgets](#-architecture--performance-budgets)
5. [Documentation Index](#-documentation-index)
6. [License & Disclaimers](#-license--disclaimers)

---

## ⚡ Key Features & Capabilities

* **Patient Online Booking System**: Real-time slot availability, deposit calculation, hold expirations, and atomic Firestore transactions.
* **Patient Portal (`/portal`)**: Secure self-service portal for managing appointments, reviewing intake records, viewing invoices, and making online payments.
* **Clinic Administration Panel**: Manage team schedules, staff roles, service catalogs, no-show fees, and patient messaging.
* **Stripe Payment Integration**: Deposit collection via Stripe Elements, card pre-authorization, refund processing, and automated webhook handling.
* **Multi-Route Prerenderer**: Pre-renders 14 static HTML routes with Schema.org JSON-LD structured data for instant SEO indexing.
* **Performance & Accessibility Audited**: Scanned with Axe-Core (0 WCAG violations) and enforced performance budgets (<600kB gzipped initial transfer).

---

## 🚀 Quickstart & Local Development

### Prerequisites
* **Node.js**: `^20.0.0` or `>=22.0.0`
* **npm**: `>=10.0.0`

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-org/practice-os.git
cd practice-os

# Install root & functions dependencies deterministically
npm ci
npm --prefix functions ci
```

### 2. Clinic Photography Setup
**Step X: Add your clinic photography.** Replace the placeholder SVGs in `public/images/` with your own images. Recommended: hire a local photographer, or use a licensed service such as Unsplash+ (paid) or your own clinical photos.

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and configure your client keys:
```bash
cp .env.example .env.local
```

### 3. Launch Local Development Server
```bash
npm run dev
# App will launch on http://localhost:3000
```

---

## 🧪 Verified Build & Test Commands

| Command | Description |
| :--- | :--- |
| `npm run build` | Compiles TypeScript, builds Vite bundle, and executes multi-route prerenderer. |
| `npm run typecheck` | Validates TypeScript types across root project and components. |
| `npm --prefix functions run build` | Compiles Cloud Functions TypeScript code targeting Node 20 runtime. |
| `npm run test:rules` | Runs Vitest security unit tests against Firestore Security Rules (`firestore.rules`). |
| `npm run test:security` | Runs security regression tests enforcing authorization boundaries and XSS prevention. |
| `npm run test:handlers` | Runs Cloud Functions callable handler integration test suite. |

---

## 📊 Architecture & Performance Budgets

* **Initial Load Transfer**: Enforced at **< 600 kB gzipped** in CI (Measured actual: **446.69 kB gzipped**).
* **Asset Optimization**: All hero and practitioner imagery supplied as optimized **WebP** files with fallback `<picture>` elements for older browser compatibility.
* **Code Splitting**: Admin management components split into dedicated `admin-chunk-*.js` chunks to keep initial patient bundle lightweight.

---

## 📚 Documentation Index

* **[Operational Playbook & Runbook](docs/OPERATIONS.md)**: Deployment, key rotation, Firestore backups, and recovery procedures.
* **[Feature Matrix & Extension Reference](docs/FEATURE_MATRIX.md)**: Implemented operational behavior vs demo fixtures, RBAC permissions, and schemas.
* **[Agency & Developer Handoff Guide](docs/AGENCY_GUIDE.md)**: Deliverable 1 — White-label onboarding, preset customization, and architecture.
* **[Clinic Launch Guide](docs/CLINIC_LAUNCH_GUIDE.md)**: Deliverable 2 — Single-clinic setup, account ownership, costs, and HIPAA/BAA considerations.
* **[Legal Terms & Licensing](docs/LEGAL_AND_LICENSE.md)**: License wording, usage rights, asset provenance inventory, and medical disclaimers.

---

## 📄 License & Disclaimers

Practice OS is distributed under the terms outlined in `docs/LEGAL_AND_LICENSE.md`. Sample clinic datasets, provider bios, and testimonials are fictional fixtures for demonstration purposes. Medical content should be reviewed by a licensed healthcare professional prior to public deployment.
