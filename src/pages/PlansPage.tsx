import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Star, 
  Crown, 
  User,
  Building2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import StripeCheckout from '@/components/StripeCheckout';
import { stripePlans, StripePlan } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_popular: boolean;
  plan_type: 'patient' | 'clinic' | 'clinic_advanced';
  display_order: number;
  stripePriceId?: string;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planType = (searchParams.get('type') as 'patient' | 'clinic' | 'clinic_advanced') || 'patient';
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    console.log('PlansPage - Plan type:', planType);
    fetchPlans();
  }, [planType]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .eq('plan_type', planType)
        .order('display_order');

      if (error) throw error;

      // Processar dados dos planos
      const processedPlans: Plan[] = data?.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || '',
        price: plan.price || 0,
        period: plan.period || 'mensal',
        features: Array.isArray(plan.features) ? plan.features.map(String) : [],
        is_popular: plan.is_popular || false,
        plan_type: (plan.plan_type as 'patient' | 'clinic' | 'clinic_advanced') || planType,
        display_order: plan.display_order || 1
      })) || [];

      setPlans(processedPlans.length > 0 ? processedPlans : getMockPlans(planType));
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      setPlans(getMockPlans(planType));
    } finally {
      setLoading(false);
    }
  };

  const getMockPlans = (type: string): Plan[] => {
    switch (type) {
      case 'patient':
        return [
          {
            id: '1',
            name: 'Básico',
            description: 'Ideal para pacientes que buscam cuidados básicos',
            price: 29.90,
            period: 'mensal',
            features: [
              'Consultas básicas com desconto',
              'Lembretes de consulta',
              'Histórico médico digital',
              'Suporte via chat'
            ],
            is_popular: false,
            plan_type: 'patient',
            display_order: 1
          },
          {
            id: '2',
            name: 'Premium',
            description: 'Cobertura completa para toda a família',
            price: 59.90,
            period: 'mensal',
            features: [
              'Tudo do plano Básico',
              'Consultas ilimitadas',
              'Descontos em tratamentos',
              'Telemedicina incluída',
              'Programa de fidelidade'
            ],
            is_popular: true,
            plan_type: 'patient',
            display_order: 2
          }
        ];
      
      case 'clinic':
        return [
          {
            id: '3',
            name: 'Clínica Starter',
            description: 'Perfeito para clínicas que estão começando',
            price: 197.00,
            period: 'mensal',
            features: [
              'Gestão de agenda completa',
              'Cadastro de até 500 pacientes',
              'Relatórios básicos',
              'Suporte por email',
              'Integração com WhatsApp'
            ],
            is_popular: false,
            plan_type: 'clinic',
            display_order: 1
          },
          {
            id: '4',
            name: 'Clínica Pro',
            description: 'Para clínicas em crescimento',
            price: 397.00,
            period: 'mensal',
            features: [
              'Tudo do plano Starter',
              'Pacientes ilimitados',
              'Múltiplos profissionais',
              'Relatórios avançados',
              'Suporte prioritário',
              'Sistema de comissões'
            ],
            is_popular: true,
            plan_type: 'clinic',
            display_order: 2
          }
        ];
      
      case 'clinic_advanced':
        return [
          {
            id: '5',
            name: 'Analytics Pro',
            description: 'Análises avançadas e inteligência de negócio',
            price: 197.00,
            period: 'mensal',
            features: [
              'Dashboard executivo completo',
              'Previsões de receita com IA',
              'Análise de performance detalhada',
              'Relatórios personalizados',
              'Integração com Google Analytics'
            ],
            is_popular: false,
            plan_type: 'clinic_advanced',
            display_order: 1
          },
          {
            id: '6',
            name: 'Marketing Digital',
            description: 'Potencialize sua presença digital',
            price: 297.00,
            period: 'mensal',
            features: [
              'Gestão completa de redes sociais',
              'Campanhas Google Ads otimizadas',
              'Email marketing automatizado',
              'Landing pages profissionais',
              'Análise de ROI detalhada'
            ],
            is_popular: true,
            plan_type: 'clinic_advanced',
            display_order: 2
          },
          {
            id: '7',
            name: 'Website Pro',
            description: 'Site profissional para sua clínica',
            price: 147.00,
            period: 'mensal',
            features: [
              'Site responsivo personalizado',
              'SEO otimizado para clínicas',
              'Integração com agenda online',
              'Blog profissional incluído',
              'Certificado SSL e hospedagem'
            ],
            is_popular: false,
            plan_type: 'clinic_advanced',
            display_order: 3
          }
        ];
      
      default:
        return [];
    }
  };

  const getTypeIcon = () => {
    switch (planType) {
      case 'patient':
        return <User className="h-6 w-6" />;
      case 'clinic':
        return <Building2 className="h-6 w-6" />;
      case 'clinic_advanced':
        return <Crown className="h-6 w-6" />;
      default:
        return <Building2 className="h-6 w-6" />;
    }
  };

  const getTypeTitle = () => {
    switch (planType) {
      case 'patient':
        return 'Planos para Pacientes';
      case 'clinic':
        return 'Planos para Clínicas';
      case 'clinic_advanced':
        return 'Serviços Avançados';
      default:
        return 'Nossos Planos';
    }
  };

  const getTypeDescription = () => {
    switch (planType) {
      case 'patient':
        return 'Escolha o plano ideal para seus cuidados odontológicos';
      case 'clinic':
        return 'Transforme sua clínica com nossa plataforma completa';
      case 'clinic_advanced':
        return 'Expanda sua clínica com serviços premium';
      default:
        return 'Encontre o plano perfeito para suas necessidades';
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    // Para planos de paciente, redirecionar para cadastro
    if (plan.plan_type === 'patient') {
      if (!user) {
        // Usuário não logado - redirecionar para login/cadastro
        toast.info('Faça login ou cadastre-se para continuar com seu plano');
        navigate('/patient-login');
        return;
      } else {
        // Usuário logado - redirecionar para completar perfil/cadastro
        toast.success(`Plano ${plan.name} selecionado! Complete seu cadastro para ativar.`);
        navigate('/patient-profile');
        return;
      }
    }

    // Para planos de clínica, manter fluxo do Stripe
    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano');
      navigate('/clinic-login');
      return;
    }

    // Verificar se o plano tem stripePriceId configurado
    if (!plan.stripePriceId) {
      // Para planos sem Stripe configurado, usar planos padrão do Stripe
      // stripePlans is already imported from stripe.ts
      const matchingStripePlan = stripePlans.find(sp => 
        sp.name.toLowerCase().includes(plan.name.toLowerCase()) ||
        Math.abs(sp.price - plan.price) < 1
      );
      
      if (matchingStripePlan) {
        setSelectedPlan({
          ...plan,
          stripePriceId: matchingStripePlan.stripePriceId
        });
      } else {
        // Usar o primeiro plano como fallback
        setSelectedPlan({
          ...plan,
          stripePriceId: stripePlans[0]?.stripePriceId || 'price_basic_monthly'
        });
      }
    } else {
      setSelectedPlan(plan);
    }
    
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    toast.success('Assinatura realizada com sucesso!');
    
    // Redirecionar para o dashboard específico baseado no role do usuário
    if (user?.user_metadata?.role === 'clinic') {
      navigate('/clinic-dashboard');
    } else if (user?.user_metadata?.role === 'patient') {
      navigate('/patient-dashboard');
    } else {
      // Fallback para dashboard genérico se role não estiver definido
      navigate('/dashboard');
    }
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                {getTypeIcon()}
              </div>
              <h1 className="text-4xl font-bold text-foreground">{getTypeTitle()}</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              {getTypeDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative h-full transition-all duration-300 hover:shadow-xl ${
                plan.is_popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-full ${
                    plan.is_popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {planType === 'clinic_advanced' ? (
                      <Sparkles className={`h-6 w-6 ${
                        plan.is_popular ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    ) : (
                      getTypeIcon()
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">R$ {plan.price.toFixed(2).replace('.', ',')}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.is_popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {planType === 'clinic_advanced' ? 'Contratar Serviço' : 'Escolher Plano'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">Precisa de ajuda para escolher?</h3>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para te ajudar a encontrar o plano ideal para suas necessidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Falar com Especialista
              </Button>
              <Button variant="outline">
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Finalizar Assinatura</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCheckoutCancel}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <StripeCheckout
                plan={{
                  id: selectedPlan.id,
                  name: selectedPlan.name,
                  price: selectedPlan.price,
                  interval: selectedPlan.period === 'mensal' ? 'month' : 'year',
                  features: selectedPlan.features,
                  stripePriceId: selectedPlan.stripePriceId || 'price_basic_monthly'
                } as StripePlan}
                onSuccess={handleCheckoutSuccess}
                onCancel={handleCheckoutCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}