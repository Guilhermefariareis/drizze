-- Criar tabela de perfis das clínicas
CREATE TABLE public.clinic_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL UNIQUE,
  description TEXT,
  specialties TEXT[],
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  opening_hours JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  certifications TEXT[],
  team_size INTEGER,
  founded_year INTEGER,
  languages_spoken TEXT[],
  payment_methods TEXT[],
  insurance_accepted TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Clinics can view all profiles" 
ON public.clinic_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Clinic owners can manage their profile" 
ON public.clinic_profiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_profiles.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all profiles" 
ON public.clinic_profiles 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add trigger for timestamps
CREATE TRIGGER update_clinic_profiles_updated_at
BEFORE UPDATE ON public.clinic_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de serviços das clínicas
CREATE TABLE public.clinic_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_min NUMERIC,
  price_max NUMERIC,
  duration_minutes INTEGER,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active services" 
ON public.clinic_services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Clinic owners can manage their services" 
ON public.clinic_services 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM clinics 
  WHERE clinics.id = clinic_services.clinic_id 
  AND clinics.owner_id = auth.uid()
));

CREATE POLICY "Admins can manage all services" 
ON public.clinic_services 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Add trigger for timestamps
CREATE TRIGGER update_clinic_services_updated_at
BEFORE UPDATE ON public.clinic_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();