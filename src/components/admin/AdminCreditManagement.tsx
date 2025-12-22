import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  CreditCard, 
  DollarSign, 
  Percent, 
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GlobalCreditSettings {
  system_active: boolean;
  max_amount: number;
  min_amount: number;
  max_installments: number;
  interest_rate: number;
  approval_limit: number;
}

export function AdminCreditManagement() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GlobalCreditSettings>({
    system_active: true,
    max_amount: 99999,
    min_amount: 100,
    max_installments: 48,
    interest_rate: 2.5,
    approval_limit: 10000
  });
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Aqui seria a chamada para salvar no banco de dados
      // await updateGlobalCreditSettings(settings);
      
      toast({
        title: 'Configurações salvas',
        description: 'As configurações globais do sistema de crédito foram atualizadas com sucesso.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Crédito</h1>
          <p className="text-muted-foreground">
            Configure as regras globais do sistema de crédito odontológico
          </p>
        </div>
        <Badge variant={settings.system_active ? "default" : "secondary"}>
          {settings.system_active ? "Sistema Ativo" : "Sistema Inativo"}
        </Badge>
      </div>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações Globais do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status do Sistema */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Sistema de Crédito</Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar o sistema de crédito para todas as clínicas
              </p>
            </div>
            <Switch
              checked={settings.system_active}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, system_active: checked }))
              }
            />
          </div>

          <Separator />

          {/* Limites de Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="min_amount" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Valor Mínimo
              </Label>
              <Input
                id="min_amount"
                type="number"
                value={settings.min_amount}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, min_amount: Number(e.target.value) }))
                }
                min="1"
                max="999999"
              />
              <p className="text-xs text-muted-foreground">
                Valor mínimo para solicitação de crédito
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_amount" className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Valor Máximo
              </Label>
              <Input
                id="max_amount"
                type="number"
                value={settings.max_amount}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, max_amount: Number(e.target.value) }))
                }
                min="1"
                max="999999"
              />
              <p className="text-xs text-muted-foreground">
                Valor máximo para solicitação de crédito
              </p>
            </div>
          </div>

          {/* Configurações de Parcelamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max_installments" className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Parcelas Máximas
              </Label>
              <Input
                id="max_installments"
                type="number"
                value={settings.max_installments}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, max_installments: Number(e.target.value) }))
                }
                min="1"
                max="60"
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de parcelas permitidas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest_rate" className="flex items-center">
                <Percent className="h-4 w-4 mr-1" />
                Taxa de Juros (% a.m.)
              </Label>
              <Input
                id="interest_rate"
                type="number"
                step="0.1"
                value={settings.interest_rate}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, interest_rate: Number(e.target.value) }))
                }
                min="0"
                max="10"
              />
              <p className="text-xs text-muted-foreground">
                Taxa de juros mensal aplicada ao crédito
              </p>
            </div>
          </div>

          {/* Limite de Aprovação Automática */}
          <div className="space-y-2">
            <Label htmlFor="approval_limit" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Limite de Aprovação Automática
            </Label>
            <Input
              id="approval_limit"
              type="number"
              value={settings.approval_limit}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, approval_limit: Number(e.target.value) }))
              }
              min="0"
              max={settings.max_amount}
            />
            <p className="text-xs text-muted-foreground">
              Valores até este limite são aprovados automaticamente
            </p>
          </div>

          <Separator />

          {/* Resumo das Configurações */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Resumo das Configurações
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Faixa de valores:</span>
                <p className="font-medium">
                  {formatCurrency(settings.min_amount)} - {formatCurrency(settings.max_amount)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Parcelamento:</span>
                <p className="font-medium">Até {settings.max_installments}x</p>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de juros:</span>
                <p className="font-medium">{settings.interest_rate}% a.m.</p>
              </div>
              <div>
                <span className="text-muted-foreground">Aprovação automática:</span>
                <p className="font-medium">Até {formatCurrency(settings.approval_limit)}</p>
              </div>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações Importantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-amber-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              • As configurações definidas aqui se aplicam a <strong>todas as clínicas</strong> do sistema.
            </p>
            <p>
              • Clínicas podem apenas visualizar solicitações e gerenciar aprovações/rejeições individuais.
            </p>
            <p>
              • Alterações nas configurações afetam apenas <strong>novas solicitações</strong> de crédito.
            </p>
            <p>
              • O limite de aprovação automática deve ser menor ou igual ao valor máximo permitido.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}