import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Loader2 } from 'lucide-react';
import { usePricingPlans } from '@/hooks/usePricingPlans';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  premium?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline' | 'secondary';
  period: string;
  is_popular?: boolean | null;
}

const clinicPlans: Plan[] = [
  {
    id: 'clinic-basic',
    name: 'Básico',
    price: 149,
    description: 'Ideal para clínicas iniciantes',
    features: [
      { text: 'Até 100 agendamentos/mês', included: true },
      { text: 'Cadastro de até 2 profissionais', included: true },
      { text: 'Relatórios básicos', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Integração com WhatsApp', included: false },
      { text: 'Relatórios avançados', included: false },
      { text: 'API personalizada', included: false }
    ],
    buttonText: 'Começar Agora',
    buttonVariant: 'outline'
  },
  {
    id: 'clinic-professional',
    name: 'Profissional',
    price: 299,
    originalPrice: 399,
    description: 'Para clínicas em crescimento',
    features: [
      { text: 'Até 500 agendamentos/mês', included: true },
      { text: 'Cadastro de até 10 profissionais', included: true },
      { text: 'Relatórios avançados', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Integração com WhatsApp', included: true },
      { text: 'Sistema de lembretes', included: true },
      { text: 'API personalizada', included: false }
    ],
    popular: true,
    buttonText: 'Mais Popular',
    buttonVariant: 'default'
  },
  {
    id: 'clinic-premium',
    name: 'Premium',
    price: 499,
    description: 'Para clínicas estabelecidas',
    features: [
      { text: 'Agendamentos ilimitados', included: true },
      { text: 'Profissionais ilimitados', included: true },
      { text: 'Relatórios completos + BI', included: true },
      { text: 'Suporte 24/7', included: true },
      { text: 'Integração completa WhatsApp', included: true },
      { text: 'Sistema de lembretes avançado', included: true },
      { text: 'API personalizada', included: true }
    ],
    premium: true,
    buttonText: 'Contratar Premium',
    buttonVariant: 'default'
  }
];

const patientPlans: Plan[] = [
  {
    id: 'patient-individual',
    name: 'Individual',
    price: 29,
    description: 'Para você que busca cuidado dental',
    features: [
      { text: 'Consultas de emergência', included: true },
      { text: 'Limpeza semestral', included: true },
      { text: 'Desconto de 20% em tratamentos', included: true },
      { text: 'Agendamento online', included: true },
      { text: 'Ortodontia incluída', included: false },
      { text: 'Implantes com desconto', included: false },
      { text: 'Cobertura familiar', included: false }
    ],
    buttonText: 'Assinar Plano',
    buttonVariant: 'outline'
  },
  {
    id: 'patient-family',
    name: 'Família',
    price: 89,
    originalPrice: 120,
    description: 'Proteção para toda a família',
    features: [
      { text: 'Até 4 pessoas da família', included: true },
      { text: 'Consultas de emergência', included: true },
      { text: 'Limpeza semestral para todos', included: true },
      { text: 'Desconto de 30% em tratamentos', included: true },
      { text: 'Ortodontia com desconto', included: true },
      { text: 'Agendamento prioritário', included: true },
      { text: 'Implantes com desconto', included: false }
    ],
    popular: true,
    buttonText: 'Mais Escolhido',
    buttonVariant: 'default'
  },
  {
    id: 'patient-premium',
    name: 'Premium',
    price: 149,
    description: 'Cobertura completa e premium',
    features: [
      { text: 'Cobertura familiar completa', included: true },
      { text: 'Consultas ilimitadas', included: true },
      { text: 'Limpeza trimestral', included: true },
      { text: 'Desconto de 50% em tratamentos', included: true },
      { text: 'Ortodontia incluída', included: true },
      { text: 'Implantes com 40% desconto', included: true },
      { text: 'Atendimento 24h', included: true }
    ],
    premium: true,
    buttonText: 'Contratar Premium',
    buttonVariant: 'default'
  }
];

const PricingSection = () => {
  const navigate = useNavigate();
  const { plans: dbPlans, loading, error } = usePricingPlans('patient');

  // Converter planos do banco para o formato da interface
  const convertDbPlansToPlans = (dbPlans: any[]): Plan[] => {
    return dbPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      description: plan.description || '',
      features: plan.features.map((feature: string) => ({ text: feature, included: true })),
      popular: plan.is_popular || false,
      premium: false,
      buttonText: 'Escolher Plano',
      buttonVariant: plan.is_popular ? 'default' : 'outline' as 'default' | 'outline' | 'secondary',
      period: plan.period,
      is_popular: plan.is_popular
    }));
  };

  // Usar planos do banco se disponíveis, senão usar planos padrão
  const currentPlans = dbPlans && dbPlans.length > 0 ? convertDbPlansToPlans(dbPlans) : patientPlans;

  const handleSelectPlan = (planId: string) => {
    navigate(`/plans?type=patient&planId=${planId}`);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planos para Pacientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para você e sua família. Cuidado dental de qualidade com preços acessíveis.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando planos...</span>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Planos para Pacientes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para você e sua família. Cuidado dental de qualidade com preços acessíveis.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Erro ao carregar planos: {error}</p>
            <p className="text-muted-foreground">Exibindo planos padrão...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Planos para Pacientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para você e sua família. Cuidado dental de qualidade com preços acessíveis.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary shadow-lg scale-105'
                  : plan.premium
                  ? 'border-yellow-500 shadow-lg'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold">
                    <Star className="h-4 w-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              {/* Premium Badge */}
              {plan.premium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 text-sm font-semibold">
                    <Crown className="h-4 w-4 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                
                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(plan.originalPrice)}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(plan.price)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">/mês</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`mt-0.5 ${
                      feature.included ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      <Check className={`h-4 w-4 ${
                        feature.included ? 'opacity-100' : 'opacity-30'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full ${
                    plan.popular || plan.premium
                      ? 'bg-gradient-primary hover:opacity-90'
                      : ''
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
};

export default PricingSection;