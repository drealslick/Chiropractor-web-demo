# Admin dashboard audit fixes

Baseline: `bcf74ba4cd951db752d1c36cf62cb0afa0adae7e`.

## Behavior

- Workspace access uses Firebase token role and clinic claims. Staff/practitioners get reception tools; content editors get a read-only content preview because existing Firestore rules require an administrator to publish clinic configuration. Editors cannot open patient inquiries. Only actual administrators can preview another role.
- Live team membership is read from Firestore. Invitations, role updates, and deactivation use existing authenticated Cloud Functions. Demo team members stay isolated in explicit demo mode. No invitation emails are sent automatically.
- Invitation acceptance requires an existing account with the matching verified email, a valid token, a supported role, and an unexpired invitation. The transaction rechecks invitation status and rejects existing active memberships or cross-clinic profiles before writes.
- Dashboard counts preserve zero and use the same local calendar date as reception. Setup health no longer always passes the conditions check. Sample inquiries require explicit demo mode.
- Cloud save failures and offline events show recoverable errors. A retry republishes current configuration. Older write completions cannot overwrite the latest save feedback. Device-only storage is labeled explicitly.
- Factory reset requires confirmation and saves a snapshot compatible with Presets & Backups. A failed backup cancels reset.
- Login and workspace dialogs have names, focus containment, Escape handling and focus restoration. Login labels are associated with inputs. Notification actions support keyboard use. Mobile hidden navigation is removed from focus order. Touch controls, admin colors, focus rings and reduced-motion behavior are independent of public site branding.

## Verification

- Frontend TypeScript: passed.
- Cloud Functions TypeScript: passed.
- Targeted unit tests: see PR validation results. Tests cover role/tenant boundaries, truthful save labels, local dates, empty/filtered counts and invitation identity/expiry validation.
- Vite production bundling and prerender: passed using `npx vite build` then `node --import tsx scripts/prerender.ts`. The repository's `tsx` CLI wrapper cannot open its IPC socket in this execution environment; the Node import form runs the same prerender module.
- Core modified UI/helper files: ESLint passes with no errors. Repository-wide lint has pre-existing errors outside this scope.
- Browser verification: NOT RUN on the modified app. A local demo server starts, but the separate cloud browser cannot connect to workspace localhost. No desktop/mobile visual or authenticated live-flow pass is claimed.
- Firestore emulator suites, live account changes, invitation delivery/acceptance, cloud writes and production deployment: NOT RUN.

## Before release

Deploy the updated Firebase Functions together with the frontend; do not enable the new invitation UI against the older invitation handler. Verify the complete invitation flow with disposable accounts in a test clinic. Confirm role changes/deactivation and last-admin protection in that environment. Existing Firebase ID tokens may remain valid until expiry after refresh-token revocation.

Use the preview at 320px, 390px, tablet and desktop widths. Exercise admin/staff/editor navigation, keyboard-only login, nested overlays, a failed/offline save and retry, zero appointments, notification actions, reset cancellation and backup restoration. Editor publishing intentionally remains administrator-only; enabling it requires a separate, narrowly scoped server/rules change.

Release verdict: UNVERIFIED pending browser and live Firebase workflow checks.
