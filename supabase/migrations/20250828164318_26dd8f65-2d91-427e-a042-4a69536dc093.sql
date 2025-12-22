-- Create clinic_profiles table
CREATE TABLE public.clinic_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    logo_url TEXT,
    cover_image_url TEXT,
    description TEXT,
    specialties TEXT[] DEFAULT '{}',
    team_size INTEGER DEFAULT 0,
    founded_year INTEGER,
    certifications TEXT[] DEFAULT '{}',
    insurance_accepted TEXT[] DEFAULT '{}',
    gallery_images TEXT[] DEFAULT '{}',
    languages_spoken TEXT[] DEFAULT '{}',
    working_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id)
);

-- Create clinic_services table
CREATE TABLE public.clinic_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_description TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinic_profiles
CREATE POLICY "Anyone can view clinic profiles" ON public.clinic_profiles
    FOR SELECT USING (true);

CREATE POLICY "Clinic owners can manage their profiles" ON public.clinic_profiles
    FOR ALL USING (
        clinic_id IN (
            SELECT id FROM public.clinics WHERE master_user_id = auth.uid()
        )
    );

-- RLS Policies for clinic_services  
CREATE POLICY "Anyone can view clinic services" ON public.clinic_services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Clinic owners can manage their services" ON public.clinic_services
    FOR ALL USING (
        clinic_id IN (
            SELECT id FROM public.clinics WHERE master_user_id = auth.uid()
        )
    );

-- Add triggers for updated_at
CREATE TRIGGER update_clinic_profiles_updated_at
    BEFORE UPDATE ON public.clinic_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_clinic_services_updated_at
    BEFORE UPDATE ON public.clinic_services
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();