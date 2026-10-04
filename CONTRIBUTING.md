# Contributing to Practice OS

Thank you for helping improve Practice OS.

## Branching

We use a simple **trunk-based** flow:

- `main` is the default and production branch.
- Do feature work on short-lived branches (`feat/...`, `fix/...`, `chore/...`).
- Open a pull request into `main`. Prefer small, focused PRs.
- Do not commit secrets, `functions/lib/`, `dist/`, or `test-output/`.

Enable **branch protection** on `main` in GitHub (Settings → Branches): require a PR and a green CI check before merge when you are ready.

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
| `npm run lint` | ESLint on `src/` and `functions/src/` |
| `npm run format` | Prettier write for TS/TSX/CSS |
| `npm run format:check` | Prettier check (CI-friendly) |
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
- Run `npm run typecheck` and relevant tests before opening a PR.
- Run `npm run format` (or format:check) so style stays consistent.
- Large components (`BookingModal`, `AgencyWorkspace`, `BookingSettings`) should be split further rather than grown.
- Commit messages: short imperative summary is enough; Conventional Commits (`feat:`, `fix:`, `chore:`) are welcome but not enforced.

## Documentation

- Setup / launch: `SETUP_WIZARD.md`, `REBRAND_CHECKLIST.md`
- Operations: `docs/OPERATIONS.md`
- Legal: `LICENSE`, `MEDICAL_DISCLAIMER.md`, `TERMS_OF_USE.md`, `docs/LEGAL_AND_LICENSE.md`
