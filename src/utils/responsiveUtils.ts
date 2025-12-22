import { useBreakpoint } from '@/hooks/useBreakpoint';

/**
 * Utilitários responsivos para uso em todo o sistema
 */

// Configurações de breakpoints
export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1199,
  desktop: 1200,
} as const;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Mapeamento de valores responsivos
export type ResponsiveValue<T> = {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};

/**
 * Hook para obter valores responsivos baseados no breakpoint atual
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T>, defaultValue?: T): T | undefined {
  const breakpoint = useBreakpoint();
  
  // Retorna o valor específico para o breakpoint atual
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }
  
  // Fallback para desktop se não houver valor específico
  if (breakpoint === 'mobile' && values.tablet !== undefined) {
    return values.tablet;
  }
  
  if ((breakpoint === 'mobile' || breakpoint === 'tablet') && values.desktop !== undefined) {
    return values.desktop;
  }
  
  // Retorna o valor padrão se nenhum valor for encontrado
  return defaultValue;
}

/**
 * Função para obter valores responsivos sem hook (para uso fora de componentes)
 */
export function getResponsiveValue<T>(breakpoint: Breakpoint, values: ResponsiveValue<T>, defaultValue?: T): T | undefined {
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }
  
  // Fallback para desktop se não houver valor específico
  if (breakpoint === 'mobile' && values.tablet !== undefined) {
    return values.tablet;
  }
  
  if ((breakpoint === 'mobile' || breakpoint === 'tablet') && values.desktop !== undefined) {
    return values.desktop;
  }
  
  return defaultValue;
}

/**
 * Configurações de espaçamento responsivo
 */
export const SPACING = {
  none: { mobile: 0, tablet: 0, desktop: 0 },
  xs: { mobile: 2, tablet: 2, desktop: 2 },
  sm: { mobile: 3, tablet: 4, desktop: 4 },
  md: { mobile: 4, tablet: 5, desktop: 6 },
  lg: { mobile: 5, tablet: 6, desktop: 8 },
  xl: { mobile: 6, tablet: 8, desktop: 10 },
  '2xl': { mobile: 8, tablet: 10, desktop: 12 },
  '3xl': { mobile: 10, tablet: 12, desktop: 16 },
} as const;

export type SpacingSize = keyof typeof SPACING;

/**
 * Hook para obter valores de espaçamento responsivo
 */
export function useResponsiveSpacing(size: SpacingSize): number {
  const breakpoint = useBreakpoint();
  return SPACING[size][breakpoint];
}

/**
 * Configurações de tamanho de fonte responsivo
 */
export const FONT_SIZES = {
  xs: { mobile: '0.75rem', tablet: '0.75rem', desktop: '0.75rem' },
  sm: { mobile: '0.875rem', tablet: '0.875rem', desktop: '0.875rem' },
  base: { mobile: '0.875rem', tablet: '1rem', desktop: '1rem' },
  lg: { mobile: '1rem', tablet: '1.125rem', desktop: '1.125rem' },
  xl: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.25rem' },
  '2xl': { mobile: '1.25rem', tablet: '1.5rem', desktop: '1.5rem' },
  '3xl': { mobile: '1.5rem', tablet: '1.875rem', desktop: '1.875rem' },
  '4xl': { mobile: '1.875rem', tablet: '2.25rem', desktop: '2.25rem' },
  '5xl': { mobile: '2.25rem', tablet: '3rem', desktop: '3rem' },
} as const;

export type FontSize = keyof typeof FONT_SIZES;

/**
 * Hook para obter tamanho de fonte responsivo
 */
export function useResponsiveFontSize(size: FontSize): string {
  const breakpoint = useBreakpoint();
  return FONT_SIZES[size][breakpoint];
}

/**
 * Configurações de largura de container responsivo
 */
export const CONTAINER_WIDTHS = {
  sm: { mobile: '100%', tablet: '100%', desktop: '640px' },
  md: { mobile: '100%', tablet: '100%', desktop: '768px' },
  lg: { mobile: '100%', tablet: '100%', desktop: '1024px' },
  xl: { mobile: '100%', tablet: '100%', desktop: '1280px' },
  '2xl': { mobile: '100%', tablet: '100%', desktop: '1536px' },
  full: { mobile: '100%', tablet: '100%', desktop: '100%' },
} as const;

export type ContainerWidth = keyof typeof CONTAINER_WIDTHS;

/**
 * Hook para obter largura de container responsiva
 */
export function useResponsiveContainerWidth(width: ContainerWidth): string {
  const breakpoint = useBreakpoint();
  return CONTAINER_WIDTHS[width][breakpoint];
}

/**
 * Configurações de grid responsivo
 */
export const GRID_COLUMNS = {
  1: { mobile: 1, tablet: 1, desktop: 1 },
  2: { mobile: 1, tablet: 2, desktop: 2 },
  3: { mobile: 1, tablet: 2, desktop: 3 },
  4: { mobile: 2, tablet: 2, desktop: 4 },
  5: { mobile: 2, tablet: 3, desktop: 5 },
  6: { mobile: 2, tablet: 3, desktop: 6 },
  8: { mobile: 2, tablet: 4, desktop: 8 },
  12: { mobile: 2, tablet: 4, desktop: 12 },
} as const;

export type GridColumns = keyof typeof GRID_COLUMNS;

/**
 * Hook para obter número de colunas de grid responsivo
 */
export function useResponsiveGridColumns(columns: GridColumns): number {
  const breakpoint = useBreakpoint();
  return GRID_COLUMNS[columns][breakpoint];
}

/**
 * Função auxiliar para detectar o breakpoint baseado na largura da janela
 */
export function getBreakpointFromWidth(width: number): Breakpoint {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

/**
 * Configurações de altura responsiva
 */
export const HEIGHTS = {
  auto: { mobile: 'auto', tablet: 'auto', desktop: 'auto' },
  screen: { mobile: '100vh', tablet: '100vh', desktop: '100vh' },
  header: { mobile: '64px', tablet: '64px', desktop: '64px' },
  sidebar: { mobile: '100vh', tablet: '100vh', desktop: '100vh' },
  card: { mobile: 'auto', tablet: 'auto', desktop: 'auto' },
  button: { mobile: '40px', tablet: '40px', desktop: '40px' },
  input: { mobile: '40px', tablet: '40px', desktop: '40px' },
} as const;

export type HeightType = keyof typeof HEIGHTS;

/**
 * Hook para obter altura responsiva
 */
export function useResponsiveHeight(height: HeightType): string {
  const breakpoint = useBreakpoint();
  return HEIGHTS[height][breakpoint];
}

/**
 * Configurações de largura responsiva
 */
export const WIDTHS = {
  auto: { mobile: 'auto', tablet: 'auto', desktop: 'auto' },
  full: { mobile: '100%', tablet: '100%', desktop: '100%' },
  screen: { mobile: '100vw', tablet: '100vw', desktop: '100vw' },
  sidebar: { mobile: '280px', tablet: '300px', desktop: '320px' },
  drawer: { mobile: '280px', tablet: '300px', desktop: '320px' },
  modal: { mobile: '90%', tablet: '80%', desktop: '600px' },
  card: { mobile: '100%', tablet: '100%', desktop: '100%' },
} as const;

export type WidthType = keyof typeof WIDTHS;

/**
 * Hook para obter largura responsiva
 */
export function useResponsiveWidth(width: WidthType): string {
  const breakpoint = useBreakpoint();
  return WIDTHS[width][breakpoint];
}

/**
 * Classes utilitárias de responsividade
 */
export const RESPONSIVE_CLASSES = {
  // Display
  hidden: {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'hidden',
  },
  block: {
    mobile: 'block',
    tablet: 'block',
    desktop: 'block',
  },
  flex: {
    mobile: 'flex',
    tablet: 'flex',
    desktop: 'flex',
  },
  grid: {
    mobile: 'grid',
    tablet: 'grid',
    desktop: 'grid',
  },
  
  // Flex direction
  'flex-col': {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-col',
  },
  'flex-row': {
    mobile: 'flex-row',
    tablet: 'flex-row',
    desktop: 'flex-row',
  },
  
  // Text alignment
  'text-left': {
    mobile: 'text-left',
    tablet: 'text-left',
    desktop: 'text-left',
  },
  'text-center': {
    mobile: 'text-center',
    tablet: 'text-center',
    desktop: 'text-center',
  },
  'text-right': {
    mobile: 'text-right',
    tablet: 'text-right',
    desktop: 'text-right',
  },
  
  // Overflow
  'overflow-hidden': {
    mobile: 'overflow-hidden',
    tablet: 'overflow-hidden',
    desktop: 'overflow-hidden',
  },
  'overflow-auto': {
    mobile: 'overflow-auto',
    tablet: 'overflow-auto',
    desktop: 'overflow-auto',
  },
  'overflow-scroll': {
    mobile: 'overflow-scroll',
    tablet: 'overflow-scroll',
    desktop: 'overflow-scroll',
  },
} as const;

export type ResponsiveClass = keyof typeof RESPONSIVE_CLASSES;

/**
 * Hook para obter classes utilitárias responsivas
 */
export function useResponsiveClass(className: ResponsiveClass): string {
  const breakpoint = useBreakpoint();
  return RESPONSIVE_CLASSES[className][breakpoint];
}

/**
 * Função para criar classes CSS responsivas condicionalmente
 */
export function cnResponsive(
  classes: Partial<Record<Breakpoint, string>>,
  ...additionalClasses: (string | undefined | null)[]
): string {
  const breakpoint = useBreakpoint();
  
  const responsiveClass = classes[breakpoint];
  const additionalClass = additionalClasses.filter(Boolean).join(' ');
  
  return [responsiveClass, additionalClass].filter(Boolean).join(' ');
}

/**
 * Configurações de animação responsiva
 */
export const ANIMATIONS = {
  none: { mobile: '', tablet: '', desktop: '' },
  fade: {
    mobile: 'transition-opacity duration-200',
    tablet: 'transition-opacity duration-200',
    desktop: 'transition-opacity duration-200',
  },
  slide: {
    mobile: 'transition-transform duration-200',
    tablet: 'transition-transform duration-200',
    desktop: 'transition-transform duration-200',
  },
  scale: {
    mobile: 'transition-transform duration-200',
    tablet: 'transition-transform duration-200',
    desktop: 'transition-transform duration-200',
  },
  all: {
    mobile: 'transition-all duration-200',
    tablet: 'transition-all duration-200',
    desktop: 'transition-all duration-200',
  },
} as const;

export type AnimationType = keyof typeof ANIMATIONS;

/**
 * Hook para obter classes de animação responsiva
 */
export function useResponsiveAnimation(type: AnimationType): string {
  const breakpoint = useBreakpoint();
  return ANIMATIONS[type][breakpoint];
}

/**
 * Configurações de z-index responsivo
 */
export const Z_INDEXES = {
  hide: { mobile: -1, tablet: -1, desktop: -1 },
  base: { mobile: 0, tablet: 0, desktop: 0 },
  dropdown: { mobile: 1000, tablet: 1000, desktop: 1000 },
  sticky: { mobile: 1100, tablet: 1100, desktop: 1100 },
  banner: { mobile: 1200, tablet: 1200, desktop: 1200 },
  overlay: { mobile: 1300, tablet: 1300, desktop: 1300 },
  modal: { mobile: 1400, tablet: 1400, desktop: 1400 },
  popover: { mobile: 1500, tablet: 1500, desktop: 1500 },
  skipLink: { mobile: 1600, tablet: 1600, desktop: 1600 },
  toast: { mobile: 1700, tablet: 1700, desktop: 1700 },
  tooltip: { mobile: 1800, tablet: 1800, desktop: 1800 },
} as const;

export type ZIndexType = keyof typeof Z_INDEXES;

/**
 * Hook para obter z-index responsivo
 */
export function useResponsiveZIndex(type: ZIndexType): number {
  const breakpoint = useBreakpoint();
  return Z_INDEXES[type][breakpoint];
}