import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DoutorizzeLogo from '@/assets/doutorizze-logo.svg?react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setIsSent(true);
            toast.success('Link de recuperação enviado!');
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
                <div className="text-center mb-8 space-y-6">
                    <Link
                        to="/auth"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Voltar ao login
                    </Link>
                    <div className="flex justify-center">
                        <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 ring-1 ring-white/5">
                            <DoutorizzeLogo className="h-10 w-auto" />
                        </div>
                    </div>
                </div>

                <Card className="glass-effect-v2 border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <CardHeader className="text-center pb-2 pt-8 relative">
                        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(233,69,96,0.1)]">
                            {isSent ? (
                                <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                            ) : (
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">
                            {isSent ? 'Verifique seu E-mail' : 'Recuperar Acesso'}
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-2">
                            {isSent
                                ? 'Enviamos as instruções para você'
                                : 'Informe seu e-mail cadastrado para receber o link'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-10">
                        {isSent ? (
                            <div className="text-center space-y-6 py-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        Um link de recuperação foi enviado para:<br />
                                        <strong className="text-primary mt-1 block font-medium">{email}</strong>
                                    </p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <p className="text-xs text-gray-500">
                                        Não recebeu? Verifique sua caixa de spam ou aguarde alguns instantes.
                                    </p>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs text-primary hover:text-primary-hover hover:bg-primary/5"
                                        onClick={() => setIsSent(false)}
                                    >
                                        Tentar outro e-mail
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300 ml-1">E-mail Corporativo</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu@exemplo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-11 h-12 bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-primary/50 focus:ring-primary/20 transition-all shadow-inner"
                                            required
                                        />
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
                                            <span>Processando...</span>
                                        </div>
                                    ) : (
                                        'Solicitar Nova Senha'
                                    )}
                                </Button>

                                <p className="text-center text-xs text-gray-500">
                                    Ao continuar, você concorda com nossos termos de segurança.
                                </p>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <p className="text-center mt-8 text-gray-600 text-[10px] tracking-widest uppercase font-medium">
                    Doutorizze Core • Advanced Protection System
                </p>
            </div>
        </div>
    );
}
