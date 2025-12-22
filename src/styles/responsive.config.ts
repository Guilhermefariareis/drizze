/**
 * Configuração centralizada de estilos responsivos
 * Este arquivo contém todas as configurações de responsividade do sistema
 */

// Breakpoints baseados em Tailwind CSS
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Nossos breakpoints customizados para o sistema
export const CUSTOM_BREAKPOINTS = {
  mobile: 767,
  tablet: 1199,
  desktop: 1200,
} as const;

export type CustomBreakpoint = keyof typeof CUSTOM_BREAKPOINTS;

// Configurações de grid responsivo
export const GRID_CONFIG = {
  columns: {
    mobile: 4,    // 4 colunas para mobile
    tablet: 8,    // 8 colunas para tablet
    desktop: 12,  // 12 colunas para desktop
  },
  gaps: {
    mobile: 16,   // 16px gap para mobile
    tablet: 20,   // 20px gap para tablet
    desktop: 24,  // 24px gap para desktop
  },
  margins: {
    mobile: 16,   // 16px margin para mobile
    tablet: 24,   // 24px margin para tablet
    desktop: 32,  // 32px margin para desktop
  },
  paddings: {
    mobile: 16,   // 16px padding para mobile
    tablet: 20,   // 20px padding para tablet
    desktop: 24,  // 24px padding para desktop
  },
} as const;

// Configurações de tipografia responsiva
export const TYPOGRAPHY_CONFIG = {
  fontSizes: {
    // Títulos
    h1: {
      mobile: '2rem',     // 32px
      tablet: '2.5rem',   // 40px
      desktop: '3rem',    // 48px
    },
    h2: {
      mobile: '1.5rem',   // 24px
      tablet: '1.875rem', // 30px
      desktop: '2.25rem', // 36px
    },
    h3: {
      mobile: '1.25rem',  // 20px
      tablet: '1.5rem',   // 24px
      desktop: '1.875rem', // 30px
    },
    h4: {
      mobile: '1.125rem', // 18px
      tablet: '1.25rem',  // 20px
      desktop: '1.5rem',  // 24px
    },
    h5: {
      mobile: '1rem',     // 16px
      tablet: '1.125rem', // 18px
      desktop: '1.25rem', // 20px
    },
    h6: {
      mobile: '0.875rem', // 14px
      tablet: '1rem',     // 16px
      desktop: '1.125rem', // 18px
    },
    // Texto corporal
    body: {
      mobile: '0.875rem', // 14px
      tablet: '1rem',     // 16px
      desktop: '1rem',    // 16px
    },
    small: {
      mobile: '0.75rem',  // 12px
      tablet: '0.875rem', // 14px
      desktop: '0.875rem', // 14px
    },
    caption: {
      mobile: '0.6875rem', // 11px
      tablet: '0.75rem',   // 12px
      desktop: '0.75rem',  // 12px
    },
  },
  lineHeights: {
    tight: {
      mobile: 1.25,
      tablet: 1.3,
      desktop: 1.3,
    },
    normal: {
      mobile: 1.4,
      tablet: 1.5,
      desktop: 1.5,
    },
    relaxed: {
      mobile: 1.6,
      tablet: 1.7,
      desktop: 1.7,
    },
  },
  letterSpacing: {
    tight: {
      mobile: '-0.025em',
      tablet: '-0.025em',
      desktop: '-0.025em',
    },
    normal: {
      mobile: '0',
      tablet: '0',
      desktop: '0',
    },
    wide: {
      mobile: '0.025em',
      tablet: '0.025em',
      desktop: '0.025em',
    },
  },
} as const;

// Configurações de espaçamento responsivo
export const SPACING_CONFIG = {
  // Margens
  margins: {
    none: { mobile: 0, tablet: 0, desktop: 0 },
    xs: { mobile: 4, tablet: 4, desktop: 4 },
    sm: { mobile: 8, tablet: 8, desktop: 8 },
    md: { mobile: 16, tablet: 16, desktop: 16 },
    lg: { mobile: 24, tablet: 24, desktop: 24 },
    xl: { mobile: 32, tablet: 32, desktop: 32 },
    '2xl': { mobile: 48, tablet: 48, desktop: 48 },
    '3xl': { mobile: 64, tablet: 64, desktop: 64 },
  },
  // Paddings
  paddings: {
    none: { mobile: 0, tablet: 0, desktop: 0 },
    xs: { mobile: 4, tablet: 4, desktop: 4 },
    sm: { mobile: 8, tablet: 8, desktop: 8 },
    md: { mobile: 16, tablet: 16, desktop: 16 },
    lg: { mobile: 24, tablet: 24, desktop: 24 },
    xl: { mobile: 32, tablet: 32, desktop: 32 },
    '2xl': { mobile: 48, tablet: 48, desktop: 48 },
    '3xl': { mobile: 64, tablet: 64, desktop: 64 },
  },
  // Gaps
  gaps: {
    none: { mobile: 0, tablet: 0, desktop: 0 },
    xs: { mobile: 4, tablet: 4, desktop: 4 },
    sm: { mobile: 8, tablet: 8, desktop: 8 },
    md: { mobile: 16, tablet: 16, desktop: 16 },
    lg: { mobile: 24, tablet: 24, desktop: 24 },
    xl: { mobile: 32, tablet: 32, desktop: 32 },
    '2xl': { mobile: 48, tablet: 48, desktop: 48 },
    '3xl': { mobile: 64, tablet: 64, desktop: 64 },
  },
} as const;

// Configurações de borda responsiva
export const BORDER_CONFIG = {
  radius: {
    none: { mobile: '0', tablet: '0', desktop: '0' },
    sm: { mobile: '2px', tablet: '2px', desktop: '2px' },
    md: { mobile: '4px', tablet: '4px', desktop: '4px' },
    lg: { mobile: '8px', tablet: '8px', desktop: '8px' },
    xl: { mobile: '12px', tablet: '12px', desktop: '12px' },
    '2xl': { mobile: '16px', tablet: '16px', desktop: '16px' },
    full: { mobile: '9999px', tablet: '9999px', desktop: '9999px' },
  },
  width: {
    none: { mobile: '0', tablet: '0', desktop: '0' },
    sm: { mobile: '1px', tablet: '1px', desktop: '1px' },
    md: { mobile: '2px', tablet: '2px', desktop: '2px' },
    lg: { mobile: '4px', tablet: '4px', desktop: '4px' },
  },
} as const;

// Configurações de sombra responsiva
export const SHADOW_CONFIG = {
  none: { mobile: 'none', tablet: 'none', desktop: 'none' },
  sm: {
    mobile: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    tablet: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    desktop: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  md: {
    mobile: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    tablet: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    desktop: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  lg: {
    mobile: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    tablet: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    desktop: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  xl: {
    mobile: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    tablet: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    desktop: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  '2xl': {
    mobile: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    tablet: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    desktop: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
} as const;

// Configurações de transição responsiva
export const TRANSITION_CONFIG = {
  duration: {
    fast: { mobile: '150ms', tablet: '150ms', desktop: '150ms' },
    normal: { mobile: '200ms', tablet: '200ms', desktop: '200ms' },
    slow: { mobile: '300ms', tablet: '300ms', desktop: '300ms' },
    slower: { mobile: '500ms', tablet: '500ms', desktop: '500ms' },
  },
  timing: {
    linear: { mobile: 'linear', tablet: 'linear', desktop: 'linear' },
    ease: { mobile: 'ease', tablet: 'ease', desktop: 'ease' },
    'ease-in': { mobile: 'ease-in', tablet: 'ease-in', desktop: 'ease-in' },
    'ease-out': { mobile: 'ease-out', tablet: 'ease-out', desktop: 'ease-out' },
    'ease-in-out': { mobile: 'ease-in-out', tablet: 'ease-in-out', desktop: 'ease-in-out' },
  },
} as const;

// Configurações de acessibilidade responsiva
export const ACCESSIBILITY_CONFIG = {
  minTouchTarget: {
    mobile: 44,   // 44px para mobile (iOS guidelines)
    tablet: 44,   // 44px para tablet
    desktop: 32,  // 32px para desktop
  },
  minFontSize: {
    mobile: 14,   // 14px para mobile
    tablet: 14,   // 14px para tablet
    desktop: 12,  // 12px para desktop
  },
  contrastRatio: {
    normal: 4.5,   // WCAG AA
    large: 3,      // WCAG AA for large text
    enhanced: 7,   // WCAG AAA
  },
} as const;

// Configurações de performance responsiva
export const PERFORMANCE_CONFIG = {
  imageQuality: {
    mobile: 70,   // 70% quality for mobile
    tablet: 80,   // 80% quality for tablet
    desktop: 90,  // 90% quality for desktop
  },
  lazyLoadOffset: {
    mobile: 50,   // 50px offset for mobile
    tablet: 100,  // 100px offset for tablet
    desktop: 150, // 150px offset for desktop
  },
  debounceDelay: {
    mobile: 300,  // 300ms for mobile
    tablet: 250,  // 250ms for tablet
    desktop: 200, // 200ms for desktop
  },
} as const;

// Configurações de container responsivo
export const CONTAINER_CONFIG = {
  maxWidths: {
    sm: { mobile: '100%', tablet: '100%', desktop: '640px' },
    md: { mobile: '100%', tablet: '100%', desktop: '768px' },
    lg: { mobile: '100%', tablet: '100%', desktop: '1024px' },
    xl: { mobile: '100%', tablet: '100%', desktop: '1280px' },
    '2xl': { mobile: '100%', tablet: '100%', desktop: '1536px' },
    full: { mobile: '100%', tablet: '100%', desktop: '100%' },
  },
  paddings: {
    none: { mobile: 0, tablet: 0, desktop: 0 },
    sm: { mobile: 16, tablet: 16, desktop: 16 },
    md: { mobile: 16, tablet: 20, desktop: 24 },
    lg: { mobile: 20, tablet: 24, desktop: 32 },
    xl: { mobile: 24, tablet: 32, desktop: 40 },
  },
} as const;

// Função auxiliar para obter configuração responsiva
export function getResponsiveConfig<T>(
  config: Record<string, Record<CustomBreakpoint, T>>,
  key: string,
  breakpoint: CustomBreakpoint
): T {
  const configItem = config[key];
  if (!configItem) {
    throw new Error(`Config key "${key}" not found`);
  }
  return configItem[breakpoint];
}

// Função para criar media queries
export function createMediaQuery(breakpoint: CustomBreakpoint, type: 'min' | 'max' = 'min'): string {
  const width = CUSTOM_BREAKPOINTS[breakpoint];
  const operator = type === 'min' ? '>=' : '<=';
  return `@media (width ${operator} ${width}px)`;
}

// Função para criar range de media queries
export function createMediaQueryRange(minBreakpoint: CustomBreakpoint, maxBreakpoint: CustomBreakpoint): string {
  const minWidth = CUSTOM_BREAKPOINTS[minBreakpoint];
  const maxWidth = CUSTOM_BREAKPOINTS[maxBreakpoint];
  return `@media (width >= ${minWidth}px) and (width <= ${maxWidth}px)`;
}

// Exportar tudo como configuração principal
export const RESPONSIVE_CONFIG = {
  breakpoints: CUSTOM_BREAKPOINTS,
  grid: GRID_CONFIG,
  typography: TYPOGRAPHY_CONFIG,
  spacing: SPACING_CONFIG,
  border: BORDER_CONFIG,
  shadow: SHADOW_CONFIG,
  transition: TRANSITION_CONFIG,
  accessibility: ACCESSIBILITY_CONFIG,
  performance: PERFORMANCE_CONFIG,
  container: CONTAINER_CONFIG,
} as const;