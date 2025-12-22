import React from 'react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus, CreditCard, MapPin, Heart, Star, CheckCircle, Users, TrendingUp, Search, Calendar, Calculator } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 pt-32"> {/* Adiciona pt-32 para compensar navbar fixa */}
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            COMO FUNCIONA
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            É TUDO MUITO SIMPLES E FÁCIL!
          </p>
          
          <Tabs defaultValue="consultas" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/10 backdrop-blur-sm">
              <TabsTrigger 
                value="consultas" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white"
              >
                Fluxo de Consultas
              </TabsTrigger>
              <TabsTrigger 
                value="credito" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 text-white"
              >
                Fluxo de Crédito
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultas">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {consultationSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="text-lg font-bold mb-2 text-center">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-sm opacity-90">{step.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="credito">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  return (
                    <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="text-lg font-bold mb-2 text-center">
                          {index + 1}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-sm opacity-90">{step.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              QUEM TEM CLÍNICA ODONTOLÓGICA, TEM<br />
              TRANSFORMAÇÃO GARANTIDA!
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20smiling%20dentist%20doctor%20with%20stethoscope%20white%20medical%20coat%20friendly%20portrait%20healthcare%20professional%20confident%20doltorizze&image_size=square" 
                    alt="Dr. Izze" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center mt-4">
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Avaliação dos pacientes</p>
                </div>
              </div>
              
              <div className="flex-1">
                <blockquote className="text-lg text-gray-700 italic mb-4">
                  "Através da nossa plataforma, conseguimos conectar milhares de pacientes com os melhores profissionais de saúde, oferecendo tratamentos de qualidade com condições de pagamento acessíveis. A transformação na vida dos nossos pacientes é nossa maior recompensa."
                </blockquote>
                <cite className="text-gray-600">
                  <strong>Doutorizze</strong><br />
                  Fundador e CEO
                </cite>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-blue-600 font-semibold">Mais de 10 bancos e locadoras parceiras</p>
            <p className="text-blue-600 text-lg font-bold">&gt;&gt; clínica odontológica</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="bg-blue-600 text-white text-center">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-2">CLIENTES ATENDIDOS</h3>
                <p className="text-4xl font-bold">7.336</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-600 text-white text-center">
              <CardContent className="p-8">
                <h3 className="text-lg font-semibold mb-2">CLIENTES PAGOS</h3>
                <p className="text-4xl font-bold">4.146</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Clínicas credenciadas em todo<br />
                o Brasil.
              </h2>
              <p className="text-gray-600 mb-8">
                Nossa rede de clínicas parceiras está presente em todas as regiões do país, garantindo que você encontre o melhor atendimento próximo a você.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Mais de 500 clínicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Cobertura nacional</span>
                </div>
              </div>
              
              <Button className="bg-black text-white hover:bg-gray-800">
                VER MAIS
              </Button>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=3D%20isometric%20brazil%20map%20with%20dental%20clinic%20location%20markers%20pins%20healthcare%20network%20coverage%20modern%20blue%20green%20colors%20medical%20icons&image_size=square" 
                alt="Mapa do Brasil com clínicas credenciadas" 
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua transformação?
          </h2>
          <p className="text-xl mb-8">
            Cadastre-se agora e encontre o tratamento ideal para você!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link to="/patient-login">Cadastrar Agora</Link>
            </Button>
            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600">
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