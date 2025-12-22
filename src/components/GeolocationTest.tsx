import React, { useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';

export function GeolocationTest() {
  const { location, loading, error } = useGeolocation();

  useEffect(() => {
    console.log('[GeolocationTest] Componente montado');
    console.log('[GeolocationTest] Estado atual:', { location, loading, error });
    
    // Também mostrar um alert para garantir que vemos a execução
    if (!loading && (location.city || error)) {
      alert(`Geolocalização: ${location.city || 'Erro: ' + error}`);
    }
  }, [location, loading, error]);

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="font-bold mb-2">Teste de Geolocalização</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
        <p><strong>Error:</strong> {error || 'Nenhum'}</p>
        <p><strong>Cidade:</strong> {location.city || 'N/A'}</p>
        <p><strong>Estado:</strong> {location.state || 'N/A'}</p>
        <p><strong>Latitude:</strong> {location.latitude || 'N/A'}</p>
        <p><strong>Longitude:</strong> {location.longitude || 'N/A'}</p>
      </div>
    </div>
  );
}