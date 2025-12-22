import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditRequestModal } from '@/components/patient/CreditRequestModal';


import { 
  CreditCard, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  FileText,
  Calendar,
  Building,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LoanRequest {
  id: string;
  treatment_description: string;
  amount: number;
  status: 'pending' | 'clinic_approved' | 'clinic_rejected' | 'admin_approved' | 'admin_rejected' | 'admin_analyzing';
  created_at: string;
  clinic_name: string;
  clinic_id: string;
  interest_rate?: number;
  installments?: number;
  monthly_payment?: number;
  approval_date?: string;
  disbursement_date?: string;
  full_name?: string;
  clinic_distance?: number;
}

interface CreditSummary {
  total_approved: number;
  total_available: number;
  total_used: number;
  pending_requests: number;
}



export default function PatientCredit() {
  console.log('[PatientCredit] Página carregada');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [creditSummary, setCreditSummary] = useState<CreditSummary>({
    total_approved: 0,
    total_available: 0,
    total_used: 0,
    pending_requests: 0
  });
  console.log('[PatientCredit] Estado inicial configurado');

  const fetchCreditData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        toast.error('Erro ao carregar dados do perfil');
        return;
      }
      
      // Buscar solicitações de crédito usando o profile.id
      const { data: loanData, error: loanError } = await supabase
        .from('credit_requests')
        .select(`
          id,
          requested_amount,
          status,
          created_at,
          treatment_description,
          installments,
          clinic_id,
          clinics!inner(id, name, phone, address)
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (loanError) {
        console.error('Erro ao buscar solicitações:', loanError);
        toast.error('Erro ao carregar solicitações de crédito');
      } else {
        const formattedLoans: LoanRequest[] = (loanData || []).map(loan => ({
          id: loan.id,
          treatment_description: loan.treatment_description || 'Tratamento Odontológico',
          amount: loan.requested_amount,
          status: loan.status,
          created_at: loan.created_at,
          clinic_name: loan.clinics.name,
          clinic_id: loan.clinic_id,
          interest_rate: 2.5,
          installments: loan.installments || 12,
          monthly_payment: loan.requested_amount / (loan.installments || 12)
        }));
        setLoanRequests(formattedLoans);
      }

      // Calcular resumo do crédito
      const currentRequests = loanData || [];
      const approvedLoans = currentRequests.filter(loan => loan.status === 'clinic_approved' || loan.status === 'admin_approved');
      const totalApproved = approvedLoans.reduce((sum, loan) => sum + loan.requested_amount, 0);
      const totalUsed = 0; // Será implementado quando houver sistema de pagamentos
      const pendingRequests = currentRequests.filter(loan => loan.status === 'pending').length;

      setCreditSummary({
        total_approved: totalApproved,
        total_available: totalApproved - totalUsed,
        total_used: totalUsed,
        pending_requests: pendingRequests
      });

    } catch (error) {
      console.error('Erro ao carregar dados de crédito:', error);
      toast.error('Erro ao carregar dados de crédito');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    fetchCreditData();
  }, [user, fetchCreditData]);

  const getStatusBadge = useCallback((status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', variant: 'outline' as const, icon: Clock },
      'clinic_approved': { label: 'Aprovado pela Clínica', variant: 'default' as const, icon: CheckCircle },
      'clinic_rejected': { label: 'Rejeitado pela Clínica', variant: 'destructive' as const, icon: XCircle },
      'admin_approved': { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      'admin_rejected': { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
      'admin_analyzing': { label: 'Em Análise', variant: 'secondary' as const, icon: Clock }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: AlertCircle 
    };
    
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  const calculateMonthlyPayment = useCallback((amount: number, installments: number) => {
    const interestRate = 0.025; // 2.5% ao mês
    const monthlyRate = interestRate;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, installments)) / 
                   (Math.pow(1 + monthlyRate, installments) - 1);
    return payment;
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <PatientSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Crédito Odontológico</h1>
              <p className="text-muted-foreground">Gerencie suas solicitações de crédito para tratamentos</p>
            </div>
            {/* Botão Nova Solicitação removido conforme solicitado */}
          </div>

          {/* Teste de Geolocalização */}
  

          {/* Credit Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crédito Aprovado</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(creditSummary.total_approved)}</div>
                <p className="text-xs text-muted-foreground">Total aprovado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crédito Disponível</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(creditSummary.total_available)}</div>
                <p className="text-xs text-muted-foreground">Disponível para uso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crédito Utilizado</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(creditSummary.total_used)}</div>
                <p className="text-xs text-muted-foreground">Já utilizado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{creditSummary.pending_requests}</div>
                <p className="text-xs text-muted-foreground">Aguardando análise</p>
              </CardContent>
            </Card>
          </div>

          {/* Loan Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Solicitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loanRequests.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Histórico de Solicitações</h3>
                    <CreditRequestModal 
                      onSuccess={fetchCreditData}
                      trigger={
                        <Button size="sm" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Nova Solicitação
                        </Button>
                      }
                    />
                  </div>
                  {loanRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{request.treatment_description}</h3>
                            {getStatusBadge(request.status)}
                            {request.clinic_distance && (
                              <Badge variant="outline" className="text-xs">
                                {request.clinic_distance.toFixed(1)} km
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {request.clinic_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(request.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(request.amount)}</div>
                          {request.monthly_payment && (
                            <div className="text-sm text-muted-foreground">
                              {request.installments}x de {formatCurrency(request.monthly_payment)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(request.status === 'clinic_approved' || request.status === 'admin_approved') && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Crédito aprovado!</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Seu crédito foi aprovado e está disponível para uso na clínica.
                          </p>
                        </div>
                      )}
                      
                      {(request.status === 'clinic_rejected' || request.status === 'admin_rejected') && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Solicitação rejeitada</span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            Entre em contato conosco para mais informações.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não fez nenhuma solicitação de crédito odontológico.
                  </p>
                  <CreditRequestModal 
                    onSuccess={fetchCreditData}
                    trigger={
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Fazer primeira solicitação
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Como funciona o Crédito Odontológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">1. Solicite</h3>
                  <p className="text-sm text-muted-foreground">
                    Faça sua solicitação informando a clínica e o tratamento desejado.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">2. Análise</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe analisa sua solicitação em até 24 horas.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">3. Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Crédito aprovado? Use diretamente na clínica escolhida.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}