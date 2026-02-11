import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import MainLayout from "./components/MainLayout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPageSimple";
import NotFound from "./pages/NotFound";
import PatientDashboard from "./pages/PatientDashboard";
import NewClinicDashboard from "./pages/NewClinicDashboard";
import ClinicBooking from "./pages/ClinicBooking";
import SearchClinics from "./pages/SearchClinics";
import ClinicProfile from "./pages/ClinicProfile";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminDashboardMetrics } from "./components/admin/AdminDashboardMetrics";
import AdminSupport from "./pages/admin/AdminSupport";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import BookingConfirmation from "./pages/BookingConfirmation";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import SpecialtiesPage from "./pages/SpecialtiesPage";
import SettingsPage from "./pages/SettingsPage";
import ReviewsPage from "./pages/ReviewsPage";
import FavoritesPage from "./pages/FavoritesPage";
import MessagesPage from "./pages/MessagesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminClinics from "./pages/admin/AdminClinics";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminSiteConfig from "./pages/admin/AdminSiteConfig";
import AdminCredentialing from "./pages/admin/AdminCredentialing";
import LoyaltyProgram from "./pages/LoyaltyProgram";
import PreventiveCare from "./pages/PreventiveCare";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicorpProvider } from "./contexts/ClinicorpContext";
import { AuthRedirect } from "./components/AuthRedirect";
import ErrorBoundary from "./components/ErrorBoundary";
import ClinicPartnership from "./pages/ClinicPartnership";
import LoanRequestPage from "./pages/LoanRequestPage";
import PatientDashboardNew from "./pages/patient/PatientDashboard";
import PatientPlan from "./pages/patient/PatientPlan";
import PatientCredit from "./pages/patient/PatientCredit";
import PatientCreditRequest from "./pages/patient/PatientCreditRequest";
import PatientDocuments from "./pages/patient/PatientDocuments";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientPayment from "./pages/patient/PatientPayment";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientAppointments from "./pages/patient/PatientAppointments";
import ClinicAppointments from "./pages/clinic/ClinicAppointments";
import ClinicDashboard from "./pages/clinic/ClinicDashboard";
import ClinicCreditAnalysis from "./pages/clinic/ClinicCreditAnalysis";
import OffersPage from "./pages/clinic/OffersPage";
import AdminCreditManagement from "./pages/admin/AdminCreditManagement";
import AdminCreditDetails from "./pages/admin/AdminCreditDetails";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import { AdminRoute } from "./components/AdminRoute";
import PlansPage from "./pages/PlansPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotificacoesPage from "./pages/NotificacoesPage";
import AgendamentoPage from "./pages/AgendamentoPage";
import AgendamentoConfirmacao from "./pages/AgendamentoConfirmacao";
import AgendamentosPage from "./pages/AgendamentosPage";
import PatientLoginPage from "./components/PatientLoginPage";
import ClinicLoginPage from "./components/ClinicLoginPage";
import DentistLoginPage from "./components/DentistLoginPage";
import AdminLoginPage from "./components/AdminLoginPage";
import ConfiguracaoHorariosPage from "./pages/ConfiguracaoHorariosPage";
import RelatoriosAgendamentosPage from "./pages/RelatoriosAgendamentosPage";
import AuthConfirm from "./pages/AuthConfirm";
import ParaClinicasPage from "./pages/ParaClinicasPage";
import ParaDentistasPage from "./pages/ParaDentistasPage";
import MeusAgendamentos from "./pages/MeusAgendamentos";
import HealthCheckPage from "./pages/admin/HealthCheckPage";
import { ChatWidget } from "@/components/chat/ChatWidget";
import ChatDemo from "./pages/ChatDemo";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StripeTestPage from "./pages/StripeTestPage";
import CustomerPortalTestPage from "./pages/CustomerPortalTestPage";
import TestCreditPage from "./pages/TestCreditPage";
import { ProposalDetailsPage } from "./pages/ProposalDetailsPage";
import { DebugAuth } from "./components/DebugAuth";
import './styles/table-spacing.css';


const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClinicorpProvider>
          <AppProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* Wrapper global: evita overflow horizontal e garante largura total no mobile */}
              <div className="min-h-screen w-full overflow-x-hidden">
                <BrowserRouter>
                  <AuthRedirect />
                  {/* <ChatWidget /> */}
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/search" element={<SearchClinics />} />
                      <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
                      <Route path="/clinic/appointments" element={<ClinicAppointments />} />
                      <Route path="/clinic/:id" element={<ClinicProfile />} />
                      <Route path="/booking/:clinicId" element={<BookingPage />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/admin-profile" element={<UserProfile />} />
                      <Route path="/master-profile" element={<UserProfile />} />
                      <Route path="/patient-profile" element={<UserProfile />} />
                      <Route path="/clinic-profile" element={<UserProfile />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/messages" element={<MessagesPage />} />
                      <Route path="/reviews" element={<ReviewsPage />} />
                      <Route path="/specialties" element={<SpecialtiesPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/para-clinicas" element={<ParaClinicasPage />} />
                      <Route path="/para-dentistas" element={<ParaDentistasPage />} />
                      <Route path="/parceria-clinicas" element={<ClinicPartnership />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/privacy" element={<PrivacyPolicyPage />} />
                      <Route path="/loan-request" element={<LoanRequestPage />} />
                      <Route path="/plans" element={<PlansPage />} />
                      <Route path="/subscription" element={<SubscriptionPage />} />
                      <Route path="/como-funciona" element={<HowItWorksPage />} />
                      <Route path="/loyalty-program" element={<LoyaltyProgram />} />
                      <Route path="/preventive-care" element={<PreventiveCare />} />
                      <Route path="/notificacoes" element={<NotificacoesPage />} />
                      <Route path="/agendamento/:clinicaId" element={<AgendamentoPage />} />
                      <Route path="/agendamento-confirmacao" element={<AgendamentoConfirmacao />} />
                      <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
                      <Route path="/configuracao-horarios" element={<AdminRoute><ConfiguracaoHorariosPage /></AdminRoute>} />
                      <Route path="/relatorios-agendamentos" element={<AdminRoute><RelatoriosAgendamentosPage /></AdminRoute>} />
                    </Route>

                    {/* Dashboards - fora do layout principal ou com layout próprio */}
                    {/* Dashboards - fora do layout principal ou com layout próprio */}
                    <Route path="/patient-dashboard" element={<Navigate to="/patient/dashboard" replace />} />
                    <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    <Route path="/clinic-dashboard" element={<NewClinicDashboard />} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                    <Route path="/admin/clinics" element={<AdminRoute><AdminClinics /></AdminRoute>} />
                    <Route path="/admin/appointments" element={<AdminRoute><AdminAppointments /></AdminRoute>} />
                    <Route path="/admin/financial" element={<AdminRoute><AdminFinances /></AdminRoute>} />
                    <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                    <Route path="/admin/site-config" element={<AdminRoute><AdminSiteConfig /></AdminRoute>} />
                    <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
                    <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
                    <Route path="/admin/audit" element={<AdminRoute><AdminAudit /></AdminRoute>} />
                    <Route path="/admin/credentialing" element={<AdminRoute><AdminCredentialing /></AdminRoute>} />
                    <Route path="/admin/credit-management" element={<AdminRoute><AdminCreditManagement /></AdminRoute>} />
                    <Route path="/admin/credit-details/:id" element={<AdminRoute><AdminCreditDetails /></AdminRoute>} />
                    <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
                    <Route path="/admin/health" element={<AdminRoute><HealthCheckPage /></AdminRoute>} />

                    {/* Rotas de Paciente (Dashboard Links) */}
                    <Route path="/patient/credit-request" element={<PatientCreditRequest />} />
                    <Route path="/patient/credit" element={<PatientCredit />} />
                    <Route path="/patient/appointments" element={<PatientAppointments />} />
                    <Route path="/patient/documents" element={<PatientDocuments />} />
                    <Route path="/patient/plan" element={<PatientPlan />} />
                    <Route path="/patient/profile" element={<PatientProfile />} />
                    <Route path="/patient/settings" element={<PatientSettings />} />
                    <Route path="/patient/payment" element={<PatientPayment />} />

                    <Route path="/login-paciente" element={<PatientLoginPage />} />
                    <Route path="/login-clinica" element={<ClinicLoginPage />} />
                    <Route path="/login-dentista" element={<DentistLoginPage />} />
                    <Route path="/patient-login" element={<PatientLoginPage />} />
                    <Route path="/clinic-login" element={<ClinicLoginPage />} />
                    <Route path="/dentist-login" element={<DentistLoginPage />} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/chat-demo" element={<ChatDemo />} />
                    <Route path="/stripe-test" element={<AdminRoute><StripeTestPage /></AdminRoute>} />
                    <Route path="/customer-portal-test" element={<AdminRoute><CustomerPortalTestPage /></AdminRoute>} />
                    <Route path="/test-credit" element={<AdminRoute><TestCreditPage /></AdminRoute>} />
                    <Route path="/proposal/:requestId" element={<ProposalDetailsPage />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>
            </TooltipProvider>
          </AppProvider>
        </ClinicorpProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

