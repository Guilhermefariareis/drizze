import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  Heart, 
  Share2, 
  Shield, 
  Award, 
  CheckCircle, 
  Users, 
  TrendingUp,
  CreditCard,
  FileText,
  DollarSign,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BaseClinic, ClinicProfile } from '@/types/clinic';
import { useUserRole } from '@/hooks/useUserRole';

interface ExtendedClinic extends BaseClinic {
  profile?: ClinicProfile & {
    statistics?: {
      rating: number;
      total_reviews: number;
      recommendation_rate: number;
      patients_served: number;
    };
    verification_status?: {
      is_verified: boolean;
      has_ra1000: boolean;
      years_in_market: number;
    };
  };
  services?: any[];
  professionals?: any[];
  reviews?: any[];
}

export default function ClinicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [clinic, setClinic] = useState<ExtendedClinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Função para redirecionar para crédito odontológico
  const handleCreditRedirect = () => {
    if (user) {
      navigate('/patient-dashboard');
    } else {
      navigate('/patient-login');
    }
  };

  // Botão Voltar: direciona para o dashboard conforme papel do usuário
  const handleBack = () => {
    if (role === 'clinic') {
      navigate('/clinic-dashboard');
    } else if (role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/search');
    }
  };

  // Função para forçar atualização dos dados
  const refreshClinicData = useCallback(async () => {
    console.log('🔄 Forçando atualização dos dados da clínica...');
    if (id) {
      localStorage.removeItem(`clinic_cache_invalidated_${id}`);
      localStorage.setItem(`clinic_cache_invalidated_${id}`, Date.now().toString());
      await fetchClinicData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClinicData();
    }
  }, [id]);

  // Listener para mudanças no localStorage (invalidação de cache)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `clinic_cache_invalidated_${id}`) {
        console.log('🔔 Detectada invalidação de cache, recarregando...');
        refreshClinicData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id, refreshClinicData]);

  const fetchClinicData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null); // Limpar erro anterior
      
      console.log('🔍 Buscando dados da clínica com ID:', id);
      
      // Verificar se há invalidação de cache e timestamp
      const cacheInvalidated = localStorage.getItem(`clinic_cache_invalidated_${id}`);
      const cacheTimestamp = cacheInvalidated ? parseInt(cacheInvalidated) : 0;
      const now = Date.now();
      const cacheAge = now - cacheTimestamp;
      const maxCacheAge = 5 * 60 * 1000; // 5 minutos
      
      if (cacheInvalidated) {
        console.log('🗑️ Cache foi invalidado em:', new Date(cacheTimestamp));
        console.log('⏰ Idade do cache:', Math.round(cacheAge / 1000), 'segundos');
        
        if (cacheAge > maxCacheAge) {
          console.log('🧹 Cache muito antigo, limpando...');
          localStorage.removeItem(`clinic_cache_invalidated_${id}`);
        }
      }
      
      // Buscar dados da clínica
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', id)
        .single();

      if (clinicError) {
        console.error('❌ Erro ao buscar clínica:', clinicError);
        throw clinicError;
      }

      console.log('📋 Dados da clínica encontrados:', {
        id: clinicData.id,
        name: clinicData.name,
        description: clinicData.description?.substring(0, 50) + '...',
        logo_url: clinicData.logo_url,
        hero_image_url: clinicData.hero_image_url,
        phone: clinicData.phone,
        email: clinicData.email,
        website: clinicData.website,
        updated_at: clinicData.updated_at
      });

      // Buscar perfil da clínica
      const { data: profileData, error: profileError } = await supabase
        .from('clinic_profiles')
        .select('*')
        .eq('clinic_id', id)
        .maybeSingle();

      if (profileError) {
        console.error('⚠️ Erro ao buscar perfil da clínica:', profileError);
      } else {
        console.log('👤 Perfil da clínica:', profileData ? 'Encontrado' : 'Não encontrado');
      }

      // Buscar serviços
      const { data: servicesData, error: servicesError } = await supabase
        .from('clinic_services')
        .select('*')
        .eq('clinic_id', id);

      if (servicesError) {
        console.error('⚠️ Erro ao buscar serviços:', servicesError);
      } else {
        console.log('🔧 Serviços encontrados:', servicesData?.length || 0);
      }

      // Buscar profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('clinic_professionals')
        .select('*')
        .eq('clinic_id', id);

      if (professionalsError) {
        console.error('⚠️ Erro ao buscar profissionais:', professionalsError);
      } else {
        console.log('👨‍⚕️ Profissionais encontrados:', professionalsData?.length || 0);
      }

      // Buscar avaliações
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('clinic_reviews')
        .select('*')
        .eq('clinic_id', id);

      if (reviewsError) {
        console.error('⚠️ Erro ao buscar avaliações:', reviewsError);
      } else {
        console.log('⭐ Avaliações encontradas:', reviewsData?.length || 0);
      }

      // Calcular estatísticas reais
      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      const recommendationRate = totalReviews > 0 
        ? (reviewsData.filter(review => review.would_recommend).length / totalReviews) * 100 
        : 0;

      console.log('📊 Estatísticas calculadas:', {
        totalReviews,
        averageRating: averageRating.toFixed(1),
        recommendationRate: recommendationRate.toFixed(1) + '%'
      });

      // Criar perfil aprimorado
      const enhancedProfile = {
        ...profileData,
        verified: true,
        editable: true,
        stats: {
          rating: averageRating,
          totalReviews,
          recommendationRate
        }
      };

      // Atualizar estado
      setClinic({
        ...clinicData,
        profile: enhancedProfile,
        services: servicesData || [],
        professionals: professionalsData || [],
        reviews: reviewsData || []
      });

      console.log('✅ Dados da clínica carregados com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados da clínica:', error);
      setError('Erro ao carregar dados da clínica');
    } finally {
      setLoading(false);
    }
  };



  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Solicitação de orçamento enviada! Resposta em até 2 horas.');
    setQuoteModalOpen(false);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>
        <div className="w-full px-6 py-8 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Carregando perfil da clínica...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>
        <div className="w-full px-6 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Erro ao carregar clínica</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={refreshClinicData} variant="default">
                🔄 Tentar novamente
              </Button>
              <Button onClick={() => navigate('/search')} variant="outline">
                Voltar à busca
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
          <Navbar />
        </div>
        <div className="w-full px-6 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Clínica não encontrada</h1>
            <Button onClick={() => navigate('/search')}>
              Voltar à busca
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatAddress = (address: any) => {
    if (typeof address === 'object' && address !== null) {
      const parts = [
        address.street,
        address.neighborhood,
        address.city,
        address.state
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
    }
    return address || 'Endereço não informado';
  };

  const statistics = clinic.profile?.statistics;
  const verification = clinic.profile?.verification_status;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
        <Navbar />
      </div>
      
      <div className="pt-20">
        {/* Botão Voltar alinhado à esquerda */}
        <div className="container mx-auto px-6 mb-4">
          <Button variant="outline" className="flex items-center" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        {/* Header com Imagem de Capa */}
        <div 
          className="text-white relative overflow-hidden min-h-[400px]"
          style={{
            backgroundImage: clinic.hero_image_url || clinic.profile?.hero_image_url 
              ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${clinic.hero_image_url || clinic.profile?.hero_image_url})`
              : 'linear-gradient(to right, #2563eb, #3b82f6)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-6 py-12">
            {/* Botão de atualização */}
            <div className="absolute top-4 right-6">
              <Button
                onClick={refreshClinicData}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Logo e Informações da Clínica */}
              <div className="flex items-start gap-6 flex-1">
                <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg flex-shrink-0">
                  <img
                    src={clinic.logo_url || clinic.profile?.logo_url || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20clinic%20logo%20modern%20tooth%20icon%20blue%20white%20professional&image_size=square"}
                    alt={`Logo ${clinic.name}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h1 className="text-3xl lg:text-4xl font-bold">{clinic.name}</h1>
                    {verification?.is_verified && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Shield className="w-4 h-4 mr-1" />
                        Verificada
                      </Badge>
                    )}
                    {verification?.has_ra1000 && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <Award className="w-4 h-4 mr-1" />
                        RA1000
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-blue-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.city}, {clinic.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-green-300 font-medium">Aberto agora</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-blue-50 text-lg leading-relaxed max-w-2xl">
                    {clinic.description || clinic.profile?.description || 
                     'Clínica odontológica moderna com tecnologia de ponta e profissionais especializados. Atendimento humanizado e tratamentos de qualidade para toda a família.'}
                  </p>
                </div>
              </div>

              {/* Cards de Ação */}
              <div className="w-full lg:w-80 bg-white rounded-xl shadow-xl p-6 text-gray-900">
                <h3 className="text-lg font-semibold mb-4 text-center">O que você precisa?</h3>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 h-auto"
                    onClick={() => {
                      console.log('🔘 Redirecionando para página de agendamento:', `/booking/${clinic.id}`);
                      navigate(`/booking/${clinic.id}`);
                    }}
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Agendar consulta</div>
                      <div className="text-xs opacity-90">Horários disponíveis hoje</div>
                    </div>
                  </Button>

                  <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full border-purple-200 hover:bg-purple-50 py-3 h-auto">
                        <FileText className="w-5 h-5 mr-2 text-purple-600" />
                        <div className="text-left">
                          <div className="font-semibold text-purple-700">Pedir orçamento</div>
                          <div className="text-xs text-purple-600">Resposta em até 2h</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Orçamento</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleQuoteSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="quote-treatment">Tratamento desejado</Label>
                          <Textarea id="quote-treatment" placeholder="Descreva o tratamento que você precisa..." required />
                        </div>
                        <div>
                          <Label htmlFor="quote-phone">Telefone para contato</Label>
                          <Input id="quote-phone" type="tel" placeholder="(11) 99999-9999" required />
                        </div>
                        <Button type="submit" className="w-full">Solicitar Orçamento</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className="w-full border-green-200 hover:bg-green-50 py-3 h-auto"
                    onClick={handleCreditRedirect}
                  >
                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                    <div className="text-left">
                      <div className="font-semibold text-green-700">Crédito odontológico</div>
                      <div className="text-xs text-green-600">Até R$ 30.000 aprovados</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="container mx-auto px-6 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Avaliação média - só exibe se houver avaliações */}
            {statistics?.rating > 0 && statistics?.total_reviews > 0 && (
              <Card className="text-center shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-8 w-8 text-yellow-500 fill-current" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">
                    {statistics.total_reviews} {statistics.total_reviews === 1 ? 'avaliação' : 'avaliações'}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Porcentagem de recomendação - só exibe se houver dados */}
            {statistics?.recommendation_rate !== null && statistics?.recommendation_rate !== undefined && (
              <Card className="text-center shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.recommendation_rate}%</div>
                  <div className="text-sm text-gray-600">Recomendam a clínica</div>
                </CardContent>
              </Card>
            )}

            {/* Pacientes atendidos - só exibe se a clínica informou */}
            {statistics?.patients_served && (
              <Card className="text-center shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {statistics.patients_served >= 1000 
                      ? `+${Math.floor(statistics.patients_served / 1000)}k` 
                      : `+${statistics.patients_served}`
                    }
                  </div>
                  <div className="text-sm text-gray-600">Pacientes atendidos</div>
                </CardContent>
              </Card>
            )}

            {/* Mensagem quando não há estatísticas */}
            {(!statistics?.rating || statistics.rating === 0) && 
             !statistics?.patients_served && 
             (statistics?.recommendation_rate === null || statistics?.recommendation_rate === undefined) && (
              <Card className="text-center shadow-lg col-span-full">
                <CardContent className="p-6">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">Clínica em crescimento</div>
                    <div className="text-sm">Seja um dos primeiros a avaliar esta clínica!</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Por que confiar? */}
        <div className="container mx-auto px-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">Por que confiar?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Clínica verificada pelo Doutorizze</div>
                    <div className="text-sm text-gray-600">Documentação e credenciais validadas</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-700">Certificação RA1000</div>
                    <div className="text-sm text-gray-600">Padrão de excelência em atendimento</div>
                  </div>
                </div>

                {/* Anos no mercado - só exibe se a clínica informou */}
                {verification?.years_in_market && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-purple-700">
                        {verification.years_in_market > 1 
                          ? `Mais de ${verification.years_in_market} anos no mercado`
                          : `${verification.years_in_market} ano no mercado`
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {verification.experience_description || 'Experiência e tradição comprovadas'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Contato */}
        <div className="container mx-auto px-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Endereço</div>
                    <div className="text-sm text-gray-600">{formatAddress(clinic.address)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Telefone</div>
                    <div className="text-sm text-gray-600">{clinic.phone || 'Telefone não informado'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium">Horário de Funcionamento</div>
                    <div className="text-sm text-gray-600">Segunda a Sexta: 8h às 18h</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Galeria de Imagens */}
        {clinic.profile?.gallery_images && clinic.profile.gallery_images.length > 0 && (
          <div className="container mx-auto px-6 mb-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Galeria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clinic.profile.gallery_images.slice(0, 6).map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${clinic.name} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </div>

      <Footer />
    </div>
  );
}
  const handleBack = () => {
    if (role === 'clinic') {
      navigate('/clinic-dashboard');
    } else if (role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/search');
    }
  };
