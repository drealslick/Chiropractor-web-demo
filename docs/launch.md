# Launch and maintenance

## 1. Configure the tenant

Set the same `VITE_CLINIC_ID` in the client and approved clinic record. Use one configured tenant per site; query parameters do not change authorization. Firebase client database must be `(default)`, matching the backend. Set `VITE_APP_URL` and server `APP_URL` to the approved HTTPS domain. Enable Anonymous and Email/Password Firebase Authentication and authorize that domain.

Compile functions, authenticate the Admin SDK with a project-scoped service identity, and explicitly set `GCLOUD_PROJECT` and `VITE_CLINIC_ID`. Never commit service account files. Export a complete, approved clinic configuration (team IDs, schedule, fees, timezone, locations included) to a private JSON file.

```sh
npm run build --prefix functions
node scripts/prepare-clinic.cjs --config=/private/path/clinic.json
# Review the dry-run result, target and backup before applying:
CONFIRM_PROJECT="$GCLOUD_PROJECT" node scripts/prepare-clinic.cjs --config=/private/path/clinic.json --apply
```

The old hardcoded-account/demo-record migration was removed. This command imports configuration, separates private drafts and validates/rebuilds reservation locks; it does not invent patients or assign ownership. Pause booking writes while migrating an existing installation. Take a Firestore export first. Resolve reported legacy appointments with verified patient UID, clinician ID, duration, authoritative price/currency and date before enabling online booking. Reconcile existing conflicts manually. Do not map patient ownership using only an unverified email. Old `patients/{uid}` uploads are read-only; move approved records to `patient_records/{clinicId}/{uid}/` with an authorized maintenance identity.

## 2. Bootstrap staff

Set a strong random `CLINIC_SETUP_TOKEN` in private server environment configuration before deployment. Register the initial administrator, then use the first-admin claim screen with that token. Missing setup configuration fails closed. Failed attempts count toward a five-attempt/hour limit. The claim is recorded once; the original user can retry if Auth claim propagation failed. Remove the bootstrap token after successful provisioning. Staff must register an account before an administrator assigns a role in Team Access. Sign in again to refresh permissions. Editor access is limited to content.

## 3. Connect providers

Copy `functions/.env.example` to private `functions/.env.<project-id>` and supply real values via your deployment's protected environment. Never use `VITE_` for private keys. CI needs those values provisioned securely before deploying; the checked-in example is not deployment configuration.

- Stripe: configure server secret/publishable keys, client publishable key and webhook signing secret. Register the deployed `stripeWebhook` endpoint for `payment_intent.succeeded` and `charge.refunded`. Optional Connect destination belongs in `clinic_settings/{clinicId}.stripeAccountId`. The server owns amounts and verifies settlement; unpaid/pending is not a receipt. Deposits/full payment and full card refunds are supported. A deposit cannot currently be topped up online; arrange the remaining balance with the clinic.
- Resend: configure `RESEND_API_KEY` and a verified `MAIL_FROM` sender.
- Twilio: configure account SID, auth token and sender number. Messages require authorized staff and an existing same-clinic appointment with a matching recipient.
- Production gateway actions use server credentials. Browser settings neither store private credentials nor prove provider connectivity. Automated reminder toggles are templates/preferences; a background reminder scheduler is not implemented. Test sends must reference a real synthetic appointment in staging. Provider acceptance is not final delivery.
- Saved-card/no-show automatic charging is unavailable and disabled in production. It requires a separate consent/SetupIntent workflow before it can be offered. Pay-at-clinic bookings remain unpaid until staff records cash or a verified payment settles.

## 4. Verify and deploy

Run every check in README. Set an explicit Firebase project for all deployment commands:

```sh
npx firebase deploy --only functions,firestore,storage --project YOUR_PROJECT_ID
```

`firebase.json` builds functions before deploy. Workflow upgrades are deferred because the publishing GitHub App lacks workflow-write permission. The existing `.github/workflows/deploy-firebase.yml` still uses Node 20 and can deploy on matching pushes to main or manual dispatch. Review and update that automation before merging: this application requires Node 22, explicit project selection, protected server configuration and staging acceptance. Deploy the frontend with the same tenant/provider environment. Vercel serves generated route HTML before SPA fallback.

Before accepting the release, use synthetic staging data to verify: guest booking; linked registration and password recovery; staff access from another browser; overlapping slot rejection; clinician/location details; explicit intake answers/signature; reschedule/cancel after reload; Stripe test settlement, duplicate webhook and full refund; correct unpaid/paid receipts; SMS/email accepted and actually delivered; private drafts and cross-patient/cross-clinic denial. Review keyboard navigation and buyer-approved content on mobile. Local emulator checks do not establish live-provider or deployed-domain readiness.

Configure Firestore/Storage backup retention and perform a restore drill independently. Browser configuration snapshots are not patient-data backups. Clear old public demo/browser caches before handing over a live workstation. Rotate any credentials previously entered in browser gateway settings; removing cached values cannot revoke a disclosed key.
