import { supabase } from '../lib/supabase';

interface PaymentIntentData {
  amount: number;
  currency: string;
  description: string;
  metadata: {
    credit_request_id: string;
    patient_id: string;
    clinic_id: string;
  };
}

interface InstallmentPlan {
  credit_request_id: string;
  total_amount: number;
  installments: number;
  installment_amount: number;
  start_date: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

class StripeService {
  private baseUrl: string;

  constructor() {
    // TODO: Configurar URL da API backend
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  /**
   * Cria um Payment Intent para pagamento único
   */
  async createPaymentIntent(data: PaymentIntentData): Promise<{ client_secret: string; payment_intent_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar Payment Intent');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Cria um plano de parcelamento usando Stripe Subscriptions
   */
  async createInstallmentPlan(data: InstallmentPlan): Promise<{ subscription_id: string; client_secret: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/create-installment-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar plano de parcelamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar plano de parcelamento:', error);
      throw error;
    }
  }

  /**
   * Confirma um pagamento
   */
  async confirmPayment(paymentIntentId: string): Promise<{ status: string; payment_method?: PaymentMethod }> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ payment_intent_id: paymentIntentId })
      });

      if (!response.ok) {
        throw new Error('Erro ao confirmar pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      throw error;
    }
  }

  /**
   * Busca o status de um pagamento
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{ status: string; amount: number; currency: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/payment-status/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar status do pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }

  /**
   * Lista os métodos de pagamento salvos do cliente
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/payment-methods/${customerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar métodos de pagamento');
      }

      const data = await response.json();
      return data.payment_methods || [];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura (plano de parcelamento)
   */
  async cancelSubscription(subscriptionId: string): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stripe/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  /**
   * Processa o pagamento de uma solicitação de crédito aprovada
   */
  async processApprovedCreditPayment(creditRequestId: string): Promise<{ success: boolean; payment_url?: string; error?: string }> {
    try {
      // Buscar dados da solicitação de crédito
      const { data: creditRequest, error: creditError } = await supabase
        .from('credit_requests')
        .select(`
          id,
          patient_id,
          clinic_id,
          requested_amount,
          installments,
          treatment_description,
          status
        `)
        .eq('id', creditRequestId)
        .eq('status', 'admin_approved')
        .single();

      if (creditError || !creditRequest) {
        throw new Error('Solicitação de crédito não encontrada ou não aprovada');
      }

      // Verificar se já existe um pagamento em andamento
      const { data: existingPayment } = await supabase
        .from('credit_payments')
        .select('id, status, stripe_payment_intent_id')
        .eq('credit_request_id', creditRequestId)
        .eq('status', 'pending')
        .single();

      if (existingPayment) {
        return {
          success: true,
          payment_url: `/payment/${existingPayment.stripe_payment_intent_id}`
        };
      }

      // Criar Payment Intent ou Subscription baseado no número de parcelas
      if (creditRequest.installments === 1) {
        // Pagamento único
        const paymentIntent = await this.createPaymentIntent({
          amount: Math.round(creditRequest.requested_amount * 100), // Converter para centavos
          currency: 'brl',
          description: `Pagamento de crédito - ${creditRequest.treatment_description}`,
          metadata: {
            credit_request_id: creditRequest.id,
            patient_id: creditRequest.patient_id,
            clinic_id: creditRequest.clinic_id
          }
        });

        // Salvar informações do pagamento no banco
        const { error: paymentError } = await supabase
          .from('credit_payments')
          .insert({
            credit_request_id: creditRequest.id,
            stripe_payment_intent_id: paymentIntent.payment_intent_id,
            amount: creditRequest.requested_amount,
            installments: 1,
            status: 'pending',
            payment_type: 'single'
          });

        if (paymentError) {
          throw paymentError;
        }

        return {
          success: true,
          payment_url: `/payment/${paymentIntent.payment_intent_id}`
        };
      } else {
        // Pagamento parcelado
        const installmentAmount = creditRequest.requested_amount / creditRequest.installments;
        const subscription = await this.createInstallmentPlan({
          credit_request_id: creditRequest.id,
          total_amount: creditRequest.requested_amount,
          installments: creditRequest.installments,
          installment_amount: installmentAmount,
          start_date: new Date().toISOString()
        });

        // Salvar informações do pagamento no banco
        const { error: paymentError } = await supabase
          .from('credit_payments')
          .insert({
            credit_request_id: creditRequest.id,
            stripe_subscription_id: subscription.subscription_id,
            amount: creditRequest.requested_amount,
            installments: creditRequest.installments,
            installment_amount: installmentAmount,
            status: 'pending',
            payment_type: 'installment'
          });

        if (paymentError) {
          throw paymentError;
        }

        return {
          success: true,
          payment_url: `/payment/subscription/${subscription.subscription_id}`
        };
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza o status do pagamento após confirmação do webhook
   */
  async updatePaymentStatus(paymentIntentId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('credit_payments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      if (error) {
        throw error;
      }

      // Se o pagamento foi bem-sucedido, criar notificação
      if (status === 'completed') {
        const { data: payment } = await supabase
          .from('credit_payments')
          .select('credit_request_id, credit_requests(patient_id, requested_amount)')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (payment) {
          await supabase
            .from('notifications')
            .insert({
              user_id: payment.credit_requests.patient_id,
              title: 'Pagamento Confirmado',
              message: `Seu pagamento de ${this.formatCurrency(payment.credit_requests.requested_amount)} foi confirmado com sucesso.`,
              type: 'success',
              credit_request_id: payment.credit_request_id
            });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }

  /**
   * Obtém o token de autenticação do usuário atual
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }

  /**
   * Formata valor monetário
   */
  private formatCurrency(amount: number): string {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }
}

export const stripeService = new StripeService();
export default stripeService;