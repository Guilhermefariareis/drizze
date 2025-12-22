import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  as?: React.ElementType;
}

/**
 * Grid responsivo que se adapta automaticamente aos breakpoints
 * 
 * @param children - Elementos do grid
 * @param className - Classes CSS adicionais
 * @param cols - Número de colunas por breakpoint
 * @param gap - Espaçamento entre elementos por breakpoint
 * @param as - Elemento HTML a ser renderizado (div por padrão)
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  as: Component = 'div',
}) => {
  const breakpoint = useBreakpoint();

  const gridClasses = cn(
    'grid',
    getGridCols(cols[breakpoint] || cols.desktop || 3),
    getGridGap(gap[breakpoint] || gap.desktop || 8),
    className
  );

  return <Component className={gridClasses}>{children}</Component>;
};

/**
 * Grid de cards responsivo com estilização padrão
 */
export const ResponsiveCardGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  as: Component = 'div',
}) => {
  return (
    <ResponsiveGrid
      className={cn('w-full', className)}
      cols={cols}
      gap={gap}
      as={Component}
    >
      {children}
    </ResponsiveGrid>
  );
};

/**
 * Grid fluido que preenche todo o espaço disponível
 */
export const FluidGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  as: Component = 'div',
}) => {
  const breakpoint = useBreakpoint();

  const gridClasses = cn(
    'grid w-full',
    getGridCols(cols[breakpoint] || cols.desktop || 3),
    getGridGap(gap[breakpoint] || gap.desktop || 8),
    'auto-rows-min',
    className
  );

  return <Component className={gridClasses}>{children}</Component>;
};

/**
 * Grid de dashboard com layout específico para métricas
 */
export const DashboardGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 4 },
  gap = { mobile: 4, tablet: 6, desktop: 8 },
  as: Component = 'div',
}) => {
  return (
    <ResponsiveGrid
      className={cn('w-full', className)}
      cols={cols}
      gap={gap}
      as={Component}
    >
      {children}
    </ResponsiveGrid>
  );
};

/**
 * Funções auxiliares para gerar classes CSS
 */
const getGridCols = (cols: number): string => {
  const colsMap: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
  };

  return colsMap[cols] || 'grid-cols-3';
};

const getGridGap = (gap: number): string => {
  const gapMap: { [key: number]: string } = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    7: 'gap-7',
    8: 'gap-8',
    9: 'gap-9',
    10: 'gap-10',
    12: 'gap-12',
    16: 'gap-16',
    20: 'gap-20',
    24: 'gap-24',
  };

  return gapMap[gap] || 'gap-4';
};