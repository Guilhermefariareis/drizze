import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useEffect } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLoading: permissionsLoading, checkPermissions } = useAdminPermissions();
  const { role, loading: roleLoading } = useUserRole();

  // Redireciona se já estiver logado baseado no role
  useEffect(() => {
    if (user && !roleLoading && role) {
      console.log('[AdminLoginPage] Usuário já logado, role:', role);
      if (role === 'admin' || role === 'master') {
        navigate('/admin');
      } else if (role === 'clinic') {
        navigate('/clinic-dashboard');
      } else if (role === 'patient') {
        navigate('/patient-dashboard');
      }
    }
  }, [user, role, roleLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado');
      }

      // Aguardar um momento para o contexto de auth atualizar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar permissões usando o hook
      const hasAdminAccess = await checkPermissions();

      if (hasAdminAccess) {
        console.log('[AdminLoginPage] Login admin bem-sucedido, redirecionando para /admin');
        navigate('/admin');
      } else {
        // Se não for admin, verificar se é clínica ou paciente e redirecionar adequadamente
        console.log('[AdminLoginPage] Não é admin, verificando role do usuário...');

        // Aguardar mais um pouco para o role ser carregado
        await new Promise(resolve => setTimeout(resolve, 500));

        // Buscar role diretamente do banco (com resiliência)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        const p = profile as any;
        const userRole = p?.role || p?.account_type || 'clinic';
        console.log('[AdminLoginPage] Role encontrado:', userRole);

        if (userRole === 'clinic') {
          console.log('[AdminLoginPage] Redirecionando clínica para /clinic-dashboard');
          navigate('/clinic-dashboard');
        } else if (userRole === 'patient') {
          console.log('[AdminLoginPage] Redirecionando paciente para /patient-dashboard');
          navigate('/patient-dashboard');
        } else {
          await supabase.auth.signOut();
          throw new Error('Acesso negado. Você não tem permissões de administrador.');
        }
      }

    } catch (error: any) {
      console.error('Erro no login administrativo:', error);
      setError(error.message || 'Erro ao fazer login');
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar ao início
        </Button>

        <Card className="bg-[#141416]/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto mb-6 w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30">
              <Shield className="h-10 w-10 text-red-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-white tracking-tight">
              Acesso Admin
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2 text-base">
              Identifique-se para acessar o núcleo do sistema
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 ml-1">Email Corporativo</Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@doutorizze.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all pl-4"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" title="password" className="text-gray-300">Senha Segura</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-red-500 hover:text-red-400 hover:underline transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500/50 focus:ring-red-500/20 transition-all pl-4 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold text-lg shadow-[0_4px_20px_rgba(185,28,28,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                    <span>Validando Acesso...</span>
                  </div>
                ) : (
                  'Entrar no Painel'
                )}
              </Button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="h-px w-8 bg-white/10" />
                <span>Alternar Acesso</span>
                <div className="h-px w-8 bg-white/10" />
              </div>

              <div className="flex gap-6">
                <button
                  onClick={() => navigate('/login-paciente')}
                  className="text-gray-400 hover:text-indigo-400 text-sm font-medium transition-colors"
                >
                  Paciente
                </button>
                <div className="w-[1px] h-4 bg-white/10 self-center" />
                <button
                  onClick={() => navigate('/login-clinica')}
                  className="text-gray-400 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Clínica
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-gray-500 text-xs tracking-widest uppercase">
          Ambiente Criptografado de Ponta a Ponta
        </p>
      </div>
    </div>
  );
}
