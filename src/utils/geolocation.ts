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

// Função para obter coordenadas de uma cidade/estado
export function getCityCoordinates(city: string, state: string): { lat: number; lng: number } | null {
  // Coordenadas conhecidas de cidades principais
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'Trindade-Goiás': { lat: -16.6469, lng: -49.4889 },
    'Goiânia-Goiás': { lat: -16.6869, lng: -49.2648 },
    'Aparecida de Goiânia-Goiás': { lat: -16.8173, lng: -49.2437 },
    'Anápolis-Goiás': { lat: -16.3281, lng: -48.9530 },
    'Rio Verde-Goiás': { lat: -17.7944, lng: -50.9267 },
    'Luziânia-Goiás': { lat: -16.2572, lng: -47.9500 },
    'Águas Lindas de Goiás-Goiás': { lat: -15.7500, lng: -48.2833 },
    'Valparaíso de Goiás-Goiás': { lat: -15.8833, lng: -48.1667 },
    'Formosa-Goiás': { lat: -15.5372, lng: -47.3342 },
    'Novo Gama-Goiás': { lat: -16.0333, lng: -48.0333 },
    'São Paulo-São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Rio de Janeiro-Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
    'Belo Horizonte-Minas Gerais': { lat: -19.9167, lng: -43.9345 },
    'Brasília-Distrito Federal': { lat: -15.7801, lng: -47.9292 },
  };

  const key = `${city}-${state}`;
  return coordinates[key] || null;
}

// Função para filtrar clínicas por proximidade
export function filterClinicsByProximity(
  clinics: any[],
  userLat: number,
  userLng: number,
  maxDistanceKm: number = 50
): any[] {
  return clinics
    .map(clinic => {
      // Usar as coordenadas diretas da clínica (latitude/longitude)
      if (!clinic.latitude || !clinic.longitude) {
        return { ...clinic, distance: Infinity };
      }
      
      const distance = calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude);
      return { ...clinic, distance };
    })
    .filter(clinic => clinic.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}