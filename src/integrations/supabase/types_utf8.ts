export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agendamento_notificacoes: {
        Row: {
          agendamento_id: string | null
          created_at: string | null
          enviada_em: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_notificacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos: {
        Row: {
          clinica_id: string
          codigo_confirmacao: string | null
          created_at: string | null
          data_hora: string
          id: string
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          status: string | null
          tipo_consulta: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          clinica_id: string
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_hora: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          status?: string | null
          tipo_consulta?: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          clinica_id?: string
          codigo_confirmacao?: string | null
          created_at?: string | null
          data_hora?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          status?: string | null
          tipo_consulta?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinic_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          patient_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          price: number | null
          professional_id: string
          scheduled_date: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price?: number | null
          professional_id: string
          scheduled_date: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price?: number | null
          professional_id?: string
          scheduled_date?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_professional"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_treatment"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_credentials: {
        Row: {
          api_token_encrypted: string
          clinic_id: string
          created_at: string | null
          id: string
          last_used_at: string | null
          subscriber_id: string
          updated_at: string | null
        }
        Insert: {
          api_token_encrypted: string
          clinic_id: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          subscriber_id: string
          updated_at?: string | null
        }
        Update: {
          api_token_encrypted?: string
          clinic_id?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          subscriber_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_credentials_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_integrations: {
        Row: {
          api_token: string
          api_user: string
          clinic_name: string | null
          id: string
          inserted_at: string | null
          online_slug: string | null
          provider: string | null
          user_id: string
        }
        Insert: {
          api_token: string
          api_user: string
          clinic_name?: string | null
          id?: string
          inserted_at?: string | null
          online_slug?: string | null
          provider?: string | null
          user_id: string
        }
        Update: {
          api_token?: string
          api_user?: string
          clinic_name?: string | null
          id?: string
          inserted_at?: string | null
          online_slug?: string | null
          provider?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clinic_notifications: {
        Row: {
          admin_response_data: Json | null
          clinic_id: string
          created_at: string
          id: string
          is_read: boolean
          loan_request_id: string
          message: string
          parcelamais_response_data: Json | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          admin_response_data?: Json | null
          clinic_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          loan_request_id: string
          message: string
          parcelamais_response_data?: Json | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          admin_response_data?: Json | null
          clinic_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          loan_request_id?: string
          message?: string
          parcelamais_response_data?: Json | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinic_professionals: {
        Row: {
          accepted_at: string | null
          clinic_id: string
          created_at: string | null
          created_by: string | null
          id: string
          invited_at: string | null
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          clinic_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          clinic_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          invited_at?: string | null
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_professionals_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_profiles: {
        Row: {
          certifications: string[] | null
          clinic_id: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          founded_year: number | null
          gallery_images: string[] | null
          id: string
          insurance_accepted: string[] | null
          languages_spoken: string[] | null
          logo_url: string | null
          specialties: string[] | null
          team_size: number | null
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          certifications?: string[] | null
          clinic_id: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          gallery_images?: string[] | null
          id?: string
          insurance_accepted?: string[] | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          specialties?: string[] | null
          team_size?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          certifications?: string[] | null
          clinic_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          founded_year?: number | null
          gallery_images?: string[] | null
          id?: string
          insurance_accepted?: string[] | null
          languages_spoken?: string[] | null
          logo_url?: string | null
          specialties?: string[] | null
          team_size?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          clinic_id: string
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          price: number | null
          service_description: string | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          service_description?: string | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          service_description?: string | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicorp_appointments: {
        Row: {
          clinic_id: string | null
          clinicorp_appointment_id: string
          created_at: string | null
          ends_at: string
          id: number
          meta: Json | null
          patient_id: string | null
          professional_id: string | null
          starts_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          clinicorp_appointment_id: string
          created_at?: string | null
          ends_at: string
          id?: number
          meta?: Json | null
          patient_id?: string | null
          professional_id?: string | null
          starts_at: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          clinicorp_appointment_id?: string
          created_at?: string | null
          ends_at?: string
          id?: number
          meta?: Json | null
          patient_id?: string | null
          professional_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinicorp_appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicorp_credentials: {
        Row: {
          api_key: string | null
          base_url: string | null
          default_api_token: string
          default_api_user: string
          id: string
          inserted_at: string | null
          is_active: boolean | null
          subscriber_id: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          base_url?: string | null
          default_api_token: string
          default_api_user: string
          id?: string
          inserted_at?: string | null
          is_active?: boolean | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          base_url?: string | null
          default_api_token?: string
          default_api_user?: string
          id?: string
          inserted_at?: string | null
          is_active?: boolean | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinics: {
        Row: {
          address: Json | null
          agenda_link_url: string | null
          city: string | null
          clinic_slug: string | null
          clinicorp_api_token: string | null
          clinicorp_api_user: string | null
          clinicorp_base_url: string | null
          clinicorp_business_id_default: string | null
          clinicorp_code_link_default: string | null
          clinicorp_enabled: boolean | null
          clinicorp_subscriber_id: string | null
          clinicorp_webhook_secret: string | null
          cnpj: string | null
          created_at: string | null
          description: string | null
          email: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          master_user_id: string | null
          name: string
          operating_hours: Json | null
          owner_id: string | null
          phone: string | null
          rating: number | null
          services_config: Json | null
          social_media: Json | null
          status: string | null
          subscription_plan: string | null
          total_reviews: number | null
          updated_at: string | null
          website: string | null
          whatsapp_url: string | null
        }
        Insert: {
          address?: Json | null
          agenda_link_url?: string | null
          city?: string | null
          clinic_slug?: string | null
          clinicorp_api_token?: string | null
          clinicorp_api_user?: string | null
          clinicorp_base_url?: string | null
          clinicorp_business_id_default?: string | null
          clinicorp_code_link_default?: string | null
          clinicorp_enabled?: boolean | null
          clinicorp_subscriber_id?: string | null
          clinicorp_webhook_secret?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          master_user_id?: string | null
          name: string
          operating_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          services_config?: Json | null
          social_media?: Json | null
          status?: string | null
          subscription_plan?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp_url?: string | null
        }
        Update: {
          address?: Json | null
          agenda_link_url?: string | null
          city?: string | null
          clinic_slug?: string | null
          clinicorp_api_token?: string | null
          clinicorp_api_user?: string | null
          clinicorp_base_url?: string | null
          clinicorp_business_id_default?: string | null
          clinicorp_code_link_default?: string | null
          clinicorp_enabled?: boolean | null
          clinicorp_subscriber_id?: string | null
          clinicorp_webhook_secret?: string | null
          cnpj?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          master_user_id?: string | null
          name?: string
          operating_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          services_config?: Json | null
          social_media?: Json | null
          status?: string | null
          subscription_plan?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp_url?: string | null
        }
        Relationships: []
      }
      credit_simulations: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          installment_value: number
          installments: number
          interest_rate: number
          is_pre_approved: boolean | null
          simulation_data: Json | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          installment_value: number
          installments: number
          interest_rate: number
          is_pre_approved?: boolean | null
          simulation_data?: Json | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          installment_value?: number
          installments?: number
          interest_rate?: number
          is_pre_approved?: boolean | null
          simulation_data?: Json | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string | null
          email: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          function_name: string
          id: string
          ip_address: unknown | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          function_name: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          function_name?: string
          id?: string
          ip_address?: unknown | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          patient_id: string
          professional_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_id: string
          professional_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_favorites_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_favorites_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_favorites_professional"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_bloqueados: {
        Row: {
          clinica_id: string
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          motivo: string | null
          profissional_id: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          motivo?: string | null
          profissional_id?: string | null
        }
        Update: {
          clinica_id?: string
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          motivo?: string | null
          profissional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_bloqueados_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_bloqueados_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_funcionamento: {
        Row: {
          ativo: boolean | null
          clinica_id: string
          created_at: string | null
          dia_semana: number
          duracao_consulta: number | null
          hora_fim: string
          hora_inicio: string
          id: string
        }
        Insert: {
          ativo?: boolean | null
          clinica_id: string
          created_at?: string | null
          dia_semana: number
          duracao_consulta?: number | null
          hora_fim: string
          hora_inicio: string
          id?: string
        }
        Update: {
          ativo?: boolean | null
          clinica_id?: string
          created_at?: string | null
          dia_semana?: number
          duracao_consulta?: number | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_funcionamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          admin_decision_date: string | null
          approval_date: string | null
          approved_amount: number | null
          clinic_id: string
          created_at: string | null
          credit_score: number | null
          documents: Json | null
          final_decision_details: Json | null
          id: string
          installments: number | null
          interest_rate: number | null
          notification_sent_at: string | null
          parcelamais_final_status: string | null
          patient_id: string
          requested_amount: number
          status: Database["public"]["Enums"]["loan_status"] | null
          treatment_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_decision_date?: string | null
          approval_date?: string | null
          approved_amount?: number | null
          clinic_id: string
          created_at?: string | null
          credit_score?: number | null
          documents?: Json | null
          final_decision_details?: Json | null
          id?: string
          installments?: number | null
          interest_rate?: number | null
          notification_sent_at?: string | null
          parcelamais_final_status?: string | null
          patient_id: string
          requested_amount: number
          status?: Database["public"]["Enums"]["loan_status"] | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_decision_date?: string | null
          approval_date?: string | null
          approved_amount?: number | null
          clinic_id?: string
          created_at?: string | null
          credit_score?: number | null
          documents?: Json | null
          final_decision_details?: Json | null
          id?: string
          installments?: number | null
          interest_rate?: number | null
          notification_sent_at?: string | null
          parcelamais_final_status?: string | null
          patient_id?: string
          requested_amount?: number
          status?: Database["public"]["Enums"]["loan_status"] | null
          treatment_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_loan_requests_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_loan_requests_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_loan_requests_treatment"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          action_type: string
          description: string | null
          earned_at: string | null
          id: string
          metadata: Json | null
          points: number
          user_id: string | null
        }
        Insert: {
          action_type: string
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string | null
        }
        Update: {
          action_type?: string
          description?: string | null
          earned_at?: string | null
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          appointment_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          allergies: string[] | null
          created_at: string | null
          emergency_contact: Json | null
          id: string
          insurance_info: Json | null
          medical_history: Json | null
          medications: string[] | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string | null
          emergency_contact?: Json | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          medications?: string[] | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          created_at?: string | null
          emergency_contact?: Json | null
          id?: string
          insurance_info?: Json | null
          medical_history?: Json | null
          medications?: string[] | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patients_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          gateway_response: Json | null
          id: string
          patient_id: string
          payment_method: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          patient_id: string
          payment_method?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          patient_id?: string
          payment_method?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_payments_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_payments_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_care_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          points_earned: number | null
          status: string | null
          task_type: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_earned?: number | null
          status?: string | null
          task_type: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          points_earned?: number | null
          status?: string | null
          task_type?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          features: Json
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          period: string
          plan_type: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          period?: string
          plan_type?: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          features?: Json
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          period?: string
          plan_type?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      professionals: {
        Row: {
          bio: string | null
          clinic_id: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          id: string
          is_available: boolean | null
          license_number: string | null
          profile_id: string
          rating: number | null
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          profile_id: string
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          clinic_id?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          profile_id?: string
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_professionals_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_professionals_profile"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          address: Json | null
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type: string
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_active?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string
          address?: Json | null
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          is_anonymous: boolean | null
          is_approved: boolean | null
          patient_id: string
          professional_id: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          patient_id: string
          professional_id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_approved?: boolean | null
          patient_id?: string
          professional_id?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_clinic"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_patient"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reviews_professional"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource: string | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plan_benefits: {
        Row: {
          benefit_text: string
          created_at: string | null
          display_order: number | null
          id: number
          plan_id: number | null
        }
        Insert: {
          benefit_text: string
          created_at?: string | null
          display_order?: number | null
          id?: number
          plan_id?: number | null
        }
        Update: {
          benefit_text?: string
          created_at?: string | null
          display_order?: number | null
          id?: number
          plan_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_benefits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          original_price_annual: number | null
          original_price_monthly: number | null
          price_annual: number
          price_monthly: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          original_price_annual?: number | null
          original_price_monthly?: number | null
          price_annual: number
          price_monthly: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          original_price_annual?: number | null
          original_price_monthly?: number | null
          price_annual?: number
          price_monthly?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id?: string | null
          sender_name: string
          sender_type: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string | null
          sender_name?: string
          sender_type?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          assigned_to: string | null
          category: string
          clinic_id: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          assigned_to?: string | null
          category: string
          clinic_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          assigned_to?: string | null
          category?: string
          clinic_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          clinic: string | null
          comment: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          rating: number | null
          treatment: string | null
          updated_at: string | null
        }
        Insert: {
          clinic?: string | null
          comment: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          rating?: number | null
          treatment?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic?: string | null
          comment?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          rating?: number | null
          treatment?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_admin_reply: boolean | null
          message: string
          sender_id: string | null
          ticket_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message?: string
          sender_id?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          base_price: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          specialty_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          specialty_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialty_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_treatments_specialty"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          clinic_id: string | null
          event_id: string
          event_type: string
          id: number
          payload: Json | null
          received_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          event_id: string
          event_type: string
          id?: number
          payload?: Json | null
          received_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          event_id?: string
          event_type?: string
          id?: number
          payload?: Json | null
          received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_flows: {
        Row: {
          created_at: string | null
          description: string
          flow_type: string
          icon_name: string
          id: string
          is_active: boolean | null
          step_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          flow_type: string
          icon_name: string
          id?: string
          is_active?: boolean | null
          step_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          flow_type?: string
          icon_name?: string
          id?: string
          is_active?: boolean | null
          step_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          created_at: string | null
          description: string
          icon_name: string
          id: string
          is_active: boolean | null
          step_number: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          is_active?: boolean | null
          step_number: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          is_active?: boolean | null
          step_number?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      cleanup_old_logs: {
        Args: { p_days?: number }
        Returns: number
      }
      create_profile_for_user: {
        Args: { p_email: string; p_full_name?: string; p_user_id: string }
        Returns: string
      }
      create_profile_manual: {
        Args: {
          user_account_type?: string
          user_email: string
          user_id: string
        }
        Returns: boolean
      }
      decrypt_clinicorp_token: {
        Args: { encrypted_token: string }
        Returns: string
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string }
        Returns: string
      }
      decrypt_webhook_secret: {
        Args: { encrypted_secret: string }
        Returns: string
      }
      delete_clinicorp_credentials: {
        Args: { p_clinic_id: string }
        Returns: boolean
      }
      encrypt_clinicorp_token: {
        Args: { token: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data_text: string }
        Returns: string
      }
      encrypt_webhook_secret: {
        Args: { secret: string }
        Returns: string
      }
      generate_confirmation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_clinic_credentials: {
        Args: { p_clinic_id: string; p_key: string }
        Returns: {
          api_token: string
          api_user: string
          auth_mode: string
          base_url: string
          business_id_default: string
          code_link_default: string
          subscriber_id: string
        }[]
      }
      get_clinic_webhook_secret: {
        Args: { p_clinic_id: string; p_key: string }
        Returns: string
      }
      get_clinicorp_credentials: {
        Args: { p_clinic_id: string }
        Returns: {
          api_token: string
          api_user: string
          base_url: string
          business_id_default: string
          subscriber_id: string
        }[]
      }
      get_clinicorp_webhook_secret: {
        Args: { p_clinic_id: string }
        Returns: string
      }
      get_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_error_logs: {
        Args: {
          p_end_date?: string
          p_error_type?: string
          p_function_name?: string
          p_limit?: number
          p_offset?: number
          p_resolved?: boolean
          p_start_date?: string
          p_user_id?: string
        }
        Returns: {
          created_at: string
          email: string
          error_details: Json
          error_message: string
          error_type: string
          function_name: string
          id: string
          ip_address: unknown
          resolved: boolean
          resolved_at: string
          resolved_by: string
          stack_trace: string
          user_agent: string
          user_id: string
        }[]
      }
      get_log_statistics: {
        Args: { p_days?: number }
        Returns: {
          backend_errors: number
          error_count: number
          frontend_errors: number
          info_count: number
          last_error: string
          success_count: number
          total_logs: number
          unique_users: number
          warning_count: number
        }[]
      }
      get_recent_errors: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          email: string
          error_details: Json
          error_message: string
          error_type: string
          function_name: string
          id: string
          resolved: boolean
          user_id: string
        }[]
      }
      get_user_logs: {
        Args: { p_email: string; p_limit?: number }
        Returns: {
          created_at: string
          error_details: Json
          error_message: string
          error_type: string
          function_name: string
          id: string
          resolved: boolean
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role_simple: {
        Args: { user_uuid?: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_clinic_owner: {
        Args: { p_clinic_id: string }
        Returns: boolean
      }
      is_master_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_self: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      log_error: {
        Args:
          | {
              p_email?: string
              p_error_details?: Json
              p_error_message?: string
              p_error_type?: string
              p_function_name?: string
              p_ip_address?: unknown
              p_stack_trace?: string
              p_user_agent?: string
              p_user_id?: string
            }
          | {
              p_email?: string
              p_error_message: string
              p_error_type: string
              p_function_name?: string
              p_stack_trace?: string
            }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: {
          p_action_type: string
          p_legal_basis?: string
          p_purpose?: string
          p_table_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      provision_self: {
        Args: {
          p_account_type: string
          p_avatar_url?: string
          p_full_name: string
        }
        Returns: undefined
      }
      resolve_error_log: {
        Args: { p_log_id: string }
        Returns: boolean
      }
      resolve_multiple_logs: {
        Args: { p_log_ids: string[] }
        Returns: number
      }
      save_clinicorp_credentials: {
        Args: {
          p_api_token: string
          p_api_user: string
          p_base_url: string
          p_clinic_id: string
          p_subscriber_id: string
        }
        Returns: boolean
      }
      test_clinicorp_connection: {
        Args: { p_clinic_id: string }
        Returns: Json
      }
    }
    Enums: {
      account_type: "paciente" | "clinica"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      loan_status:
        | "pending"
        | "approved"
        | "rejected"
        | "active"
        | "completed"
        | "defaulted"
      notification_type:
        | "info"
        | "warning"
        | "error"
        | "success"
        | "appointment"
        | "payment"
        | "system"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "refunded"
      proposal_status: "draft" | "sent" | "approved" | "rejected" | "expired"
      subscription_status:
        | "active"
        | "inactive"
        | "cancelled"
        | "expired"
        | "trial"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      transaction_type:
        | "payment"
        | "refund"
        | "fee"
        | "commission"
        | "loan"
        | "subscription"
      user_role: "admin" | "master" | "clinic" | "patient" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["paciente", "clinica"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      loan_status: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "defaulted",
      ],
      notification_type: [
        "info",
        "warning",
        "error",
        "success",
        "appointment",
        "payment",
        "system",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      proposal_status: ["draft", "sent", "approved", "rejected", "expired"],
      subscription_status: [
        "active",
        "inactive",
        "cancelled",
        "expired",
        "trial",
      ],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      transaction_type: [
        "payment",
        "refund",
        "fee",
        "commission",
        "loan",
        "subscription",
      ],
      user_role: ["admin", "master", "clinic", "patient", "professional"],
    },
  },
} as const
