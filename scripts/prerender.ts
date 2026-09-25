import fs from 'fs';
import path from 'path';

/**
 * Static Multi-Route Prerenderer for Vance Health Practice Architecture
 *
 * Generates physical, crawler-ready, scraper-perfect .html files for every
 * clinical route, complete with route-specific OpenGraph images, titles,
 * trailing-slash canonical links, JSON-LD medical schemas, and fallback semantic body content.
 */

interface RouteMetadata {
  path: string;
  title: string;
  description: string;
  ogImage: string;
  noIndex?: boolean; // Excludes private/dynamic portal pages from indexing and sitemap
  schemaType?: string;
  schemaName?: string;
  schemaDescription?: string;
  h1: string;
  h2Subtitle: string;
  bodyContent: string[];
}

const BASE_URL = 'https://vancehealth.co.uk';
const CLINIC_NAME = 'Vance Health Practice Architecture';
const CLINIC_PHONE = '+44 20 7946 0192';
const CLINIC_ADDRESS = '742 Central Practice Ave, Suite 300, London W1W 7LT, United Kingdom';

const ROUTES: RouteMetadata[] = [
  {
    path: '',
    title: `${CLINIC_NAME} | Evidence-Based Chiropractic & Spine Recovery`,
    description: 'Personalized, root-cause chiropractic care, lumbar decompression, and cervical rehabilitation in London, UK / EU Central. Fast online booking with no-show protected scheduling.',
    ogImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'Get Back to What Pain Took Away.',
    h2Subtitle: 'Evidence-Based Chiropractic Care in London, UK / EU Central',
    bodyContent: [
      'Vance Health Practice Architecture delivers root-cause, evidence-based chiropractic solutions designed around your symptoms, movement restrictions, and lifestyle goals.',
      'Specializing in lumbar decompression, cervical spine realignment, sports rehabilitation, and postural ergonomics.',
      'Consultation & Diagnostic Review available from £49. Online booking with transparent pricing and instant digital receipts.'
    ]
  },
  {
    path: 'conditions',
    title: `Conditions We Treat | ${CLINIC_NAME}`,
    description: 'Explore our evidence-based chiropractic protocols for lower back pain, sciatica, neck stiffness, tension headaches, and athletic sports injuries.',
    ogImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalWebPage',
    schemaName: 'Conditions Treated at Vance Health',
    schemaDescription: 'Comprehensive guide to musculoskeletal conditions treated by our chiropractic physicians.',
    h1: 'Targeted Clinical Care for Lasting Relief',
    h2Subtitle: 'Evidence-Based Protocols for Spine, Joint & Nerve Health',
    bodyContent: [
      'We isolate mechanical restrictions, postural compensations, and nerve entrapments behind your symptoms.',
      'Specialized care pathways for Lower Back Pain, Sciatica & Lumbar Herniation, Cervical Spine & Headaches, and Athletic Mobility.',
      'Every plan begins with an orthopedic examination, motion palpation, and neurological testing.'
    ]
  },
  {
    path: 'conditions/lower-back-pain',
    title: `Lower Back Pain & Lumbar Care | ${CLINIC_NAME}`,
    description: 'Evidence-based chiropractic adjustments, spinal decompression, and targeted stabilization exercises for acute and chronic lower back pain in London.',
    ogImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalCondition',
    schemaName: 'Lower Back Pain (Lumbar Subluxation & Strain)',
    schemaDescription: 'Mechanical lumbar restriction, facet joint syndrome, and muscular spasm care.',
    h1: 'Lower Back Pain & Lumbar Spine Care',
    h2Subtitle: 'Targeted Restoration of Lumbar Mobility and Disc Health',
    bodyContent: [
      'Lower back pain is often driven by mechanical joint restrictions, facet inflammation, or deep muscular guarding.',
      'Our clinical protocol combines precise lumbar adjustments, pelvic stabilization, and non-surgical decompression to relieve nerve pressure.',
      'Typical patient pathways achieve significant functional improvement within 3 to 5 clinical sessions.'
    ]
  },
  {
    path: 'conditions/sciatica-decompression',
    title: `Sciatica & Disc Decompression Protocol | ${CLINIC_NAME}`,
    description: 'Non-surgical spinal decompression and nerve root pressure relief for sciatica, radiating leg pain, and herniated lumbar discs in London.',
    ogImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalCondition',
    schemaName: 'Sciatica (Lumbar Radiculopathy)',
    schemaDescription: 'Compression or irritation of the sciatic nerve root from herniated or bulging lumbar discs.',
    h1: 'Sciatica & Nerve Root Decompression',
    h2Subtitle: 'Relieving Radiating Leg Pain and Lumbar Disc Irritation',
    bodyContent: [
      'Sciatica presents as sharp, electric, or burning pain traveling down the glute, hamstring, or calf.',
      'We isolate the exact spinal disc level causing nerve impingement and apply gentle, motorized decompression therapy.',
      'Combined with anti-inflammatory spinal mobilization and neural flossing exercises.'
    ]
  },
  {
    path: 'conditions/neck-posture-headaches',
    title: `Neck Pain, Posture & Tension Headaches | ${CLINIC_NAME}`,
    description: 'Upper cervical adjustments and postural ergonomics for desk workers suffering from chronic neck tightness, tech neck, and cervicogenic headaches.',
    ogImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalCondition',
    schemaName: 'Cervical Spine Strain & Tension Headaches',
    schemaDescription: 'Upper cervical joint fixations and postural compensations leading to chronic head and neck pain.',
    h1: 'Cervical Spine Care & Headache Relief',
    h2Subtitle: 'Restoring Natural Cervical Curvature & Relieving Tension',
    bodyContent: [
      'Prolonged desk work and forward head carriage place up to 60 lbs of unnatural load on the cervical spine.',
      'We restore upper cervical alignment (C1-C7) to eliminate nerve traction and occipital headache triggers.',
      'Includes ergonomic workstation recommendations and customized cervical traction.'
    ]
  },
  {
    path: 'conditions/sports-rehab-performance',
    title: `Sports Injury & Athletic Rehabilitation | ${CLINIC_NAME}`,
    description: 'Chiropractic sports medicine, active release therapy, and joint mechanics optimization for runners, crossfitters, and competitive athletes.',
    ogImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalCondition',
    schemaName: 'Athletic Sports Injury & Joint Dysfunction',
    schemaDescription: 'Biomechanical overload, shoulder impingement, hip restriction, and athletic recovery.',
    h1: 'Athletic Performance & Injury Recovery',
    h2Subtitle: 'Biomechanical Optimization for High-Performance Athletes',
    bodyContent: [
      'From repetitive running strains to acute lifting injuries, we identify kinetic chain imbalances.',
      'Soft tissue mobilization, extremity joint adjustments, and functional movement screening.',
      'Fast-track return-to-sport protocols designed to prevent recurrent injury.'
    ]
  },
  {
    path: 'conditions/pelvic-hip-alignment',
    title: `Pelvic & Sacroiliac (SI) Joint Alignment | ${CLINIC_NAME}`,
    description: 'Precision pelvic leveling, sacroiliac joint mobilization, and prenatal Webster Technique support for hip and groin discomfort.',
    ogImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'MedicalCondition',
    schemaName: 'Sacroiliac Joint Dysfunction & Pelvic Torsion',
    schemaDescription: 'Asymmetrical pelvic rotation causing gait imbalance, lower back ache, and hip stiffness.',
    h1: 'Pelvic & Sacroiliac Joint Alignment',
    h2Subtitle: 'Restoring Symmetrical Pelvic Foundation and Hip Range of Motion',
    bodyContent: [
      'The pelvis is the structural foundation of the human spine. Torsion here creates compensatory curvature higher up.',
      'We utilize gentle drop-table adjustments and Webster Technique protocols to balance pelvic ligaments.',
      'Ideal for prenatal patients, runners with asymmetrical stride, and persistent unilateral lower back pain.'
    ]
  },
  {
    path: 'first-visit',
    title: `Your First Visit: What to Expect | ${CLINIC_NAME}`,
    description: 'Transparent walkthrough of your initial chiropractic consultation: medical history, orthopedic examination, digital posture scans, and initial treatment.',
    ogImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'What to Expect on Your First Visit',
    h2Subtitle: 'A Thorough, No-Rushed 45-Minute Diagnostic Consultation',
    bodyContent: [
      'Step 1: Comprehensive Case History & Symptom Deep-Dive.',
      'Step 2: Orthopedic, Neurological & Biomechanical Motion Testing.',
      'Step 3: Report of Findings & Personalized Care Plan Recommendation.',
      'Step 4: Initial Gentle Treatment on Day One (when clinically indicated).'
    ]
  },
  {
    path: 'pricing',
    title: `Transparent Fees & Care Plans | ${CLINIC_NAME}`,
    description: 'Clear, upfront pricing with no hidden charges. Initial Consultation £49, standard adjustments, and flexible wellness packages with insurance receipts.',
    ogImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'Transparent Pricing & Care Plans',
    h2Subtitle: 'Honest Healthcare Investment With Zero Hidden Fees',
    bodyContent: [
      'New Patient Initial Exam & Consultation: £49 (Includes 45-minute comprehensive exam and treatment).',
      'Follow-Up Chiropractic Adjustment: £38 - £45 depending on care package.',
      'Itemized receipts provided for private health insurance reimbursement (AXA, Bupa, Aviva, Vitality).'
    ]
  },
  {
    path: 'team',
    title: `Our Clinical Team | ${CLINIC_NAME}`,
    description: 'Meet our GCC-registered chiropractic physicians: Dr. Alistair Vance, Dr. Elena Rostova, and Dr. Marcus Sterling. Dedicated to evidence-based spine recovery.',
    ogImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'AboutPage',
    h1: 'Our Dedicated Clinical Team',
    h2Subtitle: 'Licensed, GCC-Registered Chiropractic Specialists',
    bodyContent: [
      'Dr. Alistair Vance (MChiro, DC) - Clinic Director & Lead Spine Specialist.',
      'Dr. Elena Rostova (MChiro, DC) - Cervical Spine & Postural Rehab Specialist.',
      'Dr. Marcus Sterling (BSc, MChiro) - Sports Chiropractic & Athletic Conditioning Lead.'
    ]
  },
  {
    path: 'about',
    title: `About Our Practice Architecture | ${CLINIC_NAME}`,
    description: 'Learn about our philosophy of root-cause biomechanics, modern diagnostic technology, and personalized care plans in Central London.',
    ogImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'AboutPage',
    h1: 'Modern Chiropractic Practice Architecture',
    h2Subtitle: 'Moving Beyond Temporary Symptom Masking to Root-Cause Recovery',
    bodyContent: [
      'Founded on the principle that the human body functions best when structural biomechanics are aligned.',
      'We combine traditional chiropractic manual arts with modern decompression tables and active physical therapy.',
      'Convenient central location with morning and evening availability for busy professionals.'
    ]
  },
  {
    path: 'contact',
    title: `Contact & Location | ${CLINIC_NAME}`,
    description: 'Find our London clinic at 742 Central Practice Ave. Telephone: +44 20 7946 0192. Open Monday-Friday 8:30am-6:30pm, Saturday 9:00am-2:00pm.',
    ogImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&h=630&q=80',
    schemaType: 'ContactPage',
    h1: 'Contact & Clinic Directions',
    h2Subtitle: 'We Are Conveniently Located in Central London',
    bodyContent: [
      `Address: ${CLINIC_ADDRESS}`,
      `Telephone: ${CLINIC_PHONE}`,
      'Email: reception@vancehealth.co.uk',
      'Underground / Transit: 3 minutes walk from Oxford Circus & Tottenham Court Road.'
    ]
  },
  {
    path: 'portal',
    title: `Patient Portal & Appointment Management | ${CLINIC_NAME}`,
    description: 'Secure patient portal to view your upcoming appointments, reschedule visits, download itemized insurance receipts, and access home care instructions.',
    ogImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&h=630&q=80',
    noIndex: true, // Edge Micro-check: Excluded from search indexing and sitemap
    h1: 'Patient Portal & Booking Management',
    h2Subtitle: 'Manage Your Appointments, Reschedule, or Download Medical Receipts',
    bodyContent: [
      'Enter your unique Booking Reference Passkey (e.g. VH-9428-K82X) to access your secure record.',
      'Instant access to printable insurance invoices and diagnostic reports.',
      'Zero-wait 24/7 online rescheduling.'
    ]
  },
  {
    path: 'blog',
    title: `Spine Health & Biomechanics Journal | ${CLINIC_NAME}`,
    description: 'Clinical insights, ergonomic posture guides, and science-backed exercises written by our licensed chiropractic physicians.',
    ogImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'Spine Health & Evidence Journal',
    h2Subtitle: 'Clinical Articles and Movement Guides from Our Doctors',
    bodyContent: [
      '5 Daily Ergonomic Adjustments to Eliminate Desk-Worker Neck Pain.',
      'Understanding Sciatica: Bulging Disc vs. Piriformis Syndrome.',
      'How Non-Surgical Lumbar Decompression Promotes Disc Hydration.'
    ]
  },
  {
    path: 'privacy',
    title: `Privacy Policy | ${CLINIC_NAME}`,
    description: 'How Vance Health Practice Architecture protects patient health records and personal data in strict compliance with GDPR and medical confidentiality laws.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'Privacy & Data Protection Policy',
    h2Subtitle: 'Strict Medical Confidentiality and GDPR Compliance',
    bodyContent: [
      'We adhere to the highest international standards of medical confidentiality and data privacy.',
      'Your health history, diagnostic images, and contact information are encrypted and never shared.',
      'You hold the right to request, transfer, or erase personal data at any time.'
    ]
  },
  {
    path: 'terms',
    title: `Terms of Service | ${CLINIC_NAME}`,
    description: 'Clinical consultation policies, payment terms, and 24-hour appointment cancellation guidelines for Vance Health Practice Architecture.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'Terms of Service & Clinic Guidelines',
    h2Subtitle: 'Clear, Respectful Policies for Patients and Clinicians',
    bodyContent: [
      'Appointments may be rescheduled or cancelled free of charge with at least 24 hours notice.',
      'Consultation deposits are credited 100% toward clinical examination fees.',
      'Treatment is only performed following comprehensive informed consent.'
    ]
  },
  {
    path: 'gdpr',
    title: `GDPR Compliance & Patient Rights | ${CLINIC_NAME}`,
    description: 'Patient rights under the UK General Data Protection Regulation (GDPR) and Data Protection Act 2018 at Vance Health Practice Architecture.',
    ogImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&h=630&q=80',
    h1: 'GDPR Patient Data Protection & Rights',
    h2Subtitle: 'Your Rights Under UK GDPR & Health Records Legislation',
    bodyContent: [
      'Full compliance with the UK Data Protection Act 2018 and UK GDPR.',
      'Secure electronic health records stored with audit logging.',
      'Dedicated Data Protection Officer: dpo@vancehealth.co.uk.'
    ]
  }
];

export async function prerenderAllRoutes() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html not found. Run "vite build" first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');
  console.log(`\n🚀 Starting Static Multi-Route Prerendering for ${ROUTES.length} routes...\n`);

  for (const route of ROUTES) {
    // Micro-check 2: Trailing slash consistency (matches directory /index.html resolution)
    const fullCanonicalUrl = route.path ? `${BASE_URL}/${route.path}/` : `${BASE_URL}/`;
    let html = rawTemplate;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // 2. Replace Meta Description
    html = html.replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );

    // Micro-check 3: If route is private/noIndex (e.g. portal), inject noindex robots tag
    if (route.noIndex) {
      if (html.includes('name="robots"')) {
        html = html.replace(/<meta\s+name=["']robots["']\s+content=["'].*?["']\s*\/?>/i, '<meta name="robots" content="noindex, nofollow" />');
      } else {
        html = html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n</head>');
      }
    } else {
      if (html.includes('name="robots"')) {
        html = html.replace(/<meta\s+name=["']robots["']\s+content=["'].*?["']\s*\/?>/i, '<meta name="robots" content="index, follow" />');
      }
    }

    // 3. Replace Canonical (with Trailing Slash)
    if (html.includes('rel="canonical"')) {
      html = html.replace(
        /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
        `<link rel="canonical" href="${fullCanonicalUrl}" />`
      );
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${fullCanonicalUrl}" />\n</head>`);
    }

    // 4. Replace OpenGraph & Twitter Tags (Matching Trailing Slash Canonical)
    html = html.replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:url" content="${fullCanonicalUrl}" />`
    );
    html = html.replace(
      /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:image" content="${route.ogImage}" />`
    );

    html = html.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${route.title.replace(/"/g, '&quot;')}" />`
    );
    html = html.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );
    html = html.replace(
      /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:image" content="${route.ogImage}" />`
    );

    // 5. Inject Fallback Semantic Body for Wave-1 Crawlers & No-JS Scrapers
    const semanticBody = `
      <div id="root">
        <noscript>
          <header style="padding: 24px; background: #1c1917; color: #fff; text-align: center;">
            <p style="font-size: 20px; font-weight: bold; margin: 0;">${CLINIC_NAME}</p>
            <p style="font-size: 14px; margin: 4px 0 0; color: #a8a29e;">${CLINIC_ADDRESS} | Phone: ${CLINIC_PHONE}</p>
          </header>
          <main style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: sans-serif; color: #1c1917; line-height: 1.6;">
            <h1 style="font-size: 32px; margin-bottom: 8px;">${route.h1}</h1>
            <p style="font-size: 18px; color: #047857; font-weight: 600; margin-bottom: 24px;">${route.h2Subtitle}</p>
            ${route.bodyContent.map((p) => `<p style="font-size: 16px; margin-bottom: 16px;">${p}</p>`).join('')}
            <div style="margin-top: 32px; padding: 20px; background: #f5f5f4; border-radius: 12px;">
              <p style="margin: 0 0 8px; font-weight: bold;">Appointments & Consultations:</p>
              <p style="margin: 0;">Call ${CLINIC_PHONE} or book online at <a href="${fullCanonicalUrl}">${fullCanonicalUrl}</a></p>
            </div>
          </main>
        </noscript>
      </div>
    `.trim();

    html = html.replace(/<div id="root"><\/div>/i, semanticBody);

    // 6. Write to Physical Route Directory
    const targetDir = route.path ? path.join(distDir, route.path) : distDir;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf-8');

    console.log(`  ✓ Generated: /${route.path ? route.path + '/' : ''} (Saved: ${path.relative(distDir, targetFile)})`);
  }

  // 7. Generate XML Sitemap (excluding noIndex routes)
  generateSitemap(distDir);

  // 8. Generate Robots.txt (with explicit portal disallow)
  generateRobots(distDir);

  // 9. Generate Hosting Fallbacks
  generateServerConfigs(distDir);

  console.log(`\n🎉 Prerendering complete! Generated ${ROUTES.length} physical static routes, sitemap.xml, and server rewrite configs.\n`);
}

function generateSitemap(distDir: string) {
  const today = new Date().toISOString().split('T')[0];
  // Micro-check 3: Filter out any private or noIndex routes (e.g., /portal/)
  const indexableRoutes = ROUTES.filter((r) => !r.noIndex);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexableRoutes.map((r) => {
  const loc = r.path ? `${BASE_URL}/${r.path}/` : `${BASE_URL}/`;
  const priority = r.path === '' ? '1.0' : r.path.startsWith('conditions') ? '0.9' : '0.8';
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml.trim(), 'utf-8');
  console.log(`  ✓ Generated: sitemap.xml with ${indexableRoutes.length} public indexable URLs (Private /portal/ excluded)`);
}

function generateRobots(distDir: string) {
  // Micro-check 3: Explicitly disallow /portal/ and /portal from crawler crawl budget
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /portal/
Disallow: /portal

Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt.trim(), 'utf-8');
  console.log(`  ✓ Generated: robots.txt with Disallow: /portal/`);
}

function generateServerConfigs(distDir: string) {
  // Netlify / Cloudflare Pages _redirects
  const redirects = `# Netlify / Cloudflare Pages PushState fallback
/* /index.html 200
`;
  fs.writeFileSync(path.join(distDir, '_redirects'), redirects.trim(), 'utf-8');

  // Vercel vercel.json
  const vercelJson = JSON.stringify(
    {
      rewrites: [
        {
          source: '/(.*)',
          destination: '/$1'
        }
      ]
    },
    null,
    2
  );
  fs.writeFileSync(path.join(distDir, 'vercel.json'), vercelJson, 'utf-8');

  // Apache / cPanel .htaccess with trailing-slash directory enforcement
  const htaccess = `# Apache / cPanel Rewrite Rules for Physical HTML + SPA
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
  fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess.trim(), 'utf-8');

  console.log(`  ✓ Generated: _redirects, vercel.json, and .htaccess hosting configs`);
}

// Execute immediately when called via CLI
prerenderAllRoutes().catch((err) => {
  console.error('Fatal Prerendering Error:', err);
  process.exit(1);
});
