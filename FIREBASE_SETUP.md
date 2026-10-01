# Firebase setup

Use the current [launch and maintenance guide](docs/launch.md) for tenant provisioning, staff bootstrap, server credentials, existing-record migration, deployment and staging acceptance. Use [README.md](README.md) for the pinned Node/npm baseline and local verification commands.

The old `migrate:firestore` sample-data script was removed. Clinic configuration and reservation migration now use `scripts/prepare-clinic.cjs`, with an explicit target project, a dry run and a separate apply step. Follow the launch guide before migrating existing patient records.

## Setup checklist

- [ ] Select the live Firebase project and matching client tenant ID.
- [ ] Enable Firestore and Storage, plus Anonymous and Email/Password Authentication.
- [ ] Approve and provision clinic configuration and reconcile existing appointment records.
- [ ] Configure private server payment, email, SMS and initial-admin credentials.
- [ ] Deploy `firestore.rules`, `storage.rules` and the compiled Cloud Functions to the explicit project.
- [ ] Register the first administrator and provision registered staff accounts.
- [ ] Complete staging booking, payment/refund, notification, intake and access-denial checks.
- [ ] Configure patient-data backups and verify restoration.

These boxes are manual acceptance checks. An unchecked box does not establish that a service is configured or deployed.
