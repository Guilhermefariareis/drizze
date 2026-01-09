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
  ChevronUp,
  Lock
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
        <div className="fixed top-20 left-0 right-0 z-40 bg-[#1A1A2E]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-4">
              {/* Desktop Menu */}
              <div className="hidden lg:flex space-x-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`px-5 py-2.5 text-sm font-black rounded-2xl transition-all duration-300 ${activeSection === item.id
                      ? 'text-white bg-gradient-to-r from-[#E94560] to-[#FB923C] shadow-lg shadow-[#E94560]/20 scale-105'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleMobileMenu}
                className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                aria-label="Toggle menu"
              >
                <div className="flex flex-col justify-center items-center w-6 h-6">
                  <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                    }`}></span>
                  <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}></span>
                  <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                    }`}></span>
                </div>
              </button>

              {/* Contact Button - Always Visible */}
              <Button
                onClick={openContactForm}
                variant="v2-gradient"
                className="px-6 py-2 h-10"
              >
                <span className="hidden sm:inline">Falar com Especialista</span>
                <span className="sm:hidden">Contato</span>
              </Button>
            </nav>
          </div>

          <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="px-4 py-6 bg-[#1A1A2E] border-t border-white/5">
              <div className="flex flex-col space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`px-5 py-4 text-left text-base font-black rounded-2xl transition-all duration-300 ${activeSection === item.id
                      ? 'text-white bg-gradient-to-r from-[#E94560] to-[#FB923C] shadow-lg shadow-[#E94560]/20 translate-x-1'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
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
    <div className="min-h-screen bg-[#0F0F23]">
      <Navbar />
      <SecondaryMenu />
      <div className="pt-24">

        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#0F0F23]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E94560]/10 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[120px] -ml-48 -mb-48 opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10">
                <div className="space-y-6">
                  <Badge variant="v2-blue" className="py-2 px-4 text-sm font-bold">SOLUÇÃO CORPORATIVA</Badge>
                  <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                    Mais <span className="text-[#4ADE80]">pacientes.</span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E94560] to-[#FB923C]">Crédito no ponto</span> de decisão.
                    <br />
                    Cresça com a <span className="text-[#3B82F6]">Doutorizze.</span>
                  </h1>
                  <p className="text-xl text-white/50 leading-relaxed font-medium max-w-xl">
                    A vitrine digital que conecta clínicas a novos pacientes, com crédito integrado e marketing especializado de alta performance.
                  </p>
                </div>

                <div className="flex flex-wrap gap-5">
                  <Button size="xl" variant="v2-gradient" className="px-10" onClick={() => scrollToSection('contact-form')}>
                    Quero falar com o time
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                  <Button variant="v2-outline" size="xl" className="px-10" onClick={() => scrollToSection('contact-form')}>
                    Explorar soluções
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
                  <div className="text-left">
                    <div className="text-3xl font-black text-[#4ADE80] mb-1">+40%</div>
                    <div className="text-sm text-white/40 font-bold uppercase tracking-wider">Conversão</div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-[#E94560] mb-1">-30%</div>
                    <div className="text-sm text-white/40 font-bold uppercase tracking-wider">No-show</div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-black text-[#3B82F6] mb-1">24h</div>
                    <div className="text-sm text-white/40 font-bold uppercase tracking-wider">Retorno</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-3xl rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                  <img
                    src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20dental%20clinic%20office%20interior%20with%20blue%20dental%20chair%20and%20equipment%20clean%20professional%20lighting&image_size=landscape_4_3"
                    alt="Consultório odontológico moderno"
                    className="w-full h-80 object-cover rounded-[2rem] opacity-80"
                  />
                  <div className="absolute -bottom-6 -right-6 w-40 h-56">
                    <div className="bg-gradient-to-br from-[#E94560] to-[#FB923C] rounded-3xl p-6 text-white text-center shadow-2xl transform rotate-6 border border-white/20">
                      <div className="text-xs font-black uppercase tracking-widest mb-3 opacity-60">App Doutorizze</div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mb-4">
                        <div className="text-sm font-bold">Agende sua consulta</div>
                      </div>
                      <div className="text-xs font-black">CRÉDITO APROVADO!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Benefits Section - Soluções */}
        <section id="solucoes" className="py-24 bg-[#1A1A2E] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0F0F23] to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Por que escolher a <span className="text-[#E94560]">Doutorizze?</span></h2>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Oferecemos uma solução completa e tecnológica para o crescimento acelerado da sua clínica.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white/[0.03] border-white/[0.06] rounded-[2rem] hover:border-[#E94560]/30 transition-all duration-500 overflow-hidden group">
                    <CardContent className="pt-10 p-8 text-center">
                      <div className="bg-gradient-to-br from-[#E94560] to-[#FB923C] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                      <p className="text-white/40 leading-relaxed font-medium">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Credit Integration Section */}
        <section className="py-24 bg-gradient-to-br from-[#22C55E] to-[#16A34A] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Feche mais orçamentos com crédito integrado</h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto font-medium">
                Transforme desistências em tratamentos confirmados com crédito odontológico direto na clínica.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-10">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  COMO FUNCIONA
                </h3>

                <div className="space-y-8">
                  {[
                    { t: "Solicitação do paciente", d: "O cliente manifesta interesse em financiar o tratamento." },
                    { t: "Simulação pela clínica", d: "A clínica registra os dados no sistema e envia a proposta." },
                    { t: "Análise das financeiras", d: "Parceiros realizam a análise automática e retornam a aprovação." },
                    { t: "Aprovação concluída", d: "Com o crédito liberado, é só iniciar o tratamento imediatamente." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-6 group">
                      <div className="bg-white/10 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 group-hover:bg-white/20 transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-1 tracking-tight">{item.t}</h4>
                        <p className="text-white/70 font-medium">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button size="xl" variant="v2-outline" className="border-white text-white hover:bg-white hover:text-[#22C55E] group" onClick={() => scrollToSection('contact-form')}>
                  Quero habilitar na minha clínica
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="bg-black/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 space-y-10 shadow-2xl">
                <h3 className="text-2xl font-black text-white tracking-tight">BENEFÍCIOS PARA SUA CLÍNICA</h3>

                <div className="space-y-8">
                  {[
                    { icon: TrendingUp, t: "Aumento de conversão", d: "Mais orçamentos fechados com facilidade de pagamento" },
                    { icon: Clock, t: "Redução de desistência", d: "Elimine a barreira do preço com crédito instantâneo" },
                    { icon: DollarSign, t: "Repasse rápido", d: "Receba o pagamento de forma garantida e ágil" }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-start space-x-6">
                        <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1 tracking-tight">{item.t}</h4>
                          <p className="text-white/70 font-medium">{item.d}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Catalog */}
        <section className="py-24 bg-[#0F0F23]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Catálogo de <span className="text-[#3B82F6]">Serviços</span></h2>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Soluções completas para transformar sua clínica em um negócio digital de sucesso.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { t: "Vitrine digital Doutorizze", d: "Seu perfil profissional otimizado para atrair pacientes.", icon: Globe, c: "blue" },
                { t: "Impulsionamento e Ads", d: "Marketing digital especializado em odontologia.", icon: TrendingUp, c: "green" },
                { t: "Crédito integrado", d: "Diversos parceiros para garantir aprovação de crédito.", icon: CreditCard, c: "purple" },
                { t: "Tecnologia sob demanda", d: "IA, chatbot e sites personalizados para sua clínica.", icon: Cpu, c: "orange" },
                { t: "Dashboard e métricas", d: "Relatórios completos sobre performance e ROI.", icon: BarChart3, c: "teal" },
                { t: "Suporte e onboarding", d: "Acompanhamento especializado para o seu sucesso.", icon: Users, c: "indigo" }
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="bg-white/[0.03] border-white/[0.06] rounded-[2rem] hover:border-white/20 transition-all group overflow-hidden">
                    <CardContent className="p-8">
                      <div className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-3">{s.t}</h4>
                      <p className="text-white/40 font-medium leading-relaxed">{s.d}</p>
                    </CardContent>
                  </Card>
                )
              })}
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
        <section id="como-funciona" className="py-24 bg-[#0F0F23] relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-[100px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Como Funciona
              </h2>
              <div className="w-24 h-1.5 bg-[#4ADE80] mx-auto rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)] mb-8"></div>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Um processo simples e guiado para colocar sua clínica no ar em poucos dias com performance máxima.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-5 gap-8">
                {[
                  { step: "1", title: "Cadastro da clínica", icon: Building2 },
                  { step: "2", title: "Configuração da vitrine", icon: Globe },
                  { step: "3", title: "Habilitar crédito", icon: CreditCard },
                  { step: "4", title: "Lançamento", icon: Zap },
                  { step: "5", title: "Resultados", icon: BarChart3 }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="text-center group relative">
                      <div className="bg-white/[0.03] border border-white/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl group-hover:border-[#4ADE80]/50 relative">
                        <Icon className="h-10 w-10 text-white" />
                        <div className="absolute -top-3 -right-3 bg-[#4ADE80] text-black w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-lg">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 tracking-tight uppercase tracking-widest text-[11px] opacity-60">Passo {item.step}</h3>
                      <h4 className="text-white font-black text-sm leading-tight px-2">{item.title}</h4>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Resultados & Cases */}
        <section id="resultados" className="py-24 bg-[#1A1A2E] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#0F0F23]/50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Resultados & Cases
              </h2>
              <div className="w-24 h-1.5 bg-[#E94560] mx-auto rounded-full shadow-[0_0_15px_rgba(233,69,96,0.5)] mb-8"></div>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Veja os resultados reais de clínicas que já transformaram seu negócio com a Doutorizze.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { v: "+40%", t: "Conversão", d: "Aumento médio no fechamento", c: "#4ADE80" },
                { v: "-30%", t: "No-show", d: "Redução nas faltas de consultas", c: "#E94560" },
                { v: "4.8", t: "Satisfação", d: "Avaliação média na plataforma", c: "#3B82F6" }
              ].map((m, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 text-center hover:border-white/20 transition-all group">
                  <div className="text-5xl font-black mb-4 transition-transform group-hover:scale-110" style={{ color: m.c }}>{m.v}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{m.t}</h3>
                  <p className="text-white/40 text-sm font-medium">{m.d}</p>
                </div>
              ))}
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
        <section className="py-24 bg-[#0F0F23] relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Segurança & Compliance
              </h2>
              <div className="w-24 h-1.5 bg-[#3B82F6] mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-8"></div>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Proteção máxima de dados com as mais altas certificações de segurança do setor.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: Shield, t: "LGPD Compliance", d: "Conformidade total com a Lei Geral de Proteção de Dados.", c: "blue" },
                { icon: Shield, t: "Antifraude", d: "Sistemas avançados de detecção e prevenção de fraudes.", c: "green" },
                { icon: Shield, t: "KYC Proteção", d: "Validação rigorosa de identidade e documentos.", c: "purple" },
                { icon: Lock, t: "End-to-End", d: "Criptografia de ponta em todas as transações.", c: "orange" }
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="text-center bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 hover:border-white/20 transition-all group">
                    <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{item.t}</h3>
                    <p className="text-white/40 text-sm leading-relaxed font-medium">
                      {item.d}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Certificações */}


        {/* Nova Seção Inspirada na Imagem */}
        <div className="py-24 bg-gradient-to-br from-[#1A1A2E] to-[#0F0F23] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E94560]/10 rounded-full blur-[100px]"></div>
          <div className="max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              < Badge variant="v2-dark" className="bg-white/5 border border-white/10 text-[#4ADE80] font-black uppercase tracking-widest text-[10px] py-1.5 px-3 mb-6">FALE COM NOSSO TIME</Badge>
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                Transforme sua clínica em <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E94560] to-[#FB923C]">referência</span><br />
                com a Doutorizze.
              </h2>
              <p className="text-xl text-white/40 max-w-3xl mx-auto leading-relaxed font-medium">
                Mais pacientes, crédito no ponto de decisão e impulsionamento inteligente em uma única plataforma premium.
              </p>
            </div>

            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-3xl rounded-[3rem] p-10 md:p-16 shadow-2xl max-w-5xl mx-auto relative overflow-hidden group hover:border-[#E94560]/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E94560]/5 rounded-full blur-[80px] -z-10 group-hover:bg-[#E94560]/10 transition-colors"></div>
              <div className="mb-12">
                <div className="flex items-center mb-8">
                  <div className="w-2 h-10 bg-[#E94560] rounded-full mr-5 shadow-[0_0_20px_rgba(233,69,96,0.5)]"></div>
                  <h3 className="text-3xl font-black text-white tracking-tight">Tudo o que sua clínica precisa:</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    "Vitrine digital exclusiva para aumentar sua presença online",
                    "Crédito odontológico integrado para facilitar a decisão",
                    "Dashboard com métricas em tempo real para gestão",
                    "Impulsionamento e marketing segmentado de performance",
                    "Tecnologia sob medida (IA, chatbot, site e suporte)",
                    "Acompanhamento estratégico para crescimento real"
                  ].map((text, i) => (
                    <div key={i} className="flex items-start space-x-4 group/item">
                      <div className="bg-white/5 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 group-hover/item:bg-[#E94560]/20 transition-colors">
                        <CheckCircle className="w-5 h-5 text-[#E94560]" />
                      </div>
                      <span className="text-white/60 font-medium leading-snug group-hover/item:text-white transition-colors">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-3xl mt-12 relative group/banner">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6] rounded-full"></div>
                  <div className="flex items-center">
                    <div className="bg-[#3B82F6]/20 w-10 h-10 rounded-xl flex items-center justify-center mr-5">
                      <Zap className="text-[#3B82F6] w-6 h-6" />
                    </div>
                    <p className="text-white/70 font-bold text-lg">
                      Planos mensais acessíveis com serviços sob demanda conforme sua necessidade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button size="xl" variant="v2-gradient" className="px-16 shadow-2xl" onClick={() => scrollToSection('contact-form')}>
                  Quero saber como funciona
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Duas Frentes de Atuação */}
        <section className="py-24 bg-[#0F0F23] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#1A1A2E] transform skew-y-3 -z-10 origin-center"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Duas Frentes de Atuação
              </h2>
              <div className="w-24 h-1.5 bg-[#3B82F6] mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-8"></div>
              <p className="text-xl text-white/40 max-w-3xl mx-auto font-medium">
                Expanda seus negócios com nossas soluções especializadas em odontologia.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Card Crédito Odonto */}
              <Card className="bg-white/[0.03] border-white/10 rounded-[3rem] p-10 hover:border-[#E94560]/30 transition-all group shadow-2xl">
                <div className="text-center mb-10">
                  <div className="bg-gradient-to-br from-[#E94560] to-[#FB923C] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#E94560]/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Crédito Odonto</h3>
                  <p className="text-white/40 font-medium">Financiamento especializado para tratamentos.</p>
                </div>

                <div className="space-y-6 mb-12">
                  {[
                    { t: "Financiamento Facilitado", d: "Pacientes podem parcelar em até 24x." },
                    { t: "Recebimento Garantido", d: "A clínica recebe o valor à vista." },
                    { t: "Inadimplência Zero", d: "O risco fica por conta da plataforma." },
                    { t: "Integração Simples", d: "Sistema 100% digital e intuitivo." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="bg-[#4ADE80]/10 w-7 h-7 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-[#4ADE80]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white tracking-tight">{item.t}</h4>
                        <p className="text-white/30 text-sm font-medium">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="v2-gradient" size="xl" className="w-full shadow-2xl" onClick={() => scrollToSection('contact-form')}>
                  Saiba Mais Agora
                </Button>
              </Card>

              {/* Card HUB Clínicas */}
              <Card className="bg-white/[0.03] border-white/10 rounded-[3rem] p-10 hover:border-[#3B82F6]/30 transition-all group shadow-2xl">
                <div className="text-center mb-10">
                  <div className="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#3B82F6]/20 group-hover:scale-110 transition-transform">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">HUB Clínicas</h3>
                  <p className="text-white/40 font-medium">Marketing e gestão completa para sua unidade.</p>
                </div>

                <div className="space-y-6 mb-12">
                  {[
                    { t: "Vitrine Digital", d: "Perfil otimizado com agendamento online." },
                    { t: "Gestão de Leads", d: "Sistema completo de captação e conversão." },
                    { t: "IA & Automação", d: "Atendimento 24h com inteligência artificial." },
                    { t: "Dashboards", d: "Métricas de performance em tempo real." }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="bg-[#3B82F6]/10 w-7 h-7 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-[#3B82F6]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white tracking-tight">{item.t}</h4>
                        <p className="text-white/30 text-sm font-medium">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="v2-blue" size="xl" className="w-full shadow-2xl" onClick={() => scrollToSection('contact-form')}>
                  Conhecer o HUB
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Formulário Fale com nosso time */}
        <section id="contact-form" className="py-24 bg-[#0F0F23] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1A1A2E] to-[#0F0F23]"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Card className="bg-white/[0.02] border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-12">
                <Badge variant="v2-blue" className="mb-6">CONTATO DIRETO</Badge>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Fale com nosso time
                </h2>
                <div className="w-20 h-1.5 bg-[#3B82F6] mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-8"></div>
                <p className="text-lg text-white/40 max-w-2xl mx-auto font-medium">
                  Descubra como a Doutorizze pode transformar sua clínica e acelerar seu crescimento.
                </p>
              </div>
              <MultiStepContactForm />
            </Card>
          </div>
        </section>

        {/* FAQ - Perguntas Frequentes */}
        <section id="faq" className="py-24 bg-[#1A1A2E] relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                  Dúvidas Frequentes
                </h2>
                <div className="w-24 h-1.5 bg-[#FB923C] mx-auto rounded-full shadow-[0_0_15px_rgba(251,146,60,0.3)] mb-8"></div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    question: "Preciso trocar meu sistema atual?",
                    answer: "Não! A Doutorizze se integra com seu sistema atual. Mantemos sua operação funcionando normalmente enquanto adicionamos crédito e marketing."
                  },
                  {
                    question: "Como funciona o crédito odontológico?",
                    answer: "Trabalhamos com múltiplos parceiros financeiros. O paciente solicita o crédito na plataforma e recebe aprovação em minutos. O repasse para a clínica é à vista."
                  },
                  {
                    question: "Qual o custo para a clínica?",
                    answer: "Trabalhamos com planos flexíveis adaptados ao tamanho e necessidade de cada unidade. Fale com nosso time para uma proposta personalizada."
                  }
                ].map((faq, index) => (
                  <Card key={index} className="bg-white/[0.02] border-white/5 hover:border-white/20 transition-all duration-300 rounded-2xl overflow-hidden group">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleFaq(index + 100)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                      >
                        <h3 className="text-lg font-bold text-white/90 group-hover:text-white pr-4 transition-colors">
                          {faq.question}
                        </h3>
                        <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${expandedFaq === index + 100 ? 'rotate-180' : ''}`}>
                          <ChevronDown className="h-5 w-5 text-white/40" />
                        </div>
                      </button>
                      {expandedFaq === index + 100 && (
                        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <p className="text-white/40 font-medium leading-relaxed">
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
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#E94560] to-[#FB923C]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              Pronto para evoluir?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
              Junte-se a centenas de clínicas que já transformaram seus resultados com a Doutorizze.
            </p>
            <Button
              size="xl"
              variant="v2-blue"
              className="px-16 h-16 text-lg shadow-2xl hover:scale-105 transition-all"
              onClick={() => scrollToSection('contact-form')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </section>

        <Footer />
      </div >
    </div >
  );
};

export default ParaClinicasPage;