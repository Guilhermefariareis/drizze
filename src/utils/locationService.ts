// Serviço de localização dinâmica para filtragem inteligente de clínicas

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface ClinicWithDistance {
  id: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

// Mapeamento de coordenadas das principais cidades brasileiras
const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  // Goiás
  'trindade': { lat: -16.6469, lng: -49.4889, state: 'GO' },
  'goiânia': { lat: -16.6869, lng: -49.2648, state: 'GO' },
  'goiania': { lat: -16.6869, lng: -49.2648, state: 'GO' },
  'aparecida de goiânia': { lat: -16.8173, lng: -49.2437, state: 'GO' },
  'anápolis': { lat: -16.3281, lng: -48.9530, state: 'GO' },
  'rio verde': { lat: -17.7944, lng: -50.9267, state: 'GO' },
  'luziânia': { lat: -16.2572, lng: -47.9500, state: 'GO' },
  'águas lindas de goiás': { lat: -15.7500, lng: -48.2833, state: 'GO' },
  'valparaíso de goiás': { lat: -15.8833, lng: -48.1667, state: 'GO' },
  'formosa': { lat: -15.5372, lng: -47.3342, state: 'GO' },
  'novo gama': { lat: -16.0333, lng: -48.0333, state: 'GO' },
  
  // São Paulo
  'são paulo': { lat: -23.5505, lng: -46.6333, state: 'SP' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, state: 'SP' },
  'guarulhos': { lat: -23.4538, lng: -46.5333, state: 'SP' },
  'campinas': { lat: -22.9056, lng: -47.0608, state: 'SP' },
  'são bernardo do campo': { lat: -23.6914, lng: -46.5646, state: 'SP' },
  'santo andré': { lat: -23.6528, lng: -46.5311, state: 'SP' },
  'osasco': { lat: -23.5329, lng: -46.7918, state: 'SP' },
  'sorocaba': { lat: -23.5015, lng: -47.4526, state: 'SP' },
  'ribeirão preto': { lat: -21.1775, lng: -47.8208, state: 'SP' },
  'santos': { lat: -23.9608, lng: -46.3331, state: 'SP' },
  
  // Rio de Janeiro
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, state: 'RJ' },
  'niterói': { lat: -22.8833, lng: -43.1036, state: 'RJ' },
  'nova iguaçu': { lat: -22.7592, lng: -43.4511, state: 'RJ' },
  'duque de caxias': { lat: -22.7856, lng: -43.3117, state: 'RJ' },
  'são gonçalo': { lat: -22.8267, lng: -43.0539, state: 'RJ' },
  'campos dos goytacazes': { lat: -21.7642, lng: -41.3253, state: 'RJ' },
  
  // Minas Gerais
  'belo horizonte': { lat: -19.9167, lng: -43.9345, state: 'MG' },
  'uberlândia': { lat: -18.9113, lng: -48.2622, state: 'MG' },
  'contagem': { lat: -19.9317, lng: -44.0536, state: 'MG' },
  'juiz de fora': { lat: -21.7642, lng: -43.3503, state: 'MG' },
  'betim': { lat: -19.9678, lng: -44.1989, state: 'MG' },
  
  // Distrito Federal
  'brasília': { lat: -15.7801, lng: -47.9292, state: 'DF' },
  'brasilia': { lat: -15.7801, lng: -47.9292, state: 'DF' },
  
  // Bahia
  'salvador': { lat: -12.9714, lng: -38.5014, state: 'BA' },
  'feira de santana': { lat: -12.2664, lng: -38.9663, state: 'BA' },
  'vitória da conquista': { lat: -14.8619, lng: -40.8444, state: 'BA' },
  
  // Ceará
  'fortaleza': { lat: -3.7319, lng: -38.5267, state: 'CE' },
  'caucaia': { lat: -3.7361, lng: -38.6531, state: 'CE' },
  
  // Pernambuco
  'recife': { lat: -8.0476, lng: -34.8770, state: 'PE' },
  'jaboatão dos guararapes': { lat: -8.1130, lng: -35.0147, state: 'PE' },
  
  // Rio Grande do Sul
  'porto alegre': { lat: -30.0346, lng: -51.2177, state: 'RS' },
  'caxias do sul': { lat: -29.1678, lng: -51.1794, state: 'RS' },
  
  // Paraná
  'curitiba': { lat: -25.4284, lng: -49.2733, state: 'PR' },
  'londrina': { lat: -23.3045, lng: -51.1696, state: 'PR' },
  'maringá': { lat: -23.4205, lng: -51.9331, state: 'PR' },
  
  // Santa Catarina
  'florianópolis': { lat: -27.5954, lng: -48.5480, state: 'SC' },
  'florianopolis': { lat: -27.5954, lng: -48.5480, state: 'SC' },
  'joinville': { lat: -26.3044, lng: -48.8487, state: 'SC' },
};

// Estados brasileiros com suas siglas
const BRAZILIAN_STATES: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapá': 'AP',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceará': 'CE',
  'ceara': 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  'goiás': 'GO',
  'goias': 'GO',
  'maranhão': 'MA',
  'maranhao': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'pará': 'PA',
  'para': 'PA',
  'paraíba': 'PB',
  'paraiba': 'PB',
  'paraná': 'PR',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piauí': 'PI',
  'piaui': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondônia': 'RO',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  'sao paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO'
};

// Função para calcular distância entre duas coordenadas (fórmula de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Função para obter localização do usuário via geolocalização
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const isSecure = (() => {
      if (typeof window === 'undefined') return true;
      const protocolSecure = window.location.protocol === 'https:';
      const host = window.location.hostname;
      const localhostSecure = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
      return protocolSecure || localhostSecure;
    })();

    const getIPLocation = async (): Promise<UserLocation | null> => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            state: (data.region || ''),
            country: (data.country_name || 'Brasil')
          };
        }
      } catch (_) {}
      try {
        const res2 = await fetch('https://ipwhois.app/json/');
        if (res2.ok) {
          const data2 = await res2.json();
          return {
            latitude: parseFloat(data2.latitude),
            longitude: parseFloat(data2.longitude),
            city: data2.city,
            state: (data2.region || ''),
            country: (data2.country || 'Brasil')
          };
        }
      } catch (_) {}
      return null;
    };

    if (!isSecure || !navigator.geolocation) {
      const ipLoc = await getIPLocation();
      if (ipLoc) {
        const cityInfo = await getCityFromCoordinates(ipLoc.latitude, ipLoc.longitude);
        if (cityInfo) {
          ipLoc.city = cityInfo.city;
          ipLoc.state = cityInfo.state;
        }
        return ipLoc;
      }
      return {
        latitude: -16.6869,
        longitude: -49.2648,
        city: 'Goiânia',
        state: '',
        country: 'Brasil'
      };
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true
      });
    });
    
    const location: UserLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    
    // Tentar determinar cidade e estado baseado nas coordenadas
    const cityInfo = await getCityFromCoordinates(location.latitude, location.longitude);
    if (cityInfo) {
      location.city = cityInfo.city;
      location.state = cityInfo.state;
    }
    
    return location;
  } catch (error) {
    const isSecure = (() => {
      if (typeof window === 'undefined') return true;
      const protocolSecure = window.location.protocol === 'https:';
      const host = window.location.hostname;
      const localhostSecure = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
      return protocolSecure || localhostSecure;
    })();
    if (isSecure) {
      const ipLoc = await (async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            return {
              latitude: data.latitude,
              longitude: data.longitude,
              city: data.city,
              state: (data.region || ''),
              country: (data.country_name || 'Brasil')
            } as UserLocation;
          }
        } catch (_) {}
        try {
          const res2 = await fetch('https://ipwhois.app/json/');
          if (res2.ok) {
            const data2 = await res2.json();
            return {
              latitude: parseFloat(data2.latitude),
              longitude: parseFloat(data2.longitude),
              city: data2.city,
              state: (data2.region || ''),
              country: (data2.country || 'Brasil')
            } as UserLocation;
          }
        } catch (_) {}
        return null;
      })();
      if (ipLoc) {
        const cityInfo = await getCityFromCoordinates(ipLoc.latitude, ipLoc.longitude);
        if (cityInfo) {
          ipLoc.city = cityInfo.city;
          ipLoc.state = cityInfo.state;
        }
        return ipLoc;
      }
    }
    return {
      latitude: -16.6869,
      longitude: -49.2648,
      city: 'Goiânia',
      state: '',
      country: 'Brasil'
    };
  }
}

// Função para determinar cidade baseada em coordenadas
export async function getCityFromCoordinates(lat: number, lng: number): Promise<{city: string, state: string} | null> {
  // Buscar a cidade mais próxima baseada nas coordenadas
  let closestCity = null;
  let minDistance = Infinity;
  
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = { city: cityName, state: coords.state };
    }
  }
  
  // Se a cidade mais próxima está a menos de 50km, consideramos válida
  if (closestCity && minDistance < 50) {
    return closestCity;
  }
  
  return null;
}

// Função principal para filtrar clínicas de forma dinâmica
export function filterClinicsDynamically(
  clinics: ClinicWithDistance[],
  userLocation: UserLocation,
  maxDistanceKm: number = 100
): ClinicWithDistance[] {
  console.log('🌍 [FILTRO DINÂMICO] Iniciando filtragem inteligente...');
  console.log('📍 [FILTRO DINÂMICO] Localização do usuário:', userLocation);
  
  // Calcular distância para todas as clínicas
  const clinicsWithDistance = clinics.map(clinic => {
    if (clinic.latitude && clinic.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        clinic.latitude,
        clinic.longitude
      );
      return { ...clinic, distance };
    }
    return { ...clinic, distance: Infinity };
  });
  
  // ETAPA 1: Filtrar por proximidade máxima
  let filteredClinics = clinicsWithDistance.filter(clinic => 
    clinic.distance !== undefined && clinic.distance <= maxDistanceKm
  );
  
  console.log(`🔍 [FILTRO DINÂMICO] Clínicas dentro de ${maxDistanceKm}km: ${filteredClinics.length}`);
  
  // ETAPA 2: Priorização inteligente
  const userCity = userLocation.city?.toLowerCase().trim();
  const userState = userLocation.state?.toUpperCase();
  
  if (userCity && userState) {
    console.log(`🏙️ [FILTRO DINÂMICO] Priorizando para: ${userCity}, ${userState}`);
    
    // Prioridade 1: Mesma cidade
    const sameCityClinics = filteredClinics.filter(clinic => {
      const clinicCity = clinic.city?.toLowerCase().trim() || '';
      return clinicCity === userCity || 
             clinicCity.includes(userCity) ||
             userCity.includes(clinicCity);
    });
    
    if (sameCityClinics.length > 0) {
      console.log(`✅ [FILTRO DINÂMICO] Encontradas ${sameCityClinics.length} clínicas na mesma cidade`);
      return sameCityClinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    // Prioridade 2: Mesmo estado
    const sameStateClinics = filteredClinics.filter(clinic => {
      const clinicState = getStateFromCity(clinic.city || '');
      return clinicState === userState;
    });
    
    if (sameStateClinics.length > 0) {
      console.log(`✅ [FILTRO DINÂMICO] Encontradas ${sameStateClinics.length} clínicas no mesmo estado`);
      return sameStateClinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    // Prioridade 3: Estados próximos (para regiões metropolitanas)
    const nearbyStateClinics = filterByNearbyStates(filteredClinics, userState);
    if (nearbyStateClinics.length > 0) {
      console.log(`✅ [FILTRO DINÂMICO] Encontradas ${nearbyStateClinics.length} clínicas em estados próximos`);
      return nearbyStateClinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
  }
  
  // Fallback: Retornar todas as clínicas dentro do raio, ordenadas por distância
  console.log(`🔄 [FILTRO DINÂMICO] Usando fallback: ${filteredClinics.length} clínicas por proximidade`);
  return filteredClinics.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

// Função para determinar estado baseado na cidade
function getStateFromCity(city: string): string | null {
  const cityLower = city.toLowerCase().trim();
  const cityInfo = CITY_COORDINATES[cityLower];
  return cityInfo ? cityInfo.state : null;
}

// Função para filtrar por estados próximos
function filterByNearbyStates(clinics: ClinicWithDistance[], userState: string): ClinicWithDistance[] {
  // Mapeamento de estados próximos (regiões metropolitanas e fronteiras)
  const nearbyStates: Record<string, string[]> = {
    'GO': ['DF', 'MG', 'MT', 'MS', 'BA', 'TO'], // Goiás
    'DF': ['GO', 'MG'], // Distrito Federal
    'SP': ['RJ', 'MG', 'PR', 'MS'], // São Paulo
    'RJ': ['SP', 'MG', 'ES'], // Rio de Janeiro
    'MG': ['SP', 'RJ', 'ES', 'BA', 'GO', 'DF', 'MS'], // Minas Gerais
    'PR': ['SP', 'SC', 'MS'], // Paraná
    'SC': ['PR', 'RS'], // Santa Catarina
    'RS': ['SC'], // Rio Grande do Sul
    'BA': ['SE', 'AL', 'PE', 'PI', 'TO', 'GO', 'MG', 'ES'], // Bahia
    'PE': ['AL', 'BA', 'PI', 'CE', 'PB'], // Pernambuco
    'CE': ['RN', 'PB', 'PE', 'PI'], // Ceará
  };
  
  const allowedStates = nearbyStates[userState] || [];
  
  return clinics.filter(clinic => {
    const clinicState = getStateFromCity(clinic.city || '');
    return clinicState && allowedStates.includes(clinicState);
  });
}

// Função para gerar clínicas mock baseadas na localização do usuário
export function generateMockClinicsForLocation(userLocation: UserLocation): ClinicWithDistance[] {
  const userCity = userLocation.city?.toLowerCase().trim();
  const userState = userLocation.state?.toUpperCase();
  
  if (!userCity || !userState) {
    return [];
  }
  
  // Templates de clínicas por estado
  const clinicTemplates: Record<string, Array<{name: string, address: string, phone: string}>> = {
    'GO': [
      { name: 'Clínica Odontológica Central', address: 'Centro', phone: '(62) 3000-0001' },
      { name: 'Sorriso Premium', address: 'Setor Central', phone: '(62) 3000-0002' },
      { name: 'Dental Care', address: 'Av. Principal', phone: '(62) 3000-0003' }
    ],
    'SP': [
      { name: 'Odonto São Paulo', address: 'Centro', phone: '(11) 3000-0001' },
      { name: 'Clínica Dental Premium', address: 'Av. Paulista', phone: '(11) 3000-0002' },
      { name: 'Sorriso Paulista', address: 'Vila Madalena', phone: '(11) 3000-0003' }
    ],
    'RJ': [
      { name: 'Odonto Carioca', address: 'Copacabana', phone: '(21) 3000-0001' },
      { name: 'Dental Rio', address: 'Ipanema', phone: '(21) 3000-0002' },
      { name: 'Clínica Zona Sul', address: 'Botafogo', phone: '(21) 3000-0003' }
    ],
    'MG': [
      { name: 'Odonto Minas', address: 'Centro', phone: '(31) 3000-0001' },
      { name: 'Clínica Mineira', address: 'Savassi', phone: '(31) 3000-0002' },
      { name: 'Dental BH', address: 'Pampulha', phone: '(31) 3000-0003' }
    ]
  };
  
  const templates = clinicTemplates[userState] || clinicTemplates['GO'];
  const cityCoords = CITY_COORDINATES[userCity];
  
  return templates.map((template, index) => ({
    id: `mock-${userState.toLowerCase()}-${index + 1}`,
    name: template.name,
    address: `${template.address}, ${userCity}`,
    phone: template.phone,
    city: userCity,
    state: userState,
    latitude: cityCoords ? cityCoords.lat + (Math.random() - 0.5) * 0.01 : userLocation.latitude,
    longitude: cityCoords ? cityCoords.lng + (Math.random() - 0.5) * 0.01 : userLocation.longitude,
    distance: Math.random() * 10 // Distância aleatória até 10km
  }));
}
