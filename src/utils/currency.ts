/**
 * Utilitários para formatação de moeda brasileira
 */

/**
 * Formata um valor numérico para o padrão brasileiro de moeda
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatBrazilianCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formata um valor usando toFixed e replace (método alternativo)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatCurrencyManual(value: number): string {
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `R$ ${formatted}`;
}

/**
 * Formata um valor usando o método toFixed com replace
 * Garante que valores como 1899.9 sejam exibidos como R$ 1.899,90
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatCurrencyFixed(value: number): string {
  // Primeiro formata com 2 casas decimais
  const fixedValue = value.toFixed(2);
  
  // Separa a parte inteira da decimal
  const [integerPart, decimalPart] = fixedValue.split('.');
  
  // Adiciona separador de milhares na parte inteira
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retorna no formato brasileiro
  return `R$ ${formattedInteger},${decimalPart}`;
}

/**
 * Converte um valor em centavos (como usado pelo Stripe) para reais formatados
 * @param cents - Valor em centavos
 * @returns String formatada no padrão R$ 1.234,56
 */
export function formatCentsToReais(cents: number): string {
  return formatBrazilianCurrency(cents / 100);
}