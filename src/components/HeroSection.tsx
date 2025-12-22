import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Shield, Star, Users, Navigation, Sparkles, Zap, Heart, Scissors, Clock, Stethoscope, Drill, Smile } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
const heroImage = "/doutorizze-uploads/075af36c-7268-4982-a6d0-413e6ea5905c.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const { city, state, requestLocation, loading: locationLoading } = useGeolocation();
  const [selectedTreatment, setSelectedTreatment] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  
  const allTreatments = [
    { name: "Limpeza Dental", icon: Sparkles, category: "Preventivo", popular: true },
    { name: "Clareamento", icon: Zap, category: "Estético", popular: true },
    { name: "Implantes", icon: Heart, category: "Cirúrgico", popular: true },
    { name: "Aparelho Ortodôntico", icon: Shield, category: "Ortodontia", popular: true },
    { name: "Tratamento de Canal", icon: Scissors, category: "Endodontia", popular: true },
    { name: "Urgência 24h", icon: Clock, category: "Emergência", popular: false },
    { name: "Extração", icon: Drill, category: "Cirúrgico", popular: false },
    { name: "Prótese Dentária", icon: Smile, category: "Protético", popular: false },
    { name: "Periodontia", icon: Stethoscope, category: "Gengiva", popular: false },
    { name: "Odontopediatria", icon: Heart, category: "Infantil", popular: false },
    { name: "Facetas", icon: Star, category: "Estético", popular: false },
    { name: "Restauração", icon: Shield, category: "Preventivo", popular: false }
  ];

  const popularTreatments = allTreatments.filter(t => t.popular);
  const categorizedTreatments = allTreatments.reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, typeof allTreatments>);

  const [nearbyClinics, setNearbyClinics] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  useEffect(() => {
    if (city && state) {
      fetchNearbyClinics();
    }
  }, [city, state]);

  const fetchNearbyClinics = async () => {
    setLoadingClinics(true);
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, address, rating, total_reviews, city')
        .eq('is_active', true)
        .eq('city', city)
        .order('rating', { ascending: false })
        .limit(3);
      setNearbyClinics(data || []);
    } catch (error) {
      console.error('Error fetching nearby clinics:', error);
    } finally {
      setLoadingClinics(false);
    }
  };
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Modern dental clinic" 
          className="w-full h-full object-cover mix-blend-overlay"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left px-4 sm:px-6">
            <Badge className="mb-4 sm:mb-6 bg-accent/90 text-white hover:bg-accent backdrop-blur-sm text-base sm:text-lg px-3 sm:px-4 py-2 font-semibold shadow-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              ✓ Profissionais Verificados
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
              Seu sorriso 
              <span className="text-accent block drop-shadow-lg">perfeito</span>
              está aqui
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-white mb-6 sm:mb-8 leading-relaxed drop-shadow-md font-medium px-2">
              Conectamos você aos melhores dentistas da sua região. 
              Agende consultas, compare preços e transforme seu sorriso com segurança.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 px-2">
              <div className="flex items-center text-white/90">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-2" />
                <span className="font-semibold text-sm sm:text-base">4.9/5</span>
                <span className="ml-1 text-sm sm:text-base">avaliação média</span>
              </div>
              <div className="flex items-center text-white/90">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-accent mr-2" />
                <span className="font-semibold text-sm sm:text-base">50k+</span>
                <span className="ml-1 text-sm sm:text-base">pacientes atendidos</span>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 border border-blue-200"
                onClick={() => navigate('/search')}
              >
                Agendar Consulta
              </Button>
            </div>
          </div>

          {/* Search Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-large mx-4 sm:mx-0">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              Encontre o tratamento ideal
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Qual tratamento você precisa?"
                  className="pl-10 h-11 sm:h-12 text-base"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  value={location || (city && state ? `${city}, ${state}` : "")}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Digite sua localização"
                  className="pl-10 pr-12 h-11 sm:h-12 text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0"
                  onClick={() => {
                    requestLocation();
                    setLocation("");
                  }}
                  disabled={locationLoading}
                >
                  <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <Button variant="gradient" size="lg" className="w-full" onClick={() => window.location.href = '/search'}>
                <Search className="w-5 h-5 mr-2" />
                Buscar Clínicas
              </Button>
            </div>

            {/* Clínicas Próximas */}
            {city && state && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Clínicas próximas em {city}:</p>
                  <Badge variant="secondary" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    GPS
                  </Badge>
                </div>
                {loadingClinics ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Carregando clínicas...
                  </div>
                ) : nearbyClinics.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {nearbyClinics.map((clinic) => (
                      <Card key={clinic.id} className="p-3 hover:bg-accent/5 cursor-pointer transition-colors" onClick={() => navigate(`/booking/${clinic.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{clinic.name}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                {clinic.rating ? clinic.rating.toFixed(1) : "0.0"}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
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
                                  return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
                                }
                                return addr || 'Endereço não informado';
                              })()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {clinic.total_reviews || 0} avaliações
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Nenhuma clínica encontrada em {city}
                  </div>
                )}
              </div>
            )}

            {/* Tratamentos Populares */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
                  <div className="flex-1">
                    <Select 
                      value={selectedTreatment} 
                      onValueChange={(value) => {
                        setSelectedTreatment(value);
                        setSearchTerm(value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um tratamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Tratamentos Populares */}
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b">
                          Tratamentos Populares
                        </div>
                        {popularTreatments.map((treatment) => {
                          const IconComponent = treatment.icon;
                          return (
                            <SelectItem key={treatment.name} value={treatment.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                {treatment.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                        
                        {/* Todos os Tratamentos por Categoria */}
                        {Object.entries(categorizedTreatments).map(([category, treatments]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b mt-2">
                              {category}
                            </div>
                            {treatments.map((treatment) => {
                              const IconComponent = treatment.icon;
                              return (
                                <SelectItem key={`${category}-${treatment.name}`} value={treatment.name}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4" />
                                    {treatment.name}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600 active:bg-green-700 active:scale-95 active:shadow-inner transition-all duration-200 whitespace-nowrap text-sm sm:text-base px-4 py-2 w-full sm:w-auto shadow-md hover:shadow-lg border-none outline-none focus:outline-none"
                    onClick={() => {
                      const el = document.getElementById('credit-simulator');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        // Fallback: manter comportamento atual caso âncora não exista
                        navigate('/patient/credit-request');
                      }
                    }}
                  >
                    SIMULE SEU CRÉDITO
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;