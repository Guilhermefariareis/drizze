import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Building2, ArrowLeft, Phone, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateCNPJ } from "@/utils/validation";

const ClinicLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    clinicName: "",
    responsibleName: "",
    phone: "",
    cnpj: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const cleanDigits = (value: string) => (value || '').replace(/\D/g, '');

  const ensureClinicRecord = async (user: any) => {
    try {
      // Verificar se já existe clínica para este usuário
      const { data: existing, error: existErr } = await supabase
        .from('clinics')
        .select('id, cnpj')
        .or(`master_user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .limit(1)
        .maybeSingle();

      if (existErr) {
        console.warn('[ClinicLogin] Erro ao verificar clínica existente:', existErr.message);
      }

      const meta = user.user_metadata || {};
      const cnpjDigits = cleanDigits(meta.cnpj || signupData.cnpj || '');
      const phoneDigits = (signupData.phone || meta.phone || '').toString().trim();
      const clinicName = (meta.clinic_name || signupData.clinicName || 'Minha Clínica').toString().trim();

      if (existing?.id) {
        // Se a clínica já existe e o CNPJ não está salvo, atualizar
        if (cnpjDigits && validateCNPJ(cnpjDigits) && (!existing.cnpj || existing.cnpj !== cnpjDigits)) {
          const { error: updErr } = await supabase
            .from('clinics')
            .update({ cnpj: cnpjDigits })
            .eq('id', existing.id);

          if (updErr) {
            console.warn('[ClinicLogin] Falha ao atualizar CNPJ da clínica existente:', updErr.message);
          }
        }

        return existing.id;
      }

      // Validar CNPJ antes de salvar ao criar nova clínica
      if (!cnpjDigits || !validateCNPJ(cnpjDigits)) {
        toast.error('CNPJ inválido. Por favor, verifique o número.');
        return null;
      }

      const insertPayload: any = {
        name: clinicName,
        cnpj: cnpjDigits,
        email: user.email,
        phone: phoneDigits || null,
        owner_id: user.id,
      };

      const { data: created, error: insertErr } = await supabase
        .from('clinics')
        .insert(insertPayload)
        .select('id')
        .single();

      if (insertErr) {
        console.error('[ClinicLogin] Erro ao criar clínica:', insertErr.message);
        toast.error('Não foi possível criar o registro da clínica.');
        return null;
      }

      return created?.id || null;
    } catch (err: any) {
      console.error('[ClinicLogin] Falha ao garantir registro da clínica:', err?.message || err);
      return null;
    }
  };

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
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        const metaRoleRaw = (data.user.user_metadata as any)?.role as string | undefined;
        const metaRole = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
        const effectiveRole = metaRole ?? profile?.role ?? 'patient';

        if (effectiveRole === 'admin' || effectiveRole === 'master') {
          navigate('/admin');
        } else if (effectiveRole === 'clinic') {
          // Garantir que a clínica exista e que o CNPJ esteja salvo
          await ensureClinicRecord(data.user);
          const searchParams = window.location.search;
          navigate(`/clinic-dashboard${searchParams}`);
        } else {
          toast.error('Esta conta não tem permissão para acessar o painel de clínicas');
          // Evitar erro de rede no logout: tornar opcional e resiliente
          try {
            await supabase.auth.signOut();
          } catch (signOutErr) {
            console.warn('[ClinicLogin] signOut falhou (ignorado):', (signOutErr as any)?.message || signOutErr);
          }
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

      const cnpjDigits = cleanDigits(signupData.cnpj);
      if (!validateCNPJ(cnpjDigits)) {
        toast.error('CNPJ inválido. Corrija para continuar.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: signupData.responsibleName,
            phone: signupData.phone,
            role: 'clinic',
            clinic_name: signupData.clinicName,
            cnpj: cnpjDigits
          }
        }
      });

      if (error) throw error;

      // Tentar criar registro de clínica imediatamente se usuário estiver disponível
      if (data.user) {
        await ensureClinicRecord(data.user);
      }

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
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Doutorizze</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isSignup ? 'Cadastrar Clínica' : 'Entrar como Clínica'}
                </h1>
                <p className="text-gray-600">
                  {isSignup
                    ? 'Cadastre sua clínica na nossa plataforma'
                    : 'Acesse sua conta para gerenciar consultas'
                  }
                </p>
              </div>
            </div>

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Nome da clínica</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="clinicName"
                        type="text"
                        placeholder="Nome da sua clínica"
                        value={signupData.clinicName}
                        onChange={(e) => setSignupData({ ...signupData, clinicName: e.target.value })}
                        className="pl-10 h-12 border-gray-300 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibleName">Nome do responsável</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="responsibleName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={signupData.responsibleName}
                        onChange={(e) => setSignupData({ ...signupData, responsibleName: e.target.value })}
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
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className="pl-10 h-12 border-gray-300 focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={signupData.cnpj}
                      onChange={(e) => setSignupData({ ...signupData, cnpj: e.target.value })}
                      className="h-12 border-gray-300 focus:border-primary"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email da clínica</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="clinica@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Senha</Label>
                  {!isSignup && (
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline transition-colors"
                    >
                      Esqueceu sua senha?
                    </Link>
                  )}
                </div>
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
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
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
                {loading ? 'Carregando...' : (isSignup ? 'Cadastrar clínica' : 'Entrar no painel')}
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
                  : 'Não tem conta? Cadastre sua clínica'
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
                      src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20healthcare%20dentist%20woman%20with%20laptop%20computer%2C%20modern%20purple%20gradient%20background%2C%20clean%20minimalist%20style%2C%20colorful%20geometric%20elements%2C%20professional%20attire%2C%20confident%20pose%2C%20digital%20technology%2C%20healthcare%20innovation%2C%20high%20quality%20illustration&image_size=square_hd"
                      alt="Profissional de Saúde com Tecnologia"
                      className="w-64 h-64 rounded-2xl mx-auto object-cover shadow-lg"
                    />

                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text سفید">
                        Gestão Inteligente
                      </h3>
                      <p className="text-white/80 text-sm">
                        Tecnologia que transforma sua clínica
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
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

export default ClinicLoginPage;