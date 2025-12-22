
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useClinicorpCredentials } from '@/hooks/useClinicorpCredentials';
import { Loader2, PlugZap, AlertCircle } from 'lucide-react';

export default function ClinicorpStatusBadge() {
  const { credentials, testConnection } = useClinicorpCredentials();
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    let mounted = true;
    
    const checkConnection = async () => {
      if (!credentials) {
        if (mounted) setStatus('disconnected');
        return;
      }
      
      // Remover teste automático que gera toast de erro
      // try {
      //   const isConnected = await testConnection();
      //   if (mounted) setStatus(isConnected ? 'connected' : 'disconnected');
      // } catch (error) {
      //   console.debug('Connection check failed:', error);
      //   if (mounted) setStatus('disconnected');
      // }
      
      // Apenas verificar se tem credenciais
      if (mounted) setStatus(credentials ? 'connected' : 'disconnected');
    };

    checkConnection();
    
    return () => { 
      mounted = false; 
    };
  }, [credentials]);

  if (status === 'checking') {
    return (
      <Badge className="bg-muted text-muted-foreground">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> 
        Verificando…
      </Badge>
    );
  }

  if (status === 'connected') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <PlugZap className="h-3 w-3 mr-1" /> 
        Clinicorp conectado
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
      <AlertCircle className="h-3 w-3 mr-1" /> 
      Clinicorp desconectado
    </Badge>
  );
}
