import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
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
import { toast } from 'sonner';
import { Save, DollarSign, Loader2 } from 'lucide-react';

const formatBrazilianCurrency = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const parseBrazilianCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return 0;
  }
  
  // Remove tudo exceto dígitos, vírgulas e pontos
  let cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Se não tem vírgula nem ponto, é um número inteiro
  if (!cleanValue.includes(',') && !cleanValue.includes('.')) {
    return parseFloat(cleanValue) || 0;
  }
  
  // Se tem vírgula, é formato brasileiro (1.234,56)
  if (cleanValue.includes(',')) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  // Se tem apenas ponto, verifica se é separador de milhares ou decimal
  else if (cleanValue.includes('.')) {
    const parts = cleanValue.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // É decimal (1234.56)
      cleanValue = cleanValue;
    } else {
      // É separador de milhares (1.234)
      cleanValue = cleanValue.replace(/\./g, '');
    }
  }
  
  return parseFloat(cleanValue) || 0;
};

const EditValuesSchema = z.object({
  newAmount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      const numValue = parseBrazilianCurrency(val);
      return !isNaN(numValue) && numValue > 0;
    }, 'Formato inválido. Use formato brasileiro (ex: 1.000,00)')
    .transform((val) => parseBrazilianCurrency(val))
    .refine((val) => val >= 100, 'Valor mínimo é R$ 100,00')
    .refine((val) => val <= 99999, 'Valor máximo é R$ 99.999,00')
});

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

interface EditValueModalSimpleProps {
  creditRequest: CreditRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCreditRequestUpdate?: (updatedCreditRequest: CreditRequest) => void;
}

export function EditValueModalSimple({ 
  creditRequest, 
  open, 
  onOpenChange, 
  onSuccess,
  onCreditRequestUpdate
}: EditValueModalSimpleProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastProcessedValue, setLastProcessedValue] = useState('');

  const form = useForm({
    resolver: zodResolver(EditValuesSchema),
    defaultValues: {
      newAmount: ''
    }
  });

  // Inicializar valor quando o modal abrir
  useEffect(() => {
    if (open && creditRequest) {
      console.log('🔄 [EditValueModalSimple] Modal aberto, inicializando valor...');
      
      // Resetar estado quando abrir
      setHasUnsavedChanges(false);
      
      // Primeiro, tentar carregar rascunho ativo
      loadActiveDraft();
    } else if (!open) {
      // Limpar estado quando fechar
      setInputValue('');
      setHasUnsavedChanges(false);
      setLastProcessedValue('');
    }
  }, [open, creditRequest?.id]);

  const loadActiveDraft = async () => {
    if (!creditRequest?.id) return;

    console.log('🔍 [EditValueModalSimple] Carregando rascunho ativo para:', creditRequest.id);

    try {
      const { data: draft, error } = await supabase
        .from('edit_drafts')
        .select('*')
        .eq('credit_request_id', creditRequest.id)
        .eq('is_active', true)
        .order('saved_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [EditValueModalSimple] Erro ao carregar rascunho:', error);
        // Se der erro, usar valor original
        const originalValue = formatBrazilianCurrency(creditRequest.requested_amount);
        setInputValue(originalValue);
        form.setValue('newAmount', originalValue);
        return;
      }

      if (draft) {
        console.log('✅ [EditValueModalSimple] Rascunho encontrado:', draft);
        const draftValue = formatBrazilianCurrency(draft.draft_amount);
        setInputValue(draftValue);
        form.setValue('newAmount', draftValue);
      } else {
        console.log('ℹ️ [EditValueModalSimple] Nenhum rascunho, usando valor original');
        const originalValue = formatBrazilianCurrency(creditRequest.requested_amount);
        setInputValue(originalValue);
        form.setValue('newAmount', originalValue);
      }
    } catch (error) {
      console.error('💥 [EditValueModalSimple] Erro crítico:', error);
      // Fallback para valor original
      const originalValue = formatBrazilianCurrency(creditRequest.requested_amount);
      setInputValue(originalValue);
      form.setValue('newAmount', originalValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalInput = e.target.value;
    
    // PROTEÇÃO CONTRA DUPLICAÇÃO: Se o valor é igual ao último processado, ignora
    if (originalInput === lastProcessedValue) {
      console.log('🛡️ [PROTEÇÃO] Ignorando evento duplicado:', originalInput);
      return;
    }
    
    let value = originalInput;
    
    console.log('💰 [EditValueModalSimple] handleInputChange:', {
      originalInput,
      currentInputValue: inputValue,
      lastProcessedValue,
      timestamp: new Date().toISOString()
    });
    
    // Remove caracteres não numéricos exceto vírgula
    value = value.replace(/[^\d,]/g, '');
    
    // Se está vazio, permite
    if (!value) {
      setInputValue('');
      form.setValue('newAmount', '');
      setHasUnsavedChanges(true);
      setLastProcessedValue(originalInput);
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
    
    console.log('💰 [EditValueModalSimple] Valor formatado:', {
      originalInput,
      finalValue: value,
      integerLength: parts[0]?.replace(/\./g, '').length || 0
    });
    
    setInputValue(value);
    form.setValue('newAmount', value);
    setHasUnsavedChanges(true);
    setLastProcessedValue(originalInput);
  };

  const handleSave = async () => {
    if (!creditRequest) return;

    console.log('🚀 [EditValueModalSimple] INICIANDO SALVAMENTO:', {
      inputValue,
      creditRequestId: creditRequest.id
    });

    const validation = EditValuesSchema.safeParse({ newAmount: inputValue });
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Valor inválido';
      console.error('❌ [EditValueModalSimple] VALIDAÇÃO FALHOU:', validation.error);
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);

    try {
      console.log('✅ [EditValueModalSimple] VALIDAÇÃO OK - Salvando valor:', validation.data.newAmount);

      // Buscar dados da clínica
      const { data: creditData, error: creditError } = await supabase
        .from('credit_requests')
        .select('clinic_id')
        .eq('id', creditRequest.id)
        .single();

      if (creditError) {
        throw new Error(`Erro ao buscar dados: ${creditError.message}`);
      }

      // Desativar rascunhos antigos
      console.log('🔄 [EditValueModalSimple] Desativando rascunhos antigos...');
      await supabase
        .from('edit_drafts')
        .update({ is_active: false })
        .eq('credit_request_id', creditRequest.id)
        .eq('is_active', true);

      // Criar novo rascunho
      console.log('💾 [EditValueModalSimple] Criando novo rascunho...');
      const { data: newDraft, error: insertError } = await supabase
        .from('edit_drafts')
        .insert({
          credit_request_id: creditRequest.id,
          clinic_id: creditData.clinic_id,
          draft_amount: validation.data.newAmount,
          draft_notes: '',
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao salvar: ${insertError.message}`);
      }

      console.log('✅ [EditValueModalSimple] RASCUNHO SALVO COM SUCESSO!', newDraft);

      // ATUALIZAR TAMBÉM A TABELA PRINCIPAL credit_requests.requested_amount
      console.log('🔄 [EditValueModalSimple] Atualizando tabela principal credit_requests...');
      
      // Buscar a descrição atual para extrair profissão e renda
      const { data: currentRequest, error: fetchError } = await supabase
        .from('credit_requests')
        .select('treatment_description')
        .eq('id', creditRequest.id)
        .single();

      if (fetchError) {
        console.error('❌ [EditValueModalSimple] ERRO ao buscar descrição atual:', fetchError);
      }

      // Extrair profissão e renda da descrição atual
      let profession = 'acessor';
      let income = '5000';
      
      if (currentRequest?.treatment_description) {
        const professionMatch = currentRequest.treatment_description.match(/Profissão:\s*([^-]+)/);
        const incomeMatch = currentRequest.treatment_description.match(/Renda:\s*([^$]*)/);
        
        if (professionMatch) profession = professionMatch[1].trim();
        if (incomeMatch) income = incomeMatch[1].trim();
      }

      // Criar nova descrição com valor atualizado
      const newTreatmentDescription = `Tratamento odontológico - Valor: R$ ${formatBrazilianCurrency(validation.data.newAmount)} - Profissão: ${profession} - Renda: ${income}`;

      const { error: updateCreditError } = await supabase
        .from('credit_requests')
        .update({ 
          requested_amount: validation.data.newAmount,
          treatment_description: newTreatmentDescription,
          updated_at: new Date().toISOString()
        })
        .eq('id', creditRequest.id);

      if (updateCreditError) {
        console.error('❌ [EditValueModalSimple] ERRO ao atualizar credit_requests:', updateCreditError);
        throw new Error(`Erro ao atualizar valor principal: ${updateCreditError.message}`);
      }

      console.log('✅ [EditValueModalSimple] TABELA PRINCIPAL ATUALIZADA COM SUCESSO!');

      // Atualizar o valor na tela IMEDIATAMENTE com o valor salvo no banco
      const savedAmount = newDraft.draft_amount;
      const formattedValue = formatBrazilianCurrency(savedAmount);
      
      console.log('🔄 [EditValueModalSimple] Atualizando interface com valor salvo:', {
        savedAmount,
        formattedValue,
        inputValueAntes: inputValue
      });
      
      // Forçar atualização do estado
      setInputValue(formattedValue);
      form.setValue('newAmount', formattedValue);
      setHasUnsavedChanges(false);

      console.log('✅ [EditValueModalSimple] Interface atualizada com sucesso!');

      toast.success('Valor salvo com sucesso! Tabela principal atualizada.');

      // Chamar callbacks se existirem
      if (onCreditRequestUpdate) {
        const updatedRequest = { ...creditRequest, requested_amount: validation.data.newAmount, clinic_approved_amount: validation.data.newAmount };
        onCreditRequestUpdate(updatedRequest);
      }

      // Chamar onSuccess para atualizar o dashboard
      if (onSuccess) {
        console.log('🔄 [EditValueModalSimple] Chamando onSuccess para atualizar dashboard...');
        onSuccess();
      }

    } catch (error) {
      console.error('❌ [EditValueModalSimple] ERRO AO SALVAR:', error);
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!creditRequest) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Editar Valor da Solicitação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da Solicitação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Paciente:</span>
                <span>{creditRequest.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Valor Original:</span>
                <span className="font-mono">{formatBrazilianCurrency(creditRequest.requested_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Parcelas:</span>
                <span>{creditRequest.installments}x</span>
              </div>
            </CardContent>
          </Card>

          {/* Edição do Valor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newAmount">Novo Valor Aprovado</Label>
              <Input
                id="newAmount"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ex: 10.500,00"
                className="text-lg font-mono"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {hasUnsavedChanges && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('🔄 [EditValueModalSimple] Cancelando alterações...');
                    // Recarregar valor do rascunho ativo
                    loadActiveDraft();
                    setHasUnsavedChanges(false);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <span>↺</span>
                  Cancelar Alterações
                </Button>
              )}
              
              <Button 
                onClick={handleSave}
                disabled={isLoading || !hasUnsavedChanges}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Rascunho
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}