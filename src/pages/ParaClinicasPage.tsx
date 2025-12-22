import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Smartphone,
  BarChart3,
  Target,
  Zap,
  Award,
  Heart,
  MessageCircle,
  Globe,
  DollarSign,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MultiStepContactForm from '@/components/MultiStepContactForm';

const ParaClinicasPage = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('solucoes');

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 120; // Offset para compensar o menu fixo
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['solucoes', 'como-funciona', 'resultados', 'faq'];
      const scrollPosition = window.scrollY + 150;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const sectionTop = element.offsetTop;
          const sectionBottom = sectionTop + element.offsetHeight;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SecondaryMenu = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const menuItems = [
      { id: 'solucoes', label: 'Soluções' },
      { id: 'como-funciona', label: 'Como Funciona' },
      { id: 'resultados', label: 'Resultados' },
      { id: 'faq', label: 'FAQ' }
    ];

    const openContactForm = () => {
      // Fechar menu mobile se estiver aberto
      setIsMobileMenuOpen(false);
      
      // Procurar pela seção do formulário usando texto do h2
      const headings = document.querySelectorAll('h2');
      let formSection = null;
      
      headings.forEach(heading => {
        if (heading.textContent?.includes('Fale com nosso time')) {
          formSection = heading.closest('section');
        }
      });
      
      if (formSection) {
        const offset = 100; // Offset para compensar os menus fixos
        const elementPosition = formSection.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      } else {
        // Fallback: scroll para o final da página onde está o formulário
        window.scrollTo({ top: document.body.scrollHeight - window.innerHeight, behavior: 'smooth' });
      }
    };

    const handleMenuItemClick = (sectionId: string) => {
      scrollToSection(sectionId);
      setIsMobileMenuOpen(false); // Fechar menu mobile ao clicar em item
    };

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
      <>
        <div className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-4">
              {/* Desktop Menu */}
              <div className="hidden lg:flex space-x-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                      activeSection === item.id
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Hamburger Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <div className="flex flex-col justify-center items-center w-6 h-6">
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                  }`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                  }`}></span>
                </div>
              </button>
              
              {/* Contact Button - Always Visible */}
              <Button 
                onClick={openContactForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
              >
                <span className="hidden sm:inline">Falar com Especialista</span>
                <span className="sm:hidden">Contato</span>
              </Button>
            </nav>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-4 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                      activeSection === item.id
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    );
  };

  const benefits = [
    {
      icon: Users,
      title: 'Mais pacientes qualificados',
      description: 'Atraia novos pacientes através da nossa vitrine digital otimizada'
    },
    {
      icon: CreditCard,
      title: 'Crédito odontológico aprovado em minutos',
      description: 'Integração com múltiplas fintechs para aprovação instantânea de crédito'
    },
    {
      icon: TrendingUp,
      title: 'Impulsionamento e Ads na plataforma',
      description: 'Marketing especializado para maximizar sua visibilidade online'
    },
    {
      icon: BarChart3,
      title: 'Dashboard com métricas e resultados',
      description: 'Acompanhe performance, conversões e ROI em tempo real'
    }
  ];

  const services = [
    {
      icon: Smartphone,
      title: 'Vitrine Digital Completa',
      description: 'Perfil profissional com fotos, especialidades, horários e avaliações',
      features: ['Galeria de fotos', 'Descrição detalhada', 'Horários de funcionamento', 'Localização no mapa']
    },
    {
      icon: BarChart3,
      title: 'Marketing Digital Inteligente',
      description: 'Apareça para pacientes que procuram seus serviços na sua região',
      features: ['SEO otimizado', 'Anúncios direcionados', 'Relatórios de performance', 'Gestão de reputação']
    },
    {
      icon: CreditCard,
      title: 'Crédito Odonto Facilitado',
      description: 'Ofereça parcelamento sem juros e aumente o ticket médio',
      features: ['Aprovação instantânea', 'Sem burocracia', 'Recebimento garantido', 'Até 24x sem juros']
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Cadastro Simples',
      description: 'Preencha o formulário e nossa equipe entrará em contato'
    },
    {
      step: '02',
      title: 'Configuração do Perfil',
      description: 'Ajudamos você a criar um perfil atrativo e completo'
    },
    {
      step: '03',
      title: 'Treinamento da Equipe',
      description: 'Capacitamos sua equipe para usar todas as funcionalidades'
    },
    {
      step: '04',
      title: 'Lançamento',
      description: 'Sua clínica fica visível para milhares de pacientes'
    },
    {
      step: '05',
      title: 'Suporte Contínuo',
      description: 'Acompanhamento e otimização constante dos resultados'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Carlos Silva',
      clinic: 'Clínica OdontoVida',
      text: 'Em 6 meses, triplicamos nossos agendamentos. A plataforma é intuitiva e o suporte é excepcional.',
      rating: 5
    },
    {
      name: 'Dra. Ana Costa',
      clinic: 'Sorrir Odontologia',
      text: 'O crédito facilitado aumentou nosso ticket médio em 40%. Recomendo para todas as clínicas.',
      rating: 5
    },
    {
      name: 'Dr. Roberto Lima',
      clinic: 'Lima & Associados',
      text: 'Gestão completa em uma só plataforma. Economizamos tempo e aumentamos a receita.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SecondaryMenu />
      <div className="pt-32"> {/* Espaçamento para compensar ambos os menus fixos */}
        
        {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Mais pacientes.
                  <br />
                  <span className="text-blue-600">Crédito no ponto de decisão.</span>
                  <br />
                  Cresça com a Doutorizze.
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A vitrine digital que conecta clínicas a novos pacientes, com crédito integrado e marketing especializado.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8" onClick={() => scrollToSection('contact-form')}>
                  Quero falar com o time
                </Button>
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700" onClick={() => scrollToSection('contact-form')}>
                  Explorar soluções
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-left">
                  <div className="text-2xl font-bold text-green-600">+40%</div>
                  <div className="text-sm text-gray-600">Conversão</div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-green-600">-30%</div>
                  <div className="text-sm text-gray-600">No-show</div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-blue-600">24h</div>
                  <div className="text-sm text-gray-600">Retorno</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-8 relative overflow-hidden">
                <img 
                  src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20dental%20clinic%20office%20interior%20with%20blue%20dental%20chair%20and%20equipment%20clean%20professional%20lighting&image_size=landscape_4_3" 
                  alt="Consultório odontológico moderno" 
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <div className="absolute -bottom-4 -right-4 w-32 h-48">
                  <div className="bg-blue-600 rounded-2xl p-4 text-white text-center shadow-xl transform rotate-12">
                    <div className="text-xs mb-2">App Doutorizze</div>
                    <div className="bg-white/20 rounded-lg p-2 mb-2">
                      <div className="text-xs">Agende sua consulta</div>
                    </div>
                    <div className="text-xs opacity-80">Crédito aprovado!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Benefits Section - Soluções */}
      <section id="solucoes" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Por que escolher a Doutorizze?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Oferecemos uma solução completa para crescimento da sua clínica odontológica
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credit Integration Section */}
      <section className="py-20 bg-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Feche mais orçamentos com crédito integrado</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Transforme desistências em tratamentos confirmados com crédito odontológico direto na clínica.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Como funciona */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Como funciona:</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Solicitação do paciente</h4>
                    <p className="text-white/80 text-sm">O cliente manifesta interesse em financiar o tratamento.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Simulação pela clínica</h4>
                    <p className="text-white/80 text-sm">A clínica registra os dados no sistema e envia a proposta pela Doutorizze.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Análise das financeiras</h4>
                    <p className="text-white/80 text-sm">Parceiros financeiros realizam a análise automática e retornam a aprovação.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Aprovação concluída</h4>
                    <p className="text-white/80 text-sm">Com o crédito liberado, é só iniciar o tratamento imediatamente.</p>
                  </div>
                </div>
              </div>
              
              <Button className="bg-white text-green-600 hover:bg-gray-100 mt-8" onClick={() => scrollToSection('contact-form')}>
                Quero habilitar o crédito na minha clínica
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            {/* Benefícios */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white mb-6">Benefícios para sua clínica:</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Aumento de conversão</h4>
                    <p className="text-white/80 text-sm">Mais orçamentos fechados com facilidade de pagamento</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Redução de desistência</h4>
                    <p className="text-white/80 text-sm">Elimine a barreira do preço com crédito instantâneo</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Repasse rápido</h4>
                    <p className="text-white/80 text-sm">Receba o pagamento de forma garantida e ágil</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Catalog */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Catálogo de Serviços</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Soluções completas para transformar sua clínica em um negócio digital de sucesso
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vitrine digital Doutorizze */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Vitrine digital Doutorizze</h4>
                <p className="text-sm text-muted-foreground">Seu perfil profissional otimizado para atrair novos pacientes com informações completas e avaliações.</p>
              </CardContent>
            </Card>
            
            {/* Impulsionamento e Ads */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Impulsionamento e Ads</h4>
                <p className="text-sm text-muted-foreground">Marketing digital especializado em odontologia para aumentar sua visibilidade online.</p>
              </CardContent>
            </Card>
            
            {/* Crédito integrado */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Crédito integrado (multi-parceiros)</h4>
                <p className="text-sm text-muted-foreground">Diversos parceiros financeiros para garantir aprovação de crédito para seus pacientes.</p>
              </CardContent>
            </Card>
            
            {/* Tecnologia sob demanda */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">Tecnologia sob demanda (IA, chatbot, site)</h4>
                <p className="text-sm text-muted-foreground">Soluções tecnológicas personalizadas para automatizar seu atendimento e presença digital.</p>
              </CardContent>
            </Card>
            
            {/* Dashboard e métricas */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold mb-2">Dashboard e métricas</h4>
                <p className="text-sm text-muted-foreground">Relatórios completos sobre performance, conversões e ROI dos seus investimentos.</p>
              </CardContent>
            </Card>
            
            {/* Suporte e onboarding */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="font-semibold mb-2">Suporte e onboarding</h4>
                <p className="text-sm text-muted-foreground">Acompanhamento especializado desde a configuração até o sucesso da sua clínica na plataforma.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">O que dizem nossos parceiros</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Depoimentos reais de clínicas que transformaram seus resultados
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.clinic}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um processo simples e guiado para colocar sua clínica no ar em poucos dias
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-5 gap-8">
              {[
                {
                  step: "1",
                  title: "Cadastro da clínica",
                  description: "Registre sua clínica na plataforma com informações básicas e documentação necessária.",
                  icon: "📝"
                },
                {
                  step: "2", 
                  title: "Configuração da vitrine",
                  description: "Personalize seu perfil, adicione fotos, serviços e informações que destacam sua clínica.",
                  icon: "🏪"
                },
                {
                  step: "3",
                  title: "Habilitação de crédito",
                  description: "Configure as opções de financiamento com nossos parceiros para facilitar pagamentos.",
                  icon: "💳"
                },
                {
                  step: "4",
                  title: "Lançamento da clínica",
                  description: "Sua clínica entra no ar com marketing digital e impulsionamento direcionado.",
                  icon: "🚀"
                },
                {
                  step: "5",
                  title: "Acompanhamento dos resultados",
                  description: "Monitore métricas, leads e conversões através do dashboard completo.",
                  icon: "📊"
                }
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  {index < 4 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary to-primary/30 transform translate-x-4"></div>
                  )}
                  <div className="bg-primary text-white w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
            

          </div>
        </div>
      </section>

      {/* Resultados & Cases */}
      <section id="resultados" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resultados & Cases
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja os resultados reais de clínicas que já transformaram seu negócio com a Doutorizze
            </p>
          </div>
          
          {/* Métricas */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">+40%</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversão</h3>
              <p className="text-gray-600 text-sm">Aumento médio na taxa de fechamento de orçamentos</p>
            </div>
            <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">-30%</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No-show</h3>
              <p className="text-gray-600 text-sm">Redução nas faltas e cancelamentos de consultas</p>
            </div>

            <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-yellow-600 mb-2">4.8</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfação</h3>
              <p className="text-gray-600 text-sm">Avaliação média dos clientes na plataforma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrações de Confiança */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integrações de Confiança
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conectamos tecnologia e parceiros estratégicos para dar mais segurança e eficiência às clínicas e pacientes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Fintechs de Crédito */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Fintechs de Crédito</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Integrações que ampliam o acesso a tratamentos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Modelos de financiamento direto ao paciente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Soluções que fortalecem a oferta da clínica</span>
                </div>
              </div>
            </div>

            {/* Antifraude & Segurança */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Antifraude & Segurança</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Proteção de dados sensíveis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Compliance com LGPD e normas do setor</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Monitoramento confiável de cada operação</span>
                </div>
              </div>
            </div>

            {/* Comunicação */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Comunicação</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Canais digitais integrados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Atendimento inteligente e contínuo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Experiência simples para clínica e paciente</span>
                </div>
              </div>
            </div>

            {/* Pagamentos */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-6">
                <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pagamentos</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Processamento seguro e transparente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Diversos meios em um único ambiente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">Facilidade para a clínica receber e para o paciente pagar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segurança & Compliance */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Segurança & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proteção máxima de dados com as mais altas certificações de segurança
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* LGPD Compliance */}
            <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">LGPD Compliance</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Total conformidade com a Lei Geral de Proteção de Dados brasileira
              </p>
            </div>

            {/* Antifraude */}
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Antifraude</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sistemas avançados de detecção e prevenção de fraudes
              </p>
            </div>

            {/* KYC */}
            <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">KYC (Know Your Customer)</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Validação rigorosa de identidade e documentos
              </p>
            </div>

            {/* Criptografia End-to-End */}
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Criptografia End-to-End</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Proteção máxima de dados sensíveis com criptografia de ponta
              </p>
            </div>
          </div>

          {/* Certificações */}


          {/* Nova Seção Inspirada na Imagem */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-4">
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">FALE COM NOSSO TIME</p>
              </div>
              
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Transforme sua clínica em referência<br />
                  com a Doutorizze.
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Mais pacientes, crédito no ponto de decisão e impulsionamento inteligente em uma única plataforma.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-5xl mx-auto">
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-pink-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Tudo o que sua clínica precisa em um só lugar:</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Vitrine digital exclusiva para aumentar sua presença online</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Crédito odontológico integrado para facilitar a decisão do paciente</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Dashboard com métricas em tempo real para gestão inteligente</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Impulsionamento e marketing segmentado para atrair novos pacientes</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Tecnologia sob medida (IA, chatbot, site e suporte digital)</span>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">Suporte estratégico e especializado para crescimento sustentável</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mt-6">
                    <div className="flex items-center">
                      <div className="bg-blue-400 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">💡</span>
                      </div>
                      <p className="text-blue-800 font-medium">
                        Planos mensais acessíveis, com serviços adicionais sob demanda conforme a necessidade da clínica.
                      </p>
                    </div>
                  </div>
                </div>
                

                
                <div className="text-center">
                  <button 
                    onClick={() => {
                      const contactForm = document.getElementById('contact-form');
                      if (contactForm) {
                        contactForm.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Quero saber como funciona
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Duas Frentes de Atuação */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Duas Frentes de Atuação para Sua Clínica
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expanda seus negócios com nossas soluções especializadas em odontologia
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card Crédito Odonto */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Crédito Odonto</h3>
                <p className="text-gray-600">Sistema de financiamento especializado para tratamentos odontológicos</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Financiamento Facilitado</h4>
                    <p className="text-sm text-gray-600">Seus pacientes podem parcelar tratamentos em até 24x</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recebimento Garantido</h4>
                    <p className="text-sm text-gray-600">Receba à vista! Nós garantimos o tratamento à vista</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sem Risco de Inadimplência</h4>
                    <p className="text-sm text-gray-600">O risco fica por nossa conta</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Integração Simples</h4>
                    <p className="text-sm text-gray-600">Sistema integrado com seu fluxo de trabalho</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-center font-medium">
                    Entre em contato para conhecer as condições
                  </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold" onClick={() => scrollToSection('contact-form')}>
                💬 Saiba Mais sobre Crédito Odonto
              </Button>
            </div>

            {/* Card HUB Clínicas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center mb-6">
                <div className="bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">HUB Clínicas</h3>
                <p className="text-gray-600">Plataforma de marketing e gestão completa para clínicas odontológicas</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Vitrine Digital</h4>
                    <p className="text-sm text-gray-600">Perfil profissional com agenda online integrada</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gestão de Leads</h4>
                    <p className="text-sm text-gray-600">Sistema completo de captação e conversão</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Relatórios Inteligentes</h4>
                    <p className="text-sm text-gray-600">Analytics e métricas de performance</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Marketing Automatizado</h4>
                    <p className="text-sm text-gray-600">Campanhas e comunicação com pacientes</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-center font-medium">
                    Entre em contato para conhecer as condições
                  </div>
              </div>

              <Button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-semibold" onClick={() => scrollToSection('contact-form')}>
                🏪 Saiba Mais sobre HUB Clínicas
              </Button>
            </div>
          </div>
        </div>
      </section>



        {/* Formulário Fale com nosso time */}
        <section id="contact-form" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Fale com nosso time
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Descubra como a Doutorizze pode transformar sua clínica e aumentar seus resultados.
              </p>
            </div>
            <MultiStepContactForm />
          </div>
        </section>

        {/* FAQ - Perguntas Frequentes */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Perguntas Frequentes
                </h2>
                <p className="text-xl text-gray-600">
                  Tire suas dúvidas sobre nossos serviços
                </p>
              </div>
                
                <div className="space-y-4">
                  {[
                    {
                      question: "Preciso trocar meu sistema atual?",
                      answer: "Não! A Doutorizze se integra com seu sistema atual. Mantemos sua operação funcionando normalmente enquanto adicionamos as funcionalidades de crédito, marketing e vitrine digital."
                    },
                    {
                      question: "Como funciona o crédito odontológico?",
                      answer: "Trabalhamos com múltiplos parceiros financeiros para garantir alta aprovação. O paciente solicita o crédito diretamente na plataforma e recebe aprovação em minutos. O repasse para a clínica é rápido e garantido."
                    },
                    {
                      question: "Vocês mostram valores no site?",
                      answer: "Não trabalhamos com tabela de preços fixa. Cada clínica tem necessidades específicas, por isso nosso time comercial desenvolve uma proposta personalizada com condições adequadas ao seu perfil."
                    },
                    {
                      question: "Quanto tempo leva para começar a receber pacientes?",
                      answer: "Após o onboarding completo, sua clínica estará ativa na plataforma em até 7 dias. Os primeiros leads qualificados começam a chegar nas primeiras semanas."
                    },
                    {
                      question: "Existe contrato de fidelidade?",
                      answer: "Nossos contratos são flexíveis e focados em resultados. Discutimos os termos ideais para cada clínica durante a negociação comercial."
                    },
                    {
                      question: "Como é feito o suporte técnico?",
                      answer: "Oferecemos suporte completo via WhatsApp, e-mail e telefone. Além disso, cada clínica tem um consultor dedicado para acompanhar os resultados e otimizar a performance."
                    }
                  ].map((faq, index) => (
                    <Card key={index} className="border border-gray-200 hover:border-gray-300 transition-colors">
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFaq(index + 100)} // Offset para não conflitar com o FAQ anterior
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <div className="flex-shrink-0">
                            {expandedFaq === index + 100 ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </button>
                        {expandedFaq === index + 100 && (
                          <div className="px-6 pb-6">
                            <p className="text-gray-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>

        {/* CTA Final */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Revolucionar sua Clínica?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a centenas de clínicas que já transformaram seus resultados
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-primary hover:text-primary"
              onClick={() => scrollToSection('contact-form')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default ParaClinicasPage;