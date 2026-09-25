import React, { useEffect } from 'react';
import { useClinic } from '../data/ClinicContext';
import { resolvePalette } from '../data/colorPalettes';

/**
 * GlobalThemeApplier
 * Ensures typography font pairings, CSS color variables, and dynamic Google Fonts
 * are active globally across ALL pages and route refreshes.
 */
export const GlobalThemeApplier: React.FC = () => {
  const { clinicData: clinic } = useClinic();

  // 1. Color Palette & Custom Overrides
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const config = resolvePalette(clinic.colorPalette);
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
  }, [
    clinic.colorPalette,
    clinic.customPrimaryColor,
    clinic.customAccentColor,
    clinic.customBgColor,
    clinic.customTextColor,
  ]);

  // 2. Dynamic Typography Font Pairing Injection
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const fontPair = clinic.fontPairing || 'classic-editorial';
    let url = '';
    let headingVal = "'Playfair Display', Georgia, serif";
    let bodyVal = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

    if (fontPair === 'modern-avant-garde') {
      url =
        'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap';
      headingVal = "'Syne', sans-serif";
      bodyVal = "'Space Grotesk', sans-serif";
    } else if (fontPair === 'serene-academic') {
      url =
        'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lora:ital,wght@0,400..700;1,400..700&display=swap';
      headingVal = "'Lora', serif";
      bodyVal = "'Inter', sans-serif";
    } else if (fontPair === 'timeless-luxury') {
      url =
        'https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Montserrat:wght@100..900&display=swap';
      headingVal = "'Cinzel', serif";
      bodyVal = "'Montserrat', sans-serif";
    } else {
      url =
        'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap';
      headingVal = "'Playfair Display', Georgia, serif";
      bodyVal = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
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

  return null;
};
