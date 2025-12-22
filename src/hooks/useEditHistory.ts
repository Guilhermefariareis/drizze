import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipos para histórico de edições
interface EditHistory {
  id: string;
  creditRequestId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeReason: string;
  changedAt: string;
  changedBy?: string;
}

// Tipos para filtros de histórico
interface HistoryFilters {
  fieldName?: string;
  dateFrom?: string;
  dateTo?: string;
  changeReason?: string;
}

// Tipos para estatísticas do histórico
interface HistoryStats {
  totalChanges: number;
  fieldChanges: Record<string, number>;
  recentChanges: EditHistory[];
  mostChangedField: string;
}

/**
 * Hook para gerenciar histórico de alterações de solicitações de crédito
 * Conforme especificação da documentação técnica
 */
export const useEditHistory = (creditRequestId?: string) => {
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({});

  /**
   * Carrega o histórico de alterações
   */
  const loadHistory = useCallback(async (requestId?: string, historyFilters?: HistoryFilters) => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('credit_request_history')
        .select('*')
        .order('changed_at', { ascending: false });

      // Filtrar por solicitação específica se fornecida
      if (requestId || creditRequestId) {
        query = query.eq('credit_request_id', requestId || creditRequestId);
      }

      // Aplicar filtros adicionais
      const currentFilters = historyFilters || filters;
      
      if (currentFilters.fieldName) {
        query = query.eq('field_name', currentFilters.fieldName);
      }

      if (currentFilters.dateFrom) {
        query = query.gte('changed_at', currentFilters.dateFrom);
      }

      if (currentFilters.dateTo) {
        query = query.lte('changed_at', currentFilters.dateTo);
      }

      if (currentFilters.changeReason) {
        query = query.ilike('change_reason', `%${currentFilters.changeReason}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const historyData: EditHistory[] = (data || []).map(item => ({
        id: item.id,
        creditRequestId: item.credit_request_id,
        fieldName: item.field_name,
        oldValue: item.old_value,
        newValue: item.new_value,
        changeReason: item.change_reason,
        changedAt: item.changed_at,
        changedBy: item.changed_by
      }));

      setHistory(historyData);
      
      // Calcular estatísticas se for para uma solicitação específica
      if (requestId || creditRequestId) {
        calculateStats(historyData);
      }

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de alterações');
    } finally {
      setIsLoading(false);
    }
  }, [creditRequestId, filters]);

  /**
   * Calcula estatísticas do histórico
   */
  const calculateStats = useCallback((historyData: EditHistory[]) => {
    const totalChanges = historyData.length;
    
    // Contar alterações por campo
    const fieldChanges: Record<string, number> = {};
    historyData.forEach(item => {
      fieldChanges[item.fieldName] = (fieldChanges[item.fieldName] || 0) + 1;
    });

    // Encontrar campo mais alterado
    const mostChangedField = Object.entries(fieldChanges)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Pegar alterações recentes (últimas 5)
    const recentChanges = historyData.slice(0, 5);

    const statsData: HistoryStats = {
      totalChanges,
      fieldChanges,
      recentChanges,
      mostChangedField
    };

    setStats(statsData);
  }, []);

  /**
   * Adiciona uma nova entrada no histórico
   */
  const addHistoryEntry = useCallback(async (
    requestId: string,
    fieldName: string,
    oldValue: string,
    newValue: string,
    changeReason: string,
    changedBy?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('credit_request_history')
        .insert({
          credit_request_id: requestId,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          change_reason: changeReason,
          changed_by: changedBy
        });

      if (error) throw error;

      // Recarregar histórico se estamos visualizando esta solicitação
      if (requestId === creditRequestId) {
        await loadHistory();
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar entrada no histórico:', error);
      toast.error('Erro ao registrar alteração no histórico');
      return false;
    }
  }, [creditRequestId, loadHistory]);

  /**
   * Adiciona múltiplas entradas no histórico (para operações em lote)
   */
  const addMultipleHistoryEntries = useCallback(async (
    entries: Array<{
      requestId: string;
      fieldName: string;
      oldValue: string;
      newValue: string;
      changeReason: string;
      changedBy?: string;
    }>
  ): Promise<boolean> => {
    try {
      const historyEntries = entries.map(entry => ({
        credit_request_id: entry.requestId,
        field_name: entry.fieldName,
        old_value: entry.oldValue,
        new_value: entry.newValue,
        change_reason: entry.changeReason,
        changed_by: entry.changedBy
      }));

      const { error } = await supabase
        .from('credit_request_history')
        .insert(historyEntries);

      if (error) throw error;

      // Recarregar histórico se alguma entrada é da solicitação atual
      const hasCurrentRequest = entries.some(entry => entry.requestId === creditRequestId);
      if (hasCurrentRequest) {
        await loadHistory();
      }

      return true;
    } catch (error) {
      console.error('Erro ao adicionar entradas no histórico:', error);
      toast.error('Erro ao registrar alterações no histórico');
      return false;
    }
  }, [creditRequestId, loadHistory]);

  /**
   * Aplica filtros ao histórico
   */
  const applyFilters = useCallback(async (newFilters: HistoryFilters) => {
    setFilters(newFilters);
    await loadHistory(creditRequestId, newFilters);
  }, [creditRequestId, loadHistory]);

  /**
   * Limpa todos os filtros
   */
  const clearFilters = useCallback(async () => {
    setFilters({});
    await loadHistory(creditRequestId, {});
  }, [creditRequestId, loadHistory]);

  /**
   * Exporta histórico para CSV
   */
  const exportToCSV = useCallback((historyData?: EditHistory[]) => {
    const dataToExport = historyData || history;
    
    if (dataToExport.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = [
      'Data/Hora',
      'Campo Alterado',
      'Valor Anterior',
      'Novo Valor',
      'Motivo da Alteração',
      'Alterado Por'
    ];

    const csvContent = [
      headers.join(','),
      ...dataToExport.map(item => [
        new Date(item.changedAt).toLocaleString('pt-BR'),
        item.fieldName,
        `"${item.oldValue}"`,
        `"${item.newValue}"`,
        `"${item.changeReason}"`,
        item.changedBy || 'Sistema'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_alteracoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Histórico exportado com sucesso!');
  }, [history]);

  /**
   * Formata o nome do campo para exibição
   */
  const formatFieldName = useCallback((fieldName: string): string => {
    const fieldMap: Record<string, string> = {
      'clinic_approved_amount': 'Valor Aprovado pela Clínica',
      'clinic_installments': 'Parcelas da Clínica',
      'clinic_interest_rate': 'Taxa de Juros da Clínica',
      'clinic_notes': 'Observações da Clínica',
      'special_conditions': 'Condições Especiais',
      'status': 'Status',
      'requested_amount': 'Valor Solicitado',
      'installments': 'Parcelas',
      'interest_rate': 'Taxa de Juros'
    };

    return fieldMap[fieldName] || fieldName;
  }, []);

  /**
   * Formata o valor para exibição
   */
  const formatValue = useCallback((fieldName: string, value: string): string => {
    // Campos monetários
    if (fieldName.includes('amount')) {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }

    // Campos de taxa
    if (fieldName.includes('rate')) {
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : `${numValue}%`;
    }

    // Campos de parcelas
    if (fieldName.includes('installments')) {
      return `${value}x`;
    }

    return value;
  }, []);

  // Carregar histórico automaticamente quando o creditRequestId mudar
  useEffect(() => {
    if (creditRequestId) {
      loadHistory();
    }
  }, [creditRequestId, loadHistory]);

  return {
    // Estados
    history,
    isLoading,
    stats,
    filters,
    
    // Funções
    loadHistory,
    addHistoryEntry,
    addMultipleHistoryEntries,
    applyFilters,
    clearFilters,
    exportToCSV,
    formatFieldName,
    formatValue,
    calculateStats
  };
};