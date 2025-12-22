import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface BreakpointConfig {
  mobile: { max: number };
  tablet: { min: number; max: number };
  desktop: { min: number };
}

export const BREAKPOINTS: BreakpointConfig = {
  mobile: { max: 767 },
  tablet: { min: 768, max: 1199 },
  desktop: { min: 1200 }
} as const;

/**
 * Hook para detectar o breakpoint atual baseado na largura da janela
 * @returns O breakpoint atual ('mobile', 'tablet', ou 'desktop')
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
    };

    // Definir breakpoint inicial
    handleResize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

/**
 * Função auxiliar para determinar o breakpoint baseado na largura
 */
const getBreakpoint = (width: number): Breakpoint => {
  if (width <= BREAKPOINTS.mobile.max) {
    return 'mobile';
  } else if (width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

/**
 * Hook para verificar se o dispositivo atual é mobile
 * @returns true se for mobile, false caso contrário
 */
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'mobile';
};

/**
 * Hook para verificar se o dispositivo atual é tablet
 * @returns true se for tablet, false caso contrário
 */
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'tablet';
};

/**
 * Hook para verificar se o dispositivo atual é desktop
 * @returns true se for desktop, false caso contrário
 */
export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'desktop';
};

/**
 * Hook para obter a largura atual da janela
 * @returns objeto com width e height atuais
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Hook para detectar orientação do dispositivo
 * @returns 'portrait' ou 'landscape'
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  });

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
};