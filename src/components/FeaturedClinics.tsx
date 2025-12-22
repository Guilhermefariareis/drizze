import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone,
  Calendar,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Percent
} from "lucide-react";

interface FeaturedClinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  rating: number;
  total_reviews: number;
  commission_percentage: number;
  profile?: {
    specialties: string[];
    logo_url?: string;
    description?: string;
  };
}

const FeaturedClinics = () => {
  const [clinics, setClinics] = useState<FeaturedClinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedClinics();
  }, []);

  const fetchFeaturedClinics = async () => {
    try {
      setLoading(true);
      
      // Buscar clínicas ativas com melhor rating
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(3);

      if (clinicsError) throw clinicsError;

      // Buscar perfis das clínicas
      const clinicIds = clinicsData?.map(c => c.id) || [];
      const { data: profilesData } = await supabase
        .from('clinic_profiles')
        .select('*')
        .in('clinic_id', clinicIds);

      // Combinar dados
      const clinicsWithProfiles = clinicsData?.map(clinic => ({
        ...clinic,
        profile: profilesData?.find(p => p.clinic_id === clinic.id),
        commission_percentage: null
      })) || [];

      setClinics(clinicsWithProfiles as any);
    } catch (error) {
      console.error('Erro ao buscar clínicas em destaque:', error);
      toast.error('Erro ao carregar clínicas');
    } finally {
      setLoading(false);
    }
  };

  const getPriceRange = (commission: number) => {
    if (commission <= 2.5) return "$";
    if (commission <= 3.5) return "$$";
    return "$$$";
  };

  return (
    <section id="clinics" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
            Clínicas em Destaque
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Profissionais Próximos a Você
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Descubra as clínicas mais bem avaliadas da sua região. 
            Todos os profissionais são verificados e possuem excelência comprovada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            clinics.map((clinic) => (
              <Card 
                key={clinic.id} 
                className="group hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 border hover:border-primary/20 overflow-hidden"
              >
                <div className="relative h-48 bg-gradient-card">
                  <img 
                    src={clinic.profile?.logo_url || '/placeholder.svg'}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${
                      getPriceRange(clinic.commission_percentage) === '$' ? 'bg-green-500' : 
                      getPriceRange(clinic.commission_percentage) === '$$' ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {getPriceRange(clinic.commission_percentage)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {clinic.city}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage src={clinic.profile?.logo_url} alt={clinic.name} />
                        <AvatarFallback className="bg-primary text-white font-semibold">
                          {clinic.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {clinic.name}
                          </CardTitle>
                          <CheckCircle className="w-4 h-4 text-success ml-2" />
                        </div>
                        <CardDescription className="text-muted-foreground">
                          {clinic.profile?.specialties?.[0] || "Odontologia Geral"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-semibold text-foreground">{clinic.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground ml-1">({clinic.total_reviews} avaliações)</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      <Percent className="w-3 h-3 mr-1" />
                      {clinic.commission_percentage}% comissão
                    </Badge>
                  </div>

                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">
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
                          return parts.length > 0 ? parts.join(', ') : clinic.city;
                        }
                        return `${addr || clinic.city}, ${clinic.city}`;
                      })()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {clinic.profile?.specialties?.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        Consulte horários:
                      </div>
                      <span className="text-sm font-semibold text-success">
                        Disponível
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                    <Button variant="gradient" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="mr-4">
            Ver Mais Clínicas
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="gradient" size="lg">
            <MapPin className="w-5 h-5 mr-2" />
            Buscar na Minha Região
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedClinics;