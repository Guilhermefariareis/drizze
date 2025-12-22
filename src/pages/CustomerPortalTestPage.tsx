import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCustomerPortalSession, getUserSubscription } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, CreditCard, Calendar, DollarSign } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  plan_name?: string;
  amount?: number;
  currency?: string;
}

export default function CustomerPortalTestPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserSubscription();
  }, [user]);

  const loadUserSubscription = async () => {
    if (!user) {
      setLoadingSubscription(false);
      return;
    }

    try {
      setLoadingSubscription(true);
      console.log('🔍 Carregando assinatura do usuário...');
      const userSubscription = await getUserSubscription();
      console.log('📋 Assinatura encontrada:', userSubscription);
      setSubscription(userSubscription);
    } catch (error) {
      console.error('❌ Erro ao carregar assinatura:', error);
      setError('Erro ao carregar informações da assinatura');
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleOpenPortal = async () => {
    if (!user) {
      setError('Usuário não está logado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Abrindo portal do cliente...');
      
      const portalUrl = await createCustomerPortalSession();
      console.log('🔗 URL do portal:', portalUrl);
      
      if (portalUrl) {
        window.open(portalUrl, '_blank');
        console.log('✅ Portal aberto com sucesso');
      } else {
        throw new Error('URL do portal não foi retornada');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir portal:', error);
      setError(error instanceof Error ? error.message : 'Erro ao abrir portal do cliente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
        return 'destructive';
      case 'past_due':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Portal do Cliente - Teste</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar o portal do cliente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Faça login para gerenciar sua assinatura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Portal do Cliente - Teste</h1>
          <p className="text-muted-foreground mt-2">
            Teste das funcionalidades de gerenciamento de assinatura
          </p>
        </div>

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Status:</strong> {user.email_confirmed_at ? 'Confirmado' : 'Pendente'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Assinatura Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSubscription ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando assinatura...</span>
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(subscription.status)}>
                    {subscription.status}
                  </Badge>
                  {subscription.plan_name && (
                    <Badge variant="outline">{subscription.plan_name}</Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID da Assinatura</p>
                    <p className="font-mono text-sm">{subscription.id}</p>
                  </div>
                  
                  {subscription.amount && subscription.currency && (
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-semibold">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Início do Período</p>
                    <p>{formatDate(subscription.current_period_start)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Fim do Período</p>
                    <p>{formatDate(subscription.current_period_end)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma assinatura ativa encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Você pode criar uma assinatura na página de planos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações do Portal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Portal de Gerenciamento
            </CardTitle>
            <CardDescription>
              Acesse o portal do Stripe para gerenciar sua assinatura, atualizar método de pagamento e visualizar faturas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleOpenPortal}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abrindo Portal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir Portal do Cliente
                  </>
                )}
              </Button>
              
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>No portal você pode:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Atualizar método de pagamento</li>
                  <li>Visualizar e baixar faturas</li>
                  <li>Alterar plano de assinatura</li>
                  <li>Cancelar assinatura</li>
                  <li>Atualizar informações de cobrança</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>User Email:</strong> {user.email}</p>
              <p><strong>Subscription Status:</strong> {subscription?.status || 'N/A'}</p>
              <p><strong>Loading:</strong> {loading.toString()}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}