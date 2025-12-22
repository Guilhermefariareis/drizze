import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Store,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Building,
  DollarSign,
  Target,
  Zap
} from "lucide-react";

const ClinicServicesSection = () => {
  return (
    <section id="clinic-services" className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-success/10 text-success hover:bg-success/20">
            Para Clínicas
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Duas Frentes de Atuação para Sua Clínica
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Expanda seus negócios com nossas soluções especializadas em odontologia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crédito Odonto */}
          <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-large bg-gradient-card">
            <CardHeader className="text-center pb-6">
              <div className="bg-gradient-primary p-4 rounded-full text-white shadow-glow w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                Crédito Odonto
              </CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Sistema de crédito especializado para tratamentos odontológicos
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Aprovação Rápida</p>
                    <p className="text-sm text-muted-foreground">Análise de crédito em até 24 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Taxas Competitivas</p>
                    <p className="text-sm text-muted-foreground">Condições especiais para tratamentos odontológicos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Parcelas Flexíveis</p>
                    <p className="text-sm text-muted-foreground">Até 60x para financiar seu tratamento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Sem Burocracia</p>
                    <p className="text-sm text-muted-foreground">Processo 100% digital e simplificado</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-success/10 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Valores a partir de</p>
                  <p className="text-2xl font-bold text-primary mb-1">R$ 500</p>
                  <p className="text-xs text-muted-foreground">
                    Condições especiais para clínicas parceiras
                  </p>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:opacity-90">
                <CreditCard className="w-4 h-4 mr-2" />
                Saiba Mais sobre Crédito Odonto
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* HUB Clínicas */}
          <Card className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-large bg-gradient-card">
            <CardHeader className="text-center pb-6">
              <div className="bg-gradient-primary p-4 rounded-full text-white shadow-glow w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl text-foreground">
                HUB Clínicas
              </CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                Plataforma de marketing e gestão completa para clínicas odontológicas
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Vitrine Digital</p>
                    <p className="text-sm text-muted-foreground">Perfil profissional com agenda online integrada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Gestão de Leads</p>
                    <p className="text-sm text-muted-foreground">Sistema completo de captação e conversão</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Relatórios Inteligentes</p>
                    <p className="text-sm text-muted-foreground">Analytics e métricas de performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Marketing Automatizado</p>
                    <p className="text-sm text-muted-foreground">Campanhas e comunicação com pacientes</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary text-sm">Plano Premium</span>
                  </div>
                  <p className="text-lg font-bold text-primary mb-1">R$ 197/mês</p>
                  <p className="text-xs text-muted-foreground">
                    Vitrine completa + gestão de leads
                  </p>
                </div>
                
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-success" />
                    <span className="font-medium text-success text-sm">Plano Enterprise</span>
                  </div>
                  <p className="text-lg font-bold text-success mb-1">R$ 397/mês</p>
                  <p className="text-xs text-muted-foreground">
                    Solução completa + suporte dedicado
                  </p>
                </div>
              </div>

              <Button className="w-full bg-gradient-primary hover:opacity-90">
                <Store className="w-4 h-4 mr-2" />
                Saiba Mais sobre HUB Clínicas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-2 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Pronto para Transformar sua Clínica?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Junte-se a centenas de clínicas que já aumentaram seu faturamento e melhoraram 
                a experiência dos pacientes com nossas soluções.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Agendar Demonstração
                </Button>
                <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Cadastrar Minha Clínica
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ClinicServicesSection;