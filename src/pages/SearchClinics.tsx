import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Phone, Clock, Calendar, Navigation, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabase';

export function SearchClinics() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllClinics, setShowAllClinics] = useState(false);

  const {
    city,
    state,
    loading: locationLoading,
    requestLocation,
    clearCache
  } = useGeolocation();

  useEffect(() => {
    fetchClinics();
  }, [city, state, showAllClinics]);

  const fetchClinics = async () => {
    setLoading(true);

    try {
      let query = supabase.from('clinics').select('*');

      if (!showAllClinics) {
        // Filtrar por proximidade usando cidade digitada ou detectada
        const targetCity = (location?.trim() || city || '').trim();
        if (targetCity) {
          query = query.eq('city', targetCity);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar clínicas:', error);
        setClinics([]);
        return;
      }

      setClinics(data || []);
    } catch (error) {
      console.error('Erro na função fetchClinics:', error);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar apenas filtro de termo de busca sobre as clínicas já filtradas por proximidade
  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = () => {
    return "Consulte preços";
  };

  return (
    <div className="min-h-screen bg-background pb-20">

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-gradient-primary rounded-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-6">Encontre sua clínica ideal</h1>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Especialidade ou clínica"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-foreground"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cidade"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-white text-foreground"
              />
            </div>

            <Button className="bg-white text-primary hover:bg-white/90">
              Buscar
            </Button>
          </div>
        </div>

        {/* Location Controls */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {!city && !state && (
              <div className="flex gap-2">
                <Button
                  onClick={requestLocation}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {locationLoading ? 'Detectando localização...' : 'Usar minha localização'}
                </Button>
                <Button
                  onClick={clearCache}
                  disabled={locationLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                  title="Limpar cache e detectar novamente"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            )}

            {(city || state) && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  {city && state ? `${city}, ${state}` : state || city}
                </Badge>
                <Button
                  onClick={() => setShowAllClinics(!showAllClinics)}
                  variant={showAllClinics ? "default" : "outline"}
                  size="sm"
                >
                  {showAllClinics ? 'Mostrar apenas da região' : 'Mostrar todas as clínicas'}
                </Button>
                <Button
                  onClick={clearCache}
                  disabled={locationLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  title="Atualizar localização"
                >
                  <RefreshCw className="h-4 w-4" />
                  {locationLoading ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            )}
          </div>

          {!showAllClinics && (city || state) && (
            <p className="text-sm text-muted-foreground mt-2">
              Mostrando clínicas da sua região: {city && state ? `${city}, ${state}` : state || city}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="grid gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <div className="w-full h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="md:col-span-1">
                      <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredClinics.map(clinic => (
              <Card key={clinic.id} className="hover-lift cursor-pointer">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1">
                      <img
                        src={clinic.logo_url || '/placeholder.svg'}
                        alt={clinic.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="text-xl font-semibold mb-2">{clinic.name}</h3>

                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {clinic.city ? `${clinic.city}` : 'Localização não informada'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{clinic.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-muted-foreground">
                          ({clinic.total_reviews || 0} avaliações)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">
                          Clínica Geral
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {clinic.phone || 'Telefone não informado'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Consulte horários
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1 flex flex-col justify-between">
                      <div>
                        <p className="text-lg font-semibold text-primary mb-2">
                          {formatPrice()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => navigate(`/booking/${clinic.id}`)}
                          className="w-full"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/clinic/${clinic.id}`)}
                        >
                          Ver perfil
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {!loading && filteredClinics.length === 0 && (
            <div className="text-center py-12">
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  {!showAllClinics && (city || state)
                    ? `Nenhuma clínica encontrada na sua região: ${city && state ? `${city}, ${state}` : state || city}`
                    : 'Nenhuma clínica encontrada com os filtros aplicados.'
                  }
                </p>
                {!showAllClinics && (city || state) && (
                  <Button
                    onClick={() => setShowAllClinics(true)}
                    variant="outline"
                    className="mt-4"
                  >
                    Mostrar todas as clínicas disponíveis
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SearchClinics;