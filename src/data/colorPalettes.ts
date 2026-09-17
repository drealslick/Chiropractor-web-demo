export type ColorPaletteId =
  | 'soft-ivory-forest'
  | 'warm-bone-charcoal'
  | 'cool-ivory-navy'
  | 'warm-sand-terracotta'
  | 'pale-stone-teal'
  | 'soft-greige-black';

export interface ColorPaletteConfig {
  id: ColorPaletteId;
  name: string;
  tagline: string;
  category: string;
  description: string;
  backgroundLabel: string;
  accentLabel: string;
  previewColors: {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
    accent: string;
    background: string;
  };
  variables: {
    '--theme-primary-50': string;
    '--theme-primary-100': string;
    '--theme-primary-200': string;
    '--theme-primary-300': string;
    '--theme-primary-400': string;
    '--theme-primary-500': string;
    '--theme-primary-600': string;
    '--theme-primary-700': string;
    '--theme-primary-800': string;
    '--theme-primary-900': string;
    '--theme-primary-950': string;
    '--theme-bg-page': string;
    '--theme-bg-muted': string;
    '--theme-accent': string;
  };
}

export const colorPalettes: Record<ColorPaletteId, ColorPaletteConfig> = {
  // 1. Soft Ivory + Deep Forest (Refined restorative green)
  'soft-ivory-forest': {
    id: 'soft-ivory-forest',
    name: 'Soft Ivory + Deep Forest',
    tagline: 'Refined Restorative Green',
    category: 'Holistic & Vitality',
    description: 'Off-white ivory canvas with deep botanical forest green and soft sage accents. Inspires restorative spinal renewal.',
    backgroundLabel: 'Soft Ivory (#FAF8F5)',
    accentLabel: 'Soft Sage (#A3BFAE)',
    previewColors: {
      primary: '#1b4332',
      secondary: '#143527',
      light: '#f1f6f3',
      dark: '#07150f',
      accent: '#8fae9b',
      background: '#faf8f5',
    },
    variables: {
      '--theme-primary-50': '#f2f7f4',
      '--theme-primary-100': '#e3ede6',
      '--theme-primary-200': '#c6dacd',
      '--theme-primary-300': '#a3bfae',
      '--theme-primary-400': '#6e987c',
      '--theme-primary-500': '#396d4b',
      '--theme-primary-600': '#245337',
      '--theme-primary-700': '#1b4332',
      '--theme-primary-800': '#143527',
      '--theme-primary-900': '#0d251b',
      '--theme-primary-950': '#07150f',
      '--theme-bg-page': '#faf8f5',
      '--theme-bg-muted': '#f1ede6',
      '--theme-accent': '#8fae9b',
    },
  },

  // 2. Warm Bone + Charcoal (Modern high-end)
  'warm-bone-charcoal': {
    id: 'warm-bone-charcoal',
    name: 'Warm Bone + Charcoal',
    tagline: 'Modern High-End',
    category: 'Sleek & Contemporary',
    description: 'Off-white bone canvas with deep near-black charcoal and muted warm gold accents. Crisp, ultra-clean, and modern.',
    backgroundLabel: 'Warm Bone (#F8F6F0)',
    accentLabel: 'Muted Brass Gold (#C5A059)',
    previewColors: {
      primary: '#26231f',
      secondary: '#1a1816',
      light: '#f5f3ee',
      dark: '#0c0b0a',
      accent: '#c5a059',
      background: '#f8f6f0',
    },
    variables: {
      '--theme-primary-50': '#f6f4f0',
      '--theme-primary-100': '#eae6dc',
      '--theme-primary-200': '#d5cfc1',
      '--theme-primary-300': '#b4ab99',
      '--theme-primary-400': '#7f7664',
      '--theme-primary-500': '#524b3e',
      '--theme-primary-600': '#383329',
      '--theme-primary-700': '#26231f',
      '--theme-primary-800': '#1a1816',
      '--theme-primary-900': '#12100e',
      '--theme-primary-950': '#0a0908',
      '--theme-bg-page': '#f8f6f0',
      '--theme-bg-muted': '#ede8dd',
      '--theme-accent': '#c5a059',
    },
  },

  // 3. Cool Ivory + Navy (Classic premium medical)
  'cool-ivory-navy': {
    id: 'cool-ivory-navy',
    name: 'Cool Ivory + Navy',
    tagline: 'Classic Premium Medical',
    category: 'Clinical Orthopedics',
    description: 'Crisp cool alabaster off-white with deep prestigious navy and soft blue-gray accents. Instills trust and clinical excellence.',
    backgroundLabel: 'Cool Ivory (#F7F9FA)',
    accentLabel: 'Soft Blue-Gray (#8FAEC8)',
    previewColors: {
      primary: '#133854',
      secondary: '#0e2a40',
      light: '#eff4f8',
      dark: '#050f18',
      accent: '#8faec8',
      background: '#f7f9fa',
    },
    variables: {
      '--theme-primary-50': '#eff5f9',
      '--theme-primary-100': '#dce8f1',
      '--theme-primary-200': '#bcd3e3',
      '--theme-primary-300': '#8faec8',
      '--theme-primary-400': '#567f9f',
      '--theme-primary-500': '#2e5a7b',
      '--theme-primary-600': '#1b4465',
      '--theme-primary-700': '#133854',
      '--theme-primary-800': '#0e2a40',
      '--theme-primary-900': '#091c2b',
      '--theme-primary-950': '#050f18',
      '--theme-bg-page': '#f7f9fa',
      '--theme-bg-muted': '#ebf0f4',
      '--theme-accent': '#8faec8',
    },
  },

  // 4. Warm Sand + Terracotta / Clay (Organic luxury)
  'warm-sand-terracotta': {
    id: 'warm-sand-terracotta',
    name: 'Warm Sand + Terracotta',
    tagline: 'Organic Luxury',
    category: 'Welcoming & Grounded',
    description: 'Warm sandy off-white with earthy Tuscan terracotta clay and sun-warmed amber accents. Comforting, healing, and organic.',
    backgroundLabel: 'Warm Sand (#FAF6F0)',
    accentLabel: 'Earthy Clay (#E7B499)',
    previewColors: {
      primary: '#8a381d',
      secondary: '#6e2b16',
      light: '#fbf4ee',
      dark: '#2d1007',
      accent: '#e7b499',
      background: '#faf6f0',
    },
    variables: {
      '--theme-primary-50': '#fdf7f3',
      '--theme-primary-100': '#faebe0',
      '--theme-primary-200': '#f4d3c0',
      '--theme-primary-300': '#e7b499',
      '--theme-primary-400': '#cf835f',
      '--theme-primary-500': '#b35632',
      '--theme-primary-600': '#9a4223',
      '--theme-primary-700': '#8a381d',
      '--theme-primary-800': '#6e2b16',
      '--theme-primary-900': '#4e1e0f',
      '--theme-primary-950': '#2d1007',
      '--theme-bg-page': '#faf6f0',
      '--theme-bg-muted': '#f0e8dc',
      '--theme-accent': '#e7b499',
    },
  },

  // 5. Pale Stone + Deep Teal (Calm & sophisticated)
  'pale-stone-teal': {
    id: 'pale-stone-teal',
    name: 'Pale Stone + Deep Teal',
    tagline: 'Calm & Sophisticated',
    category: 'Balanced & Restorative',
    description: 'Cool pale stone off-white with deep pacific teal and soft mineral seafoam accents. Conveys serenity and high-touch precision.',
    backgroundLabel: 'Pale Stone (#F5F7F7)',
    accentLabel: 'Soft Seafoam (#86BCBC)',
    previewColors: {
      primary: '#154c4e',
      secondary: '#103c3e',
      light: '#eff6f6',
      dark: '#06191a',
      accent: '#86bcbc',
      background: '#f5f7f7',
    },
    variables: {
      '--theme-primary-50': '#eff6f6',
      '--theme-primary-100': '#dbeef0',
      '--theme-primary-200': '#b9dedf',
      '--theme-primary-300': '#86bcbc',
      '--theme-primary-400': '#529799',
      '--theme-primary-500': '#2e7577',
      '--theme-primary-600': '#1d5a5c',
      '--theme-primary-700': '#154c4e',
      '--theme-primary-800': '#103c3e',
      '--theme-primary-900': '#0c292b',
      '--theme-primary-950': '#06191a',
      '--theme-bg-page': '#f5f7f7',
      '--theme-bg-muted': '#e6ecec',
      '--theme-accent': '#86bcbc',
    },
  },

  // 6. Soft Greige + Black (Minimal luxury)
  'soft-greige-black': {
    id: 'soft-greige-black',
    name: 'Soft Greige + Black',
    tagline: 'Minimal Luxury',
    category: 'Architectural & Refined',
    description: 'Warm gray-beige greige canvas with pure architectural black and soft platinum accents. High-contrast, editorial elegance.',
    backgroundLabel: 'Soft Greige (#F4F3F0)',
    accentLabel: 'Soft Platinum (#D8D5CD)',
    previewColors: {
      primary: '#141312',
      secondary: '#0b0a0a',
      light: '#f5f4f2',
      dark: '#020202',
      accent: '#d8d5cd',
      background: '#f4f3f0',
    },
    variables: {
      '--theme-primary-50': '#f7f6f5',
      '--theme-primary-100': '#ecebe8',
      '--theme-primary-200': '#d8d5cd',
      '--theme-primary-300': '#b4af9e',
      '--theme-primary-400': '#7d7767',
      '--theme-primary-500': '#4d483e',
      '--theme-primary-600': '#25221c',
      '--theme-primary-700': '#141312',
      '--theme-primary-800': '#0d0c0c',
      '--theme-primary-900': '#070707',
      '--theme-primary-950': '#020202',
      '--theme-bg-page': '#f4f3f0',
      '--theme-bg-muted': '#e7e5e0',
      '--theme-accent': '#d8d5cd',
    },
  },
};

// Aliases for seamless backwards compatibility
export const paletteAliases: Record<string, ColorPaletteId> = {
  'emerald-healing': 'soft-ivory-forest',
  'modern-minimal': 'warm-bone-charcoal',
  'warm-earth': 'warm-sand-terracotta',
  'professional-blue': 'cool-ivory-navy',
};

export function resolvePalette(id?: string): ColorPaletteConfig {
  if (!id) return colorPalettes['soft-ivory-forest'];
  if (id in colorPalettes) return colorPalettes[id as ColorPaletteId];
  if (id in paletteAliases) return colorPalettes[paletteAliases[id]];
  return colorPalettes['soft-ivory-forest'];
}
