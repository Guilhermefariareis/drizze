import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irrtjredcrwucrnagune.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycnRqcmVkY3J3dWNybmFndW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MTI3NTgsImV4cCI6MjA2OTQ4ODc1OH0.8JA7rFxRB1_TP1tLLAftu5wmlHeu1a8yXLB21YbjOJg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      agendamentos: {
        Row: {
          id: string;
          paciente_id: string;
          servico_id: string;
          profissional_id: string;
          data_hora: string;
          status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
          observacoes?: string;
          valor?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          paciente_id: string;
          servico_id: string;
          profissional_id: string;
          data_hora: string;
          status?: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
          observacoes?: string;
          valor?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          paciente_id?: string;
          servico_id?: string;
          profissional_id?: string;
          data_hora?: string;
          status?: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
          observacoes?: string;
          valor?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          cpf: string;
          phone?: string;
          address?: string;
          monthly_income?: number;
          employment_status?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cpf: string;
          phone?: string;
          address?: string;
          monthly_income?: number;
          employment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cpf?: string;
          phone?: string;
          address?: string;
          monthly_income?: number;
          employment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      clinics: {
        Row: {
          id: string;
          name: string;
          cnpj: string;
          address: string;
          phone?: string;
          email?: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cnpj: string;
          address: string;
          phone?: string;
          email?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          cnpj?: string;
          address?: string;
          phone?: string;
          email?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_requests: {
        Row: {
          id: string;
          patient_id: string;
          clinic_id: string;
          requested_amount: number;
          approved_amount?: number;
          installments: number;
          interest_rate?: number;
          status: 'pending' | 'clinic_analysis' | 'admin_review' | 'approved' | 'rejected' | 'under_review';
          treatment_description: string;
          clinic_comments?: string;
          admin_comments?: string;
          payment_conditions?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          clinic_id: string;
          requested_amount: number;
          approved_amount?: number;
          installments: number;
          interest_rate?: number;
          status?: 'pending' | 'clinic_analysis' | 'admin_review' | 'approved' | 'rejected' | 'under_review';
          treatment_description: string;
          clinic_comments?: string;
          admin_comments?: string;
          payment_conditions?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          clinic_id?: string;
          requested_amount?: number;
          approved_amount?: number;
          installments?: number;
          interest_rate?: number;
          status?: 'pending' | 'clinic_analysis' | 'admin_review' | 'approved' | 'rejected' | 'under_review';
          treatment_description?: string;
          clinic_comments?: string;
          admin_comments?: string;
          payment_conditions?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_documents: {
        Row: {
          id: string;
          credit_request_id: string;
          document_type: 'cpf' | 'income_proof' | 'address_proof' | 'photo' | 'other';
          file_url: string;
          file_name: string;
          file_size?: number;
          mime_type?: string;
          verified: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          credit_request_id: string;
          document_type: 'cpf' | 'income_proof' | 'address_proof' | 'photo' | 'other';
          file_url: string;
          file_name: string;
          file_size?: number;
          mime_type?: string;
          verified?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          credit_request_id?: string;
          document_type?: 'cpf' | 'income_proof' | 'address_proof' | 'photo' | 'other';
          file_url?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          verified?: boolean;
          uploaded_at?: string;
        };
      };
      credit_analysis: {
        Row: {
          id: string;
          credit_request_id: string;
          analyzer_id: string;
          analyzer_type: 'clinic' | 'admin';
          recommendation: 'approve' | 'reject' | 'review' | 'request_docs';
          comments?: string;
          analysis_data?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          credit_request_id: string;
          analyzer_id: string;
          analyzer_type: 'clinic' | 'admin';
          recommendation: 'approve' | 'reject' | 'review' | 'request_docs';
          comments?: string;
          analysis_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          credit_request_id?: string;
          analyzer_id?: string;
          analyzer_type?: 'clinic' | 'admin';
          recommendation?: 'approve' | 'reject' | 'review' | 'request_docs';
          comments?: string;
          analysis_data?: any;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          credit_request_id?: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          metadata?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credit_request_id?: string;
          type: string;
          title: string;
          message: string;
          read?: boolean;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credit_request_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          metadata?: any;
          created_at?: string;
        };
      };
      clinic_users: {
        Row: {
          id: string;
          user_id: string;
          clinic_id: string;
          role: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          clinic_id: string;
          role?: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          clinic_id?: string;
          role?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'clinic' | 'patient';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'clinic' | 'patient';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'clinic' | 'patient';
          created_at?: string;
        };
      };
      credit_payments: {
        Row: {
          id: string;
          credit_request_id: string;
          stripe_payment_intent_id: string | null;
          stripe_subscription_id: string | null;
          amount: number;
          installments: number;
          installment_amount: number | null;
          payment_type: 'single' | 'installment';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          payment_method_id: string | null;
          customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          credit_request_id: string;
          stripe_payment_intent_id?: string | null;
          stripe_subscription_id?: string | null;
          amount: number;
          installments?: number;
          installment_amount?: number | null;
          payment_type: 'single' | 'installment';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          payment_method_id?: string | null;
          customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          credit_request_id?: string;
          stripe_payment_intent_id?: string | null;
          stripe_subscription_id?: string | null;
          amount?: number;
          installments?: number;
          installment_amount?: number | null;
          payment_type?: 'single' | 'installment';
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
          payment_method_id?: string | null;
          customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pacientes: {
        Row: {
          id: string;
          nome: string;
          email: string;
          telefone: string;
          data_nascimento?: string;
          endereco?: string;
          observacoes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          telefone: string;
          data_nascimento?: string;
          endereco?: string;
          observacoes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          telefone?: string;
          data_nascimento?: string;
          endereco?: string;
          observacoes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      servicos: {
        Row: {
          id: string;
          nome: string;
          descricao?: string;
          duracao_minutos: number;
          valor: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao?: string;
          duracao_minutos: number;
          valor: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string;
          duracao_minutos?: number;
          valor?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profissionais: {
        Row: {
          id: string;
          nome: string;
          especialidade: string;
          email?: string;
          telefone?: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          especialidade: string;
          email?: string;
          telefone?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          especialidade?: string;
          email?: string;
          telefone?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];