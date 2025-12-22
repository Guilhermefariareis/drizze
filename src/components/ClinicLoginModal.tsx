import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClinicLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClinicLoginModal = ({ isOpen, onClose }: ClinicLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
        // Check user role to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        // Priorizar role do metadata com mapeamento master->admin
        const metaRoleRaw = (data.user.user_metadata as any)?.role as string | undefined;
        const metaRole = metaRoleRaw === 'master' ? 'admin' : metaRoleRaw;
        const effectiveRole = metaRole ?? profile?.role ?? 'patient';

        // Redirect based on role
        if (effectiveRole === 'admin' || effectiveRole === 'master') {
          navigate('/admin');
        } else if (effectiveRole === 'clinic') {
          navigate('/clinic-dashboard');
        } else {
          // Se não for clínica, mostrar erro
          toast.error('Esta conta não tem permissão para acessar o painel de clínicas');
          // Evitar erro de rede no logout: tornar opcional e resiliente
          try {
            await supabase.auth.signOut();
          } catch (signOutErr) {
            console.warn('[ClinicLoginModal] signOut falhou (ignorado):', (signOutErr as any)?.message || signOutErr);
          }
          return;
        }
        
        onClose();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Login Clínica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="text-center mb-4">
            <div className="bg-gradient-primary p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground">Acesse o painel da sua clínica</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinic-email">Email da Clínica</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinic-email"
                  type="email"
                  placeholder="clinica@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clinic-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinic-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Button variant="link" className="p-0 h-auto font-medium text-primary">
            Cadastre sua clínica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClinicLoginModal;