# Contributing to Practice OS

Thank you for helping improve Practice OS.

## Development setup

1. **Node.js** `>=20` and **npm** `>=10`
2. Clone and install:
   ```bash
   git clone https://github.com/drealslick/Chiropractor-web-demo.git
   cd Chiropractor-web-demo
   npm ci
   npm --prefix functions ci
   cp .env.example .env.local
   # Edit .env.local with your Firebase / Stripe keys
   npm run dev
   ```
3. For backend work, also configure `functions/.env` from `functions/.env.example`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Vite dev server (port 3000) |
| `npm run typecheck` | TypeScript check (root) |
| `npm run build` | Production build + prerender |
| `npm run build:functions` | Compile Cloud Functions |
| `npm run test` | Full Vitest suite |
| `npm run test:rules` | Firestore security rules tests |
| `npm run test:security` | Authorization / XSS regressions |
| `npm run test:handlers` | Callable functions handler tests |
| `npm run test:ci` | typecheck + full test suite |

## Guidelines

- Prefer small, focused PRs.
- Keep secrets out of the repo (use `.env.example` only).
- Do not commit `functions/lib/`, `dist/`, or `test-output/`.
- Run `npm run typecheck` and relevant tests before opening a PR.
- Large components (`BookingModal`, `AgencyWorkspace`, `BookingSettings`) should be split further rather than grown.

## Documentation

- Setup / launch: `SETUP_WIZARD.md`, `docs/CLINIC_LAUNCH_GUIDE.md`
- Operations: `docs/OPERATIONS.md`
- Legal: `LICENSE`, `MEDICAL_DISCLAIMER.md`, `TERMS_OF_USE.md`, `docs/LEGAL_AND_LICENSE.md`
