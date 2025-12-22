import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipos para edição de valores
interface CreditRequestEdit {
  id: string;
  originalAmount: number;
  clinicApprovedAmount?: number;
  clinicNotes?: string;
  editedByClinic: boolean;
  clinicEditDate?: string;
}

// Tipos para cálculos
interface ValueCalculation {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  effectiveRate: number;
}

// Tipos para rascunhos
interface EditDraft {
  id: string;
  creditRequestId: string;
  clinicId: string;
  draftAmount: number;
  draftNotes: string;
  savedAt: string;
  isActive: boolean;
}

interface EditValuesData {
  newAmount: number;
}

/**
 * Hook para gerenciar edição de valores de solicitações de crédito
 * Conforme especificação da documentação técnica
 */
export const useEditValues = (creditRequestId: string) => {
  const [editData, setEditData] = useState<CreditRequestEdit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calculations, setCalculations] = useState<ValueCalculation | null>(null);
  const [activeDraft, setActiveDraft] = useState<EditDraft | null>(null);

  /**
   * Carrega os dados da solicitação de crédito para edição
   */
  const loadEditData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: creditRequest, error } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('id', creditRequestId)
        .single();

      if (error) throw error;

      if (creditRequest) {
        const editData: CreditRequestEdit = {
          id: creditRequest.id,
          originalAmount: creditRequest.requested_amount,
          clinicApprovedAmount: creditRequest.clinic_approved_amount,
          clinicNotes: creditRequest.clinic_notes,
          editedByClinic: creditRequest.edited_by_clinic || false,
          clinicEditDate: creditRequest.clinic_edit_date
        };

        setEditData(editData);

        // Carregar rascunho ativo se existir
        await loadActiveDraft();
      }
    } catch (error) {
      console.error('Erro ao carregar dados para edição:', error);
      toast.error('Erro ao carregar dados da solicitação');
    } finally {
      setIsLoading(false);
    }
  }, [creditRequestId]);

  /**
   * Carrega o rascunho ativo para a solicitação
   */
  const loadActiveDraft = useCallback(async () => {
    if (!creditRequestId) {
      console.log('⚠️ loadActiveDraft: creditRequestId não definido');
      return;
    }

    try {
      console.log('🔍 INICIANDO loadActiveDraft para creditRequestId:', creditRequestId);
      
      const { data: draft, error } = await supabase
        .from('edit_drafts')
        .select('*')
        .eq('credit_request_id', creditRequestId)
        .eq('is_active', true)
        .order('saved_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('🔍 Resultado da busca do rascunho ativo:', { draft, error });

      if (error) {
        console.error('❌ Erro ao carregar rascunho ativo:', error);
        return;
      }

      if (draft) {
        console.log('✅ RASCUNHO ATIVO ENCONTRADO:', draft);
        const activeDraftData: EditDraft = {
          id: draft.id,
          creditRequestId: draft.credit_request_id,
          clinicId: draft.clinic_id,
          draftAmount: draft.draft_amount,
          draftInstallments: draft.draft_installments || 0,
          draftRate: draft.draft_rate || 0,
          draftNotes: draft.draft_notes || '',
          draftConditions: draft.draft_conditions || '',
          savedAt: draft.saved_at,
          isActive: draft.is_active
        };
        
        console.log('🎯 SETANDO ACTIVE DRAFT:', activeDraftData);
        setActiveDraft(activeDraftData);
      } else {
        console.log('ℹ️ Nenhum rascunho ativo encontrado');
        setActiveDraft(null);
      }
    } catch (error) {
      console.error('💥 ERRO CRÍTICO em loadActiveDraft:', error);
      setActiveDraft(null);
    }
  }, [creditRequestId]);

  /**
   * Calcula valores conforme especificação da documentação
   */
  const calculateValues = useCallback((amount: number, installments: number, rate: number): ValueCalculation => {
    if (rate === 0) {
      const monthlyPayment = amount / installments;
      return {
        monthlyPayment,
        totalAmount: amount,
        totalInterest: 0,
        effectiveRate: 0
      };
    }
    
    const monthlyRate = rate / 100;
    const factor = Math.pow(1 + monthlyRate, installments);
    const monthlyPayment = (amount * monthlyRate * factor) / (factor - 1);
    const totalAmount = monthlyPayment * installments;
    const totalInterest = totalAmount - amount;
    
    return {
      monthlyPayment,
      totalAmount,
      totalInterest,
      effectiveRate: rate
    };
  }, []);

  /**
   * Salva alterações como rascunho
   */
  const saveDraft = useCallback(async (values: EditValuesData): Promise<{ success: boolean; draftId?: string; updatedCreditRequest?: any; activeDraft?: EditDraft }> => {
    try {
      console.log('🚀 [saveDraft] INICIANDO saveDraft com valores:', values);
      setIsLoading(true);

      // Buscar dados da solicitação diretamente do banco
      console.log('📋 [saveDraft] Buscando dados da solicitação:', creditRequestId);
      const { data: creditRequest, error: creditError } = await supabase
        .from('credit_requests')
        .select('clinic_id, requested_amount')
        .eq('id', creditRequestId)
        .single();

      console.log('📋 [saveDraft] Resultado da busca:', { creditRequest, creditError });

      if (creditError) {
        console.error('❌ [saveDraft] Erro ao buscar dados da solicitação:', creditError);
        throw new Error(`Erro ao buscar dados da solicitação: ${creditError.message}`);
      }

      if (!creditRequest) {
        console.error('❌ [saveDraft] Solicitação de crédito não encontrada');
        throw new Error('Solicitação de crédito não encontrada');
      }

      console.log('✅ [saveDraft] Dados da solicitação encontrados:', creditRequest);

      // Desativar rascunhos antigos
      console.log('🔄 [saveDraft] Desativando rascunhos antigos...');
      const { error: deactivateError } = await supabase
        .from('edit_drafts')
        .update({ is_active: false })
        .eq('credit_request_id', creditRequestId)
        .eq('is_active', true);

      if (deactivateError) {
        console.error('❌ [saveDraft] Erro ao desativar rascunhos antigos:', deactivateError);
      } else {
        console.log('✅ [saveDraft] Rascunhos antigos desativados');
      }

      // Criar novo rascunho
      console.log('💾 [saveDraft] Criando novo rascunho...');
      const draftData = {
        credit_request_id: creditRequestId,
        clinic_id: creditRequest.clinic_id,
        draft_amount: values.newAmount,
        draft_notes: '',
        is_active: true
      };
      
      console.log('💾 [saveDraft] Dados do rascunho a ser inserido:', draftData);

      const { data: newDraft, error } = await supabase
        .from('edit_drafts')
        .insert(draftData)
        .select()
        .single();

      console.log('💾 [saveDraft] Resultado da inserção:', { newDraft, error });

      if (error) {
        console.error('❌ [saveDraft] Erro detalhado ao salvar rascunho:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao salvar rascunho: ${error.message}`);
      }

      if (!newDraft) {
        console.error('❌ [saveDraft] Rascunho não foi criado (newDraft é null)');
        throw new Error('Rascunho não foi criado');
      }

      console.log('🎯 [saveDraft] RASCUNHO CRIADO NO BANCO:', newDraft);

      // Criar objeto do rascunho ativo IMEDIATAMENTE
      const activeDraftData: EditDraft = {
        id: newDraft.id,
        creditRequestId: newDraft.credit_request_id,
        clinicId: newDraft.clinic_id,
        draftAmount: newDraft.draft_amount,
        draftInstallments: newDraft.draft_installments || 0,
        draftRate: newDraft.draft_rate || 0,
        draftNotes: newDraft.draft_notes || '',
        draftConditions: newDraft.draft_conditions || '',
        savedAt: newDraft.saved_at,
        isActive: newDraft.is_active
      };

      // FORÇAR atualização do estado local IMEDIATAMENTE
      console.log('🔥 [saveDraft] FORÇANDO ATUALIZAÇÃO DO ESTADO:', activeDraftData);
      setActiveDraft(activeDraftData);

      // Também carregar do banco para garantir
      console.log('🔄 [saveDraft] Recarregando rascunho ativo...');
      await loadActiveDraft();

      // Buscar dados atualizados da solicitação para retornar
      console.log('📋 [saveDraft] Buscando dados atualizados da solicitação...');
      const { data: updatedCreditRequest, error: updateError } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('id', creditRequestId)
        .single();

      if (updateError) {
        console.error('❌ [saveDraft] Erro ao buscar dados atualizados:', updateError);
      } else {
        console.log('✅ [saveDraft] Dados atualizados obtidos');
      }

      console.log('✅ [saveDraft] RETORNANDO RESULTADO COM RASCUNHO:', activeDraftData);

      return { 
        success: true, 
        draftId: newDraft.id,
        updatedCreditRequest: updatedCreditRequest || null,
        activeDraft: activeDraftData
      };
    } catch (error) {
      console.error('💥 [saveDraft] ERRO CRÍTICO no saveDraft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar rascunho';
      console.error('💥 [saveDraft] Mensagem de erro:', errorMessage);
      toast.error(`Erro ao salvar rascunho: ${errorMessage}`);
      return { success: false };
    } finally {
      console.log('🏁 [saveDraft] Finalizando saveDraft, setIsLoading(false)');
      setIsLoading(false);
    }
  }, [creditRequestId, loadActiveDraft]);

  /**
   * Submete alterações para aprovação do admin
   */
  const submitToAdmin = useCallback(async (values: EditValuesData): Promise<{ success: boolean; newStatus?: string; submissionId?: string }> => {
    try {
      setIsLoading(true);

      if (!editData) {
        throw new Error('Dados de edição não carregados');
      }

      // Atualizar a solicitação de crédito - apenas o valor
      const { error: updateError } = await supabase
        .from('credit_requests')
        .update({
          clinic_notes: `Valor editado para R$ ${values.newAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          status: 'admin_review'
        })
        .eq('id', creditRequestId);

      if (updateError) throw updateError;

      // Registrar no histórico apenas a mudança de valor
      if (values.newAmount !== editData.originalAmount) {
        const { error: historyError } = await supabase
          .from('credit_request_history')
          .insert({
            credit_request_id: creditRequestId,
            field_name: 'clinic_approved_amount',
            old_value: editData.originalAmount.toString(),
            new_value: values.newAmount.toString(),
            change_reason: 'Edição de valor pela clínica'
          });

        if (historyError) {
          console.error('Erro ao salvar histórico:', historyError);
        }
      }

      // Desativar rascunhos
      await supabase
        .from('edit_drafts')
        .update({ is_active: false })
        .eq('credit_request_id', creditRequestId);

      // Atualizar estado local
      await loadEditData();

      toast.success('Solicitação enviada para aprovação do administrador!');
      return { 
        success: true, 
        newStatus: 'Aguardando Admin',
        submissionId: creditRequestId 
      };
    } catch (error) {
      console.error('Erro ao enviar para admin:', error);
      toast.error('Erro ao enviar solicitação');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [creditRequestId, editData, loadEditData]);

  /**
   * Deleta um rascunho específico
   */
  const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('edit_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      await loadActiveDraft();
      toast.success('Rascunho removido com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao deletar rascunho:', error);
      toast.error('Erro ao remover rascunho');
      return false;
    }
  }, [loadActiveDraft]);

  return {
    // Estados
    editData,
    isLoading,
    calculations,
    activeDraft,
    
    // Funções
    loadEditData,
    saveDraft,
    submitToAdmin,
    calculateValues,
    deleteDraft,
    loadActiveDraft
  };
};