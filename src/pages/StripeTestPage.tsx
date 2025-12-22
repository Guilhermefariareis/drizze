import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StripeCheckout from '@/components/StripeCheckout';
import { stripePlans } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function StripeTestPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(stripePlans.basic);
  const { user } = useAuth();

  const handleTestCheckout = () => {
    if (!user) {
      toast.error('Você precisa estar logado para testar o checkout');
      return;
    }
    
    console.log('🧪 Iniciando teste de checkout com plano:', selectedPlan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    console.log('✅ Checkout realizado com sucesso!');
    setShowCheckout(false);
    toast.success('Teste de checkout concluído com sucesso!');
  };

  const handleCheckoutCancel = () => {
    console.log('❌ Checkout cancelado');
    setShowCheckout(false);
    toast.info('Checkout cancelado');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🧪 Teste de Integração do Stripe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status do usuário:</p>
                <p className={`font-medium ${user ? 'text-green-600' : 'text-red-600'}`}>
                  {user ? `✅ Logado como: ${user.email}` : '❌ Não logado'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Plano selecionado:</p>
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedPlan.stripePriceId} 
                    onChange={(e) => {
                      const planKey = Object.keys(stripePlans).find(key => 
                        stripePlans[key as keyof typeof stripePlans].stripePriceId === e.target.value
                      );
                      if (planKey) {
                        setSelectedPlan(stripePlans[planKey as keyof typeof stripePlans]);
                      }
                    }}
                    className="border rounded px-3 py-2"
                  >
                    {Object.entries(stripePlans).map(([key, plan]) => (
                      <option key={key} value={plan.stripePriceId}>
                        {plan.name} - R$ {plan.price}/mês
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleTestCheckout}
                  disabled={!user}
                  className="w-full"
                >
                  {user ? '🚀 Testar Checkout' : '🔒 Faça login para testar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Planos disponíveis:</strong> {Object.keys(stripePlans).length}</p>
              <p><strong>Plano atual:</strong> {selectedPlan.name}</p>
              <p><strong>Price ID:</strong> {selectedPlan.stripePriceId}</p>
              <p><strong>Checkout ativo:</strong> {showCheckout ? 'Sim' : 'Não'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">🧪 Teste de Checkout</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCheckoutCancel}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <StripeCheckout
                plan={selectedPlan}
                onSuccess={handleCheckoutSuccess}
                onCancel={handleCheckoutCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}