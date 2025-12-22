// Interface comum para Clínica
export interface BaseClinic {
  id: string;
  name: string;
  description?: string | null;
  address?: any;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
  total_reviews?: number | null;
  is_active?: boolean;
  agenda_link_url?: string | null;
  website?: string | null;
  logo_url?: string | null;
  owner_id?: string | null;
  created_at?: string;
  updated_at?: string;
  cnpj?: string | null;
  zip_code?: string | null;
  clinicorp_subscriber_id?: string | null;
}

// Interface para perfil de clínica
export interface ClinicProfile {
  id: string;
  clinic_id: string;
  description?: string | null;
  specialties?: string[] | null;
  certifications?: string[] | null;
  languages_spoken?: string[] | null;
  payment_methods?: string[] | null;
  insurance_accepted?: string[] | null;
  opening_hours?: any;
  social_media?: any;
  team_size?: number | null;
  founded_year?: number | null;
  cover_image_url?: string | null;
  logo_url?: string | null;
  gallery_images?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Interface para clínica com perfil
export interface ClinicWithProfile extends BaseClinic {
  clinic_profiles?: ClinicProfile;
  profile?: ClinicProfile;
}

// Interface para clínica em destaque
export interface FeaturedClinic extends BaseClinic {
  profile?: ClinicProfile;
  commission_percentage?: number | null;
}

// Interface para dados de clínica no seletor
export interface ClinicData extends BaseClinic {
  clinic_profiles?: ClinicProfile;
  clinic_services?: any[];
}

// Interface para appointment
export interface AppointmentData {
  clinic_id: string;
  patient_id: string;
  clinics?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

// Interface para payment
export interface PaymentData {
  amount: number;
  appointment_id: string;
  clinic_id: string;
  created_at: string;
  id: string;
  parcelamais_charge_id?: string | null;
  payment_method?: string | null;
  status: "pending" | "completed" | "processing" | "failed" | "refunded";
  transaction_id?: string | null;
  updated_at: string;
  appointments?: AppointmentData;
}