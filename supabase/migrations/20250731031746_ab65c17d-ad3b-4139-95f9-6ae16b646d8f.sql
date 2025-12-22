-- Criar tipos enumerados
CREATE TYPE public.user_role AS ENUM ('admin', 'clinic', 'patient');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'approved', 'rejected', 'expired');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de especialidades
CREATE TABLE public.specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clínicas
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  parcelamais_clinic_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de especialidades das clínicas
CREATE TABLE public.clinic_specialties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  specialty_id UUID REFERENCES public.specialties(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(clinic_id, specialty_id)
);

-- Tabela de serviços
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de favoritos
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, clinic_id)
);

-- Tabela de mensagens
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  parcelamais_charge_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de propostas ParcelaMais
CREATE TABLE public.parcelamais_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  proposal_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  installments INTEGER NOT NULL,
  status proposal_status NOT NULL DEFAULT 'draft',
  parcelamais_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tokens de API
CREATE TABLE public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir especialidades padrão
INSERT INTO public.specialties (name, description, icon) VALUES
('Ortodontia', 'Correção de dentes e mordida', 'Braces'),
('Implantodontia', 'Implantes dentários', 'Zap'),
('Periodontia', 'Tratamento de gengivas', 'Heart'),
('Endodontia', 'Tratamento de canal', 'Activity'),
('Cirurgia Oral', 'Cirurgias bucais', 'Scissors'),
('Prótese Dentária', 'Próteses e reabilitação', 'Settings'),
('Odontopediatria', 'Odontologia infantil', 'Baby'),
('Estética Dental', 'Tratamentos estéticos', 'doltorizze');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelamais_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Função para verificar roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Policies para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para specialties (público)
CREATE POLICY "Everyone can view specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Only admins can manage specialties" ON public.specialties FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para clinics
CREATE POLICY "Everyone can view active clinics" ON public.clinics FOR SELECT USING (is_active = true);
CREATE POLICY "Clinic owners can manage their clinics" ON public.clinics FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Admins can manage all clinics" ON public.clinics FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para clinic_specialties
CREATE POLICY "Everyone can view clinic specialties" ON public.clinic_specialties FOR SELECT USING (true);
CREATE POLICY "Clinic owners can manage their specialties" ON public.clinic_specialties FOR ALL USING (
  EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all clinic specialties" ON public.clinic_specialties FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para services
CREATE POLICY "Everyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Clinic owners can manage their services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para appointments
CREATE POLICY "Patients can view their appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update their appointments" ON public.appointments FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Clinic owners can view their clinic appointments" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);
CREATE POLICY "Clinic owners can update their clinic appointments" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all appointments" ON public.appointments FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para reviews
CREATE POLICY "Everyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Patients can create reviews for their appointments" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = patient_id AND 
  EXISTS (SELECT 1 FROM public.appointments WHERE id = appointment_id AND patient_id = auth.uid() AND status = 'completed')
);
CREATE POLICY "Patients can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Admins can manage all reviews" ON public.reviews FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para favorites
CREATE POLICY "Users can view their favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Policies para messages
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para payments
CREATE POLICY "Patients can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.appointments WHERE id = appointment_id AND patient_id = auth.uid())
);
CREATE POLICY "Clinic owners can view their payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.appointments a JOIN public.clinics c ON a.clinic_id = c.id WHERE a.id = appointment_id AND c.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para parcelamais_proposals
CREATE POLICY "Patients can view their proposals" ON public.parcelamais_proposals FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Clinic owners can manage their proposals" ON public.parcelamais_proposals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.clinics WHERE id = clinic_id AND owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all proposals" ON public.parcelamais_proposals FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Policies para api_tokens (apenas admins)
CREATE POLICY "Only admins can manage api tokens" ON public.api_tokens FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parcelamais_proposals_updated_at BEFORE UPDATE ON public.parcelamais_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar rating das clínicas
CREATE OR REPLACE FUNCTION public.update_clinic_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clinics 
  SET 
    rating = (SELECT AVG(rating) FROM public.reviews WHERE clinic_id = NEW.clinic_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE clinic_id = NEW.clinic_id)
  WHERE id = NEW.clinic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar rating quando nova review é criada
CREATE TRIGGER update_clinic_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_clinic_rating();