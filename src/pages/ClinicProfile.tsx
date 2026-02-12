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
  Plus,
  ChevronRight,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar Profissional e Limpa */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Clínica Verificada</span>
              <Shield className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshClinicData}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <Button variant="outline" size="sm" className="hidden md:flex rounded-full border-slate-200 text-slate-600 hover:bg-slate-50">
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Hero Section: Design Institucional de Alto Nível */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
            <div className="flex flex-col lg:flex-row">
              {/* Info Area */}
              <div className="flex-1 p-8 lg:p-14 space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    Referência na Região
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                    {clinic.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {clinic.city}, {clinic.state}
                    </div>
                    {verification?.years_in_market && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Award className="w-4 h-4 text-blue-500" />
                        {verification.years_in_market} anos de mercado
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-w-2xl">
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {clinic.description || clinic.profile?.description ||
                      'Dedicada à excelência clínica e ao bem-estar dos pacientes. Infraestrutura moderna equipada com as tecnologias mais recentes do setor para garantir um atendimento de alta precisão e conforto.'}
                  </p>
                </div>

                {/* Estatísticas com Estilo Cards Limpos */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  {statistics?.rating > 0 && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold text-slate-900">{statistics.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Avaliação Média</p>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1 text-2xl font-bold text-slate-900 text-blue-600">
                      {statistics?.recommendation_rate || 98}%
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Recomendação</p>
                  </div>
                  {statistics?.patients_served && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1 text-2xl font-bold text-slate-900">
                        {statistics.patients_served >= 1000
                          ? `+${Math.floor(statistics.patients_served / 1000)}k`
                          : `+${statistics.patients_served}`
                        }
                      </div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Pacientes Atendidos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Area */}
              <div className="w-full lg:w-[45%] relative min-h-[400px]">
                <img
                  src={clinic.hero_image_url || clinic.profile?.hero_image_url || "https://images.unsplash.com/photo-1629909613654-28a3a7c4d444?auto=format&fit=crop&q=80&w=2000"}
                  alt={clinic.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-white/10 lg:to-white/20"></div>

                {/* Status Badge Over Image */}
                <div className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Atendimento Online</span>
                </div>
              </div>
            </div>
          </section>

          {/* Grid Inferior: Ações e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Coluna de Conteúdo (Esquerda) */}
            <div className="lg:col-span-8 space-y-16">
              {/* Diferenciais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Qualidade Certificada</h3>
                    <p className="text-sm text-slate-500">Protocolos de segurança e higiene rigorosamente auditados pela rede Doutorizze.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Equipe Especializada</h3>
                    <p className="text-sm text-slate-500">Corpo clínico graduado nas melhores instituições com atualização constante.</p>
                  </div>
                </div>
              </div>

              {/* Galeria Institucional */}
              {clinic.profile?.gallery_images && clinic.profile.gallery_images.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fotos da Unidade</h2>
                    <span className="h-[1px] flex-1 bg-slate-100 mx-6"></span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {clinic.profile.gallery_images.slice(0, 6).map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={image}
                          alt={`${clinic.name} ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna de Ações (Direita / Sticky) */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Agendar Consulta</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Selecione o melhor horário para seu atendimento presencial.</p>
                </div>

                <Button
                  onClick={() => navigate(`/booking/${clinic.id}`)}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 group"
                >
                  Continuar Agendamento
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </Button>

                <div className="grid grid-cols-1 gap-3">
                  <Dialog open={quoteModalOpen} onOpenChange={setQuoteModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        Solicitar Orçamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white sm:max-w-[425px] rounded-3xl border-none p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">Dados do Orçamento</DialogTitle>
                        <p className="text-sm text-slate-500">Envie detalhes do procedimento para análise prévia.</p>
                      </DialogHeader>
                      <form onSubmit={handleQuoteSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="quote-treatment" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição do Tratamento</Label>
                          <Textarea id="quote-treatment" className="min-h-[100px] border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Implante dentário, clareamento..." required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quote-phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone de Contato</Label>
                          <Input id="quote-phone" type="tel" className="h-12 border-slate-200 rounded-xl focus:ring-blue-500 focus:border-blue-500" placeholder="(00) 00000-0000" required />
                        </div>
                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4">Enviar Solicitação</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    onClick={handleCreditRedirect}
                    className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Crédito Odontológico
                  </Button>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{clinic.phone || '(00) 0000-0000'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Seg - Sex: 08h às 18h</span>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Proteção ao Paciente</h4>
                  <p className="text-[11px] text-slate-400">Agendamento garantido via Doutorizze.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
