import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import ClinicServicesSection from "@/components/ClinicServicesSection";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Clock, 
  Shield,
  CheckCircle,
  Star,
  Store,
  ArrowRight,
  Building,
  DollarSign,
  Target,
  Zap,
  Award,
  Phone,
  Mail,
  MapPin,
  Send
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Aumento de Receita",
    description: "Aumente seu faturamento em até 40% com mais pacientes conseguindo realizar tratamentos"
  },
  {
    icon: Users,
    title: "Mais Pacientes",
    description: "Acesso a milhares de pacientes que buscam tratamentos dentários com facilidade de pagamento"
  },
  {
    icon: CreditCard,
    title: "Pagamento Garantido",
    description: "Receba o valor integral do tratamento de forma antecipada, sem risco de inadimplência"
  },
  {
    icon: Clock,
    title: "Processo Rápido",
    description: "Aprovação de crédito em até 5 minutos para seus pacientes iniciarem o tratamento"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Plataforma segura e confiável com proteção de dados e transações"
  },
  {
    icon: Building2,
    title: "Gestão Simplificada",
    description: "Dashboard completo para gerenciar pacientes, tratamentos e pagamentos"
  }
];

const testimonials = [
  {
    name: "Dr. Carlos Silva",
    clinic: "Odonto Excellence",
    rating: 5,
    comment: "Nossa receita aumentou 35% desde que nos tornamos parceiros. Excelente plataforma!",
    plan: "Profissional"
  },
  {
    name: "Dra. Maria Santos",
    clinic: "Sorriso Perfeito",
    rating: 5,
    comment: "Processo muito simples e pacientes conseguem fazer tratamentos que antes não conseguiam.",
    plan: "Enterprise"
  },
  {
    name: "Dr. João Costa",
    clinic: "Dental Care",
    rating: 5,
    comment: "Recomendo para todas as clínicas. O suporte é excepcional!",
    plan: "Básico"
  }
];

const ClinicPartnership = () => {
  const { plans, loading: plansLoading, error: plansError } = usePricingPlans('clinic');
  
  const [formData, setFormData] = useState({
    clinicName: "",
    doctorName: "",
    email: "",
    phone: "",
    address: "",
    specialties: "",
    selectedPlan: "",
    message: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Aqui implementaremos a lógica de envio
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Seja Nossa Parceira
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Oferecemos duas frentes distintas para sua clínica: <strong>Crédito Odonto</strong> e <strong>HUB Clínicas</strong>. 
              Mais pacientes, mais receita, menos burocracia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Quero Ser Parceiro
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clinic Services Section - Moved from Home */}
      <ClinicServicesSection />

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Vantagens Exclusivas para Parceiros
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Descubra como nossa parceria pode revolucionar sua clínica
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Planos de Assinatura para Clínicas
              </h2>
              <p className="text-muted-foreground text-lg">
                Escolha o plano ideal para sua clínica e comece a crescer hoje mesmo
              </p>
            </div>

            {plansLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando planos...</p>
              </div>
            ) : plansError ? (
              <div className="text-center py-8">
                <p className="text-red-500">Erro ao carregar planos: {plansError}</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum plano disponível no momento.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                  <Card 
                    key={plan.id} 
                    className={`border-2 ${
                      plan.is_popular 
                        ? 'border-primary scale-105' 
                        : 'border-primary/20'
                    }`}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl text-primary">{plan.name}</CardTitle>
                      <p className="text-muted-foreground">{plan.description}</p>
                      {plan.is_popular && (
                        <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block">
                          Mais Popular
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-4xl font-bold text-foreground mb-2">
                        R$ {plan.price.toFixed(2).replace('.', ',')}
                      </div>
                      <p className="text-muted-foreground mb-6">por {plan.period}</p>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              O que nossos parceiros dizem
            </h2>
            <p className="text-muted-foreground text-lg">
              Clínicas que já transformaram seus resultados conosco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="ml-auto text-sm font-semibold text-primary">
                      Plano: {testimonial.plan}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.clinic}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Solicite sua Parceria
              </h2>
              <p className="text-muted-foreground">
                Preencha o formulário e nossa equipe entrará em contato em até 24 horas
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="clinicName">Nome da Clínica *</Label>
                      <Input
                        id="clinicName"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleInputChange}
                        placeholder="Ex: Odonto Excellence"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Nome do Responsável *</Label>
                      <Input
                        id="doctorName"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleInputChange}
                        placeholder="Dr. João Silva"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contato@clinica.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Rua, número, bairro, cidade - estado"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialties">Especialidades</Label>
                      <Input
                        id="specialties"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleInputChange}
                        placeholder="Ex: Ortodontia, Implantes, Estética"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="selectedPlan">Plano de Interesse</Label>
                      <select
                        id="selectedPlan"
                        name="selectedPlan"
                        value={formData.selectedPlan}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione um plano</option>
                        <option value="Básico">Básico - R$ 297/mês</option>
                        <option value="Profissional">Profissional - R$ 497/mês</option>
                        <option value="Enterprise">Enterprise - R$ 897/mês</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem Adicional</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Conte-nos mais sobre sua clínica e expectativas..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full text-lg py-6">
                    Solicitar Parceria
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ClinicPartnership;