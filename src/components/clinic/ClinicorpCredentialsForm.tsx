import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useClinicorpCredentials } from '@/hooks/useClinicorpCredentials';
import { useClinicorpContext } from '@/contexts/ClinicorpContext';
import { supabase } from '@/integrations/supabase/client';
import { Key, Lock, CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ClinicorpCredentialsForm() {
  const {
    credentials: savedCredentials,
    loading,
    testing,
    saveCredentials: saveCreds,
    testConnection: testConn,
    deleteCredentials
  } = useClinicorpCredentials();

  const { reloadCredentials } = useClinicorpContext();

  const [formCredentials, setFormCredentials] = useState({
    api_user: '',
    api_token: '',
    subscriber_id: '',
    base_url: 'https://api.clinicorp.com/rest/v1'
  });
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  // Carregar credenciais salvas no formulário
  useEffect(() => {
    if (savedCredentials) {
      setFormCredentials({
        api_user: savedCredentials.api_user,
        api_token: '', // Não preencher o token por segurança
        subscriber_id: savedCredentials.subscriber_id,
        base_url: savedCredentials.base_url
      });
      setConnectionStatus('connected');
    }
  }, [savedCredentials]);

  const handleTestConnection = async () => {
    if (!formCredentials.api_token || !formCredentials.subscriber_id) {
      toast.error('Preencha o token de API e ID do assinante');
      return;
    }

    // Verificar se o usuário está autenticado
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('Você precisa estar logado para testar a conexão');
      console.error('User not authenticated:', error);
      return;
    }

    console.log('Testing connection with user:', user.id);
    const success = await testConn({
      ...formCredentials,
      is_active: true
    });
    setConnectionStatus(success ? 'connected' : 'error');
  };

  const handleSaveCredentials = async () => {
    if (!formCredentials.api_user || !formCredentials.api_token || !formCredentials.subscriber_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se o usuário está autenticado
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      toast.error('Você precisa estar logado para salvar as credenciais');
      console.error('User not authenticated:', error);
      return;
    }

    console.log('Saving credentials for user:', user.id);
    const success = await saveCreds({
      ...formCredentials,
      is_active: true
    });
    
    if (success) {
      setConnectionStatus('connected');
      // Recarregar as credenciais no contexto global
      await reloadCredentials();
    }
  };

  const handleDeleteCredentials = async () => {
    if (!savedCredentials) return;
    
    const success = await deleteCredentials();
    if (success) {
      setFormCredentials({
        api_user: '',
        api_token: '',
        subscriber_id: '',
        base_url: 'https://api.clinicorp.com/rest/v1'
      });
      setConnectionStatus('unknown');
      // Recarregar as credenciais no contexto global
      await reloadCredentials();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credenciais Clinicorp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Configure sua integração com o sistema Clinicorp para acessar todas as funcionalidades.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="api_user">Usuário da API *</Label>
              <Input
                id="api_user"
                value={formCredentials.api_user}
                onChange={(e) => setFormCredentials(prev => ({ ...prev, api_user: e.target.value }))}
                placeholder="sorrisosaude2"
              />
            </div>

            <div>
              <Label htmlFor="api_token">Token da API *</Label>
              <Input
                id="api_token"
                type="password"
                value={formCredentials.api_token}
                onChange={(e) => setFormCredentials(prev => ({ ...prev, api_token: e.target.value }))}
                placeholder="311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b"
              />
            </div>

            <div>
              <Label htmlFor="subscriber_id">ID do Assinante *</Label>
              <Input
                id="subscriber_id"
                value={formCredentials.subscriber_id}
                onChange={(e) => setFormCredentials(prev => ({ ...prev, subscriber_id: e.target.value }))}
                placeholder="felipemello"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleTestConnection}
              variant="outline"
              disabled={testing || !formCredentials.api_token || !formCredentials.subscriber_id}
            >
              {testing ? 'Testando...' : 'Testar Conexão'}
            </Button>
            
            <Button
              onClick={handleSaveCredentials}
              disabled={loading || !formCredentials.api_user || !formCredentials.api_token || !formCredentials.subscriber_id}
            >
              {loading ? 'Salvando...' : 'Salvar Credenciais'}
            </Button>

            {savedCredentials && (
              <Button
                onClick={handleDeleteCredentials}
                variant="destructive"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
            )}
          </div>

          {connectionStatus === 'connected' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Conexão estabelecida com sucesso! Você pode agora utilizar todas as funcionalidades.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}