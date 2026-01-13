import { Mail, Phone, MapPin, MessageCircle, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos aqui para ajudar! Entre em contato conosco através dos canais abaixo
              ou envie uma mensagem diretamente.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Telefone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Atendimento 24h</p>
                  <p className="text-lg font-semibold">(11) 0800-123-4567</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Ligar Agora
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Resposta rápida</p>
                  <p className="text-lg font-semibold">(11) 99999-9999</p>
                  <Button variant="outline" size="sm" className="mt-3 bg-green-600 text-white hover:bg-green-700">
                    Conversar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    E-mail
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Suporte técnico</p>
                  <p className="text-lg font-semibold">contato@doutorizze.com.br</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Enviar E-mail
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">Escritório principal</p>
                  <p className="font-semibold">
                    Av. Paulista, 1000<br />
                    Bela Vista, São Paulo - SP<br />
                    CEP: 01310-100
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex justify-between">
                    <span>Segunda à Sexta:</span>
                    <span className="font-semibold">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado:</span>
                    <span className="font-semibold">8h às 12h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo:</span>
                    <span className="text-muted-foreground">Fechado</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Envie sua Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome *</Label>
                        <Input id="firstName" placeholder="Seu nome" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome *</Label>
                        <Input id="lastName" placeholder="Seu sobrenome" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input id="email" type="email" placeholder="seu@email.com" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" placeholder="(11) 99999-9999" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o assunto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">Suporte Técnico</SelectItem>
                          <SelectItem value="billing">Questões de Pagamento</SelectItem>
                          <SelectItem value="clinic">Cadastro de Clínica</SelectItem>
                          <SelectItem value="patient">Dúvidas de Paciente</SelectItem>
                          <SelectItem value="partnership">Parcerias</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva sua dúvida ou solicitação..."
                        rows={6}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button className="flex-1">
                        Enviar Mensagem
                      </Button>
                      <Button variant="outline">
                        <HelpCircle className="h-4 w-4 mr-2" />
                        FAQ
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Perguntas Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Como faço para agendar uma consulta?</h4>
                    <p className="text-sm text-muted-foreground">
                      Você pode agendar através da nossa plataforma online, selecionando a clínica,
                      serviço, data e horário de sua preferência.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Posso cancelar ou remarcar minha consulta?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim, você pode cancelar ou remarcar com até 24 horas de antecedência
                      através do seu perfil ou entrando em contato conosco.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Como posso cadastrar minha clínica?</h4>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato conosco através dos canais de atendimento para
                      iniciar o processo de cadastro da sua clínica.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h4>
                    <p className="text-sm text-muted-foreground">
                      Aceitamos cartão de crédito, débito e PIX. Pagamentos via PIX
                      têm desconto de 5%.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}