import { useEffect, useRef, useCallback } from 'react';

interface UseAutoRefreshProps {
  onRefresh: () => Promise<void> | void;
  interval?: number; // em milissegundos
  enabled?: boolean;
  dependencies?: any[]; // dependências que devem resetar o timer
}

export function useAutoRefresh({
  onRefresh,
  interval = 30000, // 30 segundos por padrão
  enabled = true,
  dependencies = []
}: UseAutoRefreshProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(Date.now());
  
  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(async () => {
        try {
          await onRefresh();
          lastRefreshRef.current = Date.now();
        } catch (error) {
          console.error('Erro no auto-refresh:', error);
        }
      }, interval);
    }
  }, [onRefresh, interval, enabled]);
  
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const forceRefresh = useCallback(async () => {
    try {
      await onRefresh();
      lastRefreshRef.current = Date.now();
      // Reiniciar o timer após refresh manual
      startInterval();
    } catch (error) {
      console.error('Erro no refresh manual:', error);
    }
  }, [onRefresh, startInterval]);
  
  // Iniciar/parar o interval quando as props mudarem
  useEffect(() => {
    startInterval();
    return stopInterval;
  }, [startInterval, stopInterval]);
  
  // Reiniciar o timer quando as dependências mudarem
  useEffect(() => {
    if (dependencies.length > 0) {
      startInterval();
    }
  }, dependencies);
  
  // Cleanup no unmount
  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, [stopInterval]);
  
  // Pausar/retomar quando a aba perde/ganha foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else {
        // Verificar se passou muito tempo desde o último refresh
        const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
        if (timeSinceLastRefresh > interval) {
          forceRefresh();
        } else {
          startInterval();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interval, forceRefresh, startInterval, stopInterval]);
  
  return {
    forceRefresh,
    stop: stopInterval,
    start: startInterval,
    lastRefresh: lastRefreshRef.current
  };
}

export default useAutoRefresh;