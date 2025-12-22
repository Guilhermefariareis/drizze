import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        
        // Buscar role diretamente do banco
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        const userRole = profile?.role || 'clinic'; // Default para clinic
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao início
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-gray-600">
              Área restrita para administradores do sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Administrativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@doutorizze.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </div>
                ) : (
                  'Acessar Painel Administrativo'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Apenas administradores autorizados podem acessar esta área.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Links de outros tipos de login */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">Outros tipos de acesso:</p>
          <div className="flex justify-center space-x-4">
            <Button
              type="button"
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login-paciente');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Login Paciente
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login-clinica');
              }}
              className="text-green-600 hover:text-green-800"
            >
              Login Clínica
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}