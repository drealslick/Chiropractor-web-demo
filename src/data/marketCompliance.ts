export type MarketRegion = 'UK' | 'US' | 'GLOBAL';

export interface MarketComplianceData {
  region: MarketRegion;
  regionLabel: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  governingBodyName: string;
  governingBodyShort: string;
  statuteReference: string;
  privacyFramework: string;
  privacySupervisoryBody: string;
  supervisoryBodyUrl: string;
  clinicianCredentialTitle: string;
  clinicianIdLabel: string;
  sampleDoctorId: string;
  sampleDoctorTitle: string;
  evidenceGuidelines: Array<{
    title: string;
    authority: string;
    description: string;
  }>;
  insurancePartners: string[];
}

export const UK_COMPLIANCE: MarketComplianceData = {
  region: 'UK',
  regionLabel: 'United Kingdom (UK)',
  flag: '🇬🇧',
  currencySymbol: '£',
  currencyCode: 'GBP',
  governingBodyName: 'General Chiropractic Council (GCC)',
  governingBodyShort: 'GCC',
  statuteReference: 'Chiropractors Act 1994',
  privacyFramework: 'UK GDPR, Data Protection Act 2018 & PECR',
  privacySupervisoryBody: "Information Commissioner's Office (ICO)",
  supervisoryBodyUrl: 'https://ico.org.uk',
  clinicianCredentialTitle: 'GCC Registered Doctor of Chiropractic',
  clinicianIdLabel: 'GCC Reg Number',
  sampleDoctorId: 'GCC 04182',
  sampleDoctorTitle: 'Dr. Alistair Vance, MChiro, DC',
  evidenceGuidelines: [
    {
      title: 'NICE Guideline [NG59]',
      authority: 'National Institute for Health and Care Excellence',
      description: 'Low back pain and sciatica in over 16s: assessment and non-invasive spinal management.',
    },
    {
      title: 'Cochrane Musculoskeletal Reviews',
      authority: 'Cochrane Library',
      description: 'Systematic reviews on spinal manipulative therapy and active rehabilitation for chronic mechanical spinal pain.',
    },
    {
      title: 'GCC Code of Practice',
      authority: 'General Chiropractic Council (UK)',
      description: 'Statutory clinical standards, patient safety protocols, and ethical governance under the Chiropractors Act 1994.',
    },
  ],
  insurancePartners: ['Bupa', 'AXA Health', 'Aviva', 'Vitality Health', 'WPA', 'Simplyhealth'],
};

export const US_COMPLIANCE: MarketComplianceData = {
  region: 'US',
  regionLabel: 'United States (US)',
  flag: '🇺🇸',
  currencySymbol: '$',
  currencyCode: 'USD',
  governingBodyName: 'State Board of Chiropractic Examiners & American Chiropractic Association (ACA)',
  governingBodyShort: 'State Board & ACA',
  statuteReference: 'State Chiropractic Practice Act & NBCE Standards',
  privacyFramework: 'HIPAA Privacy & Security Rules (45 CFR § 164) & HITECH Act',
  privacySupervisoryBody: 'U.S. Department of Health and Human Services (HHS Office for Civil Rights)',
  supervisoryBodyUrl: 'https://www.hhs.gov/hipaa',
  clinicianCredentialTitle: 'Board Licensed Doctor of Chiropractic (DC)',
  clinicianIdLabel: 'NPI & State License',
  sampleDoctorId: 'NPI 1849204819 • State Lic #CH-9481',
  sampleDoctorTitle: 'Dr. Alistair Vance, DC',
  evidenceGuidelines: [
    {
      title: 'ACA Clinical Practice Guidelines',
      authority: 'American Chiropractic Association',
      description: 'Evidence-based chiropractic management of acute and chronic spinal musculoskeletal conditions.',
    },
    {
      title: 'Journal of Manipulative & Physiological Therapeutics (JMPT)',
      authority: 'National Institutes of Health (NIH) / PubMed',
      description: 'Peer-reviewed clinical trials on spinal decompression, manual manipulation, and cervical headache outcomes.',
    },
    {
      title: 'CDC Non-Opioid Clinical Guidance',
      authority: 'Centers for Disease Control and Prevention',
      description: 'First-line non-pharmacological, non-invasive spinal manipulation for subacute and chronic mechanical back pain.',
    },
  ],
  insurancePartners: ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealthcare', 'Medicare', 'HSA / FSA Accepted'],
};

export function getMarketCompliance(region?: MarketRegion): MarketComplianceData {
  if (region === 'US') {
    return US_COMPLIANCE;
  }
  return UK_COMPLIANCE;
}

export function generateMarketPrivacyPolicy(
  clinicName: string,
  phone: string,
  email: string,
  region: MarketRegion = 'UK'
): string {
  if (region === 'US') {
    return `
1. Notice of Privacy Practices (HIPAA Compliance)
${clinicName} is dedicated to maintaining the privacy and security of your Protected Health Information (PHI) in strict compliance with the Health Insurance Portability and Accountability Act of 1996 (HIPAA), the Health Information Technology for Economic and Clinical Health (HITECH) Act, and applicable State privacy statutes.

2. Permitted Uses and Disclosures of Health Information
Your health information is used solely for Treatment (coordinating diagnostic reviews, spinal evaluations, and treatment protocols), Payment (billing insurance providers, verifying FSA/HSA eligibility, and processing receipts), and Health Care Operations (clinical quality improvement and regulatory compliance). We will never sell, lease, or disclose your PHI for marketing purposes without your express written authorization.

3. Security Safeguards for Digital Health Data
Electronic Protected Health Information (ePHI) submitted via our online booking engine, intake portals, or patient communication tools is protected using 256-bit TLS encryption in transit and AES encryption at rest in HIPAA-compliant, SOC 2 Type II certified databases.

4. Patient Privacy Rights Under HIPAA
You retain the legal right to:
- Inspect and obtain an electronic copy of your medical and billing records.
- Request an amendment to your health records if you believe information is incorrect.
- Request confidential communications via preferred phone numbers or email addresses.
- Request a restriction on certain uses or disclosures of your health information.
- Receive an accounting of disclosures made outside of standard treatment and payment.

5. Privacy Officer & Regulatory Reporting
For questions, requests regarding your PHI, or to exercise your HIPAA rights, contact our Privacy Officer at ${email || 'privacy@clinic.com'} or by phone at ${phone}. You also have the right to file a formal complaint with the Secretary of the U.S. Department of Health and Human Services (HHS Office for Civil Rights) at hhs.gov/hipaa. ${clinicName} will never retaliate against any patient for filing a complaint.
`.trim();
  }

  // Default UK GDPR
  return `
1. Information We Collect & Lawful Basis (UK GDPR)
${clinicName} is committed to protecting patient confidentiality and data privacy in strict compliance with the UK General Data Protection Regulation (UK GDPR), Data Protection Act 2018 (DPA 2018), and Privacy and Electronic Communications Regulations (PECR). We process your personal and special category health data under UK GDPR Article 6(1)(b) (Performance of Contract) and Article 9(2)(h) (Provision of Health or Social Care Treatment).

2. Use of Information
Your contact and appointment details are strictly utilized to coordinate consultations, confirm diagnostic assessments, issue itemized health insurance receipts, and provide necessary clinical follow-up. We never sell, rent, or trade patient data to third parties.

3. Special Category Health Data & Clinical Records Retention
Clinical case histories, orthopedic examination notes, and radiographic reports are stored within our encrypted electronic health record system. Medical records are maintained in accordance with statutory General Chiropractic Council (GCC) retention rules (minimum 8 years from the date of last treatment for adults; until age 25 for pediatric patients).

4. Your Rights Under UK Data Protection Law
Under UK data protection law, you have the right to request access to your personal data (Subject Access Request), request rectification of inaccurate records, request restriction of processing, and object to direct communications.

5. Data Protection Officer & Regulatory Authority
If you have questions regarding your data privacy, contact our Data Protection Officer at ${email || 'dpo@vancehealth.co.uk'} or by phone at ${phone}. You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk.
`.trim();
}

export function generateMarketTerms(clinicName: string, region: MarketRegion = 'UK'): string {
  const statute = region === 'US' ? 'State Chiropractic Practice Act' : 'General Chiropractic Council professional code of practice';
  const insuranceNote = region === 'US' 
    ? 'Health insurance verification, in-network coverage, copayments, and HSA/FSA eligibility are determined prior to clinical treatment.'
    : 'Health insurance invoices with GCC registration details are issued immediately for private medical reimbursement.';

  return `
1. Scope of Website Information
All educational materials, articles, triage self-assessments, and anatomical graphics published on the ${clinicName} website are provided for general informational purposes only. Content on this site does not constitute formal medical diagnosis or establish an official doctor-patient relationship.

2. In-Person Clinical Assessment Required
Definitive chiropractic care, spinal adjustments, and personalized therapeutic rehabilitation regimens begin exclusively following an in-person clinical history, orthopedic examination, and doctor evaluation at our facility.

3. Appointment Booking and Financial Terms
Published initial exam fees and follow-up treatment rates represent standard pricing and introductory promotional packages. ${insuranceNote}

4. Professional Regulatory Standards
All care is delivered in accordance with statutory standards under the ${statute}.

5. Intellectual Property
All website copy, clinical imagery, and branding assets are the exclusive intellectual property of ${clinicName}.
`.trim();
}
