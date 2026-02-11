import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft, Phone, Stethoscope } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DentistLoginPage = () => {
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('signup') === 'true') {
            setIsSignup(true);
        }
    }, []);

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
                // Check role to ensure it's a dentist/professional or regular user
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('user_id', data.user.id)
                    .single();

                const role = profile?.role || (data.user.user_metadata?.role as string);

                if (role === 'professional' || role === 'admin' || role === 'master') {
                    // For now, redirect to main page or a professional dashboard if we had one
                    // Since we don't have a specific professional dashboard yet, let's go to profile or home
                    navigate('/');
                    toast.success('Login realizado com sucesso!');
                } else {
                    // If a patient tries to login here, we can allow it but maybe warn or redirect appropriately
                    navigate('/');
                    toast.success('Login realizado com sucesso!');
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
                        role: 'professional', // Role for dentists
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
                                        <Stethoscope className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Doutorizze</span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {isSignup ? 'Cadastrar Dentista' : 'Área do Dentista'}
                                </h1>
                                <p className="text-gray-600">
                                    {isSignup
                                        ? 'Junte-se à maior rede de crédito odontológico'
                                        : 'Acesse sua conta para gerenciar parcerias'
                                    }
                                </p>
                            </div>
                        </div>

                        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
                            {isSignup && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nome Completo</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="Seu nome completo"
                                                value={signupData.fullName}
                                                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                                className="pl-10 h-12 border-gray-300 focus:border-primary"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
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
                                {loading ? 'Carregando...' : (isSignup ? 'Cadastrar' : 'Entrar')}
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
                                            src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20dentist%20in%20modern%20clinic%2C%20holding%20tablet%2C%20purple%20and%20orange%20lighting%2C%20high%20tech%2C%203d%20render%20style%2C%20premium%20quality&image_size=square_hd"
                                            alt="Dentista conectado"
                                            className="w-64 h-64 rounded-2xl mx-auto object-cover shadow-lg"
                                        />

                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold text-white">
                                                Carreira e Oportunidades
                                            </h3>
                                            <p className="text-white/80 text-sm">
                                                Conecte-se às melhores clínicas e expanda sua atuação profissional
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center space-x-4">
                                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                                            <Stethoscope className="w-6 h-6 text-primary" />
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

export default DentistLoginPage;
