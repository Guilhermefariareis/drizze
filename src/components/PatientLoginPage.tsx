import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PatientLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    fullName: "",
    phone: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        console.log('Profile data:', profile);
        console.log('Profile error:', profileError);
        
        // Permitir acesso se:
        // 1. O role é 'patient'
        // 2. Não há profile (usuário novo) - assumir como paciente
        // 3. Role é null/undefined - assumir como paciente
        const userRole = profile?.role;
        const isPatientAccess = userRole === 'patient' || !userRole || profileError;
        
        if (isPatientAccess) {
          console.log('Acesso permitido para paciente. Role:', userRole);
          navigate('/patient-dashboard');
        } else {
          console.log('Acesso negado. Role encontrado:', userRole);
          toast.error('Esta conta não tem permissão para acessar o painel de pacientes');
          // Limpar campos ao invés de fazer logout
          setEmail('');
          setPassword('');
          return;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (password !== signupData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }

      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            role: 'patient'
          }
        }
      });

      if (error) throw error;

      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      setIsSignup(false);
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full grid md:grid-cols-2">
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md space-y-8 mx-auto">
            <div className="space-y-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Link>
              
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Doutorizze</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignup ? 'Criar conta' : 'Entrar como Paciente'}
                </h1>
                <p className="text-gray-600">
                  {isSignup 
                    ? 'Crie sua conta para agendar consultas' 
                    : 'Acesse sua conta para gerenciar consultas'
                  }
                </p>
              </div>
            </div>

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData({...signupData, fullName: e.target.value})}
                        className="pl-10 h-12 border-gray-300 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        className="pl-10 h-12 border-gray-300 focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      className="pl-10 h-12 border-gray-300 focus:border-primary"
                      required
                    />
                  </div>
                </div>
              )}
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Carregando...' : (isSignup ? 'Criar conta' : 'Entrar')}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl"
              >
                {isSignup 
                  ? 'Já tem conta? Faça login' 
                  : 'Não tem conta? Cadastre-se'
                }
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary via-secondary to-primary/80 p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
          <div className="relative w-full max-w-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full transform -rotate-6"></div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <img 
                      src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=happy%20smiling%20young%20person%20with%20smartphone%20or%20tablet%2C%20modern%20purple%20gradient%20background%2C%20clean%20minimalist%20style%2C%20colorful%20geometric%20elements%2C%20casual%20modern%20clothing%2C%20friendly%20approachable%20pose%2C%20digital%20technology%2C%20healthcare%20app%20user%2C%20high%20quality%20illustration&image_size=square_hd"
                      alt="Pessoa com Tecnologia"
                      className="w-64 h-64 rounded-2xl mx-auto object-cover shadow-lg"
                    />
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        Saúde na Palma da Mão
                      </h3>
                      <p className="text-white/80 text-sm">
                        Tecnologia que cuida de você
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary/60 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLoginPage;