import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DoutorizzeLogo from '@/assets/doutorizze-logo.svg?react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for active session from reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Option link expired or invalid
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
                return;
            }

            setIsSuccess(true);
            toast.success('Senha redefinida com sucesso!');

            // Clear session after success
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err) {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 ring-1 ring-white/5">
                            <DoutorizzeLogo className="h-10 w-auto" />
                        </div>
                    </div>
                </div>

                <Card className="glass-effect-v2 border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <CardHeader className="text-center pb-2 pt-8">
                        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(233,69,96,0.1)]">
                            {isSuccess ? (
                                <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                            ) : (
                                <KeyRound className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">
                            {isSuccess ? 'Senha Atualizada' : 'Nova Senha'}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2">
                            {isSuccess
                                ? 'Sua conta está protegida com a nova senha'
                                : 'Defina uma combinação segura para sua conta'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        {isSuccess ? (
                            <div className="text-center space-y-6 py-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Sua nova senha foi configurada com sucesso. Você será redirecionado para o login em instantes.
                                    </p>
                                </div>

                                <Button
                                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-white shadow-glow transition-all active:scale-[0.98]"
                                    onClick={() => navigate('/auth')}
                                >
                                    Ir para o Login Agora
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" title="password" className="text-gray-300 ml-1">Nova Senha</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-11 h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" title="confirm-password" className="text-gray-300 ml-1">Confirmar Senha</Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="pl-11 h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all font-mono"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold text-white shadow-glow transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Atualizando...</span>
                                        </div>
                                    ) : (
                                        'Redefinir Senha Segura'
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-gray-600 text-[10px] tracking-widest uppercase font-medium">
                    Doutorizze Core • End-to-End Encryption
                </p>
            </div>
        </div>
    );
}
