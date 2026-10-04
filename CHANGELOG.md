# Changelog

All notable changes to Practice OS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-10-04

### Packaging

- Sync package version with this changelog; add repository, author, and homepage metadata.
- Remove unreferenced timestamped copies under `src/assets/images/`.
- Stop hotlinking Unsplash into Open Graph cards, Twitter cards, and image fallbacks.
- Add security policy, issue forms, pull request template, and `.nvmrc`.
- Run lint, format check, and Firestore rules tests in CI.
- Move internal audit notes to `docs/internal/`.

## [1.0.2] - 2026-10-04

### Hygiene automation

- Add Prettier (`.prettierrc`, `format` / `format:check` scripts).
- Add ESLint flat config for `src/` and `functions/src/` (TypeScript + React + Prettier).
- Add Dependabot for root npm, functions npm, and GitHub Actions.
- Document trunk-based branching and lint/format workflow in CONTRIBUTING.md.

## [1.0.1] - 2026-10-04

### Buyer readiness

- Ship demo clinic photos under `public/images/` with paths that resolve.
- Rewrite `SETUP_WIZARD.md`; add `REBRAND_CHECKLIST.md`.
- Clarify positioning: deployable template, not HIPAA-certified SaaS.
- Pin `w9jds/firebase-action` to valid `v15.30.0`.

## [1.0.0] - 2026-10-03

### Packaging & hygiene

- Expanded `.gitignore`; removed build artifacts and AI Studio residue.
- Cleaned package metadata; added LICENSE, editorconfig, CONTRIBUTING, CHANGELOG.
