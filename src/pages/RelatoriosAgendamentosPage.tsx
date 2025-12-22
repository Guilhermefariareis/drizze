import React from 'react';
import { DashboardAgendamentos } from '@/components/agendamento';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsSection } from '@/components/clinic/ReportsSection';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Download
} from 'lucide-react';

function RelatoriosAgendamentosPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Análise completa de agendamentos, ocupação e performance da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatório Completo
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Tabs para diferentes tipos de relatórios */}
      <Tabs defaultValue="agendamentos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agendamentos" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios Gerais
          </TabsTrigger>
          <TabsTrigger value="exportar" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agendamentos">
          <DashboardAgendamentos />
        </TabsContent>

        <TabsContent value="geral">
          <ReportsSection />
        </TabsContent>

        <TabsContent value="exportar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <Calendar className="h-12 w-12 text-blue-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Relatório de Agendamentos</h3>
                  <p className="text-sm text-muted-foreground">
                    Exportar dados completos de agendamentos por período
                  </p>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <DollarSign className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Relatório Financeiro</h3>
                  <p className="text-sm text-muted-foreground">
                    Receitas, faturamento e análise financeira
                  </p>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <Users className="h-12 w-12 text-purple-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Relatório de Pacientes</h3>
                  <p className="text-sm text-muted-foreground">
                    Dados de pacientes, frequência e histórico
                  </p>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <TrendingUp className="h-12 w-12 text-orange-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Análise de Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Métricas de ocupação, eficiência e tendências
                  </p>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <PieChart className="h-12 w-12 text-indigo-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Dashboard Executivo</h3>
                  <p className="text-sm text-muted-foreground">
                    Resumo executivo com principais KPIs
                  </p>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <FileText className="h-12 w-12 text-gray-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Relatório Personalizado</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure campos e filtros personalizados
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Configurações de Exportação */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Período</label>
                  <select className="w-full border border-border rounded-md px-3 py-2">
                    <option value="ultima-semana">Última semana</option>
                    <option value="ultimo-mes">Último mês</option>
                    <option value="ultimo-trimestre">Último trimestre</option>
                    <option value="ultimo-ano">Último ano</option>
                    <option value="personalizado">Período personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Formato</label>
                  <select className="w-full border border-border rounded-md px-3 py-2">
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="json">JSON (.json)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Incluir</label>
                  <select className="w-full border border-border rounded-md px-3 py-2">
                    <option value="todos">Todos os dados</option>
                    <option value="resumo">Apenas resumo</option>
                    <option value="detalhado">Dados detalhados</option>
                    <option value="graficos">Incluir gráficos</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Visualizar</Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RelatoriosAgendamentosPage;