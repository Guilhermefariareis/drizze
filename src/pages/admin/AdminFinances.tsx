import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Search, Filter, Download, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Admin client to bypass RLS
const adminSupabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

type Payment = {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  appointment_id: string;
  appointments?: {
    clinic_id: string;
    patient_id: string;
    clinics?: {
      name: string;
    };
  };
  profiles?: {
    full_name: string;
  };
};

export default function AdminFinances() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    processedCount: 0,
    commissionTotal: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminSupabase
        .from('payments')
        .select(`
          *,
          appointments (
            clinic_id,
            patient_id,
            clinics (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      let enrichedPayments = data as any[];

      if (enrichedPayments && enrichedPayments.length > 0) {
        const patientIds = [...new Set(enrichedPayments.map(p => p.appointments?.patient_id).filter(Boolean))];

        if (patientIds.length > 0) {
          const { data: profilesData } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .in('id', patientIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

          enrichedPayments = enrichedPayments.map(payment => ({
            ...payment,
            profiles: profilesMap.get(payment.appointments?.patient_id) || { full_name: 'Desconhecido' }
          }));
        }
      }

      setPayments(enrichedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total revenue
      const { data: revenueData } = await adminSupabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      // Pending amount
      const { data: pendingData } = await adminSupabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      // Total processed payments count
      const { count: processedCount } = await adminSupabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;
      const totalPending = pendingData?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;
      const commissionTotal = totalRevenue * 0.08; // 8% commission

      setStats({
        totalRevenue,
        pendingAmount: totalPending,
        processedCount: processedCount || 0,
        commissionTotal
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'N/A';
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      case 'bank_transfer': return 'Transferência';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredPayments = payments.filter(payment => {
    const clinicName = payment.appointments?.clinics?.name || '';
    const patientName = payment.profiles?.full_name || '';

    const matchesSearch = clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsData = [
    {
      title: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      change: "+25%",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Comissões",
      value: formatCurrency(stats.commissionTotal),
      change: "+18%",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Pendente",
      value: formatCurrency(stats.pendingAmount),
      change: "-5%",
      icon: AlertCircle,
      color: "text-warning"
    },
    {
      title: "Processadas",
      value: stats.processedCount.toString(),
      change: "+12%",
      icon: CreditCard,
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Financeiro</h1>
            <p className="text-muted-foreground">Monitore receitas, pagamentos e comissões da plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsData.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-success font-medium">{stat.change} vs mês anterior</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="commissions">Comissões</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <CardTitle>Transações Financeiras</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar transações..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="failed">Falhou</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Carregando transações...</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transação</TableHead>
                            <TableHead>Clínica</TableHead>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPayments.map(payment => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">Pagamento #{payment.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">ID: {payment.appointment_id.slice(0, 8)}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {payment.appointments?.clinics?.name || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {payment.profiles?.full_name || 'N/A'}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {getPaymentMethodLabel(payment.payment_method)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(payment.status)}>
                                  {getStatusLabel(payment.status)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(payment.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Baixar Comprovante
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commissions">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório de Comissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(stats.commissionTotal)}</p>
                      <p className="text-sm text-muted-foreground">Total de comissões</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">Receita total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent">8.0%</p>
                      <p className="text-sm text-muted-foreground">Taxa de comissão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Financeiros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalRevenue)}</p>
                      <p className="text-sm text-muted-foreground">Receita total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats.processedCount}</p>
                      <p className="text-sm text-muted-foreground">Transações processadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}