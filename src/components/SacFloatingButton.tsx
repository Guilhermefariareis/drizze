import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Phone, Mail, MessageSquare, Clock, Shield, Headphones } from 'lucide-react';

const faqData = [
  {
    question: "Como funciona o crédito odontológico?",
    answer: "O crédito Doutorizze permite parcelar tratamentos odontológicos em até 24x. Após a aprovação do crédito, você agenda sua consulta e inicia o tratamento. O pagamento é feito diretamente à clínica através de nosso sistema seguro."
  },
  {
    question: "Quais são os requisitos para aprovação?",
    answer: "Para solicitar o crédito você precisa: ter mais de 18 anos, CPF regularizado, comprovante de renda e conta bancária ativa. A aprovação depende da análise de crédito."
  },
  {
    question: "Como funciona a análise de crédito?",
    answer: "Nossa análise é rápida e considera diversos fatores além do score. Avaliamos seu histórico financeiro, capacidade de pagamento e relacionamento bancário. O resultado sai em até 24 horas."
  },
  {
    question: "Posso antecipar parcelas ou quitar antecipadamente?",
    answer: "Sim! Você pode antecipar parcelas ou quitar o crédito a qualquer momento com desconto proporcional nos juros. Entre em contato conosco para simular."
  },
  {
    question: "E se eu tiver problemas com o tratamento?",
    answer: "Temos um sistema de mediação entre paciente e clínica. Caso haja problemas com o tratamento, nossa equipe de suporte atua para resolver a situação de forma justa para ambas as partes."
  },
  {
    question: "Como funciona o agendamento?",
    answer: "Após a aprovação do crédito, você pode agendar diretamente com a clínica através da nossa plataforma. O sistema mostra horários disponíveis em tempo real."
  },
  {
    question: "Há taxa de adesão ou anuidade?",
    answer: "Não cobramos taxa de adesão, anuidade ou taxas ocultas. Você paga apenas os juros acordados no momento da contratação."
  },
  {
    question: "Como entro em contato se precisar de ajuda?",
    answer: "Oferecemos atendimento multicanal: WhatsApp, e-mail, telefone e chat online. Nossa equipe está disponível de segunda à sexta, das 8h às 18h."
  }
];

const contactChannels = [
  {
    icon: Phone,
    title: "Telefone",
    description: "(11) 9999-9999",
    subtitle: "Segunda à Sexta: 8h às 18h",
    color: "text-blue-600"
  },
  {
    icon: MessageSquare,
    title: "WhatsApp",
    description: "(11) 9999-9999",
    subtitle: "Atendimento rápido",
    color: "text-green-600"
  },
  {
    icon: Mail,
    title: "E-mail",
    description: "sac@doutorizze.com.br",
    subtitle: "Resposta em até 24h",
    color: "text-purple-600"
  }
];

export default function SacFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botão flutuante fixo no canto inferior direito */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl hover:shadow-3xl transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-110 group"
        >
          <div className="flex flex-col items-center justify-center">
            <Headphones className="h-6 w-6 mb-1 group-hover:animate-pulse" />
            <span className="text-xs font-semibold">SAC</span>
          </div>
        </Button>
      </div>

      {/* Modal do SAC */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <HelpCircle className="h-6 w-6 text-primary" />
              SAC - Serviço de Atendimento ao Cliente
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Canais de Atendimento */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fale Conosco</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactChannels.map((channel, index) => {
                    const IconComponent = channel.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <IconComponent className={`h-5 w-5 ${channel.color} mt-1`} />
                        <div>
                          <p className="font-medium text-sm">{channel.title}</p>
                          <p className="text-sm text-foreground">{channel.description}</p>
                          <p className="text-xs text-muted-foreground">{channel.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Horário de Funcionamento</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Segunda à Sexta: 8h às 18h<br />
                      Sábados: 8h às 12h
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Suporte Garantido</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Atendimento especializado para dúvidas sobre crédito, agendamentos e tratamentos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Encontre respostas rápidas para as dúvidas mais comuns
                  </p>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqData.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left text-sm hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rodapé com informações importantes */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">Atendimento Especializado</Badge>
              <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">Suporte Técnico</Badge>
              <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">Mediação de Conflitos</Badge>
              <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">Orientação Financeira</Badge>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              O SAC Doutorizze está comprometido em oferecer soluções rápidas e eficazes para suas necessidades. 
              Todos os atendimentos são registrados para garantir qualidade e acompanhamento adequado.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}