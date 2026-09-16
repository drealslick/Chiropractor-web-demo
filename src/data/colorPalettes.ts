export type ColorPaletteId = 'emerald-healing' | 'modern-minimal' | 'warm-earth' | 'professional-blue';

export interface ColorPaletteConfig {
  id: ColorPaletteId;
  name: string;
  category: string;
  description: string;
  previewColors: {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
    accent: string;
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
  };
}

export const colorPalettes: Record<ColorPaletteId, ColorPaletteConfig> = {
  'emerald-healing': {
    id: 'emerald-healing',
    name: 'Restorative Green',
    category: 'Holistic & Clinical',
    description: 'Clean forest & sage tones symbolizing recovery, spine alignment, and vital physical renewal.',
    previewColors: {
      primary: '#047857', // emerald-700
      secondary: '#065f46', // emerald-800
      light: '#ecfdf5', // emerald-50
      dark: '#022c22', // emerald-950
      accent: '#fbbf24', // amber-400
    },
    variables: {
      '--theme-primary-50': '#ecfdf5',
      '--theme-primary-100': '#d1fae5',
      '--theme-primary-200': '#a7f3d0',
      '--theme-primary-300': '#6ee7b7',
      '--theme-primary-400': '#34d399',
      '--theme-primary-500': '#10b981',
      '--theme-primary-600': '#059669',
      '--theme-primary-700': '#047857',
      '--theme-primary-800': '#065f46',
      '--theme-primary-900': '#064e3b',
      '--theme-primary-950': '#022c22',
    }
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'Sleek & Contemporary',
    description: 'High-contrast charcoal, deep obsidian and zinc slate with crisp platinum highlights for cutting-edge clinics.',
    previewColors: {
      primary: '#27272a', // zinc-800
      secondary: '#18181b', // zinc-900
      light: '#f4f4f5', // zinc-100
      dark: '#09090b', // zinc-950
      accent: '#38bdf8', // sky-400
    },
    variables: {
      '--theme-primary-50': '#f4f4f5',
      '--theme-primary-100': '#e4e4e7',
      '--theme-primary-200': '#d4d4d8',
      '--theme-primary-300': '#a1a1aa',
      '--theme-primary-400': '#71717a',
      '--theme-primary-500': '#52525b',
      '--theme-primary-600': '#3f3f46',
      '--theme-primary-700': '#27272a',
      '--theme-primary-800': '#18181b',
      '--theme-primary-900': '#09090b',
      '--theme-primary-950': '#040405',
    }
  },
  'warm-earth': {
    id: 'warm-earth',
    name: 'Warm Earth',
    category: 'Organic & Welcoming',
    description: 'Earthy terracotta, warm clay and amber cinnamon tones creating an inviting, comforting healing space.',
    previewColors: {
      primary: '#c2410c', // orange-700 / terracotta
      secondary: '#9a3412', // orange-800
      light: '#fff7ed', // orange-50
      dark: '#431407', // orange-950
      accent: '#f59e0b', // amber-500
    },
    variables: {
      '--theme-primary-50': '#fff7ed',
      '--theme-primary-100': '#ffedd5',
      '--theme-primary-200': '#fed7aa',
      '--theme-primary-300': '#fdba74',
      '--theme-primary-400': '#fb923c',
      '--theme-primary-500': '#f97316',
      '--theme-primary-600': '#ea580c',
      '--theme-primary-700': '#c2410c',
      '--theme-primary-800': '#9a3412',
      '--theme-primary-900': '#7c2d12',
      '--theme-primary-950': '#431407',
    }
  },
  'professional-blue': {
    id: 'professional-blue',
    name: 'Professional Blue',
    category: 'Clinical & Orthopedic',
    description: 'Deep navy, medical cyan and trust-instilling cobalt for established sports medicine & orthopedics.',
    previewColors: {
      primary: '#0369a1', // sky-700 / ocean blue
      secondary: '#075985', // sky-800
      light: '#f0f9ff', // sky-50
      dark: '#082f49', // sky-950
      accent: '#38bdf8', // sky-400
    },
    variables: {
      '--theme-primary-50': '#f0f9ff',
      '--theme-primary-100': '#e0f2fe',
      '--theme-primary-200': '#bae6fd',
      '--theme-primary-300': '#7dd3fc',
      '--theme-primary-400': '#38bdf8',
      '--theme-primary-500': '#0ea5e9',
      '--theme-primary-600': '#0284c7',
      '--theme-primary-700': '#0369a1',
      '--theme-primary-800': '#075985',
      '--theme-primary-900': '#0c4a6e',
      '--theme-primary-950': '#082f49',
    }
  }
};
