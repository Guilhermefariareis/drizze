import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Calendar, MapPin, Clock, User, Phone, CreditCard, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};

  if (!bookingData.service) {
    navigate('/search');
    return null;
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Tenho um agendamento confirmado para ${bookingData.service.name} no dia ${new Date(bookingData.date).toLocaleDateString('pt-BR')} às ${bookingData.time}. ID: ${bookingData.transactionId}`
  );

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-success mb-2">
              Agendamento Confirmado!
            </h1>

            <p className="text-muted-foreground">
              Sua consulta foi agendada com sucesso. Você receberá um lembrete por WhatsApp.
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalhes do Agendamento</CardTitle>
              <Badge variant="outline" className="w-fit">
                ID: {bookingData.transactionId}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clinic Info */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold">{bookingData.clinic.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const addr = bookingData.clinic.address;
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
                  <p className="text-sm text-muted-foreground">{bookingData.clinic.phone}</p>
                </div>
              </div>

              <Separator />

              {/* Service */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Serviço</h4>
                  <p className="text-sm text-muted-foreground">{bookingData.service.name}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Data</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bookingData.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Horário</h4>
                    <p className="text-sm text-muted-foreground">{bookingData.time}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Patient Info */}
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Paciente</h4>
                  <p className="text-sm text-muted-foreground">{bookingData.patient.name}</p>
                  <p className="text-sm text-muted-foreground">{bookingData.patient.phone}</p>
                </div>
              </div>

              <Separator />

              {/* Payment */}
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-semibold">Pagamento</h4>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.paymentMethod === 'credit' && 'Cartão de Crédito'}
                    {bookingData.paymentMethod === 'debit' && 'Cartão de Débito'}
                    {bookingData.paymentMethod === 'pix' && 'PIX'}
                  </p>
                  <p className="text-sm font-semibold text-success">
                    R$ {bookingData.paymentMethod === 'pix'
                      ? (bookingData.service.price * 0.95).toFixed(2).replace('.', ',')
                      : bookingData.service.price
                    } - Pago
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open(`https://wa.me/5511999999999?text=${whatsappMessage}`, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Entrar em Contato via WhatsApp
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Ver Minhas Consultas
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/search')}
              >
                Agendar Novamente
              </Button>
            </div>
          </div>

          {/* Important Notes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>Chegue 15 minutos antes do horário agendado</span>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>Traga um documento com foto</span>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>Em caso de reagendamento, entre em contato com 24h de antecedência</span>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-success mt-0.5" />
                <span>Você receberá lembretes por WhatsApp</span>
              </div>
            </CardContent>
          </Card>

          {/* Rating Request */}
          <Card className="mt-6">
            <CardContent className="text-center py-6">
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="h-6 w-6 text-warning fill-warning" />
                ))}
              </div>
              <h4 className="font-semibold mb-2">Gostou do nosso serviço?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Sua avaliação nos ajuda a melhorar continuamente
              </p>
              <Button variant="outline" size="sm">
                Avaliar Experiência
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}