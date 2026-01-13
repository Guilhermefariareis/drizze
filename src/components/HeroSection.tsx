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
    // Evitar que tratamentos populares apareçam duplicados na categoria
    if (treatment.popular) return acc;

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
    <section className="relative bg-[#0F0F23] overflow-hidden py-20 lg:py-32">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E94560]/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[100px] -z-10"></div>

      <div className="absolute inset-0 opacity-20">
        <img
          src={heroImage}
          alt="Modern dental clinic"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F23] via-transparent to-[#0F0F23]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left px-4 sm:px-6">
            <Badge variant="v2-dark" className="mb-6 px-4 py-2">
              <Shield className="w-5 h-5 mr-2" />
              PROFISSIONAIS VERIFICADOS
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
              Seu sorriso
              <span className="block bg-gradient-to-r from-[#E94560] via-[#FB923C] to-[#F9B500] bg-clip-text text-transparent">
                perfeito
              </span>
              está aqui
            </h1>

            <p className="text-xl text-white/60 mb-8 leading-relaxed font-medium max-w-lg">
              Conectamos você aos melhores dentistas da sua região com tecnologia de ponta e segurança total.
            </p>

            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#F9B500]" />
                <span className="font-bold text-white text-lg">4.9/5</span>
                <span className="text-white/40">Satisfação</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E94560]" />
                <span className="font-bold text-white text-lg">50k+</span>
                <span className="text-white/40">Pacientes</span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start">
              <Button
                variant="v2-gradient"
                size="lg"
                className="px-12 py-7 text-xl"
                onClick={() => navigate('/search')}
              >
                Agendar Consulta →
              </Button>
            </div>
          </div>

          {/* Search Card */}
          <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8">
              Encontre o tratamento ideal
            </h2>

            <div className="space-y-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30 w-5 h-5 group-focus-within:text-[#E94560] transition-colors" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Qual tratamento você precisa?"
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-[#E94560]/50 outline-none text-white placeholder-white/30 transition-all"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/30 w-5 h-5 group-focus-within:text-[#E94560] transition-colors" />
                <Input
                  value={location || (city && state ? `${city}, ${state}` : "")}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Digite sua localização"
                  className="pl-12 pr-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-[#E94560]/50 outline-none text-white placeholder-white/30 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 text-white/40 hover:text-white"
                  onClick={() => {
                    requestLocation();
                    setLocation("");
                  }}
                  disabled={locationLoading}
                >
                  <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <Button variant="v2-gradient" size="lg" className="w-full h-14 text-lg shadow-lg shadow-[#E94560]/20" onClick={() => window.location.href = '/search'}>
                <Search className="w-5 h-5 mr-3" />
                Buscar Clínicas →
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
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {nearbyClinics.map((clinic) => (
                      <Card key={clinic.id} className="p-4 bg-white/5 border-white/5 hover:bg-white/10 hover:border-[#E94560]/30 cursor-pointer transition-all" onClick={() => navigate(`/booking/${clinic.id}`)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-white">{clinic.name}</p>
                              <div className="flex items-center text-xs text-[#F9B500]">
                                <Star className="w-3 h-3 fill-current mr-1" />
                                {clinic.rating ? clinic.rating.toFixed(1) : "0.0"}
                              </div>
                            </div>
                            <p className="text-xs text-white/40 truncate">
                              {clinic.city} • {clinic.total_reviews || 0} avaliações
                            </p>
                          </div>
                          <Badge variant="v2-blue" className="text-[10px]">RECOMENDADA</Badge>
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
                                {IconComponent === Zap ? (
                                  <img src="/logo-white-final.png" alt="Logo" className="w-4 h-4 object-contain" />
                                ) : (
                                  <IconComponent className="w-4 h-4" />
                                )}
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
                                    {IconComponent === Zap ? (
                                      <img src="/logo-white-final.png" alt="Logo" className="w-4 h-4 object-contain" />
                                    ) : (
                                      <IconComponent className="w-4 h-4" />
                                    )}
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
                    variant="v2-success"
                    size="sm"
                    className="w-full sm:w-auto px-6"
                    onClick={() => {
                      const el = document.getElementById('credit-simulator');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        navigate('/patient/credit-request');
                      }
                    }}
                  >
                    <img src="/logo-white-final.png" alt="Logo" className="w-4 h-4 object-contain mr-2 invert brightness-0" />
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