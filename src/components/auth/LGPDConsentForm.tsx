import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Bell, Cookie } from 'lucide-react';

interface LGPDConsentFormProps {
  onConsentsChange: (consents: {
    privacy_policy: boolean;
    terms_of_service: boolean;
    data_processing: boolean;
    marketing: boolean;
    cookies: boolean;
  }) => void;
  userType: 'patient' | 'clinic';
}

export function LGPDConsentForm({ onConsentsChange, userType }: LGPDConsentFormProps) {
  const [consents, setConsents] = useState({
    privacy_policy: false,
    terms_of_service: false,
    data_processing: false,
    marketing: false,
    cookies: false
  });

  const handleConsentChange = (type: keyof typeof consents, value: boolean) => {
    const newConsents = { ...consents, [type]: value };
    setConsents(newConsents);
    onConsentsChange(newConsents);
  };

  const isRequiredConsentGiven = consents.privacy_policy && consents.terms_of_service && consents.data_processing;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2 text-primary" />
          Proteção de Dados (LGPD)
        </CardTitle>
        <CardDescription>
          Para {userType === 'patient' ? 'pacientes' : 'clínicas'}, precisamos do seu consentimento para processar seus dados pessoais conforme a Lei Geral de Proteção de Dados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Seus dados são protegidos por criptografia e usados apenas para os fins descritos em nossa política de privacidade.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Consentimentos Obrigatórios *</h4>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy_policy"
              checked={consents.privacy_policy}
              onCheckedChange={(checked) => handleConsentChange('privacy_policy', !!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="privacy_policy"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Política de Privacidade *
              </label>
              <p className="text-xs text-muted-foreground">
                Li e aceito a política de privacidade do Doutorizze.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms_of_service"
              checked={consents.terms_of_service}
              onCheckedChange={(checked) => handleConsentChange('terms_of_service', !!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms_of_service"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Termos de Serviço *
              </label>
              <p className="text-xs text-muted-foreground">
                Concordo com os termos de uso da plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="data_processing"
              checked={consents.data_processing}
              onCheckedChange={(checked) => handleConsentChange('data_processing', !!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="data_processing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Processamento de Dados *
              </label>
              <p className="text-xs text-muted-foreground">
                Autorizo o processamento dos meus dados pessoais para {userType === 'patient' ? 'agendamento de consultas e histórico médico' : 'gestão da clínica e atendimento aos pacientes'}.
              </p>
            </div>
          </div>

          <Separator />

          <h4 className="font-semibold text-sm">Consentimentos Opcionais</h4>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={consents.marketing}
              onCheckedChange={(checked) => handleConsentChange('marketing', !!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="marketing"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center"
              >
                <Bell className="w-3 h-3 mr-1" />
                Comunicações de Marketing
              </label>
              <p className="text-xs text-muted-foreground">
                Receber ofertas, promoções e novidades por email ou SMS.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="cookies"
              checked={consents.cookies}
              onCheckedChange={(checked) => handleConsentChange('cookies', !!checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="cookies"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center"
              >
                <Cookie className="w-3 h-3 mr-1" />
                Cookies de Preferências
              </label>
              <p className="text-xs text-muted-foreground">
                Usar cookies para melhorar a experiência e personalizar conteúdo.
              </p>
            </div>
          </div>
        </div>

        {!isRequiredConsentGiven && (
          <Alert variant="destructive">
            <AlertDescription>
              Os consentimentos marcados com * são obrigatórios para prosseguir.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Seus Direitos:</strong> Você pode a qualquer momento acessar, corrigir, excluir ou solicitar a portabilidade dos seus dados.
          </p>
          <p>
            <strong>Contato DPO:</strong> dpo@doutorizze.com.br
          </p>
        </div>
      </CardContent>
    </Card>
  );
}