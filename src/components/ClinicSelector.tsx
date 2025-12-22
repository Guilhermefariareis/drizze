import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Phone, Clock, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ClinicData } from '@/types/clinic';


export function ClinicSelector() {
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      
      const { data: clinicsData, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clínicas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as clínicas.",
          variant: "destructive",
        });
        return;
      }

      if (!clinicsData || clinicsData.length === 0) {
        console.log('Nenhuma clínica encontrada');
        setClinics([]);
        return;
      }

      // Buscar perfis das clínicas
      const clinicIds = clinicsData.map(clinic => clinic.id);
      const { data: profilesData } = await supabase
        .from('clinic_profiles')
        .select('*')
        .in('clinic_id', clinicIds);

      // Combinar dados das clínicas com perfis
      const clinicsWithProfiles = clinicsData.map(clinic => {
        const profile = profilesData?.find(p => p.clinic_id === clinic.id);
        
        // Calcular faixa de preços dos serviços
        let priceRange = 'Consulte';
        if (profile?.services && Array.isArray(profile.services)) {
          const prices = profile.services
            .map(service => service.price)
            .filter(price => price && price > 0)
            .sort((a, b) => a - b);
          
          if (prices.length > 0) {
            const minPrice = prices[0];
            const maxPrice = prices[prices.length - 1];
            priceRange = minPrice === maxPrice 
              ? `R$ ${minPrice.toFixed(0)}`
              : `R$ ${minPrice.toFixed(0)} - R$ ${maxPrice.toFixed(0)}`;
          }
        }

        return {
          id: clinic.id,
          name: clinic.name,
          city: clinic.city,
          state: clinic.address?.state || 'N/A',
          rating: clinic.rating || 4.5,
          reviewCount: clinic.review_count || 0,
          coverImage: profile?.cover_image || '/placeholder.svg',
          logo: profile?.logo || '/placeholder.svg',
          description: profile?.description || 'Clínica especializada em diversos tratamentos.',
          specialties: profile?.specialties || [],
          professionalCount: profile?.professional_count || 1,
          priceRange,
          services: profile?.services || [],
          latitude: clinic.latitude,
          longitude: clinic.longitude
        };
      });

      console.log('Clínicas carregadas:', clinicsWithProfiles.length);
      setClinics(clinicsWithProfiles);
    } catch (error) {
      console.error('Erro inesperado ao buscar clínicas:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao carregar as clínicas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewClinic = (clinicId: string) => {
    navigate(`/clinic/${clinicId}`);
  };







  const formatPrice = (min: number, max: number) => {
    if (min === undefined || min === null || max === undefined || max === null) {
      return 'Preço não disponível';
    }
    return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg"></div>
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Todas as Clínicas
        </h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Explore todas as nossas clínicas parceiras
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clinics.map((clinic) => (
          <Card 
            key={clinic.id} 
            className="overflow-hidden transition-all duration-300 hover:shadow-lg"
          >
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={clinic.coverImage || '/placeholder.svg'}
                alt={clinic.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-white/90">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {clinic.rating}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={clinic.logo} 
                    alt={clinic.name}
                  />
                  <AvatarFallback>
                    <Building2 className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {clinic.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {clinic.city}, {clinic.state}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {clinic.description}
              </p>

              {/* Specialties */}
              {clinic.specialties && clinic.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {clinic.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={`${clinic.id}-specialty-${index}-${specialty}`} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {clinic.specialties.length > 3 && (
                    <Badge key={`${clinic.id}-specialty-more`} variant="outline" className="text-xs">
                      +{clinic.specialties.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{clinic.professionalCount || 0} profissionais</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span>{clinic.reviewCount} avaliações</span>
                </div>
              </div>

              {/* Services and Prices */}
              {clinic.services && clinic.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Serviços em Destaque:</h4>
                  {clinic.services.slice(0, 2).map((service, index) => (
                    <div key={`${clinic.id}-service-${index}-${service.name}`} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="font-medium">
                        {service.price ? `R$ ${service.price.toFixed(0)}` : 'Consulte'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Price Range */}
              {clinic.priceRange && (
                <div className="text-sm">
                  <span className="font-medium text-primary">{clinic.priceRange}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <Button
                  onClick={() => handleViewClinic(clinic.id)}
                  variant="default"
                  className="w-full"
                >
                  Ver Clínica
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


    </div>
  );
}