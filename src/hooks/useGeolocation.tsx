import { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  loading: boolean;
  error: string | null;
  status?: 'gps' | 'ip' | 'manual' | 'fallback';
  message?: string;
  requestLocation: () => void;
  manualOverride?: (city: string, state: string) => void;
  clearCache: () => void;
  testTrindadeLocation?: () => void;
}

interface CachedLocation {
  city: string;
  state: string;
  country: string;
  timestamp: number;
  coordinates?: { lat: number; lng: number };
}

interface GeocodeResult {
  city: string;
  state: string;
  country: string;
  confidence: number;
  source: string;
}

interface IPLocationResult {
  city: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Função para calcular distância entre duas coordenadas
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para detectar cidade específica baseada em coordenadas
function detectSpecificCity(lat: number, lng: number): string | null {
  const cities = [
    { name: 'Trindade', lat: -16.6469, lng: -49.4889, radius: 35 }, // Aumentado de 25 para 35km
    { name: 'Goiânia', lat: -16.6869, lng: -49.2648, radius: 30 },
    { name: 'Aparecida de Goiânia', lat: -16.8173, lng: -49.2436, radius: 20 },
    { name: 'Senador Canedo', lat: -16.7011, lng: -49.0919, radius: 15 },
    { name: 'Hidrolândia', lat: -16.9619, lng: -49.2297, radius: 15 },
    { name: 'Nerópolis', lat: -16.4053, lng: -49.2197, radius: 15 }
  ];

  for (const city of cities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance <= city.radius) {
      return city.name;
    }
  }
  
  return null;
}

// Geocoding com Nominatim (OpenStreetMap) - com tratamento de erro melhorado
async function geocodeNominatim(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat.toFixed(8)}&lon=${lng.toFixed(8)}&accept-language=pt&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      const city = address.city || address.town || address.village || address.municipality;
      const state = address.state;
      
      if (city) {
        // Correção específica: se retornar "Campestre de Goiás" mas estiver próximo de Trindade, corrigir
        let correctedCity = city;
        if (city.toLowerCase().includes('campestre') && city.toLowerCase().includes('goiás')) {
          const distanceToTrindade = calculateDistance(lat, lng, -16.6469, -49.4889);
          if (distanceToTrindade <= 35) { // Dentro do raio de Trindade
            correctedCity = 'Trindade';
            console.log(`[useGeolocation] Corrigido: "${city}" → "Trindade" (distância: ${distanceToTrindade.toFixed(1)}km)`);
          }
        }
        
        return {
          city: correctedCity,
          state: state || 'Goiás',
          country: address.country || 'Brasil',
          confidence: 0.9,
          source: 'Nominatim'
        };
      }
    }
  } catch (error) {
    // Log apenas como warning para reduzir ruído
    console.warn('[useGeolocation] Erro Nominatim:', (error as Error).message);
  }
  return null;
}

// Geocoding com coordenadas locais (melhorado para Goiás)
async function geocodeViaCEP(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    // Coordenadas conhecidas de cidades de Goiás
    const cities = [
      { name: 'Trindade', state: 'Goiás', lat: -16.6469, lng: -49.4889, radius: 35 }, // Aumentado de 25 para 35km
      { name: 'Goiânia', state: 'Goiás', lat: -16.6869, lng: -49.2648, radius: 30 },
      { name: 'Aparecida de Goiânia', state: 'Goiás', lat: -16.8173, lng: -49.2436, radius: 20 },
      { name: 'Senador Canedo', state: 'Goiás', lat: -16.7011, lng: -49.0919, radius: 15 },
      { name: 'Hidrolândia', state: 'Goiás', lat: -16.9619, lng: -49.2297, radius: 15 },
      { name: 'Nerópolis', state: 'Goiás', lat: -16.4053, lng: -49.2197, radius: 15 }
    ];
    
    let bestMatch = null;
    let shortestDistance = Infinity;
    
    for (const city of cities) {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      
      if (distance < city.radius && distance < shortestDistance) {
        shortestDistance = distance;
        bestMatch = {
          city: city.name,
          state: city.state,
          country: 'Brasil',
          confidence: Math.max(0.7, 1 - (distance / city.radius) * 0.3),
          source: `Coordenadas Locais (${distance.toFixed(1)}km)`
        };
      }
    }
    
    if (bestMatch) {
      return bestMatch;
    }
    
  } catch (error) {
    console.warn('[useGeolocation] Erro coordenadas locais:', (error as Error).message);
  }
  return null;
}

// Função principal de geocodificação reversa
async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  // Primeiro, tentar detecção específica de cidades conhecidas
  const specificCity = detectSpecificCity(lat, lng);
  if (specificCity) {
    return {
      city: specificCity,
      state: 'Goiás',
      country: 'Brasil',
      confidence: 0.95,
      source: 'Detecção Específica'
    };
  }

  // Tentar múltiplos serviços de geocodificação
  const results: GeocodeResult[] = [];
  
  // Tentar Nominatim
  const nominatimResult = await geocodeNominatim(lat, lng);
  if (nominatimResult) {
    results.push(nominatimResult);
  }
  
  // Tentar coordenadas locais
  const localResult = await geocodeViaCEP(lat, lng);
  if (localResult) {
    results.push(localResult);
  }
  
  // Se não encontrou nada, usar fallback regional
  if (results.length === 0) {
    const cities = ['Goiânia', 'Trindade', 'Aparecida de Goiânia', 'Senador Canedo'];
    let closestCity = 'Goiânia';
    let minDistance = Infinity;
    
    const cityCoords = {
      'Goiânia': { lat: -16.6869, lng: -49.2648 },
      'Trindade': { lat: -16.6469, lng: -49.4889 },
      'Aparecida de Goiânia': { lat: -16.8173, lng: -49.2436 },
      'Senador Canedo': { lat: -16.7011, lng: -49.0919 }
    };
    
    cities.forEach(city => {
      const coords = cityCoords[city as keyof typeof cityCoords];
      const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });
    
    // Se a distância for muito grande (>50km), usar um fallback mais genérico
    if (minDistance > 50) {
      closestCity = 'Região Metropolitana de Goiânia';
    }
    
    return {
      city: closestCity,
      state: 'Goiás',
      country: 'Brasil',
      confidence: minDistance < 20 ? 0.3 : 0.1,
      source: 'Fallback Regional'
    };
  }
  
  // Escolher o resultado com maior confiança
  const bestResult = results.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  return bestResult;
}

export function useGeolocation(): LocationData {
  const [location, setLocation] = useState<Omit<LocationData, 'requestLocation' | 'manualOverride'>>({
    city: '',
    state: '',
    country: 'Brasil',
    latitude: undefined,
    longitude: undefined,
    loading: true,
    error: null,
    status: undefined,
    message: undefined,
  });

  const isSecure = typeof window !== 'undefined' ? window.location.protocol === 'https:' : true;
  const isMobile = typeof navigator !== 'undefined' ? /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) : false;
  const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection;
  const slowNetwork = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' || (connection.rtt && connection.rtt > 300));

  // Fallback por IP (HTTPS) — tenta ipapi.co e ipwhois.app
  const getIPLocation = async (): Promise<IPLocationResult | null> => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }
    } catch (_) {}
    try {
      const res2 = await fetch('https://ipwhois.app/json/');
      if (res2.ok) {
        const data2 = await res2.json();
        return {
          city: data2.city,
          region: data2.region,
          country: data2.country,
          latitude: parseFloat(data2.latitude),
          longitude: parseFloat(data2.longitude),
        };
      }
    } catch (_) {}
    return null;
  };

  const getCurrentLocation = async (retryCount = 0) => {
    const maxRetries = 3; // Aumentar tentativas para mobile

    if (!navigator.geolocation) {
      setLocation({
        city: 'Goiânia',
        state: 'Goiás',
        country: 'Brasil',
        latitude: -16.6869,
        longitude: -49.2648,
        loading: false,
        error: 'Seu navegador não suporta geolocalização.',
        status: 'fallback',
        message: 'Usando localização padrão de Goiânia.'
      });
      return;
    }

    // Se não for HTTPS, muitos navegadores móveis bloqueiam geolocalização
    if (!isSecure) {
      try {
        setLocation(prev => ({ ...prev, loading: true, error: null, status: undefined, message: undefined }));
        const ipLoc = await getIPLocation();
        if (ipLoc?.city) {
          setLocation({
            city: ipLoc.city,
            state: ipLoc.region || 'Goiás',
            country: ipLoc.country || 'Brasil',
            latitude: ipLoc.latitude,
            longitude: ipLoc.longitude,
            loading: false,
            error: 'Geolocalização requer conexão segura (HTTPS).',
            status: 'ip',
            message: 'Localização aproximada via IP por conexão não segura.'
          });
          return;
        }
      } catch (_) {}
      // Fallback final caso IP falhe
      setLocation({
        city: 'Goiânia',
        state: 'Goiás',
        country: 'Brasil',
        latitude: -16.6869,
        longitude: -49.2648,
        loading: false,
        error: 'Geolocalização bloqueada em HTTP. Usando localização padrão.',
        status: 'fallback',
        message: 'Ative HTTPS para obter sua localização precisa.'
      });
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null, status: undefined, message: undefined }));

    const attemptGeolocation = () => {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            timeout: slowNetwork || isMobile ? 20000 : 10000, // 20s em mobile/conexão lenta
            maximumAge: 300000, // Usar cache de até 5 minutos
            enableHighAccuracy: retryCount > 0 // ativa alta precisão em retries
          }
        );
      });
    };

    try {
      const position = await attemptGeolocation();
      const { latitude, longitude } = position.coords;
      
      // Use reverse geocoding to get city name
      const geocodeResult = await reverseGeocode(latitude, longitude);
      
      const newLocation = {
        city: geocodeResult.city || 'Goiânia',
        state: geocodeResult.state || 'Goiás',
        country: geocodeResult.country || 'Brasil',
        latitude,
        longitude,
        loading: false,
        error: null,
        status: 'gps',
        message: 'Localização obtida via GPS do dispositivo.'
      };
      
      // Cache com timestamp e coordenadas para validação
      const cacheData: CachedLocation = {
        ...newLocation,
        timestamp: Date.now(),
        coordinates: { lat: latitude, lng: longitude }
      };
        
      setLocation(newLocation);
      localStorage.setItem('userLocation', JSON.stringify(cacheData));
      
    } catch (error: any) {
      const code = error?.code;
      let errMsg = '';
      if (code === 1) {
        errMsg = 'Permissão de localização negada. Ative nas configurações do navegador.';
      } else if (code === 2) {
        errMsg = 'Posição indisponível no momento. Verifique o GPS e sinal.';
      } else if (code === 3) {
        errMsg = 'Tempo esgotado ao obter localização. Conexão pode estar lenta.';
      } else {
        errMsg = 'Não foi possível obter sua localização.';
      }

      // Retry com backoff exponencial
      if (retryCount < maxRetries) {
        const backoff = Math.min(4000 * Math.pow(2, retryCount), 15000);
        setTimeout(() => getCurrentLocation(retryCount + 1), backoff);
        setLocation(prev => ({ ...prev, loading: true, error: null, status: undefined, message: 'Tentando novamente...' }));
        return;
      }

      // Fallback por IP em HTTPS
      try {
        const ipLoc = await getIPLocation();
        if (ipLoc?.city) {
          const geocodeResult = {
            city: ipLoc.city,
            state: ipLoc.region || 'Goiás',
            country: ipLoc.country || 'Brasil',
            confidence: 0.6,
            source: 'IP'
          };
          const newLocation = {
            city: geocodeResult.city,
            state: geocodeResult.state,
            country: geocodeResult.country,
            latitude: ipLoc.latitude,
            longitude: ipLoc.longitude,
            loading: false,
            error: errMsg,
            status: 'ip',
            message: 'Usando localização aproximada via IP.'
          };
          const cacheData: CachedLocation = {
            ...newLocation,
            timestamp: Date.now(),
            coordinates: { lat: newLocation.latitude || 0, lng: newLocation.longitude || 0 }
          };
          setLocation(newLocation);
          localStorage.setItem('userLocation', JSON.stringify(cacheData));
          return;
        }
      } catch (_) {}

      // Fallback neutro caso IP falhe
      const fallbackLocation = {
        city: 'Goiânia',
        state: 'Goiás',
        country: 'Brasil',
        latitude: -16.6869,
        longitude: -49.2648,
        loading: false,
        error: errMsg,
        status: 'fallback',
        message: 'Usando localização padrão da região.'
      };
      setLocation(fallbackLocation);
    }
  };

  // Função para override manual da localização
  const manualOverride = (city: string, state: string) => {
    const newLocation = {
      city,
      state,
      country: 'Brasil',
      latitude: undefined,
      longitude: undefined,
      loading: false,
      error: null,
      status: 'manual',
      message: 'Localização definida manualmente.'
    };
    
    const cacheData: CachedLocation = {
      ...newLocation,
      timestamp: Date.now(),
      coordinates: { lat: 0, lng: 0 } // Coordenadas zeradas para override manual
    };
    
    setLocation(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(cacheData));
  };

  const clearCache = () => {
    localStorage.removeItem('userLocation');
    // Forçar nova detecção
    getCurrentLocation();
  };

  // Função para testar com coordenadas específicas de Trindade
  const testTrindadeLocation = async () => {
    // Coordenadas atualizadas de Trindade
    const trindadeLat = -16.6469;
    const trindadeLng = -49.4889;
    
    try {
      setLocation(prev => ({ ...prev, loading: true, error: null }));
      
      // Testar detecção específica primeiro
      const detectedCity = detectSpecificCity(trindadeLat, trindadeLng);
      
      // Simular geocodificação reversa
      const geocodeResult = await reverseGeocode(trindadeLat, trindadeLng);
      
      const testLocation = {
        city: detectedCity || geocodeResult.city,
        state: geocodeResult.state,
        country: geocodeResult.country,
        latitude: trindadeLat,
        longitude: trindadeLng,
        loading: false,
        error: null,
      };
      
      setLocation(testLocation);
      
      // Salvar no cache também
      const cacheData: CachedLocation = {
        ...testLocation,
        timestamp: Date.now(),
        coordinates: { lat: trindadeLat, lng: trindadeLng }
      };
      localStorage.setItem('userLocation', JSON.stringify(cacheData));
      
    } catch (error) {
      setLocation(prev => ({ ...prev, loading: false, error: null })); // Não mostrar erro
    }
  };

  useEffect(() => {
    // Limpar cache antigo que pode estar causando problemas
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsed: CachedLocation = JSON.parse(cachedLocation);
        const cacheAge = Date.now() - parsed.timestamp;
        const maxCacheAge = 2 * 60 * 60 * 1000; // Aumentado para 2 horas para reduzir requisições
        
        // Verificar se o cache é válido
        if (cacheAge < maxCacheAge) {
          setLocation({ 
            city: parsed.city,
            state: parsed.state,
            country: parsed.country,
            latitude: parsed.coordinates?.lat,
            longitude: parsed.coordinates?.lng,
            loading: false,
            error: null,
            status: parsed.coordinates?.lat && parsed.coordinates?.lng ? 'gps' : 'fallback',
            message: 'Usando localização em cache.'
          });
          return;
        } else {
          localStorage.removeItem('userLocation');
        }
      } catch (e) {
        localStorage.removeItem('userLocation');
      }
    }

    getCurrentLocation();
  }, []);

  return {
    ...location,
    requestLocation: getCurrentLocation,
    manualOverride,
    clearCache,
    testTrindadeLocation
  };
}

export default useGeolocation;
