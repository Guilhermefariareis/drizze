import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  Clock
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeClinics: number;
  todayAppointments: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  systemAlerts: number;
  avgResponseTime: string;
  uptime: string;
}

interface AdminDashboardEnhancedProps {
  metrics?: DashboardMetrics;
}

export function AdminDashboardEnhanced({ metrics }: AdminDashboardEnhancedProps) {
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalUsers: 12345,
    activeClinics: 856,
    todayAppointments: 2341,
    monthlyRevenue: 124500,
    pendingApprovals: 23,
    systemAlerts: 5,
    avgResponseTime: '2.3s',
    uptime: '99.9%'
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMetricCards = () => [
    {
      title: "Total de Usuários",
      value: dashboardMetrics.totalUsers.toLocaleString('pt-BR'),
      change: "+12%",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Clínicas Ativas",
      value: dashboardMetrics.activeClinics.toLocaleString('pt-BR'),
      change: "+8%",
      icon: Building2,
      color: "text-success",
      bgColor: "bg-green-100"
    },
    {
      title: "Consultas Hoje",
      value: dashboardMetrics.todayAppointments.toLocaleString('pt-BR'),
      change: "+15%",
      icon: Calendar,
      color: "text-warning",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Receita Mensal",
      value: formatCurrency(dashboardMetrics.monthlyRevenue),
      change: "+25%",
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-blue-100"
    }
  ];

  const getSystemMetrics = () => [
    {
      title: "Aprovações Pendentes",
      value: dashboardMetrics.pendingApprovals,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Alertas do Sistema",
      value: dashboardMetrics.systemAlerts,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Tempo de Resposta",
      value: dashboardMetrics.avgResponseTime,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Uptime",
      value: dashboardMetrics.uptime,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getMetricCards().map((metric) => (
          <Card key={metric.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-green-600 font-medium">
                    {metric.change} vs mês anterior
                  </p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Métricas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getSystemMetrics().map((metric) => (
              <div key={metric.title} className="flex items-center space-x-3 p-4 rounded-lg border">
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-lg font-semibold">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">5 clínicas com problemas de integração</span>
                </div>
                <Button size="sm" variant="outline">Ver</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">23 aprovações aguardando revisão</span>
                </div>
                <Button size="sm" variant="outline">Revisar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-16 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Gerenciar Usuários</span>
              </Button>
              <Button className="h-16 flex flex-col items-center justify-center" variant="outline">
                <Building2 className="h-5 w-5 mb-1" />
                <span className="text-xs">Aprovar Clínicas</span>
              </Button>
              <Button className="h-16 flex flex-col items-center justify-center" variant="outline">
                <DollarSign className="h-5 w-5 mb-1" />
                <span className="text-xs">Relatórios</span>
              </Button>
              <Button className="h-16 flex flex-col items-center justify-center" variant="outline">
                <Activity className="h-5 w-5 mb-1" />
                <span className="text-xs">Monitoramento</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}