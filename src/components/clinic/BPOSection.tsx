import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { 
  Headphones, Calculator, Users, FileText, 
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Phone, MessageCircle, Calendar, CreditCard
} from "lucide-react";

export function BPOSection() {
  const [activeService, setActiveService] = useState<string | null>(null);

  const bpoServices = [
    {
      id: "call-center",
      name: "Call Center",
      icon: Headphones,
      description: "Atendimento telefônico profissional para sua clínica",
      features: [
        "Agendamento de consultas",
        "Confirmação de consultas",
        "Atendimento ao cliente",
        "Pesquisa de satisfação"
      ],
      price: "R$ 890/mês",
      status: "available"
    },
    {
      id: "financial",
      name: "Financeiro",
      icon: Calculator,
      description: "Gestão completa das finanças da clínica",
      features: [
        "Controle de contas a pagar/receber",
        "Relatórios financeiros",
        "Conciliação bancária",
        "Gestão de fluxo de caixa"
      ],
      price: "R$ 1.200/mês",
      status: "available"
    },
    {
      id: "hr",
      name: "Recursos Humanos",
      icon: Users,
      description: "Gestão de pessoas e processos de RH",
      features: [
        "Folha de pagamento",
        "Controle de ponto",
        "Admissão e demissão",
        "Treinamentos"
      ],
      price: "R$ 650/mês",
      status: "coming-soon"
    },
    {
      id: "accounting",
      name: "Contabilidade",
      icon: FileText,
      description: "Serviços contábeis especializados",
      features: [
        "Escrituração fiscal",
        "Declarações obrigatórias",
        "Planejamento tributário",
        "Consultoria contábil"
      ],
      price: "R$ 980/mês",
      status: "available"
    },
    {
      id: "marketing",
      name: "Marketing Digital",
      icon: TrendingUp,
      description: "Estratégias de marketing para sua clínica",
      features: [
        "Gestão de redes sociais",
        "Campanhas publicitárias",
        "SEO e presença online",
        "Análise de resultados"
      ],
      price: "R$ 1.500/mês",
      status: "available"
    },
    {
      id: "scheduling",
      name: "Agendamento",
      icon: Calendar,
      description: "Gestão completa de agenda",
      features: [
        "Agendamento online",
        "Lembretes automáticos",
        "Reagendamentos",
        "Lista de espera"
      ],
      price: "R$ 450/mês",
      status: "available"
    }
  ];

  const currentContracts = [
    {
      service: "Call Center",
      status: "active",
      startDate: "2024-01-15",
      nextPayment: "2024-02-15",
      value: 890
    },
    {
      service: "Contabilidade",
      status: "active",
      startDate: "2024-01-01",
      nextPayment: "2024-02-01",
      value: 980
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "coming-soon": return "bg-yellow-100 text-yellow-800";
      case "active": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "coming-soon": return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Serviços BPO</h2>
          <p className="text-muted-foreground">
            Business Process Outsourcing para sua clínica
          </p>
        </div>
        <Badge variant="outline">
          {currentContracts.length} serviços ativos
        </Badge>
      </div>

      {/* Current Contracts */}
      {currentContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Contratados</CardTitle>
            <CardDescription>Seus serviços BPO ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentContracts.map((contract, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(contract.status)}>
                      {getStatusIcon(contract.status)}
                      <span className="ml-1 capitalize">{contract.status}</span>
                    </Badge>
                    <div>
                      <p className="font-medium">{contract.service}</p>
                      <p className="text-sm text-muted-foreground">
                        Desde {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      R$ {contract.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Próx. cobrança: {new Date(contract.nextPayment).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Services */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Disponíveis</CardTitle>
          <CardDescription>Escolha os serviços que sua clínica precisa</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
            {bpoServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeService === service.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveService(activeService === service.id ? null : service.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status === "available" ? "Disponível" : 
                         service.status === "coming-soon" ? "Em breve" : "Ativo"}
                      </Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Funcionalidades:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-xl font-bold text-primary">
                        {service.price}
                      </span>
                      <Button 
                        variant={service.status === "available" ? "gradient" : "outline"}
                        size="sm"
                        disabled={service.status !== "available"}
                      >
                        {service.status === "available" ? "Contratar" : 
                         service.status === "coming-soon" ? "Em breve" : "Ativo"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Phone className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Suporte 24/7</h3>
            <p className="text-sm text-muted-foreground">
              Fale com nossa equipe
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <MessageCircle className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Chat Online</h3>
            <p className="text-sm text-muted-foreground">
              Atendimento instantâneo
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <FileText className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Relatórios</h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe os resultados
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <CreditCard className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Faturamento</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie pagamentos
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}