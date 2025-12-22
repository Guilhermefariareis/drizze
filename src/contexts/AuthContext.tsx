import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [AuthContext] Inicializando contexto de autenticação');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 [AuthContext] Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          console.log('🔐 [AuthContext] Usuário logado:', session?.user?.email);
        }
        if (event === 'SIGNED_OUT') {
          console.log('🔐 [AuthContext] Usuário deslogado');
          toast.success('Logout realizado com sucesso!');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 [AuthContext] Sessão existente encontrada:', session?.user?.id, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Clear localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-irrtjredcrwucrnagune-auth-token');
      
      // Only do local logout to avoid network errors
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        // Silently handle any logout errors
        console.warn('Local logout completed with warning:', error);
      }
      
      toast.success('Logout realizado com sucesso!');
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, redirect to home
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};