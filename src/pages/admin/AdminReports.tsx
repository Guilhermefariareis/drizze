import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, Building2, Calendar, DollarSign, Download, FileText } from 'lucide-react';

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const stats = [
    { title: "Usuários Ativos", value: "12.345", change: "+12%", icon: Users, color: "text-primary" },
    { title: "Clínicas Ativas", value: "856", change: "+8%", icon: Building2, color: "text-success" },
    { title: "Consultas Realizadas", value: "67.891", change: "+15%", icon: Calendar, color: "text-warning" },
    { title: "Receita Total", value: "R$ 489.200", change: "+25%", icon: DollarSign, color: "text-accent" }
  ];

  const monthlyData = [
    { month: "Jan", users: 1200, clinics: 80, appointments: 5400, revenue: 38000 },
    { month: "Fev", users: 1350, clinics: 85, appointments: 5800, revenue: 42000 },
    { month: "Mar", users: 1500, clinics: 90, appointments: 6200, revenue: 45000 },
    { month: "Abr", users: 1680, clinics: 95, appointments: 6800, revenue: 48000 },
    { month: "Mai", users: 1820, clinics: 102, appointments: 7200, revenue: 52000 },
    { month: "Jun", users: 2100, clinics: 108, appointments: 7800, revenue: 56000 }
  ];

  const topClinics = [
    { name: "Clínica Dental doltorizze", appointments: 432, revenue: "R$ 64.800", rating: 4.9 },
    { name: "Odonto Excellence", appointments: 398, revenue: "R$ 59.700", rating: 4.8 },
    { name: "Sorriso Perfeito", appointments: 365, revenue: "R$ 54.750", rating: 4.7 },
    { name: "Dental Care", appointments: 298, revenue: "R$ 44.700", rating: 4.6 },
    { name: "doltorizze Center", appointments: 267, revenue: "R$ 40.050", rating: 4.5 }
  ];

  const topSpecialties = [
    { name: "Ortodontia", percentage: 28, appointments: 1890 },
    { name: "Implantes", percentage: 22, appointments: 1485 },
    { name: "Endodontia", percentage: 18, appointments: 1215 },
    { name: "Periodontia", percentage: 15, appointments: 1012 },
    { name: "Estética", percentage: 17, appointments: 1148 }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />
        
        <div className="p-6">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Relatórios e Analytics</h1>
              <p className="text-muted-foreground">Análise detalhada do desempenho da plataforma</p>
            </div>
            <div className="flex gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-success font-medium">{stat.change} vs período anterior</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="clinics">Clínicas</TabsTrigger>
              <TabsTrigger value="specialties">Especialidades</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Crescimento Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyData.map((data, index) => (
                        <div key={data.month} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <BarChart3 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{data.month} 2024</p>
                              <p className="text-sm text-muted-foreground">{data.appointments} consultas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">R$ {data.revenue.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{data.users} usuários</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clinics">
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Clínicas por Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topClinics.map((clinic, index) => (
                      <div key={clinic.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{clinic.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Avaliação: {clinic.rating}⭐
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{clinic.revenue}</p>
                          <p className="text-sm text-muted-foreground">{clinic.appointments} consultas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specialties">
              <Card>
                <CardHeader>
                  <CardTitle>Especialidades Mais Procuradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSpecialties.map((specialty) => (
                      <div key={specialty.name} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{specialty.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {specialty.appointments} consultas ({specialty.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${specialty.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="p-4 bg-success/10 rounded-lg mb-2">
                          <DollarSign className="h-8 w-8 text-success mx-auto" />
                        </div>
                        <p className="text-2xl font-bold text-success">R$ 489.200</p>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                      </div>
                      <div className="text-center">
                        <div className="p-4 bg-primary/10 rounded-lg mb-2">
                          <TrendingUp className="h-8 w-8 text-primary mx-auto" />
                        </div>
                        <p className="text-2xl font-bold text-primary">R$ 48.920</p>
                        <p className="text-sm text-muted-foreground">Comissões (10%)</p>
                      </div>
                      <div className="text-center">
                        <div className="p-4 bg-warning/10 rounded-lg mb-2">
                          <FileText className="h-8 w-8 text-warning mx-auto" />
                        </div>
                        <p className="text-2xl font-bold text-warning">2.341</p>
                        <p className="text-sm text-muted-foreground">Transações</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}