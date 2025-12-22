import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveGrid } from "@/components/responsive/ResponsiveGrid";
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  Calendar, Filter, Eye, Users, DollarSign,
  Clock, Star, Target, FileText
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

export function ReportsSection() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReport, setSelectedReport] = useState("revenue");

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 25000, appointments: 120 },
    { month: 'Fev', revenue: 28000, appointments: 135 },
    { month: 'Mar', revenue: 32000, appointments: 145 },
    { month: 'Abr', revenue: 35000, appointments: 160 },
    { month: 'Mai', revenue: 38000, appointments: 175 },
    { month: 'Jun', revenue: 42000, appointments: 190 },
  ];

  const servicesData = [
    { name: 'Limpeza', value: 30, color: '#8884d8' },
    { name: 'Clareamento', value: 25, color: '#82ca9d' },
    { name: 'Implante', value: 20, color: '#ffc658' },
    { name: 'Ortodontia', value: 15, color: '#ff7300' },
    { name: 'Outros', value: 10, color: '#00ff00' },
  ];

  const appointmentsByHour = [
    { hour: '08:00', appointments: 2 },
    { hour: '09:00', appointments: 4 },
    { hour: '10:00', appointments: 6 },
    { hour: '11:00', appointments: 5 },
    { hour: '14:00', appointments: 7 },
    { hour: '15:00', appointments: 8 },
    { hour: '16:00', appointments: 6 },
    { hour: '17:00', appointments: 4 },
  ];

  const reports = [
    {
      id: "revenue",
      name: "Faturamento",
      icon: DollarSign,
      description: "Análise de receitas e faturamento",
      component: "revenue"
    },
    {
      id: "appointments",
      name: "Consultas",
      icon: Calendar,
      description: "Estatísticas de consultas e agendamentos",
      component: "appointments"
    },
    {
      id: "services",
      name: "Serviços",
      icon: PieChart,
      description: "Performance dos serviços oferecidos",
      component: "services"
    },
    {
      id: "patients",
      name: "Pacientes",
      icon: Users,
      description: "Análise do perfil de pacientes",
      component: "patients"
    }
  ];

  const kpis = [
    {
      title: "Faturamento Mensal",
      value: "R$ 42.000",
      change: "+12%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Consultas do Mês",
      value: "190",
      change: "+8%",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Taxa de Ocupação",
      value: "85%",
      change: "+5%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Satisfação Média",
      value: "4.8",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  const renderReportContent = () => {
    switch (selectedReport) {
      case "revenue":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Faturamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Faturamento" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "appointments":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultas por Horário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={appointmentsByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={servicesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {servicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "patients":
        return (
          <div className="space-y-6">
            <ResponsiveGrid cols={{ default: 1, sm: 2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Novos Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">35</p>
                    <p className="text-muted-foreground">Este mês</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Retorno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">78%</p>
                    <p className="text-muted-foreground">Pacientes recorrentes</p>
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios e Análises</h2>
          <p className="text-muted-foreground">
            Acompanhe o desempenho da sua clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ResponsiveGrid cols={{ default: 2, lg: 4 }}>
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-8 w-8 ${kpi.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {kpi.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </ResponsiveGrid>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid cols={{ default: 2, lg: 4 }}>
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <Icon className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-medium">{report.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </ResponsiveGrid>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReportContent()}

      {/* Quick Actions */}
      <ResponsiveGrid cols={{ default: 1, sm: 3 }}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <FileText className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Relatório Completo</h3>
            <p className="text-sm text-muted-foreground">
              Gerar relatório detalhado
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Análise Preditiva</h3>
            <p className="text-sm text-muted-foreground">
              Projeções e tendências
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center space-y-2">
            <Eye className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-medium">Dashboard Executivo</h3>
            <p className="text-sm text-muted-foreground">
              Visão geral executiva
            </p>
          </CardContent>
        </Card>
      </ResponsiveGrid>
    </div>
  );
}