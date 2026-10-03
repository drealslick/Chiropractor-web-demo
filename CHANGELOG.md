# Changelog

All notable changes to Practice OS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-03

### Packaging & hygiene

- Expanded `.gitignore` to exclude build artifacts (`functions/lib/`, `test-output/`, maps, Firebase debug logs).
- Removed committed compiled Cloud Functions output and test screenshots.
- Renamed poorly named logo asset (`IMG_1502 logo.JPG` → `public/images/logo.jpg`).
- Removed leftover AI Studio residue (`public/assets/aistudio/`).
- Cleaned root `package.json`: moved build tooling to `devDependencies`, removed unused `@google/genai`.
- Renamed functions package to `practice-os-functions`.
- Added root `LICENSE`, `.editorconfig`, `CONTRIBUTING.md`, and this `CHANGELOG.md`.
- Fixed README clone URL, step numbering, and documentation index.

### Product (prior)

- Patient online booking with atomic Firestore holds and Stripe deposits.
- Patient portal, clinic admin panel, multi-route prerenderer with Schema.org JSON-LD.
- Performance budget enforcement in CI (<600 kB gzipped initial transfer).
