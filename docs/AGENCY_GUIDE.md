# Practice OS — Agency & Developer Handoff Guide (Deliverable 1)

This guide is designed for digital agencies, software consultants, and healthcare web developers deploying or customizing Practice OS as a white-label client solution.

---

## 1. Deliverable Scope & Agency Rights

As an Agency Licensee of Practice OS, you receive:
* **Full Source Code Access**: Unrestricted access to React 19 frontend, Vite builder, Tailwind CSS v4 design system, and Node 20 Firebase Cloud Functions.
* **White-Label Deployment Rights**: Right to customize, brand, deploy, and host unlimited client instances for single practices or multi-location groups.
* **Developer Tooling**: Built-in multi-route prerenderer, automated test suites (rules, security, callable handlers), and CI workflows.

---

## 2. White-Label Quickstart & Preset System

Practice OS features a built-in Preset System (`src/config/clinicPresets.ts`) allowing rapid white-label re-branding without touching core layout code.

### Preset Selection via `.env`
Set `VITE_DEFAULT_PRESET` in your client's `.env.local` or environment configuration:
```bash
# Available Built-in Presets:
# 'austin'  -> Modern Minimalist (Earthy Sage & Stone)
# 'seattle' -> Clinical Precision (Deep Navy & Sky Blue)
# 'denver'  -> Active Recovery & Sports Medicine (Forest Green & Amber)
# 'chicago' -> Premium Boutique Care (Warm Charcoal & Gold)

VITE_DEFAULT_PRESET=austin
```

### Adding a Custom Client Preset
To add a custom brand preset for a new client:
1. Open `src/config/clinicPresets.ts`.
2. Add a new preset object:
   ```typescript
   export const CLIENT_PRESETS: Record<string, ClinicPreset> = {
     'my-custom-clinic': {
       id: 'my-custom-clinic',
       name: 'Apex Spine & Sports Therapy',
       theme: {
         primaryColor: '#0f766e', // Teal-700
         accentColor: '#f59e0b',  // Amber-500
         fontFamily: 'Inter, sans-serif',
       },
       heroImage: '/images/custom_hero.webp',
       doctorImage: '/images/custom_doctor.webp',
     },
   };
   ```

---

## 3. Architecture & Code Structure

```
├── .github/workflows/         # CI/CD Workflows (Typecheck, Vitest, Gzip Budget)
├── docs/                      # Operational & Legal Documentation
├── functions/                 # Firebase Cloud Functions (Node 20 TypeScript)
│   ├── src/
│   │   ├── index.ts           # Primary Cloud Functions Entrypoint
│   │   ├── booking.ts         # Authoritative Slot Reservation & Transactions
│   │   └── scheduleUtils.ts   # Slot Availability Math & Hold Expirations
│   └── package.json           # Node 20 Runtime & Dependencies
├── public/                    # Static Assets (WebP Optimized Images)
├── scripts/                   # Prerenderer & Migration Tools
│   └── prerender.ts           # Multi-Route HTML Generator + Schema.org Graph
├── src/
│   ├── components/            # Modular React UI Components
│   ├── context/               # ClinicContext & Tenant Provider
│   ├── data/                  # Default Clinic Data & Stores
│   ├── pages/                 # Route Pages (Prerendered)
│   └── services/              # Firebase Sync & API Handlers
├── firestore.rules            # Security & RBAC Rules
└── storage.rules              # Storage Authorization Rules
```

---

## 4. Extension Points for Developers

1. **Custom Intake Forms**: Edit `src/components/BookingModal.tsx` to add custom health questionnaire fields.
2. **Third-Party EHR / CRM Integrations**: Hook into `functions/src/booking.ts` inside `authoritativeBookAppointment` to sync patient records with Jane App, WebPT, or HubSpot.
3. **Custom Payment Gateways**: Extend `functions/src/index.ts` alongside `createPaymentIntent` to support Square or Clover.

---

## 5. Support Model & Agency Responsibilities

| Activity | Agency Responsibility | Maintainer Support |
| :--- | :--- | :--- |
| **Client Onboarding & Branding** | Primary | Preset Guides & Documentation |
| **Client Hosting Infrastructure** | Primary | CI/CD Workflow Templates |
| **Third-Party Account Setup** | Primary | Integration Runbooks |
| **Core Template Bug Fixes** | Pull Request / Issue | Upstream Code Maintenance |
