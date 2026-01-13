import React from 'react';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, MapPin, Heart, Star, CheckCircle, Users, TrendingUp, Search, Calendar, Calculator, Quote, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const HowItWorksPage = () => {
  const consultationSteps = [
    {
      number: "01",
      title: "CADASTRE-SE",
      description: "Crie sua conta gratuita em nossa plataforma e complete seu perfil com suas informações pessoais.",
      icon: UserPlus
    },
    {
      number: "02",
      title: "BUSQUE PROFISSIONAIS",
      description: "Encontre dentistas e clínicas especializadas próximas a você através de nossa plataforma.",
      icon: Search
    },
    {
      number: "03",
      title: "AGENDE SUA CONSULTA",
      description: "Escolha o horário que melhor se adequa à sua agenda e confirme seu agendamento.",
      icon: Calendar
    },
    {
      number: "04",
      title: "RECEBA ATENDIMENTO",
      description: "Compareça à consulta e receba o melhor atendimento odontológico com profissionais qualificados.",
      icon: Heart
    }
  ];

  const creditSteps = [
    {
      number: "01",
      title: "CADASTRE-SE",
      description: "Crie sua conta gratuita em nossa plataforma e complete seu perfil com suas informações pessoais.",
      icon: UserPlus
    },
    {
      number: "02",
      title: "SIMULE SEU CRÉDITO",
      description: "Informe o valor desejado e veja as condições disponíveis para seu financiamento odontológico.",
      icon: Calculator
    },
    {
      number: "03",
      title: "ESCOLHA A CLÍNICA",
      description: "Navegue por nossa rede de clínicas parceiras e escolha a que melhor atende suas necessidades.",
      icon: MapPin
    },
    {
      number: "04",
      title: "REALIZE SEU TRATAMENTO",
      description: "Com o crédito aprovado, inicie seu tratamento na clínica escolhida com total tranquilidade.",
      icon: Heart
    }
  ];

  const logoUrl = "/logo-white-final.png"; // Assuming it will be served from public or root

  return (
    <div className="min-h-screen bg-[#0F0F23] text-white">

      {/* Hero Section */}
      <section className="relative py-24 pt-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E94560]/10 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[120px] -ml-48 -mb-48 opacity-50"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="v2-dark" className="mb-6 px-4 py-2">
            COMO FUNCIONA
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            É TUDO MUITO <span className="text-[#E94560]">SIMPLES</span> E FÁCIL!
          </h1>
          <p className="text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            Escolha como quer começar sua jornada para um sorriso perfeito.
          </p>

          <Tabs defaultValue="consultas" className="w-full max-w-5xl mx-auto">
            <TabsList className="grid w-64 grid-cols-2 mb-12 mx-auto bg-white/5 border border-white/10 p-1 rounded-2xl h-14">
              <TabsTrigger
                value="consultas"
                className="rounded-xl data-[state=active]:bg-[#E94560] data-[state=active]:text-white transition-all font-bold"
              >
                Consultas
              </TabsTrigger>
              <TabsTrigger
                value="credito"
                className="rounded-xl data-[state=active]:bg-[#E94560] data-[state=active]:text-white transition-all font-bold"
              >
                Crédito
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {consultationSteps.map((step, index) => (
                  <Card key={index} className="bg-white/[0.03] border-white/[0.06] hover:border-[#E94560]/30 transition-all duration-500 group overflow-hidden rounded-[2rem]">
                    <CardContent className="p-8 text-center flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-[#E94560] to-[#FB923C] p-5 rounded-2xl shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform duration-500 w-16 h-16 flex items-center justify-center">
                          <img src="/logo-white-final.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-sm font-black">
                          {step.number}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-white/40 leading-relaxed font-medium text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="credito">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {creditSteps.map((step, index) => (
                  <Card key={index} className="bg-white/[0.03] border-white/[0.06] hover:border-[#8B5CF6]/30 transition-all duration-500 group overflow-hidden rounded-[2rem]">
                    <CardContent className="p-8 text-center flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] p-5 rounded-2xl shadow-lg shadow-[#8B5CF6]/20 group-hover:scale-110 transition-transform duration-500 w-16 h-16 flex items-center justify-center">
                          <img src="/logo-white-final.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="absolute -top-3 -right-3 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-sm font-black">
                          {step.number}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                      <p className="text-white/40 leading-relaxed font-medium text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-[#1A1A2E] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F0F23] to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              QUEM TEM CLÍNICA ODONTOLÓGICA, TEM<br />
              <span className="text-[#E94560]">TRANSFORMAÇÃO</span> GARANTIDA!
            </h2>
          </div>

          <div className="max-w-5xl mx-auto bg-white/[0.03] border border-white/[0.06] rounded-[3rem] p-10 md:p-16">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-[2.5rem] bg-white/5 border border-white/10 p-2 overflow-hidden shadow-2xl">
                  <img
                    src="/dentist_portrait_premium_1767984469045.png"
                    alt="Dr. Izze"
                    className="w-full h-full object-cover rounded-[2rem]"
                  />
                </div>
                <div className="text-center mt-6">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Avaliação Real</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <Quote className="w-12 h-12 text-[#E94560] opacity-20" />
                <blockquote className="text-2xl text-white/80 italic font-medium leading-relaxed">
                  "Através da nossa plataforma, conseguimos conectar milhares de pacientes com os melhores profissionais de saúde, oferecendo tratamentos de qualidade com condições de pagamento acessíveis. A transformação na vida dos nossos pacientes é nossa maior recompensa."
                </blockquote>
                <div>
                  <h4 className="text-xl font-bold text-white">Doutorizze</h4>
                  <p className="text-[#E94560] font-bold">Fundador e CEO</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 space-y-2">
            <p className="text-white/40 font-medium tracking-wide">MAIS DE 10 BANCOS E LOCADORAS PARCEIRAS</p>
            <p className="text-2xl font-black text-[#E94560]">&gt;&gt; CLÍNICA ODONTOLÓGICA</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 bg-[#0F0F23]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/[0.03] border-white/[0.06] border-l-4 border-l-[#E94560] rounded-3xl overflow-hidden group">
              <CardContent className="p-10 text-center space-y-4">
                <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">CLIENTES ATENDIDOS</h3>
                <p className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-500">7.336</p>
                <div className="w-12 h-1 bg-[#E94560] mx-auto rounded-full"></div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] border-l-4 border-l-[#4ADE80] rounded-3xl overflow-hidden group">
              <CardContent className="p-10 text-center space-y-4">
                <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">CLIENTES PAGOS</h3>
                <p className="text-6xl font-black text-white group-hover:scale-110 transition-transform duration-500">4.146</p>
                <div className="w-12 h-1 bg-[#4ADE80] mx-auto rounded-full"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-[#1A1A2E] relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="v2-blue" className="px-4 py-2">COBERTURA NACIONAL</Badge>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                Clínicas credenciadas em todo o <span className="text-[#3B82F6]">Brasil.</span>
              </h2>
              <p className="text-xl text-white/40 font-medium leading-relaxed">
                Nossa rede de clínicas parceiras está presente em todas as regiões do país, garantindo que você encontre o melhor atendimento próximo a você.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#4ADE80]/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#4ADE80]" />
                  </div>
                  <span className="font-bold text-white/80">Mais de 500 clínicas</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#4ADE80]/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#4ADE80]" />
                  </div>
                  <span className="font-bold text-white/80">Cobertura nacional</span>
                </div>
              </div>

              <Button size="xl" variant="v2-gradient" className="px-10">
                VER MAIS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[100px]"></div>
              <img
                src="/brazil_map_healthcare_isometric_1767984482926.png"
                alt="Mapa do Brasil"
                className="relative z-10 w-full hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
            Pronto para começar sua <span className="text-[#E94560]">transformação?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto font-medium lead-relaxed">
            Cadastre-se agora e encontre o tratamento ideal para você com condições exclusivas!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="xl" variant="v2-gradient" className="px-12">
              <Link to="/patient-login">Cadastrar Agora</Link>
            </Button>
            <Button asChild size="xl" variant="v2-outline" className="px-12">
              <Link to="/search">Buscar Clínicas</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;