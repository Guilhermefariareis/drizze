import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricasAgendamento {
  total: number;
  confirmados: number;
  pendentes: number;
  cancelados: number;
  concluidos: number;
  taxaOcupacao: number;
  receitaTotal: number;
  receitaMedia: number;
  noShow: number;
}

interface DadosGrafico {
  data: string;
  agendamentos: number;
  receita: number;
  ocupacao: number;
}

const CORES_STATUS = {
  confirmado: '#10b981',
  pendente: '#f59e0b',
  cancelado: '#ef4444',
  concluido: '#8b5cf6',
  'no-show': '#6b7280'
};

export function DashboardAgendamentos() {
  const { user } = useAuth();
  const { agendamentos, carregarAgendamentos } = useAgendamentos();
  const [periodo, setPeriodo] = useState('mes');
  const [metricas, setMetricas] = useState<MetricasAgendamento>({
    total: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0,
    concluidos: 0,
    taxaOcupacao: 0,
    receitaTotal: 0,
    receitaMedia: 0,
    noShow: 0
  });
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);

  useEffect(() => {
    if (user?.clinica_id) {
      carregarAgendamentos();
    }
  }, [user?.clinica_id]);

  useEffect(() => {
    calcularMetricas();
  }, [agendamentos, periodo]);

  const calcularMetricas = () => {
    if (!agendamentos.length) return;

    const agora = new Date();
    let agendamentosFiltrados = agendamentos;

    // Filtrar por período
    if (periodo === 'mes') {
      const inicioMes = startOfMonth(agora);
      const fimMes = endOfMonth(agora);
      agendamentosFiltrados = agendamentos.filter(ag => {
        const dataAg = new Date(ag.data_hora);
        return dataAg >= inicioMes && dataAg <= fimMes;
      });
    }

    const total = agendamentosFiltrados.length;
    const confirmados = agendamentosFiltrados.filter(ag => ag.status === 'confirmado').length;
    const pendentes = agendamentosFiltrados.filter(ag => ag.status === 'pendente').length;
    const cancelados = agendamentosFiltrados.filter(ag => ag.status === 'cancelado').length;
    const concluidos = agendamentosFiltrados.filter(ag => ag.status === 'concluido').length;
    const noShow = agendamentosFiltrados.filter(ag => ag.status === 'no-show').length;

    const receitaTotal = agendamentosFiltrados
      .filter(ag => ag.status === 'concluido')
      .reduce((acc, ag) => acc + (ag.valor || 0), 0);

    const receitaMedia = concluidos > 0 ? receitaTotal / concluidos : 0;

    // Calcular taxa de ocupação (assumindo 8 horas/dia, 5 dias/semana)
    const diasUteis = 22; // aproximadamente por mês
    const horasDisponiveis = diasUteis * 8;
    const horasOcupadas = agendamentosFiltrados
      .filter(ag => ag.status !== 'cancelado')
      .length; // assumindo 1 hora por consulta
    const taxaOcupacao = (horasOcupadas / horasDisponiveis) * 100;

    setMetricas({
      total,
      confirmados,
      pendentes,
      cancelados,
      concluidos,
      taxaOcupacao: Math.min(taxaOcupacao, 100),
      receitaTotal,
      receitaMedia,
      noShow
    });

    // Gerar dados para gráficos
    gerarDadosGrafico(agendamentosFiltrados);
  };

  const gerarDadosGrafico = (agendamentosFiltrados: any[]) => {
    const agora = new Date();
    const inicioMes = startOfMonth(agora);
    const fimMes = endOfMonth(agora);
    const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes });

    const dadosPorDia = diasMes.map(dia => {
      const agendamentosDia = agendamentosFiltrados.filter(ag => {
        const dataAg = new Date(ag.data_hora);
        return format(dataAg, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd');
      });

      const receitaDia = agendamentosDia
        .filter(ag => ag.status === 'concluido')
        .reduce((acc, ag) => acc + (ag.valor || 0), 0);

      const ocupacaoDia = (agendamentosDia.length / 8) * 100; // 8 slots por dia

      return {
        data: format(dia, 'dd/MM'),
        agendamentos: agendamentosDia.length,
        receita: receitaDia,
        ocupacao: Math.min(ocupacaoDia, 100)
      };
    });

    setDadosGrafico(dadosPorDia);
  };

  const dadosStatusPie = [
    { name: 'Confirmados', value: metricas.confirmados, color: CORES_STATUS.confirmado },
    { name: 'Pendentes', value: metricas.pendentes, color: CORES_STATUS.pendente },
    { name: 'Concluídos', value: metricas.concluidos, color: CORES_STATUS.concluido },
    { name: 'Cancelados', value: metricas.cancelados, color: CORES_STATUS.cancelado },
    { name: 'No-show', value: metricas.noShow, color: CORES_STATUS['no-show'] }
  ].filter(item => item.value > 0);

  const dadosOcupacaoSemanal = [
    { dia: 'Seg', ocupacao: 85, meta: 80 },
    { dia: 'Ter', ocupacao: 92, meta: 80 },
    { dia: 'Qua', ocupacao: 78, meta: 80 },
    { dia: 'Qui', ocupacao: 88, meta: 80 },
    { dia: 'Sex', ocupacao: 95, meta: 80 },
    { dia: 'Sáb', ocupacao: 65, meta: 60 }
  ];

  return (
    <div className="spacing-mobile sm:spacing-desktop">
      {/* Header */}
      <div className="calendar-header">
        <div>
          <h1 className="text-responsive-xl font-bold text-foreground">Dashboard de Agendamentos</h1>
          <p className="text-responsive-sm text-muted-foreground">
            Análise completa dos agendamentos e ocupação da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm touch-target"
          >
            <option value="semana">Última semana</option>
            <option value="mes">Último mês</option>
            <option value="trimestre">Último trimestre</option>
          </select>
          <Button variant="outline" className="btn-mobile sm:btn-desktop touch-target">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid-dashboard">
        <Card className="card-mobile sm:card-desktop">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <p className="text-responsive-lg font-bold">{metricas.total}</p>
                <p className="text-responsive-sm text-muted-foreground">Total de Agendamentos</p>
                <Badge variant="outline" className="text-xs">
                  +{metricas.confirmados + metricas.pendentes} ativos
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile sm:card-desktop">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div>
                <p className="text-responsive-lg font-bold">{metricas.taxaOcupacao.toFixed(1)}%</p>
                <p className="text-responsive-sm text-muted-foreground">Taxa de Ocupação</p>
                <Progress value={metricas.taxaOcupacao} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile sm:card-desktop">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div>
                <p className="text-responsive-lg font-bold">R$ {metricas.receitaTotal.toFixed(0)}</p>
                <p className="text-responsive-sm text-muted-foreground">Receita Total</p>
                <Badge variant="outline" className="text-xs">
                  Média: R$ {metricas.receitaMedia.toFixed(0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile sm:card-desktop">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div>
                <p className="text-responsive-lg font-bold">{metricas.concluidos}</p>
                <p className="text-responsive-sm text-muted-foreground">Consultas Concluídas</p>
                <Badge variant="outline" className="text-xs">
                  {metricas.noShow} no-show
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="ocupacao" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ocupacao">Ocupação</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="tendencias">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="ocupacao" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ocupação Diária do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="ocupacao"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Taxa de Ocupação (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocupação Semanal vs Meta</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosOcupacaoSemanal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ocupacao" fill="#8884d8" name="Ocupação Atual" />
                    <Bar dataKey="meta" fill="#82ca9d" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receita" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Receita Diária (R$)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={dadosStatusPie}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dadosStatusPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo de Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Confirmados</span>
                  </div>
                  <span className="font-medium">{metricas.confirmados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pendentes</span>
                  </div>
                  <span className="font-medium">{metricas.pendentes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Concluídos</span>
                  </div>
                  <span className="font-medium">{metricas.concluidos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Cancelados</span>
                  </div>
                  <span className="font-medium">{metricas.cancelados}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>No-show</span>
                  </div>
                  <span className="font-medium">{metricas.noShow}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="agendamentos" fill="#8884d8" name="Agendamentos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas e Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Taxa de No-show</p>
                <p className="text-sm text-yellow-600">
                  {((metricas.noShow / metricas.total) * 100).toFixed(1)}% dos agendamentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Melhor Dia</p>
                <p className="text-sm text-blue-600">
                  {dadosGrafico.reduce((max, dia) => 
                    dia.agendamentos > max.agendamentos ? dia : max, 
                    dadosGrafico[0] || { data: 'N/A', agendamentos: 0 }
                  ).data}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Receita Média</p>
                <p className="text-sm text-green-600">
                  R$ {metricas.receitaMedia.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardAgendamentos;