export interface ColorPalette {
  id: string;
  name: string;
  preview: {
    primary: string;
    accent: string;
    bg: string;
  };
  variables: Record<string, string>;
}

export type ColorPaletteId = 'emerald-stone' | 'navy-gold' | 'clinical-blue' | 'charcoal-teal';

export const colorPalettes: Record<string, ColorPalette> = {
  'emerald-stone': {
    id: 'emerald-stone',
    name: 'Emerald & Stone (Default)',
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
    name: 'Royal Navy & Gold',
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
  'clinical-blue': {
    id: 'clinical-blue',
    name: 'Clinical Cyan & Slate',
    preview: {
      primary: '#0284c7',
      accent: '#06b6d4',
      bg: '#f0f9ff',
    },
    variables: {
      '--color-primary': '#0284c7',
      '--color-primary-hover': '#0369a1',
      '--color-accent': '#06b6d4',
      '--color-bg': '#f0f9ff',
      '--color-text': '#0c4a6e',
    },
  },
  'charcoal-teal': {
    id: 'charcoal-teal',
    name: 'Charcoal & Alpine Teal',
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
};

export function resolvePalette(paletteId?: string): ColorPalette {
  if (paletteId && colorPalettes[paletteId]) {
    return colorPalettes[paletteId];
  }
  return colorPalettes['emerald-stone'];
}
