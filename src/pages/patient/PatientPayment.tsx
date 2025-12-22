import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { stripeService } from '../../services/stripeService';

interface PaymentData {
  id: string;
  credit_request_id: string;
  amount: number;
  installments: number;
  installment_amount?: number;
  status: string;
  payment_type: 'single' | 'installment';
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  credit_request: {
    treatment_description: string;
    clinic: {
      name: string;
    };
  };
}

const PatientPayment: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('credit_payments')
        .select(`
          id,
          credit_request_id,
          amount,
          installments,
          installment_amount,
          status,
          payment_type,
          stripe_payment_intent_id,
          stripe_subscription_id,
          credit_request:credit_requests(
            treatment_description,
            clinic:clinics(
              name
            )
          )
        `)
        .eq('stripe_payment_intent_id', paymentId)
        .or(`stripe_subscription_id.eq.${paymentId}`)
        .single();

      if (error) {
        throw error;
      }

      setPayment(data);
      setPaymentStatus(data.status);
    } catch (error) {
      console.error('Erro ao buscar dados do pagamento:', error);
      setError('Pagamento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!payment) return;

    try {
      setProcessing(true);
      setError(null);

      // Simular processamento do pagamento
      // Em uma implementação real, aqui seria integrado com o Stripe Elements
      setPaymentStatus('processing');

      // Simular delay do processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Confirmar pagamento
      if (payment.stripe_payment_intent_id) {
        const result = await stripeService.confirmPayment(payment.stripe_payment_intent_id);
        
        if (result.status === 'succeeded') {
          setPaymentStatus('completed');
          
          // Atualizar status no banco
          await stripeService.updatePaymentStatus(payment.stripe_payment_intent_id, 'completed');
          
          // Atualizar status da solicitação de crédito
          await supabase
            .from('credit_requests')
            .update({ status: 'payment_completed' })
            .eq('id', payment.credit_request_id);
        } else {
          throw new Error('Pagamento não foi processado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
      setPaymentStatus('failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'processing':
        return <Clock className="w-16 h-16 text-blue-500 animate-spin" />;
      default:
        return <CreditCard className="w-16 h-16 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'Pagamento realizado com sucesso!';
      case 'failed':
        return 'Falha no processamento do pagamento';
      case 'processing':
        return 'Processando pagamento...';
      default:
        return 'Confirme os dados e prossiga com o pagamento';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do pagamento...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pagamento do Crédito</h1>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          {getStatusIcon()}
          <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            {getStatusMessage()}
          </h2>
          {paymentStatus === 'completed' && (
            <p className="text-gray-600">
              Seu pagamento foi processado com sucesso. Você receberá uma confirmação por email.
            </p>
          )}
          {paymentStatus === 'failed' && error && (
            <p className="text-red-600">{error}</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Pagamento</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Clínica:</span>
              <span className="font-medium">{payment.credit_request.clinic.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tratamento:</span>
              <span className="font-medium">{payment.credit_request.treatment_description}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Total:</span>
              <span className="font-medium text-lg">{formatCurrency(payment.amount)}</span>
            </div>
            
            {payment.payment_type === 'installment' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcelas:</span>
                  <span className="font-medium">{payment.installments}x</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor da Parcela:</span>
                  <span className="font-medium">{formatCurrency(payment.installment_amount || 0)}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo de Pagamento:</span>
              <span className="font-medium">
                {payment.payment_type === 'single' ? 'À vista' : 'Parcelado'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {paymentStatus === 'pending' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h3>
            
            {/* Simulação de formulário de cartão */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processing}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={processing}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  placeholder="Nome como está no cartão"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processing}
                />
              </div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </div>
              ) : (
                `Pagar ${formatCurrency(payment.amount)}`
              )}
            </button>
          </div>
        )}

        {/* Success Actions */}
        {paymentStatus === 'completed' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Voltar ao Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Imprimir Comprovante
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPayment;