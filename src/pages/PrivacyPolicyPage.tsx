import { Shield, FileText, Eye, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-xl text-muted-foreground">
              Como coletamos, usamos e protegemos suas informações pessoais
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Última atualização: 15 de Janeiro de 2024
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>

          {/* Quick Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Navegação Rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-2">
                <a href="#coleta" className="text-primary hover:underline">1. Coleta de Informações</a>
                <a href="#uso" className="text-primary hover:underline">2. Uso das Informações</a>
                <a href="#compartilhamento" className="text-primary hover:underline">3. Compartilhamento</a>
                <a href="#seguranca" className="text-primary hover:underline">4. Segurança</a>
                <a href="#cookies" className="text-primary hover:underline">5. Cookies</a>
                <a href="#direitos" className="text-primary hover:underline">6. Seus Direitos</a>
                <a href="#criancas" className="text-primary hover:underline">7. Menores de Idade</a>
                <a href="#alteracoes" className="text-primary hover:underline">8. Alterações</a>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introdução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  A Doutorizze ("nós", "nossa" ou "nosso") está comprometida em proteger e respeitar 
                  sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, 
                  processamos e protegemos suas informações pessoais quando você usa nossos serviços.
                </p>
                <p className="leading-relaxed">
                  Ao usar nossa plataforma, você concorda com a coleta e uso de informações 
                  de acordo com esta política. Recomendamos que você leia atentamente este 
                  documento antes de usar nossos serviços.
                </p>
              </CardContent>
            </Card>

            {/* Data Collection */}
            <Card id="coleta">
              <CardHeader>
                <CardTitle>1. Coleta de Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">1.1 Informações que você nos fornece:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dados de cadastro (nome, e-mail, telefone, data de nascimento)</li>
                  <li>Informações de perfil e preferências</li>
                  <li>Histórico de consultas e tratamentos</li>
                  <li>Avaliações e comentários</li>
                  <li>Informações de pagamento (processadas por terceiros seguros)</li>
                </ul>

                <h4 className="font-semibold">1.2 Informações coletadas automaticamente:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dados de navegação e uso da plataforma</li>
                  <li>Informações do dispositivo (tipo, sistema operacional, navegador)</li>
                  <li>Endereço IP e localização aproximada</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>

                <h4 className="font-semibold">1.3 Informações de terceiros:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dados recebidos de clínicas parceiras</li>
                  <li>Informações de redes sociais (quando autorizado)</li>
                  <li>Dados de verificação de identidade</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card id="uso">
              <CardHeader>
                <CardTitle>2. Uso das Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">Utilizamos suas informações para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fornecer e manter nossos serviços</li>
                  <li>Processar agendamentos e pagamentos</li>
                  <li>Enviar confirmações e lembretes</li>
                  <li>Personalizar sua experiência</li>
                  <li>Melhorar nossos serviços e desenvolver novos recursos</li>
                  <li>Prevenir fraudes e garantir segurança</li>
                  <li>Cumprir obrigações legais</li>
                  <li>Enviar comunicações de marketing (com seu consentimento)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card id="compartilhamento">
              <CardHeader>
                <CardTitle>3. Compartilhamento de Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                    <div>
                      <p className="font-semibold text-warning">Importante:</p>
                      <p className="text-sm">Nunca vendemos suas informações pessoais para terceiros.</p>
                    </div>
                  </div>
                </div>

                <p className="leading-relaxed">Compartilhamos suas informações apenas nas seguintes situações:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Com clínicas parceiras:</strong> Para processar agendamentos e prestação de serviços</li>
                  <li><strong>Prestadores de serviços:</strong> Processamento de pagamentos, análise de dados, suporte técnico</li>
                  <li><strong>Requisições legais:</strong> Quando exigido por lei ou ordem judicial</li>
                  <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
                  <li><strong>Transferência de negócios:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
                </ul>
              </CardContent>
            </Card>

            {/* Security */}
            <Card id="seguranca">
              <CardHeader>
                <CardTitle>4. Segurança das Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais para proteger 
                  suas informações pessoais:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Criptografia de dados em trânsito e em repouso</li>
                  <li>Controles de acesso rigorosos</li>
                  <li>Monitoramento contínuo de segurança</li>
                  <li>Treinamento regular da equipe</li>
                  <li>Auditorias de segurança periódicas</li>
                  <li>Backup seguro e planos de recuperação</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Embora implementemos medidas de segurança robustas, nenhum sistema é 100% seguro. 
                  Recomendamos que você também tome precauções, como usar senhas fortes e não 
                  compartilhar suas credenciais.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card id="cookies">
              <CardHeader>
                <CardTitle>5. Cookies e Tecnologias Similares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">Utilizamos cookies e tecnologias similares para:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Manter você conectado</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar o uso da plataforma</li>
                  <li>Personalizar conteúdo e anúncios</li>
                  <li>Melhorar a segurança</li>
                </ul>
                
                <h4 className="font-semibold">Tipos de cookies:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Essenciais</p>
                    <p className="text-sm text-muted-foreground">Necessários para o funcionamento básico</p>
                  </div>
                  <div>
                    <p className="font-medium">Funcionais</p>
                    <p className="text-sm text-muted-foreground">Melhoram a experiência do usuário</p>
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">Ajudam a entender como você usa o site</p>
                  </div>
                  <div>
                    <p className="font-medium">Marketing</p>
                    <p className="text-sm text-muted-foreground">Personalizam anúncios e conteúdo</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                </p>
              </CardContent>
            </Card>

            {/* User Rights */}
            <Card id="direitos">
              <CardHeader>
                <CardTitle>6. Seus Direitos (LGPD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Acesso</p>
                      <p className="text-sm text-muted-foreground">Ver quais dados temos sobre você</p>
                    </div>
                    <div>
                      <p className="font-medium">Correção</p>
                      <p className="text-sm text-muted-foreground">Corrigir dados incompletos ou incorretos</p>
                    </div>
                    <div>
                      <p className="font-medium">Exclusão</p>
                      <p className="text-sm text-muted-foreground">Solicitar a remoção de seus dados</p>
                    </div>
                    <div>
                      <p className="font-medium">Portabilidade</p>
                      <p className="text-sm text-muted-foreground">Transferir dados para outro fornecedor</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">Oposição</p>
                      <p className="text-sm text-muted-foreground">Opor-se ao processamento de dados</p>
                    </div>
                    <div>
                      <p className="font-medium">Limitação</p>
                      <p className="text-sm text-muted-foreground">Limitar o processamento</p>
                    </div>
                    <div>
                      <p className="font-medium">Informação</p>
                      <p className="text-sm text-muted-foreground">Saber como seus dados são usados</p>
                    </div>
                    <div>
                      <p className="font-medium">Revogação</p>
                      <p className="text-sm text-muted-foreground">Retirar consentimento a qualquer momento</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="font-medium">Para exercer seus direitos:</p>
                  <p className="text-sm mt-1">
                    Entre em contato conosco através do e-mail: <strong>privacidade@doutorizze.com.br</strong> 
                    ou através das configurações da sua conta.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Children */}
            <Card id="criancas">
              <CardHeader>
                <CardTitle>7. Menores de Idade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Nossos serviços não são direcionados a menores de 13 anos. Não coletamos 
                  intencionalmente informações pessoais de crianças menores de 13 anos.
                </p>
                <p className="leading-relaxed">
                  Para usuários entre 13 e 18 anos, é necessário o consentimento dos pais 
                  ou responsáveis legais. Se tomarmos conhecimento de que coletamos dados 
                  de uma criança menor de 13 anos, tomaremos medidas para excluir essas 
                  informações o mais rápido possível.
                </p>
              </CardContent>
            </Card>

            {/* Changes */}
            <Card id="alteracoes">
              <CardHeader>
                <CardTitle>8. Alterações nesta Política</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Podemos atualizar nossa Política de Privacidade periodicamente. Quando 
                  fizermos alterações, notificaremos você através de:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Aviso em nossa plataforma</li>
                  <li>E-mail para usuários registrados</li>
                  <li>Notificação push (se habilitada)</li>
                </ul>
                <p className="leading-relaxed">
                  Recomendamos que você revise esta política periodicamente para se manter 
                  informado sobre como protegemos suas informações.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como 
                  tratamos seus dados pessoais, entre em contato conosco:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">E-mail:</p>
                    <p className="text-primary">privacidade@doutorizze.com.br</p>
                  </div>
                  <div>
                    <p className="font-medium">Telefone:</p>
                    <p>(11) 0800-123-4567</p>
                  </div>
                  <div>
                    <p className="font-medium">Endereço:</p>
                    <p className="text-sm">
                      Av. Paulista, 1000<br />
                      Bela Vista, São Paulo - SP<br />
                      CEP: 01310-100
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">DPO (Encarregado):</p>
                    <p className="text-primary">dpo@doutorizze.com.br</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Termos de Uso
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button>
                Aceito e Entendo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}