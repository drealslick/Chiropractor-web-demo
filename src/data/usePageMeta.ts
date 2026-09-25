import { useEffect } from 'react';
import { useClinic } from './ClinicContext';

function setMetaTag(selector: string, attribute: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta(pageTitle: string, pageDesc?: string, pageImage?: string) {
  const { clinicData: clinic } = useClinic();

  useEffect(() => {
    const fullTitle = `${pageTitle} | ${clinic.seoTitle || clinic.name}`;
    const desc = pageDesc || clinic.seoDescription || clinic.tagline || clinic.name;
    const socialImage =
      pageImage ||
      clinic.ogImage ||
      clinic.heroImage ||
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=630&q=80';
    let canonicalUrl = '';
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
      }
      canonicalUrl = url.origin + url.pathname;
    }

    // Standard HTML Title & Description
    document.title = fullTitle;
    setMetaTag('meta[name="description"]', 'name', 'description', desc);

    // OpenGraph Social Cards (WhatsApp, iMessage, Facebook, LinkedIn, Discord)
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', clinic.name || 'Private Practice');
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', clinic.ogTitle || fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', clinic.ogDescription || desc);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', socialImage);
    if (canonicalUrl) {
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    }

    // Twitter / X Social Cards
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', clinic.ogTitle || fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', clinic.ogDescription || desc);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', socialImage);
  }, [
    pageTitle,
    pageDesc,
    pageImage,
    clinic.name,
    clinic.seoTitle,
    clinic.seoDescription,
    clinic.tagline,
    clinic.ogTitle,
    clinic.ogDescription,
    clinic.ogImage,
    clinic.heroImage,
  ]);
}
