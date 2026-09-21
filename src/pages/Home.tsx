import React, { useState, useEffect } from 'react';
import { conditionsData } from '../data/clinicData';
import { resolvePalette } from '../data/colorPalettes';
import { useClinic } from '../data/ClinicContext';
import { StickyOfferBanner } from '../components/StickyOfferBanner';
import { Hero } from '../components/Hero';
import { TrustBar } from '../components/TrustBar';
import { TheProblem } from '../components/TheProblem';
import { WhyUs } from '../components/WhyUs';
import { TheProcess } from '../components/TheProcess';
import { TheDoctor } from '../components/TheDoctor';
import { PatientsSection } from '../components/PatientsSection';
import { TheClinic } from '../components/TheClinic';
import { FirstVisitSection } from '../components/FirstVisitSection';
import { InsurancePayment } from '../components/InsurancePayment';
import { LocationSection } from '../components/LocationSection';
import { FAQSection } from '../components/FAQSection';
import { FinalCTA } from '../components/FinalCTA';
import { MobileStickyBar } from '../components/MobileStickyBar';
import { BookingModal } from '../components/BookingModal';
import { AgencyWorkspace } from '../components/AgencyWorkspace';

export default function Home() {
  const { clinicData: clinic, updateClinic, resetClinic } = useClinic();

  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [isStaffMode, setIsStaffMode] = useState<boolean>(false);
  const [selectedConditionForBooking, setSelectedConditionForBooking] = useState<string>('Back pain');

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAdminParam = urlParams.get('admin') === 'true' || urlParams.get('agency') === 'true' || urlParams.get('staff') === 'true' || urlParams.get('edit') === 'true';
      if (hasAdminParam) {
        setIsStaffMode(true);
        setIsManagerOpen(true);
      }
    } catch {
      // Ignore search param errors
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsStaffMode(true);
        setIsManagerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const config = resolvePalette(clinic.colorPalette);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(config.variables).forEach(([cssVar, colorVal]) => {
        root.style.setProperty(cssVar, colorVal);
      });

      if (clinic.customPrimaryColor) {
        root.style.setProperty('--theme-primary-500', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-600', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-700', clinic.customPrimaryColor);
        root.style.setProperty('--theme-primary-800', clinic.customPrimaryColor);
      }
      if (clinic.customAccentColor) {
        root.style.setProperty('--theme-accent', clinic.customAccentColor);
      }
      if (clinic.customBgColor) {
        root.style.setProperty('--theme-bg-page', clinic.customBgColor);
      }
      if (clinic.customTextColor) {
        root.style.setProperty('--theme-primary-950', clinic.customTextColor);
      }
    }
  }, [clinic.colorPalette, clinic.customPrimaryColor, clinic.customAccentColor, clinic.customBgColor, clinic.customTextColor]);

  useEffect(() => {
    const fontPair = clinic.fontPairing || 'classic-editorial';
    let url = '';
    let headingVal = "'Playfair Display', serif";
    let bodyVal = "'Plus Jakarta Sans', sans-serif";

    if (fontPair === 'modern-avant-garde') {
      url = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap';
      headingVal = "'Syne', sans-serif";
      bodyVal = "'Space Grotesk', sans-serif";
    } else if (fontPair === 'serene-academic') {
      url = 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap';
      headingVal = "'Lora', serif";
      bodyVal = "'Inter', sans-serif";
    } else if (fontPair === 'timeless-luxury') {
      url = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Montserrat:wght@100..900&display=swap';
      headingVal = "'Cinzel', serif";
      bodyVal = "'Montserrat', sans-serif";
    } else {
      url = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap';
      headingVal = "'Playfair Display', serif";
      bodyVal = "'Plus Jakarta Sans', sans-serif";
    }

    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = url;

    const styleId = 'dynamic-font-styles';
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = `
      :root {
        --font-heading: ${headingVal};
        --font-body: ${bodyVal};
      }
      h1, h2, h3, h4, .font-serif {
        font-family: var(--font-heading), Georgia, Cambria, "Times New Roman", Times, serif !important;
      }
      body, p, span, div, button, input, textarea, select, .font-sans {
        font-family: var(--font-body), system-ui, -apple-system, sans-serif !important;
      }
    `;
  }, [clinic.fontPairing]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = clinic.seoTitle || `${clinic.name} | Professional Chiropractic Care`;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild