# Practice OS clinic website

A configurable React clinic site, booking flow, patient portal and staff workspace. Explicit demo mode uses synthetic browser data. Live mode uses Firebase Authentication, Firestore and callable Cloud Functions; missing provider configuration fails visibly.

## Reproducible setup

Use Node **22.23.3** (`.node-version`), npm **10.9.9**, and Java **21** for Firebase rule tests.

```sh
npm ci
npm ci --prefix functions
cp .env.example .env.local
npm run dev
```

Set `VITE_DEMO_MODE=true` for a local sales demonstration. Demo identities, notifications and payments are simulations. Production must set it to `false`, supply Firebase web configuration, and enable Anonymous and Email/Password sign-in. Guest bookings receive an anonymous UID; registration links that identity so its bookings remain accessible. Losing that guest session requires clinic assistance; knowing an email or reference does not grant access.

## Checks

```sh
npm run lint
npm run build --prefix functions
npm test
npm run test:rules
npm run build
npm audit --omit=dev --audit-level=high
npm audit --prefix functions --omit=dev --audit-level=high
```

The rule suite starts isolated Firestore/Storage emulators and tests tenant boundaries, patient access, concurrent bookings, payment authority and bootstrap protection. Do not run it while other emulators occupy the same ports. Backend output is generated from TypeScript; it is not committed.

For full local integration, run:

```sh
npm run build --prefix functions
npx firebase emulators:start --only auth,firestore,functions,storage --project demo-practice-review
```

In a separate terminal set `VITE_FIREBASE_PROJECT_ID=demo-practice-review`, a synthetic nonempty `VITE_FIREBASE_API_KEY`, `VITE_USE_FIREBASE_EMULATORS=true`, and `VITE_DEMO_MODE=false` before starting Vite. Only development builds connect to the emulators. Configure a synthetic clinic through the maintenance procedure below. State is temporary unless explicitly exported.

## Clinic content and existing data

Runtime and prerender use `src/data/siteDefaults.ts` and `src/data/siteOverrides.json`. Replace sample clinician biographies, credentials, testimonials, addresses, fees and legal copy with buyer-approved content. Export the approved CMS configuration to `siteOverrides.json` and rebuild when changing content that must appear in static metadata. Set `VITE_APP_URL` to the deployed origin; no sitemap is emitted without it. Only published posts are public; drafts are stored in `clinic_drafts/{clinicId}`.

Use [the launch guide](docs/launch.md) for bootstrap, existing-record migration, providers, deployment and acceptance checks. This repository does not include a deployed clinic, verified provider accounts or a patient-data backup service.
