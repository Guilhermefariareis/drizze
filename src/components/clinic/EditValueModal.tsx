import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEditValues } from '@/hooks/useEditValues';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Calculator, 
  Save, 
  X, 
  DollarSign, 
  Calendar, 
  Percent,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Função para formatar valor no padrão brasileiro (sem R$, apenas números)
const formatBrazilianCurrency = (value: number): string => {
  console.log('🎯 formatBrazilianCurrency INPUT:', { value, type: typeof value });
  
  if (isNaN(value) || value === null || value === undefined) {
    return '0,00';
  }
  
  // Converte para string com 2 casas decimais
  const formatted = value.toFixed(2);
  
  // Separa parte inteira e decimal
  const [integerPart, decimalPart] = formatted.split('.');
  
  // Adiciona pontos para separar milhares na parte inteira
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retorna no formato brasileiro: 1.234,56
  const result = `${formattedInteger},${decimalPart}`;
  console.log('🎯 formatBrazilianCurrency OUTPUT:', { input: value, result });
  return result;
};

// Função para converter string brasileira para número
const parseBrazilianCurrency = (value: string): number => {
  console.log('🔄 parseBrazilianCurrency INPUT:', { value, type: typeof value });
  
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  // Remove espaços e caracteres não numéricos exceto vírgula e ponto
  let cleanValue = value.trim().replace(/[^\d.,]/g, '');
  
  // Se não tem vírgula nem ponto, é um número inteiro
  if (!cleanValue.includes(',') && !cleanValue.includes('.')) {
    const result = parseFloat(cleanValue) || 0;
    console.log('🔄 parseBrazilianCurrency OUTPUT (integer):', { input: value, cleaned: cleanValue, result });
    return result;
  }
  
  // Se tem vírgula, é formato brasileiro (1.234,56)
  if (cleanValue.includes(',')) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  // Se tem apenas ponto e mais de 2 dígitos após o ponto, é formato americano
  else if (cleanValue.includes('.')) {
    const parts = cleanValue.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // É decimal americano (1234.56)
      cleanValue = cleanValue;
    } else {
      // É separador de milhares brasileiro sem vírgula (1.234)
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  const result = parseFloat(cleanValue) || 0;
  console.log('🔄 parseBrazilianCurrency OUTPUT:', { input: value, cleaned: cleanValue, result });
  return result;
};

// Schema de validação com transformação para formato brasileiro
const EditValuesSchema = z.object({
  newAmount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      // Aceita formato brasileiro: 1.000,00 ou 1000,00 ou 1000
      const brazilianPattern = /^[\d.]*,?\d*$/;
      return brazilianPattern.test(val);
    }, 'Formato inválido. Use formato brasileiro (ex: 1.000,00)')
    .transform((val) => {
      const parsed = parseBrazilianCurrency(val);
      console.log('🔍 Validação:', { input: val, parsed });
      return parsed;
    })
    .refine((val) => !isNaN(val) && val > 0, 'Valor deve ser um número válido')
    .refine((val) => val >= 100, 'Valor mínimo é R$ 100,00')
    .refine((val) => val <= 99999, 'Valor máximo é R$ 99.999,00')
});

type EditValuesForm = z.infer<typeof EditValuesSchema>;

interface CreditRequest {
  id: string;
  patient_id: string;
  clinic_id: string;
  requested_amount: number;
  installments: number;
  interest_rate: number;
  clinic_approved_amount?: number;
  clinic_installments?: number;
  clinic_interest_rate?: number;
  clinic_notes?: string;
  special_conditions?: string;
  edited_by_clinic: boolean;
  status: string;
  patient_name?: string;
}

interface EditValueModalProps {
  creditRequest: CreditRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCreditRequestUpdate?: (updatedCreditRequest: CreditRequest) => void;
}

export function EditValueModal({ 
  creditRequest, 
  open, 
  onOpenChange, 
  onSuccess,
  onCreditRequestUpdate
}: EditValueModalProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Hook para salvar valores
  const { isLoading, saveDraft, loadEditData, activeDraft, loadActiveDraft } = useEditValues(creditRequest?.id || '');

  // LOG CRÍTICO: Monitorar mudanças no activeDraft
  useEffect(() => {
    console.log('🔥 [EditValueModal] MUDANÇA NO ACTIVE DRAFT:', {
      activeDraft,
      creditRequestId: creditRequest?.id,
      open,
      timestamp: new Date().toISOString()
    });
  }, [activeDraft, creditRequest?.id, open]);

  const form = useForm<EditValuesForm>({
    resolver: zodResolver(EditValuesSchema),
    defaultValues: {
      newAmount: ''
    }
  });

  const { formState: { errors } } = form;

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (creditRequest && open) {
      console.log('🚀 [EditValueModal] MODAL ABERTO - Carregando dados...');
      // Carregar dados do hook
      loadEditData();
      // Carregar rascunho ativo
      loadActiveDraft();
    }
  }, [creditRequest, open, loadEditData, loadActiveDraft]);

  // Inicializar valor do input quando rascunho ou creditRequest mudarem
  useEffect(() => {
    if (creditRequest && open) {
      // Usar valor do rascunho se disponível, senão usar valor original
      const currentAmount = activeDraft?.draftAmount || 
                           creditRequest.clinic_approved_amount || 
                           creditRequest.requested_amount;
      
      console.log('🚨 VALORES BRUTOS ANTES DA FORMATAÇÃO:', {
        'activeDraft?.draftAmount': activeDraft?.draftAmount,
        'creditRequest.clinic_approved_amount': creditRequest.clinic_approved_amount,
        'creditRequest.requested_amount': creditRequest.requested_amount,
        'currentAmount (final)': currentAmount,
        'typeof currentAmount': typeof currentAmount
      });
      
      const formattedValue = formatBrazilianCurrency(currentAmount);
      console.log('🎯 INICIALIZANDO VALOR (useEffect):', { 
        activeDraft: activeDraft?.draftAmount, 
        clinic_approved: creditRequest.clinic_approved_amount,
        requested: creditRequest.requested_amount,
        final: currentAmount,
        formatted: formattedValue,
        activeDraftObject: activeDraft
      });
      
      setInputValue(formattedValue);
      form.setValue('newAmount', formattedValue);
      setHasUnsavedChanges(false);
    }
  }, [creditRequest, open, activeDraft, form]);

  // Verificar mudanças não salvas
  useEffect(() => {
    if (!creditRequest) return;
    
    // Usar valor do rascunho se disponível, senão usar valor original
    const currentAmount = activeDraft?.draftAmount || 
                         creditRequest.clinic_approved_amount || 
                         creditRequest.requested_amount;
    const inputNumericValue = parseBrazilianCurrency(inputValue);
    const hasChanges = inputNumericValue !== currentAmount && inputValue !== '';
    setHasUnsavedChanges(hasChanges);
  }, [inputValue, creditRequest, activeDraft]);

  // Renderização condicional baseada na validação de creditRequest
  if (!creditRequest) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os dados da solicitação de crédito.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Função para formatar input enquanto digita (formato brasileiro)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove caracteres não numéricos exceto vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Se está vazio, permite
    if (!value) {
      setInputValue('');
      form.setValue('newAmount', '');
      return;
    }
    
    // Garante apenas uma vírgula
    const parts = value.split(',');
    if (parts.length > 2) {
      value = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limita casas decimais a 2
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    // Adiciona pontos para separar milhares na parte inteira
    if (parts[0]) {
      // Remove pontos existentes antes de adicionar novos
      const integerPart = parts[0].replace(/\./g, '');
      
      // PROTEÇÃO ADICIONAL: Limita a 5 dígitos na parte inteira (99.999)
      if (integerPart.length > 5) {
        console.log('🛡️ [PROTEÇÃO] Limitando dígitos na parte inteira:', integerPart);
        return; // Não permite mais de 5 dígitos
      }
      
      // Adiciona pontos a cada 3 dígitos da direita para esquerda
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      value = formattedInteger + (parts[1] !== undefined ? ',' + parts[1] : '');
    }
    
    console.log('💰 handleInputChange:', { input: e.target.value, formatted: value });
    
    setInputValue(value);
    form.setValue('newAmount', value);
  };

  const handleSave = async () => {
    console.log('🚀 [handleSave] INICIANDO SALVAMENTO:', {
      inputValue,
      creditRequestId: creditRequest?.id,
      activeDraftAntes: activeDraft
    });
    
    const validation = EditValuesSchema.safeParse({ newAmount: inputValue });
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Valor inválido';
      console.error('❌ [handleSave] VALIDAÇÃO FALHOU:', validation.error);
      toast.error(errorMessage);
      return;
    }
    
    console.log('✅ [handleSave] VALIDAÇÃO OK - Salvando rascunho com valor:', validation.data.newAmount);
    
    const result = await saveDraft({ newAmount: validation.data.newAmount });
    
    console.log('📋 [handleSave] RESULTADO DO SAVE DRAFT:', {
      success: result.success,
      draftId: result.draftId,
      activeDraft: result.activeDraft,
      updatedCreditRequest: result.updatedCreditRequest
    });
    
    if (result.success) {
      console.log('✅ [handleSave] RASCUNHO SALVO COM SUCESSO!');
      
      setHasUnsavedChanges(false);
      toast.success('Valor salvo com sucesso!');
      
      // Se temos dados atualizados, atualizar o creditRequest
      if (result.updatedCreditRequest && onCreditRequestUpdate) {
        console.log('🔄 [handleSave] ATUALIZANDO CREDIT REQUEST...');
        onCreditRequestUpdate(result.updatedCreditRequest);
      }
      
      // FORÇAR atualização do inputValue com o valor do rascunho salvo
      if (result.activeDraft) {
        const formattedValue = formatBrazilianCurrency(result.activeDraft.draftAmount);
        console.log('🎯 [handleSave] FORÇANDO ATUALIZAÇÃO DO INPUT:', { 
          draftAmount: result.activeDraft.draftAmount, 
          formattedValue 
        });
        
        // Forçar atualização do estado
        setInputValue(formattedValue);
        form.setValue('newAmount', formattedValue);
        
        // Forçar re-render forçando o useEffect a rodar novamente
        setTimeout(() => {
          console.log('🔄 [handleSave] FORÇANDO RELOAD DO RASCUNHO ATIVO');
          loadActiveDraft();
        }, 100);
      } else {
        console.warn('⚠️ [handleSave] RESULTADO NÃO CONTÉM activeDraft!');
        // Tentar recarregar manualmente
        setTimeout(() => {
          console.log('🔄 [handleSave] TENTANDO RECARREGAR MANUALMENTE...');
          loadActiveDraft();
        }, 200);
      }
      
      // Não fechar o modal automaticamente - deixar o usuário ver a mudança
      // onOpenChange(false);
      // onSuccess?.();
    } else {
      console.error('❌ [handleSave] FALHA AO SALVAR RASCUNHO!');
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0,00%';
    }
    return `${value.toFixed(2).replace('.', ',')}%`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Editar Valor da Solicitação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valores Originais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valores Originais (Solicitação do Paciente)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Valor Solicitado</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{formatCurrency(creditRequest?.requested_amount)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Parcelas</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{creditRequest?.installments || 0}x</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Taxa de Juros</Label>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{formatPercentage(creditRequest?.interest_rate)} a.m.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Novo Valor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Novo Valor (Edição da Clínica)
                </CardTitle>
                {activeDraft && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                    <Save className="h-3 w-3" />
                    Rascunho Salvo
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newAmount">Novo Valor Solicitado *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="newAmount"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    className={`pl-10 ${errors.newAmount ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.newAmount && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.newAmount.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  As parcelas e taxa de juros originais serão mantidas. Apenas o valor será alterado.
                </p>
                <p className="text-xs text-blue-600">
                  Use o formato: 1.234,56 (ponto para milhares, vírgula para decimais)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Você tem alterações não salvas.
              </span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Resetar para o valor do rascunho se disponível, senão valor original
                  const currentAmount = activeDraft?.draftAmount || 
                                       creditRequest.clinic_approved_amount || 
                                       creditRequest.requested_amount;
                  const formattedValue = formatBrazilianCurrency(currentAmount);
                  setInputValue(formattedValue);
                  form.setValue('newAmount', formattedValue);
                  setHasUnsavedChanges(false);
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar Alterações
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                onSuccess?.();
              }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}