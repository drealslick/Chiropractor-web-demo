# Agency Deployment Guide — Multi-Client Management (Optional Add-On)

> 💡 **License Note**: Practice OS is natively built for single-clinic standalone deployments with zero platform fees. If you hold an agency license and deploy Practice OS for multiple clients across separate domains, use this guide to manage blueprints and client configurations.

---

## 🚀 Accessing Practice Admin & Client Configuration Suite

### The Recommended Access Path: URL Parameter (Mobile & Desktop Friendly)
To open the secure Agency Workspace Suite on any device, simply append `?admin=true` to the URL.
- **Example**: `https://your-domain.com/?admin=true`
- **Why this is the primary path**: Tablet, phone, and touch-screen devices do not support keyboard shortcuts. The URL parameter is the only 100% reliable way to trigger the verification prompt during mobile field-sales or tablet client presentations.

### Secondary Access Path: Desktop Shortcut
If you are on a desktop computer with a keyboard:
- **Shortcut**: Press `Cmd + Shift + C` (Mac) or `Ctrl + Shift + C` (Windows) anywhere on the page.

---

## ⚙️ How to Configure a Client Clinic in Under 5 Minutes

1. **Authenticate as Practice Admin**: Log in using your verified Firebase administrator email and password. (On initial deployment, claim the clinic using your `CLINIC_SETUP_TOKEN` from `functions/.env`).
2. **Setup Clinic Info & Scheduling**:
   - In **Clinic & Alerts** tab, fill out the clinic’s details (Phone, Email, Address, Business Hours).
   - Enter their secure JaneApp, Calendly, or other clinical management diary link in the **External Booking URL** field. 
   - *Note*: If an external booking URL is set, the website automatically disables local forms and prompts the user to open the secure clinical diary directly, protecting patient privacy.
3. **Customize Branding & Fonts**:
   - In **Theme & Colors** tab, switch between beautiful custom color palettes (e.g. Earthy Forest, Warm Charcoal, Refined Sand) or enter custom HEX overrides.
   - Select a typography pairing that matches their practice's personality.
4. **Curate Content & FAQs**:
   - In **Content & FAQs** tab, update custom FAQs and list the specific spine, neck, and joint conditions they treat.
5. **Manage Layout Visibility**:
   - Toggle homepage sections and individual pages (Pricing, Blog, Conditions) in the **Sections** tab.
6. **Export / Import Blueprints**:
   - In **Presets & Clone**, you can download a complete backup of the client's configuration (`.json` blueprint).
   - Transfer this blueprint instantly to any other deployment by dragging the file or pasting the JSON.

---

## 📋 Client Onboarding Checklist

When taking on a new chiropractic client, ask them for:
- [ ] Clinic Name & Exact Street Address (including Suite # and Zip Code)
- [ ] Direct Clinic Phone (formatted for display & clickable)
- [ ] Lead Chiropractor Name, Post-Nominal Degrees (`D.C.`, `CCSP`, etc.), & Years in Practice
- [ ] Clinic Operating Hours (Weekday & Saturday)
- [ ] Parking Details (e.g. *"Free parking in rear lot"*)
- [ ] Lead Generation Offer (e.g. *"$49 Exam + Spinal Consultation"* or *"Free 15-Min Phone Consult"*)
- [ ] Photos: Doctor Headshot (aspect 3:4 portrait), Treatment Room, and Hero Image
