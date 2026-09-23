export type ColorPaletteId =
  | 'ivory-forest'
  | 'bone-charcoal'
  | 'sage-slate'
  | 'navy-gold'
  | 'stone-clay'
  | 'ink-steel';

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
  'ivory-forest': {
    id: 'ivory-forest',
    name: 'Ivory & Forest',
    category: 'Wellness',
    tagline: 'Forest green on warm ivory',
    description: 'Deep forest green paired with warm ivory background.',
    backgroundLabel: 'Warm Ivory',
    accentLabel: 'Forest Sage',
    previewColors: {
      primary: '#245337',
      secondary: '#1B422B',
      background: '#FAF8F5',
      accent: '#6E987C',
      light: '#F0F6F2',
    },
    preview: {
      primary: '#245337',
      accent: '#6E987C',
      bg: '#FAF8F5',
    },
    variables: {
      '--theme-primary-50': '#F0F6F2',
      '--theme-primary-100': '#DFECE3',
      '--theme-primary-200': '#C1D9C9',
      '--theme-primary-300': '#9DBFA8',
      '--theme-primary-400': '#6E987C',
      '--theme-primary-500': '#396D4B',
      '--theme-primary-600': '#245337',
      '--theme-primary-700': '#1B422B',
      '--theme-primary-800': '#153422',
      '--theme-primary-900': '#0E2417',
      '--theme-primary-950': '#07150D',
      '--theme-bg-page': '#FAF8F5',
      '--theme-bg-muted': '#F2EFE9',
      '--theme-accent': '#6E987C',
      '--theme-text': '#1C1917',
      '--color-primary': '#245337',
      '--color-primary-hover': '#1B422B',
      '--color-accent': '#6E987C',
      '--color-bg': '#FAF8F5',
      '--color-text': '#1C1917',
    },
  },
  'bone-charcoal': {
    id: 'bone-charcoal',
    name: 'Bone & Charcoal',
    category: 'Monochrome',
    tagline: 'Charcoal on soft gray',
    description: 'Charcoal primary with neutral gray tones.',
    backgroundLabel: 'Bone / Neutral Gray',
    accentLabel: 'Warm Stone',
    previewColors: {
      primary: '#292524',
      secondary: '#1C1917',
      background: '#F5F5F4',
      accent: '#A8A29E',
      light: '#E7E5E4',
    },
    preview: {
      primary: '#292524',
      accent: '#A8A29E',
      bg: '#F5F5F4',
    },
    variables: {
      '--theme-primary-50': '#F5F5F4',
      '--theme-primary-100': '#E7E5E4',
      '--theme-primary-200': '#D6D3D1',
      '--theme-primary-300': '#A8A29E',
      '--theme-primary-400': '#78716C',
      '--theme-primary-500': '#44403C',
      '--theme-primary-600': '#292524',
      '--theme-primary-700': '#1C1917',
      '--theme-primary-800': '#141211',
      '--theme-primary-900': '#0C0A09',
      '--theme-primary-950': '#050505',
      '--theme-bg-page': '#F5F5F4',
      '--theme-bg-muted': '#EAE8E6',
      '--theme-accent': '#A8A29E',
      '--theme-text': '#1C1917',
      '--color-primary': '#292524',
      '--color-primary-hover': '#1C1917',
      '--color-accent': '#A8A29E',
      '--color-bg': '#F5F5F4',
      '--color-text': '#1C1917',
    },
  },
  'sage-slate': {
    id: 'sage-slate',
    name: 'Sage & Slate',
    category: 'Earthy',
    tagline: 'Slate sage on linen',
    description: 'Muted slate sage with warm linen backgrounds.',
    backgroundLabel: 'Warm Linen',
    accentLabel: 'Sage Slate',
    previewColors: {
      primary: '#3F4F46',
      secondary: '#303D36',
      background: '#F4F1EA',
      accent: '#8A9A8E',
      light: '#E5EAE6',
    },
    preview: {
      primary: '#3F4F46',
      accent: '#8A9A8E',
      bg: '#F4F1EA',
    },
    variables: {
      '--theme-primary-50': '#F4F6F4',
      '--theme-primary-100': '#E5EAE6',
      '--theme-primary-200': '#CBD5CC',
      '--theme-primary-300': '#ABBDB0',
      '--theme-primary-400': '#8A9A8E',
      '--theme-primary-500': '#5A6E63',
      '--theme-primary-600': '#3F4F46',
      '--theme-primary-700': '#303D36',
      '--theme-primary-800': '#232E28',
      '--theme-primary-900': '#161E1A',
      '--theme-primary-950': '#0D1210',
      '--theme-bg-page': '#F4F1EA',
      '--theme-bg-muted': '#EAE5DB',
      '--theme-accent': '#8A9A8E',
      '--theme-text': '#1C1917',
      '--color-primary': '#3F4F46',
      '--color-primary-hover': '#303D36',
      '--color-accent': '#8A9A8E',
      '--color-bg': '#F4F1EA',
      '--color-text': '#1C1917',
    },
  },
  'navy-gold': {
    id: 'navy-gold',
    name: 'Navy & Soft Gold',
    category: 'Classic',
    tagline: 'Deep navy with gold accents',
    description: 'Deep navy blue with warm gold accents.',
    backgroundLabel: 'Soft Cream',
    accentLabel: 'Soft Gold',
    previewColors: {
      primary: '#1E3A5F',
      secondary: '#152A47',
      background: '#F7F4EE',
      accent: '#C4A574',
      light: '#DEE8F2',
    },
    preview: {
      primary: '#1E3A5F',
      accent: '#C4A574',
      bg: '#F7F4EE',
    },
    variables: {
      '--theme-primary-50': '#F0F4F8',
      '--theme-primary-100': '#DEE8F2',
      '--theme-primary-200': '#BED1E4',
      '--theme-primary-300': '#8EB1D2',
      '--theme-primary-400': '#4C7EA8',
      '--theme-primary-500': '#2B5885',
      '--theme-primary-600': '#1E3A5F',
      '--theme-primary-700': '#152A47',
      '--theme-primary-800': '#0F1E33',
      '--theme-primary-900': '#0A1321',
      '--theme-primary-950': '#050A12',
      '--theme-bg-page': '#F7F4EE',
      '--theme-bg-muted': '#EFE9DF',
      '--theme-accent': '#C4A574',
      '--theme-text': '#1C1917',
      '--color-primary': '#1E3A5F',
      '--color-primary-hover': '#152A47',
      '--color-accent': '#C4A574',
      '--color-bg': '#F7F4EE',
      '--color-text': '#1C1917',
    },
  },
  'stone-clay': {
    id: 'stone-clay',
    name: 'Stone & Clay',
    category: 'Warm',
    tagline: 'Warm stone and terracotta',
    description: 'Muted stone paired with clay terracotta.',
    backgroundLabel: 'Warm Sand',
    accentLabel: 'Clay',
    previewColors: {
      primary: '#57534E',
      secondary: '#44403C',
      background: '#FAF6F1',
      accent: '#B08968',
      light: '#EEE9E2',
    },
    preview: {
      primary: '#57534E',
      accent: '#B08968',
      bg: '#FAF6F1',
    },
    variables: {
      '--theme-primary-50': '#F7F5F2',
      '--theme-primary-100': '#EEE9E2',
      '--theme-primary-200': '#DDD3C7',
      '--theme-primary-300': '#C5B4A1',
      '--theme-primary-400': '#B08968',
      '--theme-primary-500': '#786F68',
      '--theme-primary-600': '#57534E',
      '--theme-primary-700': '#44403C',
      '--theme-primary-800': '#312E2B',
      '--theme-primary-900': '#201E1C',
      '--theme-primary-950': '#121110',
      '--theme-bg-page': '#FAF6F1',
      '--theme-bg-muted': '#EFE7DD',
      '--theme-accent': '#B08968',
      '--theme-text': '#1C1917',
      '--color-primary': '#57534E',
      '--color-primary-hover': '#44403C',
      '--color-accent': '#B08968',
      '--color-bg': '#FAF6F1',
      '--color-text': '#1C1917',
    },
  },
  'ink-steel': {
    id: 'ink-steel',
    name: 'Ink & Steel',
    category: 'High Contrast',
    tagline: 'Slate ink with steel blue',
    description: 'Ink dark tone with steel blue accents.',
    backgroundLabel: 'Crisp White / Gray',
    accentLabel: 'Steel Blue',
    previewColors: {
      primary: '#0F172A',
      secondary: '#0B1120',
      background: '#F8FAFC',
      accent: '#3D5A80',
      light: '#E2E8F0',
    },
    preview: {
      primary: '#0F172A',
      accent: '#3D5A80',
      bg: '#F8FAFC',
    },
    variables: {
      '--theme-primary-50': '#F1F5F9',
      '--theme-primary-100': '#E2E8F0',
      '--theme-primary-200': '#CBD5E1',
      '--theme-primary-300': '#94A3B8',
      '--theme-primary-400': '#64748B',
      '--theme-primary-500': '#3D5A80',
      '--theme-primary-600': '#0F172A',
      '--theme-primary-700': '#0B1120',
      '--theme-primary-800': '#080C17',
      '--theme-primary-900': '#04070D',
      '--theme-primary-950': '#020306',
      '--theme-bg-page': '#F8FAFC',
      '--theme-bg-muted': '#EDF2F7',
      '--theme-accent': '#3D5A80',
      '--theme-text': '#0F172A',
      '--color-primary': '#0F172A',
      '--color-primary-hover': '#0B1120',
      '--color-accent': '#3D5A80',
      '--color-bg': '#F8FAFC',
      '--color-text': '#0F172A',
    },
  },
};

export function resolvePalette(paletteId?: string): ColorPalette {
  if (paletteId && paletteId in colorPalettes) {
    return colorPalettes[paletteId as ColorPaletteId];
  }
  return colorPalettes['ivory-forest'];
}

// Utility to generate tint/shade steps for a custom hex color
export function generateCustomShades(hex: string): Record<string, string> {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return {};

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const mix = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, weight: number) => {
    const w1 = weight;
    const w2 = 1 - weight;
    const nr = Math.round(r1 * w1 + r2 * w2);
    const ng = Math.round(g1 * w1 + g2 * w2);
    const nb = Math.round(b1 * w1 + b2 * w2);
    return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
  };

  return {
    '--theme-primary-50': mix(255, 255, 255, r, g, b, 0.92),
    '--theme-primary-100': mix(255, 255, 255, r, g, b, 0.82),
    '--theme-primary-200': mix(255, 255, 255, r, g, b, 0.65),
    '--theme-primary-300': mix(255, 255, 255, r, g, b, 0.45),
    '--theme-primary-400': mix(255, 255, 255, r, g, b, 0.25),
    '--theme-primary-500': mix(255, 255, 255, r, g, b, 0.1),
    '--theme-primary-600': `#${cleanHex}`,
    '--theme-primary-700': mix(0, 0, 0, r, g, b, 0.18),
    '--theme-primary-800': mix(0, 0, 0, r, g, b, 0.35),
    '--theme-primary-900': mix(0, 0, 0, r, g, b, 0.55),
    '--theme-primary-950': mix(0, 0, 0, r, g, b, 0.75),
    '--color-primary': `#${cleanHex}`,
    '--color-primary-hover': mix(0, 0, 0, r, g, b, 0.18),
  };
}
