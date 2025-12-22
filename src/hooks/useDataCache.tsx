import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em milissegundos (padrão: 5 minutos)
  maxSize?: number; // Tamanho máximo do cache (padrão: 100 entradas)
  persistToStorage?: boolean; // Persistir no localStorage (padrão: false)
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  private options: Required<CacheOptions>;
  private storageKey = 'doutorizze_data_cache';

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutos
      maxSize: options.maxSize || 100,
      persistToStorage: options.persistToStorage || false
    };

    if (this.options.persistToStorage) {
      this.loadFromStorage();
    }
  }

  set<T>(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.options.ttl;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    // Remove entrada mais antiga se o cache estiver cheio
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, entry);

    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verifica se a entrada expirou
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      if (this.options.persistToStorage) {
        this.saveToStorage();
      }
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (this.options.persistToStorage) {
      this.saveToStorage();
    }
    return result;
  }

  clear(): void {
    this.cache.clear();
    if (this.options.persistToStorage) {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Remove entradas expiradas
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.options.persistToStorage && keysToDelete.length > 0) {
      this.saveToStorage();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      ttl: this.options.ttl,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        expiry: entry.expiry,
        isExpired: Date.now() > entry.expiry
      }))
    };
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        Object.entries(data).forEach(([key, entry]: [string, any]) => {
          if (entry.expiry > now) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('Erro ao carregar cache do localStorage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar cache no localStorage:', error);
    }
  }
}

// Instância global do cache
const globalCache = new DataCache({ persistToStorage: true });

// Hook para usar o cache de dados
export function useDataCache<T>(options: CacheOptions = {}) {
  const cache = useRef(new DataCache(options));
  const [cacheStats, setCacheStats] = useState(cache.current.getStats());

  // Cleanup automático a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      cache.current.cleanup();
      setCacheStats(cache.current.getStats());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const set = useCallback((key: string, data: any, customTtl?: number) => {
    cache.current.set(key, data, customTtl);
    setCacheStats(cache.current.getStats());
  }, []);

  const get = useCallback(<T = any>(key: string): T | null => {
    return cache.current.get<T>(key);
  }, []);

  const has = useCallback((key: string): boolean => {
    return cache.current.has(key);
  }, []);

  const remove = useCallback((key: string): boolean => {
    const result = cache.current.delete(key);
    setCacheStats(cache.current.getStats());
    return result;
  }, []);

  const clear = useCallback(() => {
    cache.current.clear();
    setCacheStats(cache.current.getStats());
  }, []);

  const cleanup = useCallback(() => {
    cache.current.cleanup();
    setCacheStats(cache.current.getStats());
  }, []);

  return {
    set,
    get,
    has,
    remove,
    clear,
    cleanup,
    stats: cacheStats
  };
}

// Hook para cache de dados com fetch automático
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions & {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchInterval?: number;
  } = {}
) {
  console.log('🚨 [CRÍTICO] useCachedData INICIALIZADO');
  console.log('🚨 [CRÍTICO] Key:', key);
  console.log('🚨 [CRÍTICO] Options:', JSON.stringify(options, null, 2));
  
  const {
    enabled = true,
    refetchOnMount = false,
    refetchInterval,
    ...cacheOptions
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number | null>(null);
  
  const { get, set, has } = useDataCache(cacheOptions);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const fetchData = useCallback(async (force = false) => {
    console.log('🚨 [CRÍTICO] useCachedData.fetchData CHAMADO');
    console.log('🚨 [CRÍTICO] Key:', key);
    console.log('🚨 [CRÍTICO] Force:', force);
    console.log('🚨 [CRÍTICO] Enabled:', enabled);
    
    if (!enabled) {
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - DISABLED, retornando');
      return;
    }

    // Verifica se há dados no cache e não é um fetch forçado
    if (!force && has(key)) {
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - Dados encontrados no cache');
      const cachedData = get<T>(key);
      if (cachedData) {
        console.log('🚨 [CRÍTICO] useCachedData.fetchData - Retornando dados do cache:', cachedData);
        setData(cachedData);
        return cachedData;
      }
    }

    console.log('🚨 [CRÍTICO] useCachedData.fetchData - Iniciando fetch real');
    setLoading(true);
    setError(null);

    try {
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - Chamando fetchRef.current()');
      const result = await fetchRef.current();
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - Resultado obtido:', result);
      set(key, result);
      setData(result);
      setLastFetch(Date.now());
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - Dados salvos no cache e state');
      return result;
    } catch (err) {
      console.error('🚨 [CRÍTICO] useCachedData.fetchData - ERRO:', err);
      const error = err instanceof Error ? err : new Error(`Erro no cache: ${String(err)}`);
      setError(error);
      console.error('Erro no useCachedData:', err);
      throw error;
    } finally {
      setLoading(false);
      console.log('🚨 [CRÍTICO] useCachedData.fetchData - Loading definido como false');
    }
  }, [key, enabled, has, get, set]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    setData(null);
    setLastFetch(null);
  }, [key]);

  // Fetch inicial
  useEffect(() => {
    console.log('🚨 [CRÍTICO] useCachedData - useEffect fetch inicial');
    console.log('🚨 [CRÍTICO] Key:', key);
    console.log('🚨 [CRÍTICO] Enabled:', enabled);
    console.log('🚨 [CRÍTICO] RefetchOnMount:', refetchOnMount);
    
    if (enabled) {
      // Verifica se há dados no cache primeiro
      const cachedData = get<T>(key);
      console.log('🚨 [CRÍTICO] useCachedData - Dados no cache:', cachedData);
      
      if (cachedData && !refetchOnMount) {
        console.log('🚨 [CRÍTICO] useCachedData - Usando dados do cache');
        setData(cachedData);
      } else {
        console.log('🚨 [CRÍTICO] useCachedData - Chamando fetchData()');
        fetchData();
      }
    }
  }, [key, enabled, refetchOnMount]);

  // Refetch automático
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refetch,
    invalidate,
    fetchData
  };
}

// Hook para cache global (compartilhado entre componentes)
export function useGlobalCache() {
  const [stats, setStats] = useState(globalCache.getStats());

  const updateStats = useCallback(() => {
    setStats(globalCache.getStats());
  }, []);

  const set = useCallback((key: string, data: any, customTtl?: number) => {
    globalCache.set(key, data, customTtl);
    updateStats();
  }, [updateStats]);

  const get = useCallback(<T = any>(key: string): T | null => {
    return globalCache.get<T>(key);
  }, []);

  const has = useCallback((key: string): boolean => {
    return globalCache.has(key);
  }, []);

  const remove = useCallback((key: string): boolean => {
    const result = globalCache.delete(key);
    updateStats();
    return result;
  }, [updateStats]);

  const clear = useCallback(() => {
    globalCache.clear();
    updateStats();
  }, [updateStats]);

  const cleanup = useCallback(() => {
    globalCache.cleanup();
    updateStats();
  }, [updateStats]);

  return {
    set,
    get,
    has,
    remove,
    clear,
    cleanup,
    stats
  };
}