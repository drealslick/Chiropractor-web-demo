# Security policy

Practice OS is a deployable clinic template. Each deployment owns its Firebase project, Stripe account, and secrets. This policy covers the template repository, not a hosted multi-tenant service.

## Supported versions

| Version | Supported |
| --- | --- |
| 1.0.x | Yes |

## Reporting a vulnerability

Do not open a public GitHub issue for a security report.

Email hello.noirlabs@gmail.com with:

- Affected path (rules, callable, client route, or config)
- Impact (data exposure, auth bypass, payment, XSS)
- A minimal reproduction, if you have one

You should receive an acknowledgement within 5 business days. Please give us a reasonable window to ship a fix before public disclosure.

## What is in scope

- Firestore and Storage rules bypasses
- Callable function authorization gaps
- Stripe webhook signature handling
- Auth claim escalation
- XSS or open redirects in the patient or admin surfaces

## What is out of scope

- Missing HIPAA certification or a BAA (this template does not provide either)
- Demo-mode localStorage behavior when `VITE_DEMO_MODE=true`
- Issues that require a leaked service account or committed secret
- Third-party Firebase, Stripe, or Vercel platform incidents
