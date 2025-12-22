import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  };
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: string;
  as?: React.ElementType;
  align?: {
    mobile?: 'left' | 'center' | 'right' | 'justify';
    tablet?: 'left' | 'center' | 'right' | 'justify';
    desktop?: 'left' | 'center' | 'right' | 'justify';
  };
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  truncate?: boolean;
}

/**
 * Componente de texto responsivo que se adapta automaticamente aos breakpoints
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { mobile: 'base', tablet: 'base', desktop: 'base' },
  weight = 'normal',
  color,
  as: Component = 'p',
  align = { mobile: 'left', tablet: 'left', desktop: 'left' },
  lineHeight = 'normal',
  truncate = false,
}) => {
  const breakpoint = useBreakpoint();

  const textClasses = cn(
    getTextSize(size[breakpoint] || size.desktop || 'base'),
    getFontWeight(weight),
    getTextAlign(align[breakpoint] || align.desktop || 'left'),
    getLineHeight(lineHeight),
    color,
    truncate && 'truncate',
    className
  );

  return <Component className={textClasses}>{children}</Component>;
};

/**
 * Título responsivo (h1-h6)
 */
export interface ResponsiveHeadingProps extends Omit<ResponsiveTextProps, 'size'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: {
    mobile?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    tablet?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
    desktop?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  };
}

export const ResponsiveHeading: React.FC<ResponsiveHeadingProps> = ({
  children,
  className,
  level = 1,
  size,
  weight = 'bold',
  color,
  align = { mobile: 'left', tablet: 'left', desktop: 'left' },
  lineHeight = 'tight',
  truncate = false,
}) => {
  const breakpoint = useBreakpoint();
  const Component = `h${level}` as React.ElementType;

  // Tamanhos padrão para headings se não especificados
  const defaultSizes = {
    1: { mobile: '2xl', tablet: '3xl', desktop: '4xl' },
    2: { mobile: 'xl', tablet: '2xl', desktop: '3xl' },
    3: { mobile: 'lg', tablet: 'xl', desktop: '2xl' },
    4: { mobile: 'base', tablet: 'lg', desktop: 'xl' },
    5: { mobile: 'sm', tablet: 'base', desktop: 'lg' },
    6: { mobile: 'xs', tablet: 'sm', desktop: 'base' },
  };

  const currentSize = size?.[breakpoint] || size?.desktop || defaultSizes[level][breakpoint];

  const headingClasses = cn(
    getTextSize(currentSize),
    getFontWeight(weight),
    getTextAlign(align[breakpoint] || align.desktop || 'left'),
    getLineHeight(lineHeight),
    color,
    truncate && 'truncate',
    className
  );

  return <Component className={headingClasses}>{children}</Component>;
};

/**
 * Parágrafo responsivo
 */
export const ResponsiveParagraph: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { mobile: 'sm', tablet: 'base', desktop: 'base' },
  weight = 'normal',
  color = 'text-gray-700',
  align = { mobile: 'left', tablet: 'left', desktop: 'left' },
  lineHeight = 'relaxed',
  truncate = false,
}) => {
  return (
    <ResponsiveText
      className={cn('mb-4 last:mb-0', className)}
      size={size}
      weight={weight}
      color={color}
      as="p"
      align={align}
      lineHeight={lineHeight}
      truncate={truncate}
    >
      {children}
    </ResponsiveText>
  );
};

/**
 * Texto pequeno responsivo (para legendas, notas, etc.)
 */
export const ResponsiveSmall: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { mobile: 'xs', tablet: 'xs', desktop: 'sm' },
  weight = 'normal',
  color = 'text-gray-500',
  align = { mobile: 'left', tablet: 'left', desktop: 'left' },
  lineHeight = 'normal',
  truncate = false,
}) => {
  return (
    <ResponsiveText
      className={className}
      size={size}
      weight={weight}
      color={color}
      as="small"
      align={align}
      lineHeight={lineHeight}
      truncate={truncate}
    >
      {children}
    </ResponsiveText>
  );
};

/**
 * Funções auxiliares para gerar classes CSS
 */
const getTextSize = (size: string): string => {
  const sizeMap: { [key: string]: string } = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  return sizeMap[size] || 'text-base';
};

const getFontWeight = (weight: string): string => {
  const weightMap: { [key: string]: string } = {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  };

  return weightMap[weight] || 'font-normal';
};

const getTextAlign = (align: string): string => {
  const alignMap: { [key: string]: string } = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return alignMap[align] || 'text-left';
};

const getLineHeight = (lineHeight: string): string => {
  const lineHeightMap: { [key: string]: string } = {
    none: 'leading-none',
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  return lineHeightMap[lineHeight] || 'leading-normal';
};