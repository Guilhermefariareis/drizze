import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export const AdminDashboardMetrics = () => {
  // Dados fictícios para demonstração
  const metrics = {
    users: {
      total: 8432,
      growth: 12.3,
      patients: 7850,
      clinics: 582
    },
    revenue: {
      total: 287450,
      growth: 8.7,
      subscriptions: 185200,
      commissions: 102250
    },
    appointments: {
      total: 15420,
      growth: 15.2,
      completed: 14156,
      pending: 1264
    },
    support: {
      open_tickets: 23,
      resolved_tickets: 156,
      response_time: 2.4
    }
  };

  const revenueData = [
    { name: 'Jan', assinaturas: 15000, comissoes: 8500, total: 23500 },
    { name: 'Fev', assinaturas: 16200, comissoes: 9200, total: 25400 },
    { name: 'Mar', assinaturas: 17800, comissoes: 10100, total: 27900 },
    { name: 'Abr', assinaturas: 18500, comissoes: 11200, total: 29700 },
    { name: 'Mai', assinaturas: 19200, comissoes: 10800, total: 30000 },
    { name: 'Jun', assinaturas: 20100, comissoes: 12300, total: 32400 }
  ];

  const userGrowthData = [
    { name: 'Jan', pacientes: 6200, clinicas: 480 },
    { name: 'Fev', pacientes: 6800, clinicas: 510 },
    { name: 'Mar', pacientes: 7200, clinicas: 535 },
    { name: 'Abr', pacientes: 7450, clinicas: 558 },
    { name: 'Mai', pacientes: 7680, clinicas: 572 },
    { name: 'Jun', pacientes: 7850, clinicas: 582 }
  ];

  const planDistribution = [
    { name: 'Básico', value: 45, color: '#0088FE' },
    { name: 'Profissional', value: 35, color: '#00C49F' },
    { name: 'Premium', value: 20, color: '#FFBB28' }
  ];

  const supportData = [
    { name: 'Seg', tickets: 15, resolvidos: 18 },
    { name: 'Ter', tickets: 12, resolvidos: 14 },
    { name: 'Qua', tickets: 8, resolvidos: 16 },
    { name: 'Qui', tickets: 20, resolvidos: 22 },
    { name: 'Sex', tickets: 18, resolvidos: 25 },
    { name: 'Sáb', tickets: 6, resolvidos: 12 },
    { name: 'Dom', tickets: 3, resolvidos: 8 }
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.users.total || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{metrics.users.growth}%</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Pacientes: </span>
              <span className="font-medium">{(metrics.users.patients || 0).toLocaleString()}</span>
              <span className="text-muted-foreground"> | Clínicas: </span>
              <span className="font-medium">{metrics.users.clinics}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(metrics.revenue.total || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{metrics.revenue.growth}%</span>
              <span className="ml-1">vs mês anterior</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Assinaturas: </span>
              <span className="font-medium">R$ {(metrics.revenue.subscriptions || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.appointments.total || 0).toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">{metrics.appointments.growth}%</span>
              <span className="ml-1">este mês</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Concluídos: </span>
              <span className="font-medium">{(metrics.appointments.completed || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suporte</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.support.open_tickets}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-500 mr-1" />
              <span>Tempo médio: {metrics.support.response_time}h</span>
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Resolvidos: </span>
              <span className="font-medium">{metrics.support.resolved_tickets} este mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${(value || 0).toLocaleString()}`, '']} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="assinaturas"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pacientes"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Pacientes"
                />
                <Line
                  type="monotone"
                  dataKey="clinicas"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Clínicas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets de Suporte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={supportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#ff7300" name="Novos" />
                <Bar dataKey="resolvidos" fill="#387908" name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema Principal</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Clinicorp</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sistema de Pagamentos</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Funcionando
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Banco de Dados</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Manutenção
              </Badge>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Uptime</span>
                <span>99.7%</span>
              </div>
              <Progress value={99.7} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas e Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Campanha de Limpeza</p>
                <p className="text-xs text-muted-foreground">Desconto especial para novos pacientes</p>
              </div>
              <Badge variant="default">Ativa</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Programa de Fidelidade</p>
                <p className="text-xs text-muted-foreground">Sistema de pontos e recompensas</p>
              </div>
              <Badge variant="default">Ativa</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Black Friday Dental</p>
                <p className="text-xs text-muted-foreground">Promoção sazonal - preparação</p>
              </div>
              <Badge variant="secondary">Agendada</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-1" />
              <div>
                <p className="font-medium text-sm text-red-900">Limite de API atingido</p>
                <p className="text-xs text-red-700">API do Clinicorp próxima do limite mensal</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 mt-1" />
              <div>
                <p className="font-medium text-sm text-yellow-900">Backup programado</p>
                <p className="text-xs text-yellow-700">Backup automático em 2 horas</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-sm text-blue-900">Sistema atualizado</p>
                <p className="text-xs text-blue-700">Última atualização realizada com sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};