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
    <section id="about" className="py-24 bg-[#0F0F23] relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E94560]/5 rounded-full blur-[120px] -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="v2-dark" className="mb-6 px-4 py-2">
            COMO FUNCIONA
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Duas Formas de <span className="text-[#E94560]">Cuidar</span> da sua Saúde
          </h2>
          <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium">
            Escolha entre agendar consultas diretamente ou solicitar crédito para financiar seu tratamento com condições exclusivas.
          </p>
        </div>

        <Tabs defaultValue="credit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-16 max-w-md mx-auto bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
            <TabsTrigger value="credit" className="rounded-xl data-[state=active]:bg-[#E94560] data-[state=active]:text-white transition-all font-bold">
              <CreditCard className="w-4 h-4 mr-2" />
              Crédito Odonto
            </TabsTrigger>
            <TabsTrigger value="consultation" className="rounded-xl data-[state=active]:bg-[#E94560] data-[state=active]:text-white transition-all font-bold">
              <Calendar className="w-4 h-4 mr-2" />
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
                    <Card className="h-full bg-white/[0.03] border-white/[0.06] hover:border-[#E94560]/30 transition-all duration-500 group overflow-hidden rounded-[2rem]">
                      <CardHeader className="text-center pb-6">
                        <div className="relative inline-flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-br from-[#E94560] to-[#FB923C] p-5 rounded-2xl shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform duration-500 w-16 h-16 flex items-center justify-center">
                            <img src="/logo-white-final.png" alt="Logo" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-sm font-black">
                            {step.id}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-white">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-white/40 leading-relaxed font-medium">
                          {step.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <ul className="space-y-3">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-white/60">
                              <div className="w-5 h-5 rounded-full bg-[#4ADE80]/10 flex items-center justify-center mr-3">
                                <CheckCircle className="w-3 h-3 text-[#4ADE80]" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {index < consultationSteps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-white/10">
                        <ArrowRight className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefits for consultation */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ADE80]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#4ADE80]/10 transition-colors duration-700"></div>

              <h3 className="text-2xl font-black text-white text-center mb-10">
                Por que agendar com a <span className="text-[#E94560]">Doutorizze</span>?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#4ADE80]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#4ADE80]" />
                    </div>
                    <span className="text-white/80 font-medium">{benefit}</span>
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
                    <Card className="h-full bg-white/[0.03] border-white/[0.06] hover:border-[#8B5CF6]/30 transition-all duration-500 group overflow-hidden rounded-[2rem]">
                      <CardHeader className="text-center pb-6">
                        <div className="relative inline-flex items-center justify-center mb-4">
                          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] p-5 rounded-2xl shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-110 transition-transform duration-500 w-16 h-16 flex items-center justify-center">
                            <img src="/logo-white-final.png" alt="Logo" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-sm font-black">
                            {step.id}
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-white">
                          {step.title}
                        </CardTitle>
                        <CardDescription className="text-white/40 leading-relaxed font-medium">
                          {step.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <ul className="space-y-3">
                          {step.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-white/60">
                              <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center mr-3">
                                <CheckCircle className="w-3 h-3 text-[#8B5CF6]" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {index < creditSteps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-white/10">
                        <ArrowRight className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Benefits for credit */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#8B5CF6]/10 transition-colors duration-700"></div>

              <h3 className="text-2xl font-black text-white text-center mb-10">
                Vantagens do <span className="text-[#8B5CF6]">Crédito Odonto</span> Doutorizze
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creditBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                    </div>
                    <span className="text-white/80 font-medium">{benefit}</span>
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