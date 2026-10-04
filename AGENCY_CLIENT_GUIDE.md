# Optional Multi-Client Deployment Add-On (Agency License)

> Canonical handoff: [docs/AGENCY_GUIDE.md](./docs/AGENCY_GUIDE.md). This file is the short agency add-on.


> 💡 **Core Platform Architecture**: Practice OS is natively designed as a **standalone, single-clinic operating system** with zero platform fees or vendor lock-in. If you are a clinic owner deploying for your practice, follow the primary [README.md](./README.md) and [SETUP_WIZARD.md](./SETUP_WIZARD.md).
>
> If you hold an agency license and deploy standalone Practice OS instances for multiple independent clients, use this optional guide for client blueprint setup.

---

## 🚀 Practice Admin & Configuration Overview

To access the administrative configuration suite on any deployment, append `?admin=true` to your site URL or click the floating "Practice Admin" button.

### Client Onboarding Workflow
1. **Deploy Repository**: Deploy a standalone instance for each practice (e.g. on Vercel or Cloud Run).
2. **Set Setup Secret**: Set `CLINIC_SETUP_TOKEN` in `functions/.env`.
3. **Claim Practice**: Access `?admin=true` and click **"Claim This Practice as First Admin"**.
4. **Customize Branding**: Set clinic name, logo, phone, address, and color scheme via Practice Admin.
