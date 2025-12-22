import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
  padding?: boolean;
  as?: React.ElementType;
}

/**
 * Container responsivo que se adapta automaticamente aos breakpoints
 * 
 * @param children - Conteúdo do container
 * @param className - Classes CSS adicionais
 * @param maxWidth - Largura máxima do container
 * @param center - Centralizar horizontalmente
 * @param padding - Adicionar padding responsivo
 * @param as - Elemento HTML a ser renderizado (div por padrão)
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  center = true,
  padding = true,
  as: Component = 'div',
}) => {
  const breakpoint = useBreakpoint();

  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    mobile: 'px-4 py-4',
    tablet: 'px-6 py-6',
    desktop: 'px-8 py-8',
  };

  const containerClasses = cn(
    'w-full',
    center && 'mx-auto',
    maxWidthClasses[maxWidth],
    padding && paddingClasses[breakpoint],
    className
  );

  return <Component className={containerClasses}>{children}</Component>;
};

/**
 * Container fluido que ocupa toda a largura disponível
 */
export const FluidContainer: React.FC<Omit<ResponsiveContainerProps, 'maxWidth'>> = ({
  children,
  className,
  center = false,
  padding = true,
  as: Component = 'div',
}) => {
  const breakpoint = useBreakpoint();

  const paddingClasses = {
    mobile: 'px-4 py-4',
    tablet: 'px-6 py-6',
    desktop: 'px-8 py-8',
  };

  const containerClasses = cn(
    'w-full',
    center && 'mx-auto',
    padding && paddingClasses[breakpoint],
    className
  );

  return <Component className={containerClasses}>{children}</Component>;
};

/**
 * Container centralizado com largura fixa para desktop
 */
export const CenteredContainer: React.FC<Omit<ResponsiveContainerProps, 'center'>> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
  as: Component = 'div',
}) => {
  return (
    <ResponsiveContainer
      className={cn('min-h-screen flex items-center justify-center', className)}
      maxWidth={maxWidth}
      center={true}
      padding={padding}
      as={Component}
    >
      <div className="w-full">{children}</div>
    </ResponsiveContainer>
  );
};