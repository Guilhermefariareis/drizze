import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, Star, Gift, TrendingUp, Calendar, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import Footer from '@/components/Footer';

const LoyaltyProgram = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/patient-login" replace />;
  }

  const currentPoints = 250;
  const nextLevelPoints = 500;
  const progress = (currentPoints / nextLevelPoints) * 100;

  const benefits = [
    {
      icon: Gift,
      title: "Desconto em Consultas",
      description: "5% de desconto em todas as consultas",
      points: "100 pontos",
      color: "text-blue-600"
    },
    {
      icon: Star,
      title: "Consulta Preventiva Gratuita",
      description: "Uma consulta preventiva gratuita por ano",
      points: "300 pontos",
      color: "text-yellow-600"
    },
    {
      icon: Heart,
      title: "Limpeza Gratuita",
      description: "Limpeza dental gratuita a cada 6 meses",
      points: "500 pontos",
      color: "text-red-600"
    },
    {
      icon: TrendingUp,
      title: "Upgrade de Tratamento",
      description: "10% de desconto em tratamentos especializados",
      points: "750 pontos",
      color: "text-green-600"
    }
  ];

  const activities = [
    { action: "Consulta realizada", points: "+50 pontos", date: "15/12/2024" },
    { action: "Avaliação enviada", points: "+25 pontos", date: "10/12/2024" },
    { action: "Referência de amigo", points: "+100 pontos", date: "05/12/2024" },
    { action: "Check-up preventivo", points: "+75 pontos", date: "01/12/2024" }
  ];

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Programa de Fidelidade</h1>
            <p className="text-muted-foreground">Acumule pontos e ganhe benefícios exclusivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status do Programa */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Seus Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">{currentPoints}</p>
                    <p className="text-sm text-muted-foreground">pontos disponíveis</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Nível Bronze
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso para Nível Prata</span>
                    <span>{currentPoints}/{nextLevelPoints} pontos</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Faltam {nextLevelPoints - currentPoints} pontos para o próximo nível
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Benefícios Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Benefícios Disponíveis</CardTitle>
                <p className="text-muted-foreground">Troque seus pontos por benefícios exclusivos</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    const canClaim = currentPoints >= parseInt(benefit.points);

                    return (
                      <div key={index} className={`p-4 border rounded-lg ${canClaim ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
                        <div className="flex items-start gap-3">
                          <IconComponent className={`h-5 w-5 ${benefit.color} mt-1`} />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{benefit.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{benefit.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {benefit.points}
                              </Badge>
                              <Button
                                size="sm"
                                variant={canClaim ? "default" : "secondary"}
                                disabled={!canClaim}
                                className="h-7 text-xs"
                              >
                                {canClaim ? "Resgatar" : "Indisponível"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Atividades */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como Ganhar Pontos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Consulta realizada</p>
                    <p className="text-muted-foreground">+50 pontos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Avaliação da clínica</p>
                    <p className="text-muted-foreground">+25 pontos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Check-up preventivo</p>
                    <p className="text-muted-foreground">+75 pontos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Gift className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Indicação de amigo</p>
                    <p className="text-muted-foreground">+100 pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-muted-foreground text-xs">{activity.date}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.points}
                      </Badge>
                    </div>
                  ))}
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

export default LoyaltyProgram;