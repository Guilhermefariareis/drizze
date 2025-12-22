// Utilitários de validação para o sistema de chat

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingData {
  specialty?: string;
  clinic?: string;
  date?: string;
  time?: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  symptoms?: string;
  urgency?: 'low' | 'medium' | 'high';
}

// Validação de dados de agendamento
export const validateBookingData = (data: BookingData, step: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (step) {
    case 'specialty':
      if (!data.specialty) {
        errors.push('Especialidade é obrigatória');
      }
      break;

    case 'clinic':
      if (!data.clinic) {
        errors.push('Clínica é obrigatória');
      }
      if (!data.specialty) {
        errors.push('Especialidade deve ser selecionada primeiro');
      }
      break;

    case 'datetime':
      if (!data.date) {
        errors.push('Data é obrigatória');
      } else {
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          errors.push('Data não pode ser no passado');
        }
        
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        if (selectedDate > maxDate) {
          warnings.push('Data muito distante. Recomendamos agendar em até 3 meses');
        }
      }
      
      if (!data.time) {
        errors.push('Horário é obrigatório');
      } else {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(data.time)) {
          errors.push('Formato de horário inválido (HH:MM)');
        }
      }
      break;

    case 'patient_info':
      if (!data.patientName || data.patientName.trim().length < 2) {
        errors.push('Nome do paciente deve ter pelo menos 2 caracteres');
      }
      
      if (!data.patientPhone) {
        errors.push('Telefone é obrigatório');
      } else {
        const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        if (!phoneRegex.test(data.patientPhone.replace(/\s/g, ''))) {
          errors.push('Formato de telefone inválido');
        }
      }
      
      if (data.patientEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.patientEmail)) {
          errors.push('Formato de email inválido');
        }
      }
      break;

    case 'symptoms':
      if (!data.symptoms || data.symptoms.trim().length < 10) {
        warnings.push('Descrição mais detalhada dos sintomas ajuda no atendimento');
      }
      
      if (data.symptoms && data.symptoms.length > 500) {
        warnings.push('Descrição muito longa. Tente ser mais conciso');
      }
      break;

    case 'confirmation':
      // Validar todos os campos obrigatórios
      const requiredFields = ['specialty', 'clinic', 'date', 'time', 'patientName', 'patientPhone'];
      const missingFields = requiredFields.filter(field => !data[field as keyof BookingData]);
      
      if (missingFields.length > 0) {
        errors.push(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validação de mensagem do usuário
export const validateUserMessage = (message: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!message || message.trim().length === 0) {
    errors.push('Mensagem não pode estar vazia');
  }

  if (message.length > 1000) {
    errors.push('Mensagem muito longa (máximo 1000 caracteres)');
  }

  // Detectar possível spam ou conteúdo inadequado
  const spamPatterns = [
    /http[s]?:\/\//gi,
    /www\./gi,
    /\b(compre|venda|promoção|desconto)\b/gi
  ];

  const hasSpamContent = spamPatterns.some(pattern => pattern.test(message));
  if (hasSpamContent) {
    warnings.push('Mensagem pode conter conteúdo promocional');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validação de sessão
export const validateSession = (sessionData: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!sessionData) {
    errors.push('Dados de sessão não encontrados');
    return { isValid: false, errors, warnings };
  }

  // Verificar se a sessão não expirou
  if (sessionData.timestamp) {
    const sessionAge = Date.now() - sessionData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (sessionAge > maxAge) {
      errors.push('Sessão expirada');
    } else if (sessionAge > maxAge * 0.8) {
      warnings.push('Sessão próxima do vencimento');
    }
  }

  // Verificar integridade dos dados
  if (sessionData.messages && !Array.isArray(sessionData.messages)) {
    errors.push('Formato de mensagens inválido');
  }

  if (sessionData.bookingFlow && typeof sessionData.bookingFlow !== 'object') {
    errors.push('Formato de fluxo de agendamento inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Sanitização de dados
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};

// Validação de formato de telefone brasileiro
export const validateBrazilianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^\d{10,11}$/.test(cleanPhone);
};

// Validação de CPF (opcional)
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  
  return remainder === parseInt(cleanCPF.charAt(10));
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  const clean = (cnpj || '').replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  const calcCheckDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split('')
      .reduce((acc, digit, idx) => acc + parseInt(digit, 10) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcCheckDigit(clean.slice(0, 12), firstWeights);
  if (d1 !== parseInt(clean.charAt(12), 10)) return false;

  const d2 = calcCheckDigit(clean.slice(0, 13), secondWeights);
  return d2 === parseInt(clean.charAt(13), 10);
};

export const formatCNPJUniversal = (value: string): string => {
  const digits = (value || '').replace(/\D/g, '');
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};