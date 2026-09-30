# Practice OS: Pre-Launch Checklist (30–45 min)

Follow this checklist to replace sample demo data with your clinic's live operational information:

1. **Deploy Repository**: Deploy to your hosting provider (Vercel, Netlify, or Cloud Run).
2. **Practice Profile**: In **Practice Admin > Clinic Info**, update:
   - Practice Name, Phone, Email, City, Address, Business Hours
   - Primary Doctor Name, Credentials (`D.C.`, `CCSP`), and Headshot
   - External EHR / Diary Link (JaneApp, Calendly, or Practice Fusion if using external booking)
3. **Branding & Styling**: Select your color palette and typography pairing in **Theme & Colors**.
4. **Treatable Conditions**: Enable/disable condition tracks (Back Pain, Neck Strain, Sciatica, Sports Injury).
5. **Special Offer**: Set your intro consultation special (e.g. *$49 Consultation & Spinal Exam*).
6. **Payment Gateway**: Connect your Stripe Account for deposit or full consultation checkouts.
7. **Custom Domain**: Connect your domain and update the base URL in `public/sitemap.xml` and `public/robots.txt`.

Patient intake and triage forms are stored securely in Firestore with strict RBAC rules. If your practice prefers external EHR scheduling (Jane/Calendly), set your link in **Practice Admin > Clinic Info** to enable direct redirect or embed mode.