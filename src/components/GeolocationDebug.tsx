import React from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

const GeolocationDebug = () => {
  const { city, state, loading, error, clearCache, testTrindadeLocation, manualOverride } = useGeolocation();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔍 Debug Geolocalização</h3>
      
      <div className="text-xs mb-3">
        <p><strong>Localização:</strong> {loading ? 'Carregando...' : `${city}, ${state}`}</p>
        {error && <p className="text-red-500"><strong>Erro:</strong> {error}</p>}
      </div>
      
      <div className="space-y-2">
        <button 
          onClick={testTrindadeLocation}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          🧪 Testar Trindade
        </button>
        
        <button 
          onClick={() => manualOverride?.('Trindade', 'Goiás')}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
        >
          📍 Forçar Trindade
        </button>
        
        <button 
          onClick={clearCache}
          className="w-full bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600"
        >
          🗑️ Limpar Cache
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p>Use os botões para testar a detecção de Trindade</p>
      </div>
    </div>
  );
};

export default GeolocationDebug;