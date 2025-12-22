import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StripeCheckout from '@/components/StripeCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { stripePlans } from '@/lib/stripe';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookingData = location.state || {};
  
  if (!bookingData.service) {
    navigate('/search');
    return null;
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer um pagamento');
      return;
    }

    if (paymentMethod === 'stripe') {
      try {
        setLoading(true);
        const plans = await getStripePlans();
        
        // Create a plan based on the booking data
        const bookingPlan = {
          id: 'booking-payment',
          name: `Pagamento - ${bookingData.service?.name}`,
          description: `Pagamento para ${bookingData.service?.name} em ${bookingData.clinic?.name}`,
          price: bookingData.service?.price || 0,
          stripePriceId: 'price_booking', // This would be configured in Stripe
          features: [
            `Serviço: ${bookingData.service?.name}`,
            `Data: ${new Date(bookingData.date).toLocaleDateString('pt-BR')}`,
            `Horário: ${bookingData.time}`,
            `Clínica: ${bookingData.clinic?.name}`
          ]
        };
        
        setSelectedPlan(bookingPlan);
        setShowStripeCheckout(true);
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        toast.error('Erro ao processar pagamento. Tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle other payment methods (PIX, etc.)
      setTimeout(() => {
        navigate('/booking-confirmation', { 
          state: { 
            ...bookingData,
            paymentMethod,
            transactionId: 'TXN' + Date.now()
          }
        });
      }, 2000);
    }
  };

  const handleStripeSuccess = (sessionId) => {
    setShowStripeCheckout(false);
    navigate('/booking-confirmation', {
      state: {
        ...bookingData,
        paymentMethod: 'stripe',
        transactionId: sessionId,
        paymentStatus: 'completed'
      }
    });
    toast.success('Pagamento realizado com sucesso!');
  };

  const handleStripeCancel = () => {
    setShowStripeCheckout(false);
    toast.info('Pagamento cancelado');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">Dados</span>
              </div>
              
              <div className="flex-1 h-px bg-border"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-sm font-semibold">Pagamento</span>
              </div>
              
              <div className="flex-1 h-px bg-border"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">3</span>
                </div>
                <span className="text-sm text-muted-foreground">Confirmação</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Pagamento Seguro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">
                      Forma de Pagamento
                    </Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>Cartão de Crédito/Débito (Stripe)</span>
                            <div className="flex gap-2">
                              <img src="/api/placeholder/30/20" alt="Visa" className="h-5" />
                              <img src="/api/placeholder/30/20" alt="Mastercard" className="h-5" />
                              <span className="text-xs bg-primary text-white px-2 py-1 rounded">Seguro</span>
                            </div>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <span>PIX</span>
                            <span className="text-sm text-success font-semibold">Desconto 5%</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Stripe Payment Info */}
                  {paymentMethod === 'stripe' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="h-4 w-4 text-success" />
                          <span className="text-sm font-semibold">Pagamento Seguro com Stripe</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Seus dados de pagamento são processados de forma segura pelo Stripe, 
                          líder mundial em processamento de pagamentos online.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span>Criptografia SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span>PCI DSS Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span>3D Secure</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          <span>Proteção contra fraude</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PIX */}
                  {paymentMethod === 'pix' && (
                    <div className="text-center p-8">
                      <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-muted-foreground">QR Code PIX</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Escaneie o código QR com seu app bancário
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{bookingData.clinic?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const addr = bookingData.clinic?.address;
                        if (typeof addr === 'object' && addr !== null) {
                          const addressObj = addr as { street?: string; neighborhood?: string; city?: string; state?: string };
                          const parts = [
                            addressObj.street,
                            addressObj.neighborhood,
                            addressObj.city,
                            addressObj.state
                          ].filter(Boolean);
                          return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
                        }
                        return addr || 'Endereço não informado';
                      })()}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Serviço:</span>
                      <span>{bookingData.service?.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span>{new Date(bookingData.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Horário:</span>
                      <span>{bookingData.time}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {bookingData.service?.price}</span>
                    </div>
                    
                    {paymentMethod === 'pix' && (
                      <div className="flex justify-between text-success">
                        <span>Desconto PIX:</span>
                        <span>-R$ {(bookingData.service?.price * 0.05).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>
                      R$ {paymentMethod === 'pix' 
                        ? (bookingData.service?.price * 0.95).toFixed(2).replace('.', ',')
                        : bookingData.service?.price
                      }
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handlePayment}
                    disabled={loading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {loading ? 'Processando...' : 'Finalizar Pagamento'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Stripe Checkout Modal */}
      {showStripeCheckout && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Finalizar Pagamento</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStripeCancel}
                >
                  ✕
                </Button>
              </div>
              
              <StripeCheckout
                plan={selectedPlan}
                onSuccess={handleStripeSuccess}
                onCancel={handleStripeCancel}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}