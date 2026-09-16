# Agency Template Guide — Filling Out for New Clients

This template is built for long-term multi-client agency operations. You can customize, preview, and deploy high-converting landing pages for any chiropractic client without writing code.

---

## 🚀 3 Ways to Fill Out a Client's Info

### Method 1: The Built-in Client Manager (Recommended)
Open the hidden Client Manager directly in the live app:
1. **Shortcut**: Press `Cmd + Shift + C` (or `Ctrl + Shift + C` on Windows) anywhere on the page.
2. **Or Click**: In the bottom footer, click the subtle link: **`Agency Manager ⚙️`**.
3. **Or URL**: Add `?admin=true` to the URL.

#### What you can do in the Manager:
- **Edit Info Tab**: Type or paste the clinic name, doctor credentials, address, phone number, hours, lead magnet offer, and image URLs. Every change instantly updates the live page in real time.
- **Save JSON**: Click **"Save JSON"** to download a clean config file (e.g. `apex-spine-config.json`).
- **Load JSON**: Click **"Load JSON"** to upload any previously saved client file.
- **Sample Presets**: Instantly test 1-click demos (Austin Sports Chiro, Denver Family Chiro, San Diego Chiro).

---

### Method 2: Tell the AI in Chat
Whenever a client sends you an onboarding questionnaire, simply copy and paste their raw answers here in the chat:
```text
Here's my new client info:
- Clinic: Blue Ridge Spinal Health
- Doctor: Dr. Hannah Miller (14 yrs)
- City: Asheville, NC
- Phone: (828) 555-0188
- Offer: $49 Exam & Adjustment
```
The AI will update all files, metadata, and maps instantly.

---

### Method 3: Edit `src/data/clinicData.ts` Directly (For Standalone Clones)
If you clone or export this repository to GitHub/Vercel/Netlify for a dedicated client domain:
1. Open `src/data/clinicData.ts`.
2. Update the `defaultClinic` object at the top.
3. Replace images in `src/assets/images/` or link to their hosted image URLs.

---

## 📋 Standard Client Onboarding Checklist

When taking on a new chiropractic client, ask them for:
- [ ] Clinic Name & Exact Street Address (including Suite # and Zip Code)
- [ ] Direct Clinic Phone (formatted for display & clickable)
- [ ] Lead Chiropractor Name, Post-Nominal Degrees (`D.C.`, `CCSP`, etc.), & Years in Practice
- [ ] Clinic Operating Hours (Weekday & Saturday)
- [ ] Parking Details (e.g. *"Free parking in rear lot"*)
- [ ] Lead Generation Offer (e.g. *"$49 Exam + Spinal Consultation"* or *"Free 15-Min Phone Consult"*)
- [ ] Photos: Doctor Headshot (aspect 3:4 portrait), Treatment Room, and Hero Image
