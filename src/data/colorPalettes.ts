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
    category: 'Default wellness',
    tagline: 'Default wellness',
    description: 'Deep forest greens paired with soft restorative ivory background tones.',
    backgroundLabel: 'Soft Restorative Ivory',
    accentLabel: 'Forest Sage Accent',
    previewColors: {
      primary: '#245337',
      secondary: '#1d422c',
      background: '#FAF8F5',
      accent: '#6E987C',
      light: '#e8eedf',
    },
    preview: {
      primary: '#245337',
      accent: '#6E987C',
      bg: '#FAF8F5',
    },
    variables: {
      '--color-primary': '#245337',
      '--color-primary-hover': '#1d422c',
      '--color-accent': '#6E987C',
      '--color-bg': '#FAF8F5',
      '--color-text': '#1C1917',
    },
  },
  'bone-charcoal': {
    id: 'bone-charcoal',
    name: 'Bone & Charcoal',
    category: 'Quiet private practice',
    tagline: 'Quiet private practice',
    description: 'Sleek, clinical charcoal tones and soft, premium bone canvas backgrounds.',
    backgroundLabel: 'Soft Bone Background',
    accentLabel: 'Warm Stone Accent',
    previewColors: {
      primary: '#292524',
      secondary: '#1c1917',
      background: '#F5F5F4',
      accent: '#A8A29E',
      light: '#e7e5e4',
    },
    preview: {
      primary: '#292524',
      accent: '#A8A29E',
      bg: '#F5F5F4',
    },
    variables: {
      '--color-primary': '#292524',
      '--color-primary-hover': '#1c1917',
      '--color-accent': '#A8A29E',
      '--color-bg': '#F5F5F4',
      '--color-text': '#1C1917',
    },
  },
  'sage-slate': {
    id: 'sage-slate',
    name: 'Sage & Slate',
    category: 'Family / osteo',
    tagline: 'Family / osteo',
    description: 'Earth-informed clinical tones perfect for multi-generational practices.',
    backgroundLabel: 'Warm Linen Background',
    accentLabel: 'Earthy Sage Accent',
    previewColors: {
      primary: '#3F4F46',
      secondary: '#323f38',
      background: '#F4F1EA',
      accent: '#8A9A8E',
      light: '#e1dbcd',
    },
    preview: {
      primary: '#3F4F46',
      accent: '#8A9A8E',
      bg: '#F4F1EA',
    },
    variables: {
      '--color-primary': '#3F4F46',
      '--color-primary-hover': '#323f38',
      '--color-accent': '#8A9A8E',
      '--color-bg': '#F4F1EA',
      '--color-text': '#1C1917',
    },
  },
  'navy-gold': {
    id: 'navy-gold',
    name: 'Navy & Soft Gold',
    category: 'City private',
    tagline: 'City private',
    description: 'Elite royal navy paired with luxurious warm gold highlights.',
    backgroundLabel: 'Cream Canvas Background',
    accentLabel: 'Warm Gold Accent',
    previewColors: {
      primary: '#1E3A5F',
      secondary: '#162b46',
      background: '#F7F4EE',
      accent: '#C4A574',
      light: '#e7e0d3',
    },
    preview: {
      primary: '#1E3A5F',
      accent: '#C4A574',
      bg: '#F7F4EE',
    },
    variables: {
      '--color-primary': '#1E3A5F',
      '--color-primary-hover': '#162b46',
      '--color-accent': '#C4A574',
      '--color-bg': '#F7F4EE',
      '--color-text': '#1C1917',
    },
  },
  'stone-clay': {
    id: 'stone-clay',
    name: 'Stone & Clay',
    category: 'Warm neighbourhood',
    tagline: 'Warm neighbourhood',
    description: 'Deep stone paired with welcoming, organic clay tones.',
    backgroundLabel: 'Warm Sand Background',
    accentLabel: 'Warm Clay Accent',
    previewColors: {
      primary: '#57534E',
      secondary: '#44403c',
      background: '#FAF6F1',
      accent: '#B08968',
      light: '#eedccb',
    },
    preview: {
      primary: '#57534E',
      accent: '#B08968',
      bg: '#FAF6F1',
    },
    variables: {
      '--color-primary': '#57534E',
      '--color-primary-hover': '#44403c',
      '--color-accent': '#B08968',
      '--color-bg': '#FAF6F1',
      '--color-text': '#1C1917',
    },
  },
  'ink-steel': {
    id: 'ink-steel',
    name: 'Ink & Steel',
    category: 'Sports / rehab',
    tagline: 'Sports / rehab',
    description: 'High-contrast clinical ink black with steel blue indicators.',
    backgroundLabel: 'Crisp Snow Background',
    accentLabel: 'Sleek Steel Accent',
    previewColors: {
      primary: '#0F172A',
      secondary: '#020617',
      background: '#F8FAFC',
      accent: '#3D5A80',
      light: '#e2e8f0',
    },
    preview: {
      primary: '#0F172A',
      accent: '#3D5A80',
      bg: '#F8FAFC',
    },
    variables: {
      '--color-primary': '#0F172A',
      '--color-primary-hover': '#020617',
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
