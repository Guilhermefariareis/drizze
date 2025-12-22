/**
 * Utilitários para gerenciamento de sessões de chat
 */

const CHAT_SESSION_KEY = 'doutorizze_chat_session';

/**
 * Gera um sessionId único para visitantes anônimos
 * Formato: visitor_[timestamp]_[random]
 */
export function generateUniqueSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `visitor_${timestamp}_${random}`;
}

/**
 * Obtém ou cria um sessionId único para o visitante atual
 * Se já existe no localStorage, retorna o existente
 * Se não existe, cria um novo e salva no localStorage
 */
export function getOrCreateSessionId(): string {
  try {
    // Verificar se já existe um sessionId no localStorage
    const existingSessionId = localStorage.getItem(CHAT_SESSION_KEY);
    
    if (existingSessionId && existingSessionId !== 'anonymous') {
      console.log('📋 [getOrCreateSessionId] SessionId existente encontrado:', existingSessionId);
      return existingSessionId;
    }
    
    // Gerar novo sessionId único
    const newSessionId = generateUniqueSessionId();
    console.log('🆕 [getOrCreateSessionId] Novo sessionId gerado:', newSessionId);
    
    // Salvar no localStorage
    localStorage.setItem(CHAT_SESSION_KEY, newSessionId);
    
    return newSessionId;
  } catch (error) {
    console.error('❌ [getOrCreateSessionId] Erro ao gerenciar sessionId:', error);
    // Fallback: gerar sessionId sem localStorage
    return generateUniqueSessionId();
  }
}

/**
 * Limpa o sessionId atual (usado para forçar nova sessão)
 */
export function clearSessionId(): void {
  try {
    localStorage.removeItem(CHAT_SESSION_KEY);
    console.log('🗑️ [clearSessionId] SessionId removido do localStorage');
  } catch (error) {
    console.error('❌ [clearSessionId] Erro ao limpar sessionId:', error);
  }
}

/**
 * Obtém o sessionId atual sem criar um novo
 */
export function getCurrentSessionId(): string | null {
  try {
    return localStorage.getItem(CHAT_SESSION_KEY);
  } catch (error) {
    console.error('❌ [getCurrentSessionId] Erro ao obter sessionId:', error);
    return null;
  }
}