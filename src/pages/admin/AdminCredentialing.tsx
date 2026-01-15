import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Download, Eye, MoreHorizontal, FileCheck, Building2, Calendar, Phone, User, MapPin, CreditCard, FileText, Image, FileSpreadsheet, FileImage, ChevronDown, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Cliente admin com SERVICE_ROLE_KEY para contornar RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type ClinicLead = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nome_clinica: string;
  especialidade: string;
  cidade: string;
  mensagem?: string;
  status: string;
  created_at: string;
  updated_at?: string;

  // Novos campos individuais
  razao_social?: string;
  cnpj?: string;
  nome_fantasia?: string;
  cro_responsavel?: string;
  carteirinha_cro_url?: string;
  instagram?: string;
  site?: string;
  uf?: string;
  bairro?: string;
  numero_cadeiras?: number;
  orcamentos_mes?: number;
  ticket_medio?: number;
  faturamento_mensal?: number;
  local_clinica?: string;
  tem_credito?: boolean;
  valor_credito?: number;
  banco_credito?: string;
  tem_outros_servicos?: boolean;
  outros_servicos?: string;
  cargo?: string;
  como_conheceu?: string;
  especialidades?: string[];
};

export default function AdminCredentialing() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ufFilter, setUfFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [leads, setLeads] = useState<ClinicLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ClinicLead | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    states: 0,
    avgChairs: 0,
    byStatus: {
      novo: 0,
      em_analise: 0,
      aprovado: 0
    }
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data, error } = await adminSupabase
        .from('clinic_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads:', error);
        toast.error('Erro ao carregar dados');
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: totalData } = await adminSupabase
        .from('clinic_leads')
        .select('id, status', { count: 'exact' });

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthData } = await adminSupabase
        .from('clinic_leads')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfMonth.toISOString());

      const { data: citiesData } = await adminSupabase
        .from('clinic_leads')
        .select('cidade');

      const { data: specialtiesData } = await adminSupabase
        .from('clinic_leads')
        .select('especialidade');

      const uniqueCities = new Set(citiesData?.map(c => c.cidade) || []).size;
      const uniqueSpecialties = new Set(specialtiesData?.map(s => s.especialidade) || []).size;

      // Calcular estatísticas por status
      const statusCounts = {
        novo: 0,
        em_analise: 0,
        aprovado: 0
      };

      totalData?.forEach(lead => {
        if (lead.status in statusCounts) {
          statusCounts[lead.status as keyof typeof statusCounts]++;
        }
      });

      setStats({
        total: totalData?.length || 0,
        thisMonth: monthData?.length || 0,
        states: uniqueCities,
        avgChairs: uniqueSpecialties,
        byStatus: statusCounts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Função para atualizar lead no banco de dados
  const updateLeadInDatabase = async (leadId: string, updates: Partial<ClinicLead>) => {
    try {
      const { error } = await adminSupabase
        .from('clinic_leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro na atualização:', error);
      throw error;
    }
  };

  // Função para atualizar status individual
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadInDatabase(leadId, { status: newStatus });

      // Atualizar estado local
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );

      // Atualizar estatísticas
      await fetchStats();

      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  // Função para atualizar status em lote
  const updateMultipleLeadsStatus = async (leadIds: string[], newStatus: string) => {
    try {
      const { error } = await adminSupabase
        .from('clinic_leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', leadIds);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          leadIds.includes(lead.id) ? { ...lead, status: newStatus } : lead
        )
      );

      // Limpar seleção
      setSelectedLeads(new Set());
      setSelectAll(false);

      // Atualizar estatísticas
      await fetchStats();

      toast.success(`${leadIds.length} lead(s) atualizado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar leads em lote:', error);
      toast.error('Erro ao atualizar leads em lote');
    }
  };

  // Funções de seleção
  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
    setSelectAll(newSelected.size === filteredLeads.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredLeads.map(lead => lead.id));
      setSelectedLeads(allIds);
      setSelectAll(true);
    }
  };

  // Funções de exportação
  const getSelectedData = () => {
    return filteredLeads.filter(lead => selectedLeads.has(lead.id));
  };

  const exportToCSV = () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error('Selecione pelo menos um item para exportar');
      return;
    }

    const headers = [
      'Nome', 'Clínica', 'Email', 'Telefone', 'CNPJ', 'CRO', 'Cidade', 'UF',
      'Endereço', 'CEP', 'Especialidades', 'Cadeiras', 'Ticket Médio',
      'Faturamento Mensal', 'Valor Crédito', 'Status', 'Data Criação'
    ];

    const csvContent = [
      headers.join(','),
      ...selectedData.map(lead => [
        `"${lead.nome}"`,
        `"${lead.nome_clinica}"`,
        `"${lead.email || 'N/A'}"`,
        `"${formatPhone(lead.telefone)}"`,
        `"${formatCNPJ(lead.cnpj)}"`,
        `"${lead.cro_responsavel || 'N/A'}"`,
        `"${lead.cidade}"`,
        `"${lead.uf}"`,
        `"${lead.endereco || 'N/A'}"`,
        `"${lead.cep || 'N/A'}"`,
        `"${lead.especialidades || 'N/A'}"`,
        `"${lead.numero_cadeiras || 'N/A'}"`,
        `"${formatCurrency(lead.ticket_medio)}"`,
        `"${formatCurrency(lead.faturamento_mensal)}"`,
        `"${formatCurrency(lead.valor_credito)}"`,
        `"${lead.status === 'novo' ? 'Novo' : lead.status === 'em_analise' ? 'Em Análise' : 'Aprovado'}"`,
        `"${formatDate(lead.created_at)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credenciamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${selectedData.length} registros exportados para CSV`);
  };

  const exportToExcel = () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error('Selecione pelo menos um item para exportar');
      return;
    }

    // Implementação básica para Excel (usando CSV com extensão .xls)
    const headers = [
      'Nome', 'Clínica', 'Email', 'Telefone', 'CNPJ', 'CRO', 'Cidade', 'UF',
      'Endereço', 'CEP', 'Especialidades', 'Cadeiras', 'Ticket Médio',
      'Faturamento Mensal', 'Valor Crédito', 'Status', 'Data Criação'
    ];

    const csvContent = [
      headers.join('\t'),
      ...selectedData.map(lead => [
        lead.nome,
        lead.nome_clinica,
        lead.email || 'N/A',
        formatPhone(lead.telefone),
        formatCNPJ(lead.cnpj),
        lead.cro_responsavel || 'N/A',
        lead.cidade,
        lead.uf,
        lead.endereco || 'N/A',
        lead.cep || 'N/A',
        lead.especialidades || 'N/A',
        lead.numero_cadeiras || 'N/A',
        formatCurrency(lead.ticket_medio),
        formatCurrency(lead.faturamento_mensal),
        formatCurrency(lead.valor_credito),
        lead.status === 'novo' ? 'Novo' : lead.status === 'em_analise' ? 'Em Análise' : 'Aprovado',
        formatDate(lead.created_at)
      ].join('\t'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credenciamentos_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${selectedData.length} registros exportados para Excel`);
  };

  const exportToPDF = () => {
    const selectedData = getSelectedData();
    if (selectedData.length === 0) {
      toast.error('Selecione pelo menos um item para exportar');
      return;
    }

    // Implementação básica para PDF (usando window.print)
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Credenciamentos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 20px; }
          .date { text-align: right; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Credenciamentos</h1>
          <p class="date">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          <p><strong>Total de registros:</strong> ${selectedData.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Clínica</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>CNPJ</th>
              <th>CRO</th>
              <th>Cidade</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${selectedData.map(lead => `
              <tr>
                <td>${lead.nome}</td>
                <td>${lead.nome_clinica}</td>
                <td>${lead.email || 'N/A'}</td>
                <td>${formatPhone(lead.telefone)}</td>
                <td>${formatCNPJ(lead.cnpj)}</td>
                <td>${lead.cro_responsavel || 'N/A'}</td>
                <td>${lead.cidade}</td>
                <td>${lead.status === 'novo' ? 'Novo' : lead.status === 'em_analise' ? 'Em Análise' : 'Aprovado'}</td>
                <td>${formatDate(lead.created_at)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);

    toast.success(`Relatório PDF gerado com ${selectedData.length} registros`);
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCNPJ = (cnpj: string | null | undefined) => {
    if (!cnpj) return 'N/A';
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length === 14) {
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    }
    return cnpj;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.nome_clinica.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telefone.includes(searchQuery);
    const matchesUf = ufFilter === 'all' || lead.cidade === ufFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    // Filtro por período
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const leadDate = new Date(lead.created_at);
      const now = new Date();

      switch (dateFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = leadDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = leadDate >= monthAgo;
          break;
        case '3months':
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = leadDate >= threeMonthsAgo;
          break;
        case 'custom':
          if (customDateStart && customDateEnd) {
            const startDate = new Date(customDateStart);
            const endDate = new Date(customDateEnd);
            matchesDate = leadDate >= startDate && leadDate <= endDate;
          }
          break;
      }
    }

    return matchesSearch && matchesUf && matchesStatus && matchesDate;
  });

  const uniqueCities = Array.from(new Set(leads.map(lead => lead.cidade))).sort();

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Novo Credenciamento</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as solicitações de credenciamento de clínicas</p>
          </div>

          <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Visualização do Documento</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center p-4">
                {selectedLead?.carteirinha_cro_url && (
                  <img
                    src={selectedLead.carteirinha_cro_url}
                    alt="Documento em tamanho real"
                    className="max-w-full h-auto max-h-[80vh] rounded shadow-lg"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                    <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Building2 className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidades</p>
                    <p className="text-2xl font-bold">{stats.states}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Phone className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Especialidades</p>
                    <p className="text-2xl font-bold">{stats.avgChairs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Novos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.byStatus.novo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Settings className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.em_analise}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aprovados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.byStatus.aprovado}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar por nome, clínica, telefone ou email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={ufFilter} onValueChange={setUfFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Cidades</SelectItem>
                        {uniqueCities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="novo">Novo</SelectItem>
                        <SelectItem value="em_analise">Em Análise</SelectItem>
                        <SelectItem value="aprovado">Aprovado</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Períodos</SelectItem>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mês</SelectItem>
                        <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {dateFilter === 'custom' && (
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={customDateStart}
                      onChange={(e) => setCustomDateStart(e.target.value)}
                      placeholder="Data inicial"
                      className="w-40"
                    />
                    <Input
                      type="date"
                      value={customDateEnd}
                      onChange={(e) => setCustomDateEnd(e.target.value)}
                      placeholder="Data final"
                      className="w-40"
                    />
                  </div>
                )}

                <div className="flex gap-2">

                  {selectedLeads.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedLeads.size} selecionado{selectedLeads.size > 1 ? 's' : ''}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Ações em Lote
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => updateMultipleLeadsStatus(Array.from(selectedLeads), 'novo')}>
                            Marcar como Novo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMultipleLeadsStatus(Array.from(selectedLeads), 'em_analise')}>
                            Marcar como Em Análise
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMultipleLeadsStatus(Array.from(selectedLeads), 'aprovado')}>
                            Marcar como Aprovado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={exportToCSV}>
                            <FileText className="h-4 w-4 mr-2" />
                            Exportar CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportToExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Exportar Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportToPDF}>
                            <FileImage className="h-4 w-4 mr-2" />
                            Exportar PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Novo Credenciamento ({filteredLeads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>CRO</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id} className={selectedLeads.has(lead.id) ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.nome}</TableCell>
                        <TableCell>{lead.nome_clinica}</TableCell>
                        <TableCell className="text-sm">{lead.email || 'N/A'}</TableCell>
                        <TableCell className="font-mono text-sm">{formatPhone(lead.telefone)}</TableCell>
                        <TableCell className="text-sm">{formatCNPJ(lead.cnpj)}</TableCell>
                        <TableCell className="text-sm">{lead.cro_responsavel || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{lead.cidade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.status === 'aprovado' ? 'default' : lead.status === 'em_analise' ? 'secondary' : 'outline'}>
                            {lead.status === 'novo' ? 'Novo' : lead.status === 'em_analise' ? 'Em Análise' : 'Aprovado'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(lead.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Ver Detalhes
                                </Button>
                              </DialogTrigger>
                              {selectedLead && (
                                <LeadDetailsModal
                                  lead={selectedLead}
                                  onOpenImage={() => setImageModalOpen(true)}
                                />
                              )}
                            </Dialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'novo')}>
                                  Marcar como Novo
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'em_analise')}>
                                  Marcar como Em Análise
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'aprovado')}>
                                  Marcar como Aprovado
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && filteredLeads.length === 0 && (
                <div className="text-center py-8">
                  <FileCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma solicitação encontrada</h3>
                  <p className="text-sm text-muted-foreground">Não há solicitações de credenciamento que correspondam aos filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}