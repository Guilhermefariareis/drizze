import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Calendar, CheckCircle, Clock, Bell, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PreventiveCare = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/patient-login" replace />;
  }

  const careSchedule = [
    {
      title: "Limpeza Dental",
      frequency: "A cada 6 meses",
      lastDone: "15/08/2024",
      nextDue: "15/02/2025",
      status: "em_dia",
      priority: "alta",
      description: "Remoção de tártaro e placa bacteriana"
    },
    {
      title: "Consulta de Rotina",
      frequency: "A cada 6 meses",
      lastDone: "10/07/2024",
      nextDue: "10/01/2025",
      status: "atrasado",
      priority: "alta",
      description: "Exame geral da saúde bucal"
    },
    {
      title: "Raio-X Panorâmico",
      frequency: "Anual",
      lastDone: "22/03/2024",
      nextDue: "22/03/2025",
      status: "proximo",
      priority: "media",
      description: "Avaliação completa da estrutura óssea e dentária"
    },
    {
      title: "Aplicação de Flúor",
      frequency: "A cada 6 meses",
      lastDone: "15/08/2024",
      nextDue: "15/02/2025",
      status: "em_dia",
      priority: "media",
      description: "Fortalecimento do esmalte dentário"
    }
  ];

  const tips = [
    {
      icon: Shield,
      title: "Escovação Correta",
      description: "Escove os dentes 3 vezes ao dia por pelo menos 2 minutos",
      category: "Higiene Diária"
    },
    {
      icon: Heart,
      title: "Uso do Fio Dental",
      description: "Use fio dental diariamente para remover restos de alimentos",
      category: "Higiene Diária"
    },
    {
      icon: Calendar,
      title: "Visitas Regulares",
      description: "Mantenha consultas preventivas a cada 6 meses",
      category: "Prevenção"
    },
    {
      icon: CheckCircle,
      title: "Alimentação Saudável",
      description: "Evite excesso de açúcar e mantenha uma dieta equilibrada",
      category: "Nutrição"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_dia': return 'bg-green-100 text-green-800 border-green-200';
      case 'proximo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_dia': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'proximo': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'atrasado': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_dia': return 'Em dia';
      case 'proximo': return 'Próximo do vencimento';
      case 'atrasado': return 'Atrasado';
      default: return 'Pendente';
    }
  };

  const completedTasks = careSchedule.filter(item => item.status === 'em_dia').length;
  const totalTasks = careSchedule.length;
  const completionRate = (completedTasks / totalTasks) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cuidados Preventivos</h1>
            <p className="text-muted-foreground">Mantenha sua saúde bucal em dia com nosso programa preventivo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cronograma de Cuidados */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Seu Progresso Preventivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{completedTasks}/{totalTasks}</p>
                    <p className="text-sm text-muted-foreground">cuidados em dia</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {Math.round(completionRate)}% completo
                  </Badge>
                </div>
                
                <Progress value={completionRate} className="h-2 mb-4" />
                <p className="text-xs text-muted-foreground">
                  Continue mantendo seus cuidados preventivos em dia para uma saúde bucal perfeita!
                </p>
              </CardContent>
            </Card>

            {/* Lista de Cuidados */}
            <Card>
              <CardHeader>
                <CardTitle>Cronograma de Cuidados</CardTitle>
                <p className="text-muted-foreground">Acompanhe seus procedimentos preventivos</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {careSchedule.map((care, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(care.status)}
                          <div>
                            <h4 className="font-medium">{care.title}</h4>
                            <p className="text-sm text-muted-foreground">{care.description}</p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(care.status)}`}>
                          {getStatusText(care.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Frequência</p>
                          <p className="font-medium">{care.frequency}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Último</p>
                          <p className="font-medium">{care.lastDone}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Próximo</p>
                          <p className="font-medium">{care.nextDue}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Agendar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          Lembrete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Dicas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas de Prevenção</CardTitle>
                <p className="text-sm text-muted-foreground">Mantenha sua saúde bucal perfeita</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {tips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-4 w-4 text-primary mt-1" />
                        <div>
                          <h4 className="font-medium text-sm">{tip.title}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{tip.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {tip.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lembretes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="font-medium text-sm text-red-900">Consulta atrasada</p>
                      <p className="text-xs text-red-700">Venceu em 10/01/2025</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm text-yellow-900">Raio-X próximo</p>
                      <p className="text-xs text-yellow-700">Vence em 22/03/2025</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Passos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button size="sm" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Consulta de Rotina
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Configurar Lembretes
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Ver Programa de Fidelidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PreventiveCare;