# Practice OS — Public-Site V2 Art Direction
**Status:** proposal / design contract; not yet implemented or visually verified  
**Scope:** public-facing clinic site only. Preserve the Practice OS admin dashboard, authentication, booking contracts, payments, content editor and Firebase integration.

## The problem to solve
An outside reviewer independently recognized the *entire public interface* as AI-generated at first glance. This is a visual-composition problem before it is a copy problem. Source audit on current main identifies repeated full-width centered heading → card grid → icon/badge → CTA sequences; rounded shadowed boxes throughout inner pages; saturated emerald decoration; floating hero image caption; ornamental status dot; and frequent micro-labels. The homepage mounts more than a dozen sections, increasing the chance that the rhythm repeats.

This diagnosis is based on JSX/CSS/source inspection. **Live desktop and mobile screenshots have not yet been captured**; do not assert pixel-level defects or successful browser verification from source alone.

### Existing assets and constraints
- React + TypeScript + Tailwind CSS v4, responsive pages.
- Pages: Home, About, Team, Conditions, Condition Detail, First Visit, Pricing, Contact, Blog, plus booking and portal flows.
- `GlobalThemeApplier` and `colorPalettes` provide per-clinic colors, font pairing and custom overrides. The new system must work under these controls; do not merely hardcode one palette.
- `Home.tsx` provides admin-controlled section visibility. Preserve the choices and safe empty states while reorganizing layout.
- The demo has sample locations, doctors, reviews and photos: retain an unmistakable demo label and never imply those fixtures are authenticated evidence.
- **Back-end blocked:** Firebase deployment is not verified. This work does not make, simulate, or alter live appointment/payment behavior.

## Three competing concepts — different organizing ideas, not colorways

### A — The Practice Guide (recommended)
**Concept:** Because a patient is deciding whether to trust a practitioner and attend a first visit, the public site functions like a clear, beautifully typeset patient guide, not a collection of marketing widgets.

- First glance: a specific clinic identity, one short clear headline, clinic/environment image, and an obvious "Book a visit" action.
- Signature structure: practical "Before you come / During your visit / Afterwards" journey with readable time and logistics where verified. Pricing resembles a plainly labeled fee schedule; Conditions resembles an indexed reference; Team uses people and biographies, not credential badge overlays.
- Layout grammar: left-aligned reading columns where appropriate; selective asymmetric media; breathing room; natural dividers and editorial lists; real information density.
- Personality: informed, calm, approachable. Distinctiveness comes from care-path structure and patient usefulness, not faux-luxury effects.
- Risk: can look too restrained without careful type, image crops and proportion. Solve through art direction, not ornament.
- Strongest default for clinics lacking a large commissioned-photo library.

### B — The Independent Studio
**Concept:** Because the actual clinic and people are the experience, use genuine photography and practitioner narrative as the organizing material.

- Signature structure: image-led, intentionally varied compositions; patient perspectives on rooms, staff, and the arrival experience.
- Homepage opens on an authentic clinic photograph with minimal overlay; inner pages alternate portrait/editorial reading and detail imagery rather than repeated cards.
- Risk: weak without excellent, licensed real photography; demo stock must be explicitly presented as illustrative, not as genuine people/places.
- Use later as a distinct layout preset after V2 structure works.

### C — The Neighbourhood Practice
**Concept:** Because patients choose convenient, trusted local care, make the clinic's location, practitioner availability, fees, arrival logistics and access the first-class information model.

- Signature structure: directions, parking, opening times, contact methods, services, and what to expect; minimal promotional persuasion.
- Risk: weaker on brand storytelling, particularly for destination clinics and multi-location premium practices.
- Use later as an information-first layout preset for locally oriented clinics.

**Decision:** Prototype A on **Home + First Visit + one content-heavy inner page (Pricing or Conditions)** before carrying it across all pages. Do not create three nearly identical themed screenshots.

## V2 visual design contract — The Practice Guide

### First-glance hierarchy
1. **Clinic identity / area / book:** logo or truthful type wordmark, clear clinic name and location, direct navigation, one strong booking button.
2. **What it does:** legible headline (prefer two short lines), one sentence of concrete introduction; no pulsing status dot, fake verification row or decorative pills.
3. **Experience:** one meaningful photo or simple nondeceptive placeholder with restrained crop; no floating frosted fake clinician quotation.
4. **Next action:** book / see the first-visit guide. No mini-diagnostic interface dominating the opening viewport.

### Structure and rhythm
- Restrict the homepage to 6–8 distinct content chapters by default: first impression; short overview of care; visit process; practitioner/clinic; fees or insurance; location/logistics; useful FAQ only when configured; final appointment access.
- Preserve `showSection*` toggles and other existing clinic settings. Composition should adapt to hidden/empty content instead of leaving visual voids.
- Break the repeated "centered heading + 3 cards" scaffold. Different pages must use their natural information shape:
  - **Home:** warm introduction + practical scan path; avoid turning every service into a selling card.
  - **About:** practitioner's perspective, team and real space; no decorative verified-credential seals.
  - **Team:** restrained portrait + accessible name and role; genuine details only.
  - **Conditions:** indexed topics or plain lists with meaningful summary and a link; no interchangeable icon-card mosaic by default.
  - **First Visit:** step-by-step journey and arrival checklist; details readable without accordions.
  - **Pricing:** legible fee rows/table, what is included, and plain-language payment guidance rather than featured plan cards.
  - **Contact:** one clean location/contact block, accessible form and directions.
- Keep consistent page frame/nav/footer but vary composition *inside* it. Avoid arbitrary different styles for different routes.

### Typography, color, material
- Define semantic **roles**, not a fixed trendy font: display heading, body copy, UI label, caption. Select two font families maximum for a chosen clinic identity. Validate supplied font-pairing presets rather than disabling clinic customization.
- Body copy >=16px desktop/mobile where practical; readable line length and clear type contrast. Don't rely on 10–11px uppercase micro-labels for content that matters.
- Default geometry: purposeful small-radius controls, primarily unboxed text groups, one container level where genuinely necessary; don't apply round + border + shadow by reflex.
- Surface system: light neutral canvas, strong text, one meaningful accent controlled by clinic theme variables. Dark sections only for meaningful transition, not every other chapter.
- Do not blindly replace cream/forest with another fashionable beige/serif package. Judge the selected clinic's identity by reference photography and content.
- Motion only to communicate state (navigation, disclosure, selected item, booking modal); honor reduced-motion. Strip ambient pulse, repetitive staggered scroll reveals, hover scale and unnecessary `transition-all` from public marketing chrome.

### Content / trust integrity
- Missing real doctors, licensing numbers, reviews, clinic addresses, ratings, associations and outcome claims must **not** be compensated for with invented seals, plausible metrics or patient testimonials.
- Distinguish DEMO from LIVE. Use properly credited illustrative images as examples, not false documentary evidence; preserve provenance.
- Don't make absolute medical outcomes, recovery-time estimates or guaranteed visit counts by default.
- Don't silently delete useful settings; inactive information remains editable in admin.

### Functionality and accessibility guarantees
- Preserve routing, deep links, blog SEO metadata, booking modal triggers, clinic theme + editor settings, form semantics, mobile navigation and responsive touch targets.
- Keep the public CTA genuinely wired to existing booking behavior without implying Firebase is operational.
- No changes to `functions/`, Stripe, Firebase rules, staff administration or appointment persistence as part of a visual redesign.
- Implement mobile-specific hierarchy and reflow, not a squeezed desktop canvas.

## Implementation slices (each a separate PR)
1. **Foundation + prototype:** introduce scoped public-site tokens/primitives that coexist with `GlobalThemeApplier`. Rebuild Navbar + Hero + Home composition and **First Visit** under A. Keep existing admin toggles. Produce real desktop/mobile screenshots and compare to baseline, before merging.
2. **Inner pages:** About, Team, Conditions/Detail, Pricing, Contact using page-specific layouts and shared typography. Check long clinic names, missing photographs, multi-location data, varied currency lengths and no review data.
3. **Final consolidation:** Footer, location, optional FAQ, Blog consistency, responsive polish, source-aware image/provenance fixes, prune unused decorative styles, and run authenticity guards.

## Required verification before any public UI merge
- Baseline screenshot **before** edits, and final screenshot from the same browser and viewport: 390×844 mobile, 768 tablet, 1440 desktop and short viewport. Use genuine screenshots, not conceptual mockups.
- Visually compare the entire Home, First Visit, Pricing/Conditions and About; at least one long-content case and one empty/missing-assets case.
- Navigation, keyboard tab order, visible focus, 200% zoom/reflow, touch targets, and reduced-motion.
- Admin changes to palette/font/section toggles still render sensibly; logo and addresses still respond to clinic context.
- Booking CTA still opens modal in explicit demo, with no invented live payment/appointment success.
- CI: typecheck, tests, build and performance budget unchanged or improved.
- An independent first-glance check with someone who has **not** seen the previous design; ask "What kind of organization does this look like?" before mentioning AI.
- Do not claim shipped, visually verified or user-tested without evidence. Stage on a Vercel preview when team access permits. Main remains unchanged until the gates are met.

## Skill workflow attribution
Design reasoning here follows the public principles of `frontend-craft` and `ui-art-direction`, plus the existing Organism UI audit/implementation approach:
- https://github.com/nattergabriel/frontend-craft
- https://github.com/SpellbourneDZ/ui-design-skill
- https://github.com/pbakaus/impeccable

These are references; a GitHub link alone does not prove a skill is installed or a browser integration is active.

## What is explicitly NOT done
No frontend components restyled yet. No screenshots captured, no live render validated, no Vercel configuration altered, and no backend deployed. This document is the input to the implementation/prototype PR, not an approval to market the site as authentic or production-ready.
