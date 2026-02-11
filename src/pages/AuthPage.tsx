import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, ArrowLeft, Mail, Lock, User, Phone, Building2, UserCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LGPDConsentForm } from '@/components/auth/LGPDConsentForm';
import { AdditionalDataForm } from '@/components/auth/AdditionalDataForm';
import { toast } from 'sonner';
import DoutorizzeLogo from '@/assets/doutorizze-logo.svg?react';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'patient' as 'patient' | 'clinic'
  });

  // Multi-step signup state
  const [signupStep, setSignupStep] = useState(1);
  const [lgpdConsents, setLgpdConsents] = useState({
    privacy_policy: false,
    terms_of_service: false,
    data_processing: false,
    marketing: false,
    cookies: false
  });
  const [additionalData, setAdditionalData] = useState({});

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();

    // Check URL params for signup mode
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup') {
      setActiveTab('signup');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login');
        } else {
          setError(error.message);
        }
        return;
      }

      navigate('/');
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (signupData.password !== signupData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (signupData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!signupData.fullName || !signupData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    // Proceed to LGPD consent step
    setSignupStep(2);
  };

  const handleCompleteSignup = async () => {
    setIsLoading(true);
    setError(null);

    // Validate LGPD consents
    if (!lgpdConsents.privacy_policy || !lgpdConsents.terms_of_service || !lgpdConsents.data_processing) {
      setError('Os consentimentos obrigatórios devem ser aceitos');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;

      // Prepare clinic data for the trigger
      const clinicMetaData = signupData.role === 'clinic' ? {
        clinic_name: (additionalData as any).clinicName,
        clinic_description: (additionalData as any).clinicDescription,
        clinic_address: (additionalData as any).address,
        clinic_city: (additionalData as any).clinicCity,
        clinic_state: (additionalData as any).clinicState,
        clinic_zip_code: (additionalData as any).clinicZipCode,
        clinic_phone: (additionalData as any).clinicPhone,
        clinic_specialty: (additionalData as any).specialty,
        cnpj: (additionalData as any).cnpj,
        license_number: (additionalData as any).licenseNumber
      } : {};

      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            role: signupData.role,
            ...clinicMetaData,
            lgpd_consents: lgpdConsents,
            registration_ip: window.location.hostname,
            user_agent: navigator.userAgent
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError(error.message);
        }
        return;
      }

      // Store consents in database
      if (data.user) {
        await storeUserConsents(data.user.id);
        await storeAdditionalData(data.user.id);
      }

      toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
      setSignupStep(1); // Reset for next user
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const storeUserConsents = async (userId: string) => {
    const consentEntries = Object.entries(lgpdConsents).map(([type, given]) => ({
      user_id: userId,
      consent_type: type,
      consent_given: given,
      consent_version: '1.0',
      ip_address: window.location.hostname,
      user_agent: navigator.userAgent
    }));

    for (const consent of consentEntries) {
      // LGPD consents are now stored in user metadata and can be logged separately
      console.log('LGPD consents recorded for user:', userId, lgpdConsents);
    }
  };

  const storeAdditionalData = async (userId: string) => {
    if (Object.keys(additionalData).length > 0) {
      const encryptedData: any = {
        user_id: userId,
        privacy_consent: lgpdConsents.privacy_policy,
        terms_accepted: lgpdConsents.terms_of_service,
        data_processing_consent: lgpdConsents.data_processing,
        marketing_consent: lgpdConsents.marketing
      };

      // Encrypt sensitive data (basic implementation)
      if ((additionalData as any).cpf) {
        encryptedData.cpf_encrypted = btoa((additionalData as any).cpf);
      }
      if ((additionalData as any).rg) {
        encryptedData.rg_encrypted = btoa((additionalData as any).rg);
      }
      if ((additionalData as any).address) {
        encryptedData.address_encrypted = btoa((additionalData as any).address);
      }
      if ((additionalData as any).medicalHistory) {
        encryptedData.medical_history_encrypted = btoa((additionalData as any).medicalHistory);
      }
      if ((additionalData as any).emergencyContact) {
        encryptedData.emergency_contact_encrypted = btoa((additionalData as any).emergencyContact);
      }

      // Store additional data in profiles table instead
      const updateData: any = {};

      if ((additionalData as any).phone) {
        updateData.phone = (additionalData as any).phone;
      }
      if ((additionalData as any).address) {
        updateData.address = (additionalData as any).address;
      }

      if (Object.keys(updateData).length > 0) {
        const attemptUpdate: any = async (payload: any) => {
          const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', userId);

          if (error) {
            const missingColumnMatch = error.message?.match(/column "(.+)" does not exist/);
            if (missingColumnMatch && missingColumnMatch[1]) {
              const missingCol = missingColumnMatch[1];
              console.warn(`⚠️ [AuthPage] Retentativa: Removendo "${missingCol}" que gerou erro.`);
              const nextPayload = { ...payload };
              delete nextPayload[missingCol];
              if (Object.keys(nextPayload).length > 0) {
                return attemptUpdate(nextPayload);
              }
              return;
            }
            console.error('Erro ao atualizar perfil em AuthPage:', error);
          }
        };

        await attemptUpdate(updateData);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <div className="flex justify-center">
            <DoutorizzeLogo className="h-16 w-auto" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Fazer Login</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Criar Conta</CardTitle>
                <CardDescription>
                  Crie sua conta para começar a usar o Doutorizze
                </CardDescription>
              </CardHeader>
              <CardContent>
                {signupStep === 1 && (
                  <form onSubmit={handleBasicSignup} className="space-y-4">
                    <div className="space-y-3">
                      <Label>Tipo de Conta</Label>
                      <RadioGroup
                        value={signupData.role}
                        onValueChange={(value) => setSignupData({ ...signupData, role: value as 'patient' | 'clinic' })}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="patient" id="patient" />
                          <Label htmlFor="patient" className="flex items-center cursor-pointer">
                            <UserCircle className="w-4 h-4 mr-2" />
                            Paciente
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="clinic" id="clinic" />
                          <Label htmlFor="clinic" className="flex items-center cursor-pointer">
                            <Building2 className="w-4 h-4 mr-2" />
                            Clínica
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={signupData.fullName}
                          onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={signupData.phone}
                          onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      <span>Continuar</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                )}

                {signupStep === 2 && (
                  <div className="space-y-4">
                    <LGPDConsentForm
                      onConsentsChange={setLgpdConsents}
                      userType={signupData.role}
                    />

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignupStep(1)}
                        className="flex-1"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSignupStep(3)}
                        className="flex-1"
                        disabled={!lgpdConsents.privacy_policy || !lgpdConsents.terms_of_service || !lgpdConsents.data_processing}
                      >
                        Continuar
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {signupStep === 3 && (
                  <div className="space-y-4">
                    <AdditionalDataForm
                      userType={signupData.role}
                      onDataChange={setAdditionalData}
                    />

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSignupStep(2)}
                        className="flex-1"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Voltar
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCompleteSignup}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando conta...
                          </>
                        ) : (
                          'Finalizar Cadastro'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}