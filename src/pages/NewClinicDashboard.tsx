import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';


import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, LoadingState } from '@/components/ui/loading-spinner';
import { ClinicDashboardMetrics } from '@/components/clinic/ClinicDashboardMetrics';
import { ServicesSection } from '@/components/clinic/ServicesSection';
import { ServicesManager } from '@/components/clinic/ServicesManager';
import { LeadsManager } from '@/components/clinic/LeadsManager';
import { CreditManager } from '@/components/clinic/CreditManager';
import { SimpleCreditManager } from '@/components/clinic/SimpleCreditManager';
import ClinicDashboard from '@/pages/clinic/ClinicDashboard'; // Versão correta com "Solicitações de Crédito"

import ClinicorpDashboard from '@/components/clinic/ClinicorpDashboard';
import ClinicorpCredentialsForm from '@/components/clinic/ClinicorpCredentialsForm';
import ClinicSupportCenter from '@/components/clinic/ClinicSupportCenter';
import ProfessionalsManager from '@/components/clinic/ProfessionalsManager';
import ClinicProfileManager from '@/components/clinic/ClinicProfileManager';
import ConfiguracaoHorariosPage from '@/pages/ConfiguracaoHorariosPage';
import RelatoriosAgendamentosPage from '@/pages/RelatoriosAgendamentosPage';
import AgendamentosPage from '@/pages/AgendamentosPage';
import AgendamentosContent from '@/components/clinic/AgendamentosContent';
import { useUserRole } from '@/hooks/useUserRole';
import { useClinicProfile } from '@/hooks/useClinicProfile';
import { useClinicPermissions } from '@/hooks/useClinicPermissions';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';
import { AppSidebar } from '@/components/AppSidebar';
import Footer from '@/components/Footer';
import {
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Crown,
  AlertCircle,
  ExternalLink,
  Settings,
  MapPin,
  User,
  Home,
  Info,
  Building2,
  Menu,
  X
} from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';



const NewClinicDashboard = () => {
  console.log('🚀 [NewClinicDashboard] Componente iniciado');
  console.log('🚨 TESTE SIMPLES - COMPONENTE CARREGADO v3.0');
  console.log('🌍 [NewClinicDashboard] URL ATUAL:', window.location.href);
  const { user } = useAuth();
  console.log('🔥🔥🔥 [NewClinicDashboard] USER OBTIDO:', user?.email);
  console.log('🔥🔥🔥 [NewClinicDashboard] USER COMPLETO:', user);
  const { role, loading: roleLoading } = useUserRole();

  // Hook de permissões admin
  console.log('🔥🔥🔥 [NewClinicDashboard] ANTES DE CHAMAR useAdminPermissions');
  const { isAdmin, isLoading: adminLoading } = useAdminPermissions();
  console.log('🔥🔥🔥 [NewClinicDashboard] DEPOIS DE CHAMAR useAdminPermissions:', { isAdmin, adminLoading });

  console.log('🚨🚨🚨 [NewClinicDashboard] isAdmin:', isAdmin);
  console.log('🚨🚨🚨 [NewClinicDashboard] adminLoading:', adminLoading);
  console.log('🚨🚨🚨 [NewClinicDashboard] role:', role);
  console.log('🚨🚨🚨 [NewClinicDashboard] roleLoading:', roleLoading);

  // Log para verificar se o hook está sendo executado
  console.log('🏥 [NewClinicDashboard] Executando useClinicProfile, user:', user?.id, user?.email);
  const { clinic, loading: clinicLoading } = useClinicProfile();
  console.log('🏥 [NewClinicDashboard] Resultado useClinicProfile - clinic:', clinic, 'loading:', clinicLoading);

  console.log('🚨 [NewClinicDashboard] ADMIN DEBUG:', { isAdmin, adminLoading, role, roleLoading });
  console.log('🚨 [NewClinicDashboard] TIMESTAMP:', Date.now());

  const { canAccessAdvancedServices } = useClinicPermissions(clinic?.id);
  const { loading: subscriptionLoading, canAccessAdvancedServices: hasAdvancedSubscription } = useSubscriptionCheck();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Capturar parâmetro tab da URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    console.log('🏥 [NewClinicDashboard] URL completa:', window.location.href);
    console.log('🏥 [NewClinicDashboard] Search params:', window.location.search);
    console.log('🏥 [NewClinicDashboard] Parâmetro tab da URL:', tabParam);
    console.log('🏥 [NewClinicDashboard] ActiveTab atual:', activeTab);
    if (tabParam) {
      setActiveTab(tabParam);
      console.log('🏥 [NewClinicDashboard] Aba definida para:', tabParam);
    }
  }, [searchParams]);

  // Log de debug em useEffect para evitar side effects durante renderização
  useEffect(() => {
    console.log('🏥 [NewClinicDashboard] Componente renderizado, activeTab:', activeTab);
    console.log('🏥 [NewClinicDashboard] Usuário:', user?.email);
    console.log('🏥 [NewClinicDashboard] Role:', role);
    console.log('🏥 [NewClinicDashboard] Clínica carregada:', clinic?.name, clinic?.id);
  }, [activeTab, user?.email, role, clinic?.name, clinic?.id]);

  // Redirecionamento se não estiver logado
  useEffect(() => {
    if (!user) {
      const currentSearchParams = searchParams.toString();
      const redirectUrl = currentSearchParams ? `/clinic-login?${currentSearchParams}` : '/clinic-login';
      navigate(redirectUrl, { replace: true });
    }
  }, [user, searchParams, navigate]);

  if (!user) {
    return null;
  }

  console.log('🔍 [NewClinicDashboard] Debug admin:', { isAdmin, adminLoading, role, roleLoading });

  // Esperar o role carregar antes de fazer qualquer redirecionamento
  if (roleLoading || !role || adminLoading) {
    console.log('🔍 [NewClinicDashboard] Aguardando carregamento:', { roleLoading, role, adminLoading });
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Se for admin, redirecionar para /admin
  if (isAdmin) {
    console.log('🏥 [NewClinicDashboard] Usuário é admin, redirecionando para /admin');
    return <Navigate to="/admin" replace />;
  }

  // BYPASS TEMPORÁRIO PARA TESTE - REMOVER DEPOIS
  console.log('🔧 [NewClinicDashboard] role:', role);
  console.log('🔧 [NewClinicDashboard] clinic:', clinic);
  console.log('🔧 [NewClinicDashboard] user:', user);

  // CORREÇÃO CRÍTICA: Removido hardcode que causava vazamento de dados
  // Agora usa apenas a clínica real do usuário logado
  const testClinic = clinic;

  /*
  if (role !== 'clinic' && role !== 'admin') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  if (clinicLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração de Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure sua clínica para começar a usar o sistema.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  */

  // Verificação de segurança: só continua se houver clínica válida OU se for admin
  if ((!testClinic || !testClinic.id) && !isAdmin) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Você não tem uma clínica associada ou não tem permissão para acessar esta área.
            </p>
            <Button
              onClick={() => navigate('/clinic-login')}
              className="mt-4 w-full"
            >
              Fazer Login Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isMaster = testClinic.master_user_id === user?.id || testClinic.owner_id === user?.id;

  const renderContent = () => {
    console.log('🔍 [NewClinicDashboard] renderContent chamado v2.0');
    console.log('🔍 [NewClinicDashboard] activeTab atual:', activeTab);
    console.log('🔍 [NewClinicDashboard] activeTab === "credito"?', activeTab === 'credito');
    console.log('🔍 [NewClinicDashboard] clinic.id:', clinic?.id);
    console.log('🔍 Comparando activeTab com cases:', {
      activeTab,
      isCredit: activeTab === 'credit',
      isCredito: activeTab === 'credito'
    });

    switch (activeTab) {
      case 'dashboard':
        return (
          <LoadingState
            isLoading={false}
            error={dashboardError}
            loadingText="Carregando dashboard..."
          >
            <div className="space-y-6">
              <ClinicDashboardMetrics clinicId={clinic?.id || testClinic?.id} />
            </div>
          </LoadingState>
        );

      case 'agenda':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Dados Clinicorp</h2>
              <p className="text-gray-400">
                Sistema integrado de agendamento com Clinicorp
              </p>
            </div>
            {clinic?.clinicorp_enabled ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div>
                    <p className="font-medium text-emerald-400">Clinicorp Conectado</p>
                    <p className="text-sm text-emerald-500/80">Sistema de agenda integrado e funcionando</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar Agenda
                  </Button>
                </div>
                <ClinicorpDashboard clinicId={clinic?.id || testClinic?.id} />
              </div>
            ) : (
              <div className="text-center py-12 glass-effect rounded-[2rem] border-dashed border-primary/20">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Configure a Integração Clinicorp</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Configure suas credenciais do Clinicorp para acessar o sistema de agenda
                </p>
                <Button onClick={() => setActiveTab('config')} size="lg" className="rounded-full shadow-glow shadow-primary/20">
                  Configurar Agora
                </Button>
              </div>
            )}
          </div>
        );

      case 'agendamento':
        const viewMode = searchParams.get('view') || 'calendario';
        return (
          <div className="space-y-6 px-4 sm:px-6">
            <div className="mb-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold mb-2 text-white">Gerenciar Agendamento</h2>
              <p className="text-gray-400">
                Sistema de agendamento do Doutorizze
              </p>
            </div>
            <AgendamentosContent initialViewMode={viewMode as any} />
          </div>
        );

      case 'credit':
      case 'credito':
        console.log('🔥 [NewClinicDashboard] Renderizando aba de crédito!');
        console.log('🔥 [NewClinicDashboard] testClinic.id:', testClinic?.id);
        return (
          <div className="space-y-6">
            <ClinicDashboard />
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Gestão de Leads</h2>
              <p className="text-gray-400">
                Acompanhe e converta potenciais pacientes em consultas
              </p>
            </div>
            <LeadsManager clinicId={clinic?.id || testClinic?.id} />
          </div>
        );

      case 'horarios':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Configuração de Horários</h2>
              <p className="text-gray-400">
                Configure os horários de funcionamento e bloqueios da clínica
              </p>
            </div>
            <ConfiguracaoHorariosPage />
          </div>
        );

      case 'relatorios':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Relatórios de Agendamentos</h2>
              <p className="text-gray-400">
                Visualize relatórios detalhados dos agendamentos
              </p>
            </div>
            <RelatoriosAgendamentosPage />
          </div>
        );

      case 'config':
        return (
          <Card className="w-full glass-effect border-none">
            <CardHeader className="w-full">
              <CardTitle className="text-white">Configurações do Clinicorp</CardTitle>
              <p className="text-gray-400">
                Configure a integração com o sistema Clinicorp
              </p>
            </CardHeader>
            <CardContent className="w-full">
              <ClinicorpCredentialsForm />
            </CardContent>
          </Card>
        );

      case 'professionals':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Gerenciar Profissionais</h2>
              <p className="text-gray-400">
                Gerencie a equipe de profissionais da sua clínica
              </p>
            </div>
            <ProfessionalsManager clinicId={clinic?.id || testClinic?.id} />
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Central de Suporte</h2>
              <p className="text-gray-400">
                Gerencie tickets de suporte da sua clínica
              </p>
            </div>
            <ClinicSupportCenter clinicId={clinic?.id || testClinic?.id} />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Perfil da Clínica</h2>
              <p className="text-gray-400">
                Gerencie as informações e configurações da sua clínica
              </p>
            </div>
            <ClinicProfileManager />
          </div>
        );

      case 'advanced-services':
        if (!isMaster) {
          return (
            <Card className="w-full">
              <CardHeader className="w-full">
                <CardTitle className="w-full flex items-center gap-2 text-red-600">
                  <Crown className="h-5 w-5" />
                  Acesso Restrito
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                <p className="text-gray-400">
                  Apenas o usuário Master tem acesso aos Serviços Avançados.
                  Entre em contato com o administrador da clínica para liberar o acesso.
                </p>
              </CardContent>
            </Card>
          );
        }

        if (subscriptionLoading) {
          return (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2">Verificando assinatura...</span>
            </div>
          );
        }

        if (!hasAdvancedSubscription()) {
          return (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Serviços Avançados
                </h2>
                <p className="text-gray-400">
                  Funcionalidades premium disponíveis mediante assinatura
                </p>
              </div>

              <Card className="w-full border-2 border-yellow-200 bg-yellow-50">
                <CardHeader className="w-full">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-5 w-5" />
                    Assinatura Necessária
                  </CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <p className="text-yellow-700 mb-4">
                    Para acessar os serviços avançados, é necessário ter uma assinatura ativa do plano Clínica Avançada.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate('/plans?type=clinic_advanced')}
                  >
                    Assinar Plano Avançado
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                Serviços Avançados
              </h2>
              <p className="text-gray-400">
                Funcionalidades premium ativas
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="w-full border-2 border-green-200 bg-green-50">
                <CardHeader className="w-full">
                  <CardTitle className="text-green-800">Sistema de Clínicas Pay</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <p className="text-green-700 mb-4">
                    Sistema de pagamentos integrado com funcionalidades avançadas
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                  >
                    Acessar Sistema
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full border-2 border-green-200 bg-green-50">
                <CardHeader className="w-full">
                  <CardTitle className="text-green-800">Marketing Automatizado</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <p className="text-green-700 mb-4">
                    Campanhas automáticas e gestão avançada de relacionamento
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                  >
                    Acessar Campanhas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  console.log('🎯 [NewClinicDashboard] Pronto para renderizar, activeTab:', activeTab);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0F0F23] text-foreground selection:bg-primary/30">
      {/* Navbar da página home - Talvez remover ou fazer dark? */}
      {/* <Navbar /> */}

      {/* Background Gradients/Aurora */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Container Principal */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar fixa: oculta em mobile, visível em md+ */}
        {/* AppSidebar já é fixed, então precisamos de um spacer ou ajustar o layout */}
        {/* AppSidebar é `fixed left-0 top-0`. Então precisamos de margin-left no contéudo */}
        <AppSidebar />

        {/* Main content alinhado */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:ml-20 lg:ml-64">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-white/5 bg-[#0F0F23]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="md:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)} className="text-white">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
                <div className="min-w-0">
                  {/* Título removido para interface mais limpa */}
                  <div className="h-8"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="container mx-auto px-4 sm:px-6 py-6 text-gray-100">
              {renderContent()}
              <Footer />
            </div>
          </div>
        </div>
      </div>
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-[#0F0F23] shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)} className="text-white hover:bg-white/10">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100%-56px)] overflow-y-auto">
              <AppSidebar />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewClinicDashboard;
