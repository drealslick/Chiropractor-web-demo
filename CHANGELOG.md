# Changelog

All notable changes to Practice OS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-04

### Buyer readiness

- Ship demo clinic photos under `public/images/` with paths that resolve (fixed broken `.webp` references).
- Rewrite `SETUP_WIZARD.md` into a realistic deploy path (CLI, secrets, Vercel, admin claim, compliance note).
- Add `REBRAND_CHECKLIST.md` for turning the Columbus demo into a real clinic.
- Clarify product positioning: deployable template, not hosted SaaS / not HIPAA-certified out of the box.
- Refresh asset provenance docs to match shipped files.
- Pin `w9jds/firebase-action` to valid `v15.30.0` (CI deploy).

## [1.0.0] - 2026-10-03

### Packaging & hygiene

- Expanded `.gitignore` (functions/lib, test-output, maps, Firebase debug, editor junk).
- Removed committed build artifacts and AI Studio residue.
- Renamed logo asset; cleaned root and functions `package.json`.
- Added `LICENSE`, `.editorconfig`, `CONTRIBUTING.md`, `CHANGELOG.md`, `docs/README.md`.
- Fixed README clone URL and documentation index.
