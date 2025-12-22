import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'password';
  placeholder?: string;
  required?: boolean;
  validationRules?: ValidationRule[];
  className?: string;
  disabled?: boolean;
}

export function ValidatedFormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  validationRules = [],
  className,
  disabled = false
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!touched && !value) return;

    const newErrors: string[] = [];

    // Validação obrigatória
    if (required && !value.trim()) {
      newErrors.push(`${label} é obrigatório`);
    }

    // Validações customizadas
    if (value && validationRules.length > 0) {
      validationRules.forEach(rule => {
        if (!rule.test(value)) {
          newErrors.push(rule.message);
        }
      });
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0 && (value.trim() !== '' || !required));
  }, [value, touched, required, validationRules, label]);

  const handleBlur = () => {
    setTouched(true);
  };

  const hasErrors = errors.length > 0 && touched;
  const showSuccess = isValid && touched && value.trim() !== '';

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            hasErrors && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            showSuccess && 'border-green-500 focus:ring-green-500 focus:border-green-500',
            !hasErrors && !showSuccess && 'border-gray-300'
          )}
        />
        
        {/* Ícone de validação */}
        {(hasErrors || showSuccess) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensagens de erro */}
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          ))}
        </div>
      )}
      
      {/* Mensagem de sucesso */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="h-4 w-4" />
          Campo válido
        </p>
      )}
    </div>
  );
}

// Regras de validação comuns
export const validationRules = {
  email: {
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Email deve ter um formato válido'
  },
  phone: {
    test: (value: string) => /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(value),
    message: 'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
  },
  minLength: (min: number) => ({
    test: (value: string) => value.length >= min,
    message: `Deve ter pelo menos ${min} caracteres`
  }),
  maxLength: (max: number) => ({
    test: (value: string) => value.length <= max,
    message: `Deve ter no máximo ${max} caracteres`
  }),
  noSpecialChars: {
    test: (value: string) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value),
    message: 'Deve conter apenas letras e espaços'
  },
  cpf: {
    test: (value: string) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      
      // Validação do CPF
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      return remainder === parseInt(cpf.charAt(10));
    },
    message: 'CPF deve ser válido'
  }
};

// Hook para gerenciar validação de formulário
export function useFormValidation<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setFieldTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateField = (field: keyof T, rules: ValidationRule[], required = false) => {
    const value = values[field];
    const fieldErrors: string[] = [];

    if (required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${String(field)} é obrigatório`);
    }

    if (value && rules.length > 0) {
      rules.forEach(rule => {
        if (!rule.test(value.toString())) {
          fieldErrors.push(rule.message);
        }
      });
    }

    setErrors(prev => ({ ...prev, [field]: fieldErrors }));
    return fieldErrors.length === 0;
  };

  const isFormValid = () => {
    return Object.values(errors).every(fieldErrors => 
      !fieldErrors || fieldErrors.length === 0
    );
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    isFormValid,
    resetForm
  };
}