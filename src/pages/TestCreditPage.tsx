import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  status: string;
  created_at: string;
}

const TestCreditPage = () => {
  // Logs imediatos para verificar se o componente carrega
  console.log('🧪 [TestCreditPage] ===== COMPONENTE INICIADO =====');
  console.log('🧪 [TestCreditPage] Timestamp:', new Date().toISOString());
  
  // Removido alerta para focar no problema real
  
  const { user } = useAuth();
  const [clinic, setClinic] = useState<any>(null);
  const [creditRequests, setCreditRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🧪 [TestCreditPage] User objeto:', user);
  console.log('🧪 [TestCreditPage] User ID:', user?.id);
  console.log('🧪 [TestCreditPage] User email:', user?.email);

  useEffect(() => {
    console.log('🧪 [TestCreditPage] useEffect executado');
    
    const testCreditRequests = async () => {
      console.log('🧪 [TestCreditPage] fetchData iniciado');
      try {
        console.log('🧪 [TestCreditPage] Iniciando teste...');
        console.log('🧪 [TestCreditPage] Usuário logado:', user?.email);

        if (!user) {
          console.log('🧪 [TestCreditPage] Usuário não logado');
          setError('Usuário não logado');
          setLoading(false);
          return;
        }

        // Buscar clínica do usuário
        console.log('🧪 [TestCreditPage] Buscando clínica...');
        const { data: clinicData, error: clinicError } = await supabase
          .from('clinics')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (clinicError) {
          console.error('🧪 [TestCreditPage] Erro ao buscar clínica:', clinicError);
          setError(`Erro ao buscar clínica: ${clinicError.message}`);
          setLoading(false);
          return;
        }

        console.log('🧪 [TestCreditPage] Dados da clínica:', clinicData);
        setClinic(clinicData);

        // Buscar solicitações de crédito
        console.log('🧪 [TestCreditPage] Buscando solicitações de crédito...');
        const { data: requests, error: requestsError } = await supabase
          .from('credit_requests')
          .select('*')
          .eq('clinic_id', clinicData.id)
          .order('created_at', { ascending: false });

        if (requestsError) {
          console.error('🧪 [TestCreditPage] Erro ao buscar solicitações:', requestsError);
          setError(`Erro ao buscar solicitações: ${requestsError.message}`);
        } else {
          console.log('🧪 [TestCreditPage] Solicitações de crédito:', requests);
          setCreditRequests(requests || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('🧪 [TestCreditPage] Erro ao buscar dados:', err);
        setError(`Erro: ${err.message}`);
        setLoading(false);
      }
    };

    testCreditRequests();
  }, [user]);

  // Log antes do render
  console.log('🧪 [TestCreditPage] Renderizando - Loading:', loading, 'Error:', error);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados de teste...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Teste de Crédito - Debug</h1>
      
      {/* Informações básicas sempre visíveis */}
      <Card className="mb-6 bg-blue-50">
        <CardHeader>
          <CardTitle>🔍 Informações de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            <p><strong>User logado:</strong> {user ? 'Sim' : 'Não'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
            <p><strong>Error:</strong> {error || 'Nenhum'}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Informações do Usuário</h2>
        <p>Email: {user?.email}</p>
        <p>ID: {user?.id}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Informações da Clínica</h2>
        {clinic ? (
          <div>
            <p>Nome: {clinic.name}</p>
            <p>ID: {clinic.id}</p>
            <p>Owner ID: {clinic.owner_id}</p>
          </div>
        ) : (
          <p>Nenhuma clínica encontrada</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Solicitações de Crédito</h2>
        {error ? (
          <p className="text-red-600">Erro: {error}</p>
        ) : creditRequests.length > 0 ? (
          <div className="space-y-4">
            {creditRequests.map((request) => (
              <div key={request.id} className="border p-4 rounded">
                <p><strong>ID:</strong> {request.id}</p>
                <p><strong>Valor:</strong> R$ {request.requested_amount}</p>
                <p><strong>Status:</strong> {request.status}</p>
                <p><strong>Descrição:</strong> {request.treatment_description}</p>
                <p><strong>Data:</strong> {new Date(request.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma solicitação encontrada</p>
        )}
      </div>
    </div>
  );
};

export default TestCreditPage;