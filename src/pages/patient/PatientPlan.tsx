import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PatientSidebar } from '@/components/patient/PatientSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Calendar, 
  CheckCircle, 
  Clock,
  Star,
  CreditCard,
  FileText,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  coverage_percentage: number;
  max_procedures: number;
  status: 'active' | 'inactive' | 'suspended';
  start_date: string;
  end_date: string;
  procedures_used: number;
}

interface PlanBenefit {
  id: string;
  procedure_name: string;
  coverage_percentage: number;
  max_annual_limit: number;
  used_amount: number;
}

interface RecentClaim {
  id: string;
  procedure_name: string;
  clinic_name: string;
  date: string;
  amount: number;
  covered_amount: number;
  status: 'approved' | 'pending' | 'rejected';
}

export default function PatientPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [benefits, setBenefits] = useState<PlanBenefit[]>([]);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    fetchPlanData();
  }, [user, navigate]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      
      // Simular dados do plano (em um cenário real, viria do Supabase)
      const mockPlan: Plan = {
        id: '1',
        name: 'Plano Dental Premium',
        description: 'Cobertura completa para tratamentos odontológicos',
        monthly_price: 89.90,
        coverage_percentage: 80,
        max_procedures: 24,
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        procedures_used: 8
      };

      const mockBenefits: PlanBenefit[] = [
        {
          id: '1',
          procedure_name: 'Limpeza e Profilaxia',
          coverage_percentage: 100,
          max_annual_limit: 2,
          used_amount: 1
        },
        {
          id: '2',
          procedure_name: 'Restaurações',
          coverage_percentage: 80,
          max_annual_limit: 6,
          used_amount: 3
        },
        {
          id: '3',
          procedure_name: 'Tratamento de Canal',
          coverage_percentage: 70,
          max_annual_limit: 2,
          used_amount: 0
        },
        {
          id: '4',
          procedure_name: 'Próteses',
          coverage_percentage: 60,
          max_annual_limit: 1,
          used_amount: 0
        }
      ];

      const mockClaims: RecentClaim[] = [
        {
          id: '1',
          procedure_name: 'Limpeza Dental',
          clinic_name: 'Clínica Sorriso',
          date: '2024-01-15',
          amount: 120.00,
          covered_amount: 120.00,
          status: 'approved'
        },
        {
          id: '2',
          procedure_name: 'Restauração',
          clinic_name: 'Dental Care',
          date: '2024-01-10',
          amount: 250.00,
          covered_amount: 200.00,
          status: 'approved'
        },
        {
          id: '3',
          procedure_name: 'Consulta',
          clinic_name: 'OdontoVida',
          date: '2024-01-05',
          amount: 80.00,
          covered_amount: 64.00,
          status: 'pending'
        }
      ];

      setCurrentPlan(mockPlan);
      setBenefits(mockBenefits);
      setRecentClaims(mockClaims);

    } catch (error) {
      console.error('Erro ao carregar dados do plano:', error);
      toast.error('Erro ao carregar dados do plano');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Ativo', variant: 'default' as const },
      'inactive': { label: 'Inativo', variant: 'secondary' as const },
      'suspended': { label: 'Suspenso', variant: 'destructive' as const },
      'approved': { label: 'Aprovado', variant: 'default' as const },
      'pending': { label: 'Pendente', variant: 'outline' as const },
      'rejected': { label: 'Rejeitado', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateUsagePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

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
              <h1 className="text-3xl font-bold text-foreground">Meu Plano</h1>
              <p className="text-muted-foreground">Gerencie seu plano odontológico e benefícios</p>
            </div>
          </div>

          {/* Current Plan Overview */}
          {currentPlan && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                      <p className="text-muted-foreground">{currentPlan.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(currentPlan.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatCurrency(currentPlan.monthly_price)}</div>
                    <p className="text-sm text-muted-foreground">Mensalidade</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentPlan.coverage_percentage}%</div>
                    <p className="text-sm text-muted-foreground">Cobertura Média</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentPlan.procedures_used}/{currentPlan.max_procedures}</div>
                    <p className="text-sm text-muted-foreground">Procedimentos Usados</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatDate(currentPlan.start_date)} - {formatDate(currentPlan.end_date)}
                    </div>
                    <p className="text-sm text-muted-foreground">Vigência</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uso do Plano</span>
                    <span className="text-sm text-muted-foreground">
                      {currentPlan.procedures_used} de {currentPlan.max_procedures} procedimentos
                    </span>
                  </div>
                  <Progress 
                    value={calculateUsagePercentage(currentPlan.procedures_used, currentPlan.max_procedures)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits and Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Benefícios e Cobertura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{benefit.procedure_name}</h3>
                      <Badge variant="outline">{benefit.coverage_percentage}% cobertura</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Limite anual:</span>
                        <span>{benefit.used_amount}/{benefit.max_annual_limit}</span>
                      </div>
                      <Progress 
                        value={calculateUsagePercentage(benefit.used_amount, benefit.max_annual_limit)} 
                        className="h-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reembolsos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentClaims.length > 0 ? (
                <div className="space-y-4">
                  {recentClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{claim.procedure_name}</h3>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{claim.clinic_name}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(claim.date)}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(claim.covered_amount)}</div>
                        <div className="text-sm text-muted-foreground">de {formatCurrency(claim.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Nenhum reembolso encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  Solicitar Reembolso
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <CreditCard className="h-6 w-6" />
                  Histórico de Pagamentos
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Phone className="h-6 w-6" />
                  Suporte do Plano
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contato da Operadora</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Central de Atendimento</p>
                    <p className="text-sm text-muted-foreground">0800 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">atendimento@planodental.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Horário</p>
                    <p className="text-sm text-muted-foreground">24h por dia, 7 dias por semana</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}