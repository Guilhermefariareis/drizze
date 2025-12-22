import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Star,
  ArrowRight,
  CheckCircle,
  FileText,
  UserCheck,
  Handshake,
  DollarSign
} from "lucide-react";

const consultationSteps = [
  {
    id: 1,
    icon: Search,
    title: "Encontre o Profissional",
    description: "Busque por especialidade, localização ou tipo de tratamento. Compare preços, avaliações e disponibilidade.",
    features: ["Filtros avançados", "Avaliações reais", "Localização próxima"]
  },
  {
    id: 2,
    icon: Calendar,
    title: "Agende sua Consulta",
    description: "Escolha o melhor horário disponível e confirme seu agendamento em tempo real.",
    features: ["Agenda em tempo real", "Confirmação automática", "Lembretes por WhatsApp"]
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Pague com Segurança",
    description: "Faça o pagamento online ou presencial. Oferecemos parcelamento e opções de crédito.",
    features: ["Cartão ou Pix", "Parcelamento", "Crédito aprovado"]
  },
  {
    id: 4,
    icon: Star,
    title: "Avalie sua Experiência",
    description: "Compartilhe sua experiência e ajude outros pacientes a encontrarem o melhor atendimento.",
    features: ["Sistema de avaliação", "Feedback construtivo", "Melhoria contínua"]
  }
];

const creditSteps = [
  {
    id: 1,
    icon: FileText,
    title: "Solicite seu Crédito",
    description: "Preencha o formulário com seus dados e o valor desejado. Processo 100% online e seguro.",
    features: ["Formulário simples", "Documentos digitais", "Processo rápido"]
  },
  {
    id: 2,
    icon: UserCheck,
    title: "Análise de Crédito",
    description: "Nossa equipe analisa seu perfil em até 24 horas. Critérios justos e transparentes.",
    features: ["Análise em 24h", "Critérios transparentes", "Feedback detalhado"]
  },
  {
    id: 3,
    icon: Handshake,
    title: "Aprovação e Liberação",
    description: "Com a aprovação, seu crédito é liberado e você pode escolher a clínica e agendar seu tratamento.",
    features: ["Liberação imediata", "Escolha livre da clínica", "Flexibilidade total"]
  },
  {
    id: 4,
    icon: DollarSign,
    title: "Pague em Parcelas",
    description: "Realize seu tratamento e pague em parcelas fixas, sem surpresas ou taxas ocultas.",
    features: ["Parcelas fixas", "Sem taxas ocultas", "Flexibilidade de pagamento"]
  }
];

const benefits = [
  "Profissionais verificados e qualificados",
  "Preços transparentes e competitivos", 
  "Agendamento rápido e fácil",
  "Suporte 24/7 para dúvidas",
  "Garantia de qualidade nos serviços",
  "Programa de fidelidade com descontos"
];

const creditBenefits = [
  "Aprovação em até 24 horas",
  "Sem consulta ao SPC/Serasa*",
  "Até 24x para pagar",
  "Taxa de juros competitiva",
  "Sem taxa de adesão",
  "Atendimento especializado"
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-success/10 text-success hover:bg-success/20">
            Como Funciona
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Duas Formas de Cuidar da sua Saúde
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Escolha entre agendar consultas diretamente ou solicitar crédito para financiar seu tratamento
          </p>
        </div>

        <Tabs defaultValue="credit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 max-w-md mx-auto">
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Crédito Odonto
            </TabsTrigger>
            <TabsTrigger value="consultation" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Consultas
            </TabsTrigger>
          </TabsList>

          {/* Fluxo de Consultas */}
          <TabsContent value="consultation" className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {consultationSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="relative">
                    <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-medium bg-gradient-card">
                      <CardHeader className="text-center pb-4">
                        <div className="relative inline-flex items-center justify-center">
                          <div className="bg-gradient-primary p-4 rounded-full text-white shadow-glow">
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {step.id}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-foreground mt-4">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    {/* Arrow for desktop */}
                    {index < consultationSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefits for consultation */}
            <div className="bg-white rounded-2xl p-8 shadow-large border">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Por que agendar com a Doutorizze?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Fluxo de Crédito */}
          <TabsContent value="credit" className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {creditSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="relative">
                    <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-medium bg-gradient-card">
                      <CardHeader className="text-center pb-4">
                        <div className="relative inline-flex items-center justify-center">
                          <div className="bg-gradient-primary p-4 rounded-full text-white shadow-glow">
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                            {step.id}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-foreground mt-4">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <ul className="space-y-2">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-success mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    {/* Arrow for desktop */}
                    {index < creditSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-8 h-8 text-primary/60" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefits for credit */}
            <div className="bg-white rounded-2xl p-8 shadow-large border">
              <h3 className="text-2xl font-bold text-foreground text-center mb-8">
                Vantagens do Crédito Odonto Doutorizze
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creditBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  * Sujeito à política de crédito da instituição financeira parceira
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default HowItWorks;