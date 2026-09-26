# TERMS OF USE & COMMERCIAL LICENSE AGREEMENT

**PLEASE READ THIS AGREEMENT CAREFULLY PRIOR TO PURCHASING, DOWNLOADING, MODIFYING, OR DEPLOYING THIS SOFTWARE CODEBASE.**

Last Updated: September 2026

---

## 1. NATURE OF THE PRODUCT: SOFTWARE TEMPLATE ONLY

1.1. This product (the "Software", "Template", or "Codebase") is a digital software design template and application boilerplate engineered for independent chiropractic and physical rehabilitation practices.

1.2. The Software is sold and distributed as source code for use by software engineers, clinic owners, healthcare entrepreneurs, or their technical contractors. 

1.3. **THE SOFTWARE IS NOT A TURNKEY, READY-TO-OPERATE HEALTHCARE SERVICE, NOR DOES IT CONSTITUTE A CERTIFIED ELECTRONIC HEALTH RECORD (EHR) OR ELECTRONIC MEDICAL RECORD (EMR) SYSTEM.**

---

## 2. PRIVACY & STATUTORY REGULATORY COMPLIANCE (HIPAA, GDPR, DPA 2018)

### 2.1. No Out-of-the-Box HIPAA / GDPR Certification
* **The Software is NOT HIPAA-certified, HITECH-certified, GDPR-certified, SOC2-certified, or ISO 27001-certified out-of-the-box.**
* Software source code alone cannot be "HIPAA certified." Compliance with health data privacy regulations requires a combination of technical architecture, secure cloud infrastructure configuration, organizational policies, administrative safeguards, workforce training, and executed legal agreements.

### 2.2. Buyer's Sole Responsibility for Infrastructure & BAAs
The purchasing organization, clinic, or developer ("Licensee") acknowledges and agrees that they bear sole, exclusive legal responsibility for configuring the deployment environment in compliance with all relevant data privacy and protection statutes. This includes, without limitation:

1. **Business Associate Agreements (BAAs)**:
   * **Google Cloud / Firebase**: Licensee must execute a HIPAA Business Associate Agreement directly with Google Cloud Platform and enable Cloud KMS encryption and audit logging prior to transmitting Protected Health Information (PHI).
   * **Supabase / Relational Databases**: If Supabase or PostgreSQL is utilized for patient records, Licensee must subscribe to a HIPAA-eligible tier and execute an enterprise BAA with the database vendor.
   * **Transactional Email & SMS (Resend / Twilio)**: Licensee must ensure messaging gateways used to transmit appointment reminders or intake links comply with HIPAA, TCPA, and GDPR guidelines, including patient consent for SMS/email notifications and appropriate encryption.
   * **Payment Processing (Stripe)**: Licensee must maintain PCI-DSS compliance and ensure no protected health information (such as diagnostic ICD-10 codes or clinical notes) is passed to Stripe payment metadata fields.

2. **Access Control & Safeguards**:
   * Implementing mandatory Multi-Factor Authentication (MFA) for all clinical and administrative staff accounts.
   * Establishing strict session timeouts, password complexity rules, and automated audit logging of all patient chart access.
   * Ensuring all client devices, tablets, and clinic reception computers operating this application have full-disk encryption and antivirus protections enabled.

3. **GDPR & Data Protection Compliance (UK & EU Deployments)**:
   * Conducting a comprehensive Data Protection Impact Assessment (DPIA) under Article 35 of the UK/EU GDPR before processing special category health data.
   * Appointing a qualified Data Protection Officer (DPO) if required by clinical volume.
   * Establishing formal Standard Operating Procedures (SOPs) for responding to Data Subject Access Requests (DSARs), data rectification, and patient data erasure ("Right to be Forgotten").

---

## 3. CLINICAL TRIAGE, RED FLAGS & INTAKE LOGIC

### 3.1. Illustrative Boilerplate Only
All medical and chiropractic clinical logic embedded in this software — including the 2D anatomical pain locator, contraindication checklists (osteoporosis, blood thinners, pacemakers), red flag triage warnings (cauda equina syndrome, progressive neurological deficits), pain severity scales (VAS 1–10), and symptom aggregators — is provided strictly as **illustrative sample code**.

### 3.2. Non-Validated Clinical Logic
The clinical rules and screening algorithms have **NOT** been clinically evaluated, validated by randomized controlled trials, or approved by the U.S. Food and Drug Administration (FDA), the UK National Institute for Health and Care Excellence (NICE), the UK General Chiropractic Council (GCC), or any medical board.

### 3.3. Mandatory Licensed Clinical Oversight
> **"This intake is educational and administrative. It does not replace professional clinical judgment. All findings must be reviewed by a licensed practitioner before treatment."**

Licensee must ensure that all patient-submitted intake forms, symptom mappings, and questionnaires are independently reviewed, verified, and physically examined by a licensed and insured healthcare practitioner prior to the delivery of any clinical care or spinal manipulation.

---

## 4. INFORMED CONSENT & LEGAL DOCUMENTATION

4.1. The informed consent agreements, digital signature capture tools, and cancellation policy terms provided in this codebase are sample templates.

4.2. Licensee is required to consult their professional malpractice attorney, professional indemnity insurer (e.g., NCMIC, ChiroSecure, Balens, or Medical Protection Society), and local regulatory body to tailor and formally execute all clinical consent language to the specific statutory requirements of their operating jurisdiction.

---

## 5. DISCLAIMER OF WARRANTIES

TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, THIS SOFTWARE IS PROVIDED **"AS IS" AND "AS AVAILABLE"**, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. 

THE AUTHORS, DEVELOPERS, SELLERS, AND DISTRIBUTORS SPECIFICALLY DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION:
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT;
* WARRANTIES THAT THE SOFTWARE COMPLIES WITH HIPAA, HITECH, GDPR, DPA 2018, CCPA, FDA SaMD REGULATIONS, OR ANY MEDICAL DEVICE STANDARDS;
* WARRANTIES REGARDING THE ACCURACY, RELIABILITY, CLINICAL VALIDITY, COMPLETENESS, OR TIMELINESS OF ANY CLINICAL SCREENING, QUESTIONNAIRE, OR TRIAGE RESULT.

---

## 6. LIMITATION OF LIABILITY & INDEMNIFICATION

6.1. **Exclusion of Damages**: In no event shall the authors, copyright holders, developers, or distributors of this software be liable for any medical malpractice, clinical misdiagnosis, failure to diagnose, patient injury, wrongful death, loss of data, regulatory fine, civil penalty, loss of business, or any direct, indirect, incidental, punitive, or consequential damages arising out of the use or inability to use this codebase.

6.2. **Indemnification by Licensee**: Licensee agrees to defend, indemnify, and hold completely harmless the software authors, developers, vendors, and distributors from and against any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable attorney's fees) arising out of or related to:
1. Licensee's deployment, operation, or modification of the Software;
2. Any patient care, clinical examination, diagnosis, triage decision, treatment, or spinal manipulation rendered by Licensee or its staff;
3. Any breach of patient data privacy, unauthorized disclosure of Protected Health Information (PHI), or failure to comply with HIPAA, GDPR, or applicable healthcare laws;
4. Any dispute arising from informed consent, electronic signatures, billing, or patient communications.

---

## 7. GOVERNING LAW & SEVERABILITY

7.1. If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the validity, legality, and enforceability of the remaining provisions shall continue in full force and effect.

7.2. By purchasing, cloning, deploying, or distributing this Software, Licensee confirms that they have read, understood, and voluntarily accept all terms and conditions outlined herein.
