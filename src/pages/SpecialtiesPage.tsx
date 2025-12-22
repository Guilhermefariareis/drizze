import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Calendar, Phone, Heart, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Specialty {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  rating: number;
  total_reviews: number;
  profile?: {
    specialties: string[];
    logo_url?: string;
  };
  services?: Array<{
    name: string;
    price_min: number;
    price_max: number;
  }>;
}

export default function SpecialtiesPage() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    verified: false,
    featured: false,
    weekend: false,
    emergency: false
  });
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar especialidades
      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from('specialties')
        .select('*')
        .order('name');

      if (specialtiesError) throw specialtiesError;

      // Buscar clínicas ativas
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (clinicsError) throw clinicsError;

      // Buscar perfis das clínicas
      const clinicIds = clinicsData?.map(c => c.id) || [];
      const { data: profilesData } = await supabase
        .from('clinic_profiles')
        .select('*')
        .in('clinic_id', clinicIds);

      // Buscar serviços das clínicas
      const { data: servicesData } = await supabase
        .from('clinic_services')
        .select('*')
        .in('clinic_id', clinicIds)
        .eq('is_active', true);

      // Combinar dados das clínicas
      const clinicsWithData = clinicsData?.map(clinic => ({
        ...clinic,
        profile: profilesData?.find(p => p.clinic_id === clinic.id),
        services: servicesData?.filter(s => s.clinic_id === clinic.id) || []
      })) || [];

      setSpecialties(specialtiesData || []);
      setClinics(clinicsWithData as any);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClinics = clinics.filter(clinic => {
    const matchesCity = !selectedCity || clinic.city === selectedCity;
    const matchesSpecialty = !selectedSpecialty || clinic.profile?.specialties?.includes(selectedSpecialty);
    const matchesSearch = !searchTerm || 
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCity && matchesSpecialty && matchesSearch;
  });

  const getClinicCountForSpecialty = (specialtyName: string) => {
    return clinics.filter(clinic => 
      clinic.profile?.specialties?.includes(specialtyName)
    ).length;
  };

  const formatPrice = (services: any[]) => {
    if (!services || services.length === 0) return "Consulte preços";
    const minPrice = Math.min(...services.map(s => s.price_min));
    const maxPrice = Math.max(...services.map(s => s.price_max));
    return `R$ ${minPrice}-${maxPrice}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Especialidades Odontológicas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre o tratamento ideal para seu sorriso com os melhores especialistas
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg shadow-medium mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as cidades</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="verified"
                    checked={filters.verified}
                    onCheckedChange={(checked) => setFilters({...filters, verified: checked as boolean})}
                  />
                  <label htmlFor="verified" className="text-sm">Clínicas Verificadas</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured"
                    checked={filters.featured}
                    onCheckedChange={(checked) => setFilters({...filters, featured: checked as boolean})}
                  />
                  <label htmlFor="featured" className="text-sm">Destaque</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="weekend"
                    checked={filters.weekend}
                    onCheckedChange={(checked) => setFilters({...filters, weekend: checked as boolean})}
                  />
                  <label htmlFor="weekend" className="text-sm">Atende Fins de Semana</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emergency"
                    checked={filters.emergency}
                    onCheckedChange={(checked) => setFilters({...filters, emergency: checked as boolean})}
                  />
                  <label htmlFor="emergency" className="text-sm">Emergência 24h</label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Specialties Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Especialidades Disponíveis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredSpecialties.map(specialty => (
                <Card 
                  key={specialty.id} 
                  className="hover-lift cursor-pointer"
                  onClick={() => setSelectedSpecialty(specialty.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{specialty.name}</h3>
                      <Badge variant="secondary">{getClinicCountForSpecialty(specialty.name)}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {specialty.description || "Tratamento odontológico especializado"}
                    </p>
                    
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Clínicas:</span>
                        <span>{getClinicCountForSpecialty(specialty.name)} disponíveis</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Clinics Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Clínicas Encontradas ({filteredClinics.length})
            </h2>
            
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Melhor avaliada</SelectItem>
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="distance">Mais próxima</SelectItem>
                <SelectItem value="availability">Disponibilidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-0">
                      <div className="h-48 bg-gray-200 rounded-l-lg"></div>
                      <div className="md:col-span-2 p-6 space-y-3">
                        <div className="h-6 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="p-6">
                        <div className="h-10 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredClinics.map(clinic => (
                <Card key={clinic.id} className="hover-lift">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-0">
                      <div className="relative">
                        <img
                          src={clinic.profile?.logo_url || '/placeholder.svg'}
                          alt={clinic.name}
                          className="w-full h-48 object-cover rounded-l-lg"
                        />
                        <Badge className="absolute top-2 left-2 bg-success/10 text-success">
                          Verificada
                        </Badge>
                      </div>
                      
                      <div className="md:col-span-2 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold">{clinic.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {(() => {
                              const addr = clinic.address;
                              if (typeof addr === 'object' && addr !== null) {
                                const addressObj = addr as { street?: string; neighborhood?: string; city?: string; state?: string };
                                const parts = [
                                  addressObj.street,
                                  addressObj.neighborhood,
                                  addressObj.city,
                                  addressObj.state
                                ].filter(Boolean);
                                return parts.length > 0 ? parts.join(', ') : `${clinic.city} - ${clinic.state}`;
                              }
                              return `${addr || clinic.city}, ${clinic.city} - ${clinic.state}`;
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-medium">{clinic.rating.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({clinic.total_reviews} avaliações)
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {clinic.profile?.specialties?.slice(0, 3).map(specialty => (
                            <Badge key={specialty} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-6 flex flex-col justify-between">
                        <div className="mb-4">
                          <p className="text-lg font-semibold text-primary mb-2">
                            {formatPrice(clinic.services)}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full"
                            onClick={() => navigate(`/booking/${clinic.id}`)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Agendar
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Phone className="h-4 w-4 mr-1" />
                              Ligar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            {!loading && filteredClinics.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Nenhuma clínica encontrada com os filtros aplicados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}