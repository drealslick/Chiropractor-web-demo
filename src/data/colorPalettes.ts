export type ColorPaletteId =
  | 'soft-ivory-forest'
  | 'warm-bone-charcoal'
  | 'warm-sand-terracotta'
  | 'pale-stone-teal'
  | 'emerald-stone'
  | 'navy-gold';

export interface ColorPalette {
  id: ColorPaletteId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  backgroundLabel: string;
  accentLabel: string;
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    light: string;
  };
  preview: {
    primary: string;
    accent: string;
    bg: string;
  };
  variables: Record<string, string>;
}

export const colorPalettes: Record<ColorPaletteId, ColorPalette> = {
  'soft-ivory-forest': {
    id: 'soft-ivory-forest',
    name: 'Soft Ivory & Forest',
    category: 'Natural & Restorative',
    tagline: 'Calming Wellness',
    description: 'Deep forest greens paired with warm ivory tones create a grounded, clinical yet inviting feel.',
    backgroundLabel: 'Soft Ivory Canvas',
    accentLabel: 'Earthy Sage Accent',
    previewColors: {
      primary: '#1e3a2b',
      secondary: '#2d5a41',
      background: '#fcfbf7',
      accent: '#829e8d',
      light: '#eaf0ec',
    },
    preview: {
      primary: '#1e3a2b',
      accent: '#829e8d',
      bg: '#fcfbf7',
    },
    variables: {
      '--color-primary': '#1e3a2b',
      '--color-primary-hover': '#15291e',
      '--color-accent': '#829e8d',
      '--color-bg': '#fcfbf7',
      '--color-text': '#1c1917',
    },
  },
  'warm-bone-charcoal': {
    id: 'warm-bone-charcoal',
    name: 'Warm Bone & Charcoal',
    category: 'Modern Executive',
    tagline: 'High-End Aesthetic',
    description: 'Sleek, high-contrast palette with soft bone undertones for a premium boutique practice look.',
    backgroundLabel: 'Warm Bone Canvas',
    accentLabel: 'Bronze Gold Accent',
    previewColors: {
      primary: '#262626',
      secondary: '#404040',
      background: '#f7f6f2',
      accent: '#c5a059',
      light: '#f0ece1',
    },
    preview: {
      primary: '#262626',
      accent: '#c5a059',
      bg: '#f7f6f2',
    },
    variables: {
      '--color-primary': '#262626',
      '--color-primary-hover': '#171717',
      '--color-accent': '#c5a059',
      '--color-bg': '#f7f6f2',
      '--color-text': '#171717',
    },
  },
  'warm-sand-terracotta': {
    id: 'warm-sand-terracotta',
    name: 'Warm Sand & Terracotta',
    category: 'Holistic & Organic',
    tagline: 'Warm Family Care',
    description: 'Earthy terracotta and soft desert sand tones ideal for family, pediatric, and wellness care.',
    backgroundLabel: 'Desert Sand Canvas',
    accentLabel: 'Clay Terracotta Accent',
    previewColors: {
      primary: '#9e472a',
      secondary: '#c25e3d',
      background: '#fbf8f3',
      accent: '#d97736',
      light: '#f7ebe3',
    },
    preview: {
      primary: '#9e472a',
      accent: '#d97736',
      bg: '#fbf8f3',
    },
    variables: {
      '--color-primary': '#9e472a',
      '--color-primary-hover': '#7f3820',
      '--color-accent': '#d97736',
      '--color-bg': '#fbf8f3',
      '--color-text': '#292524',
    },
  },
  'pale-stone-teal': {
    id: 'pale-stone-teal',
    name: 'Pale Stone & Alpine Teal',
    category: 'Sports & Active Rehab',
    tagline: 'Dynamic Performance',
    description: 'Crisp teal combined with neutral stone background colors for modern sports injury clinics.',
    backgroundLabel: 'Pale Stone Canvas',
    accentLabel: 'Bright Teal Accent',
    previewColors: {
      primary: '#0f766e',
      secondary: '#115e59',
      background: '#f4f4f5',
      accent: '#14b8a6',
      light: '#ccfbf1',
    },
    preview: {
      primary: '#0f766e',
      accent: '#14b8a6',
      bg: '#f4f4f5',
    },
    variables: {
      '--color-primary': '#0f766e',
      '--color-primary-hover': '#115e59',
      '--color-accent': '#14b8a6',
      '--color-bg': '#f4f4f5',
      '--color-text': '#18181b',
    },
  },
  'emerald-stone': {
    id: 'emerald-stone',
    name: 'Classic Emerald & Stone',
    category: 'Clinical Excellence',
    tagline: 'Trusted Standard',
    description: 'Rich clinical emerald greens providing strong contrast and immediate trustworthiness.',
    backgroundLabel: 'Light Stone Canvas',
    accentLabel: 'Vibrant Emerald Accent',
    previewColors: {
      primary: '#059669',
      secondary: '#047857',
      background: '#f5f5f4',
      accent: '#10b981',
      light: '#d1fae5',
    },
    preview: {
      primary: '#059669',
      accent: '#10b981',
      bg: '#f5f5f4',
    },
    variables: {
      '--color-primary': '#059669',
      '--color-primary-hover': '#047857',
      '--color-accent': '#10b981',
      '--color-bg': '#f5f5f4',
      '--color-text': '#1c1917',
    },
  },
  'navy-gold': {
    id: 'navy-gold',
    name: 'Royal Navy & Warm Gold',
    category: 'Corporate & Specialist',
    tagline: 'Elite Medical',
    description: 'Deep royal blue paired with subtle warm gold highlights for an authoritative medical feel.',
    backgroundLabel: 'Soft Slate Canvas',
    accentLabel: 'Warm Gold Accent',
    previewColors: {
      primary: '#1e3a8a',
      secondary: '#1e40af',
      background: '#f8fafc',
      accent: '#d97706',
      light: '#e0e7ff',
    },
    preview: {
      primary: '#1e3a8a',
      accent: '#d97706',
      bg: '#f8fafc',
    },
    variables: {
      '--color-primary': '#1e3a8a',
      '--color-primary-hover': '#1e40af',
      '--color-accent': '#d97706',
      '--color-bg': '#f8fafc',
      '--color-text': '#0f172a',
    },
  },
};

export function resolvePalette(paletteId?: string): ColorPalette {
  if (paletteId && paletteId in colorPalettes) {
    return colorPalettes[paletteId as ColorPaletteId];
  }
  return colorPalettes['soft-ivory-forest'];
}
