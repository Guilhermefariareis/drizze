import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, StripePlan, createCheckoutSession, redirectToCheckout } from '@/lib/stripe';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface StripeCheckoutProps {
  plan: StripePlan;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<StripeCheckoutProps> = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      setError('Stripe não foi carregado ou usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar sessão de checkout no Stripe
      const sessionId = await createCheckoutSession(plan.stripePriceId);
      
      // Redirecionar para o checkout do Stripe
      await redirectToCheckout(sessionId);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <CreditCard className="h-5 w-5" />
          Finalizar Assinatura
        </CardTitle>
        <CardDescription>
          {plan.name} - {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(plan.price)}/{plan.interval === 'month' ? 'mês' : 'ano'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumo do plano */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Resumo do Plano</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(plan.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Período:</span>
                <span className="font-medium">
                  {plan.interval === 'month' ? 'Mensal' : 'Anual'}
                </span>
              </div>
            </div>
          </div>

          {/* Features do plano */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Incluído no plano:</h3>
            <ul className="space-y-1">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{plan.features.length - 3} outros recursos
                </li>
              )}
            </ul>
          </div>

          {/* Informações de segurança */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Pagamento seguro processado pelo Stripe</span>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Assinar Agora'
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos termos de serviço.
            Você pode cancelar sua assinatura a qualquer momento.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;