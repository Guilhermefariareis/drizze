-- SECURITY HARDENING MIGRATION
-- 1) Helper functions
CREATE OR REPLACE FUNCTION public.is_clinic_owner(p_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinics c
    WHERE c.id = p_clinic_id AND c.owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_self(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = p_user_id;
$$;

-- 2) Prevent role escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing role is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_role_change
BEFORE UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- 3) Enable RLS and add policies to critical tables
-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: user can select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: user can update own (no role change)" ON public.profiles;

CREATE POLICY "Profiles: user can select own"
ON public.profiles FOR SELECT
USING (public.is_self(user_id));

CREATE POLICY "Profiles: user can insert own"
ON public.profiles FOR INSERT
WITH CHECK (public.is_self(user_id));

CREATE POLICY "Profiles: user can update own (no role change)"
ON public.profiles FOR UPDATE
USING (public.is_self(user_id))
WITH CHECK (public.is_self(user_id));

-- CLINICS
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinics: owner select" ON public.clinics;
DROP POLICY IF EXISTS "Clinics: owner insert" ON public.clinics;
DROP POLICY IF EXISTS "Clinics: owner update" ON public.clinics;
DROP POLICY IF EXISTS "Clinics: owner delete" ON public.clinics;

CREATE POLICY "Clinics: owner select"
ON public.clinics FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Clinics: owner insert"
ON public.clinics FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Clinics: owner update"
ON public.clinics FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Clinics: owner delete"
ON public.clinics FOR DELETE
USING (owner_id = auth.uid());

-- CLINIC-RELATED TABLES
ALTER TABLE public.clinic_sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for clinic-owned records (allow owner of clinic)
-- clinic_sensitive_data
DROP POLICY IF EXISTS "ClinicSensitive: owner select" ON public.clinic_sensitive_data;
DROP POLICY IF EXISTS "ClinicSensitive: owner modify" ON public.clinic_sensitive_data;
CREATE POLICY "ClinicSensitive: owner select"
ON public.clinic_sensitive_data FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicSensitive: owner modify"
ON public.clinic_sensitive_data FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_profiles
DROP POLICY IF EXISTS "ClinicProfiles: owner select" ON public.clinic_profiles;
DROP POLICY IF EXISTS "ClinicProfiles: owner modify" ON public.clinic_profiles;
CREATE POLICY "ClinicProfiles: owner select"
ON public.clinic_profiles FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicProfiles: owner modify"
ON public.clinic_profiles FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_settings
DROP POLICY IF EXISTS "ClinicSettings: owner select" ON public.clinic_settings;
DROP POLICY IF EXISTS "ClinicSettings: owner modify" ON public.clinic_settings;
CREATE POLICY "ClinicSettings: owner select"
ON public.clinic_settings FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicSettings: owner modify"
ON public.clinic_settings FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_services
DROP POLICY IF EXISTS "ClinicServices: owner select" ON public.clinic_services;
DROP POLICY IF EXISTS "ClinicServices: owner modify" ON public.clinic_services;
CREATE POLICY "ClinicServices: owner select"
ON public.clinic_services FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicServices: owner modify"
ON public.clinic_services FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_operating_hours
DROP POLICY IF EXISTS "ClinicHours: owner select" ON public.clinic_operating_hours;
DROP POLICY IF EXISTS "ClinicHours: owner modify" ON public.clinic_operating_hours;
CREATE POLICY "ClinicHours: owner select"
ON public.clinic_operating_hours FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicHours: owner modify"
ON public.clinic_operating_hours FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_availability
DROP POLICY IF EXISTS "ClinicAvail: owner select" ON public.clinic_availability;
DROP POLICY IF EXISTS "ClinicAvail: owner modify" ON public.clinic_availability;
CREATE POLICY "ClinicAvail: owner select"
ON public.clinic_availability FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicAvail: owner modify"
ON public.clinic_availability FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_time_slots
DROP POLICY IF EXISTS "ClinicSlots: owner select" ON public.clinic_time_slots;
DROP POLICY IF EXISTS "ClinicSlots: owner modify" ON public.clinic_time_slots;
CREATE POLICY "ClinicSlots: owner select"
ON public.clinic_time_slots FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicSlots: owner modify"
ON public.clinic_time_slots FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- clinic_notifications
DROP POLICY IF EXISTS "ClinicNotifications: owner select" ON public.clinic_notifications;
DROP POLICY IF EXISTS "ClinicNotifications: owner modify" ON public.clinic_notifications;
CREATE POLICY "ClinicNotifications: owner select"
ON public.clinic_notifications FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "ClinicNotifications: owner modify"
ON public.clinic_notifications FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- APPOINTMENTS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Appointments: patient/owner select" ON public.appointments;
DROP POLICY IF EXISTS "Appointments: patient/owner insert" ON public.appointments;
DROP POLICY IF EXISTS "Appointments: patient/owner update" ON public.appointments;
DROP POLICY IF EXISTS "Appointments: owner delete" ON public.appointments;
CREATE POLICY "Appointments: patient/owner select"
ON public.appointments FOR SELECT
USING (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
);
CREATE POLICY "Appointments: patient/owner insert"
ON public.appointments FOR INSERT
WITH CHECK (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
);
CREATE POLICY "Appointments: patient/owner update"
ON public.appointments FOR UPDATE
USING (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
)
WITH CHECK (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
);
CREATE POLICY "Appointments: owner delete"
ON public.appointments FOR DELETE
USING (public.is_clinic_owner(clinic_id));

-- PAYMENTS (via appointment ownership)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Payments: by appointment ownership" ON public.payments;
CREATE POLICY "Payments: by appointment ownership"
ON public.payments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id
      AND (a.patient_id = auth.uid() OR public.is_clinic_owner(a.clinic_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id
      AND (a.patient_id = auth.uid() OR public.is_clinic_owner(a.clinic_id))
  )
);

-- MESSAGES
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages: read own" ON public.messages;
DROP POLICY IF EXISTS "Messages: send own" ON public.messages;
DROP POLICY IF EXISTS "Messages: update own sent" ON public.messages;
DROP POLICY IF EXISTS "Messages: delete own sent" ON public.messages;
CREATE POLICY "Messages: read own"
ON public.messages FOR SELECT
USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Messages: send own"
ON public.messages FOR INSERT
WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Messages: update own sent"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Messages: delete own sent"
ON public.messages FOR DELETE
USING (sender_id = auth.uid());

-- FAVORITES
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Favorites: user access" ON public.favorites;
CREATE POLICY "Favorites: user access"
ON public.favorites FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Notifications: user/owner access" ON public.notifications;
CREATE POLICY "Notifications: user/owner access"
ON public.notifications FOR ALL
USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (clinic_id IS NOT NULL AND public.is_clinic_owner(clinic_id))
)
WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  (clinic_id IS NOT NULL AND public.is_clinic_owner(clinic_id))
);

-- REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews: patient/owner select" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: patient insert" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: patient update" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: patient delete" ON public.reviews;
CREATE POLICY "Reviews: patient/owner select"
ON public.reviews FOR SELECT
USING (patient_id = auth.uid() OR public.is_clinic_owner(clinic_id));
CREATE POLICY "Reviews: patient insert"
ON public.reviews FOR INSERT
WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Reviews: patient update"
ON public.reviews FOR UPDATE
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Reviews: patient delete"
ON public.reviews FOR DELETE
USING (patient_id = auth.uid());

-- LOANS
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_status_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_contracts ENABLE ROW LEVEL SECURITY;

-- loan_requests
DROP POLICY IF EXISTS "LoanRequests: patient/owner select" ON public.loan_requests;
DROP POLICY IF EXISTS "LoanRequests: patient/owner modify" ON public.loan_requests;
CREATE POLICY "LoanRequests: patient/owner select"
ON public.loan_requests FOR SELECT
USING (patient_id = auth.uid() OR public.is_clinic_owner(clinic_id));
CREATE POLICY "LoanRequests: patient/owner modify"
ON public.loan_requests FOR ALL
USING (patient_id = auth.uid() OR public.is_clinic_owner(clinic_id))
WITH CHECK (patient_id = auth.uid() OR public.is_clinic_owner(clinic_id));

-- loan_notifications
DROP POLICY IF EXISTS "LoanNotifications: owner select" ON public.loan_notifications;
DROP POLICY IF EXISTS "LoanNotifications: owner modify" ON public.loan_notifications;
CREATE POLICY "LoanNotifications: owner select"
ON public.loan_notifications FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "LoanNotifications: owner modify"
ON public.loan_notifications FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- loan_status_responses
DROP POLICY IF EXISTS "LoanStatus: owner select" ON public.loan_status_responses;
DROP POLICY IF EXISTS "LoanStatus: owner modify" ON public.loan_status_responses;
CREATE POLICY "LoanStatus: owner select"
ON public.loan_status_responses FOR SELECT
USING (public.is_clinic_owner(clinic_id));
CREATE POLICY "LoanStatus: owner modify"
ON public.loan_status_responses FOR ALL
USING (public.is_clinic_owner(clinic_id))
WITH CHECK (public.is_clinic_owner(clinic_id));

-- loan_offers (by loan_request clinic ownership)
DROP POLICY IF EXISTS "LoanOffers: by request owner" ON public.loan_offers;
CREATE POLICY "LoanOffers: by request owner"
ON public.loan_offers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.loan_requests lr
    WHERE lr.id = loan_request_id
      AND (lr.patient_id = auth.uid() OR public.is_clinic_owner(lr.clinic_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loan_requests lr
    WHERE lr.id = loan_request_id
      AND (lr.patient_id = auth.uid() OR public.is_clinic_owner(lr.clinic_id))
  )
);

-- loan_contracts (by loan_request clinic ownership)
DROP POLICY IF EXISTS "LoanContracts: by request owner" ON public.loan_contracts;
CREATE POLICY "LoanContracts: by request owner"
ON public.loan_contracts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.loan_requests lr
    WHERE lr.id = loan_request_id
      AND (lr.patient_id = auth.uid() OR public.is_clinic_owner(lr.clinic_id))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loan_requests lr
    WHERE lr.id = loan_request_id
      AND (lr.patient_id = auth.uid() OR public.is_clinic_owner(lr.clinic_id))
  )
);

-- PARCELAMAIS PROPOSALS
ALTER TABLE public.parcelamais_proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ParceilaMais: patient/owner access" ON public.parcelamais_proposals;
CREATE POLICY "ParceilaMais: patient/owner access"
ON public.parcelamais_proposals FOR ALL
USING (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
)
WITH CHECK (
  patient_id = auth.uid() OR public.is_clinic_owner(clinic_id)
);

-- FAVOR ADMIN/INTERNAL TABLES: lock down (enable RLS, no policies)
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configurations ENABLE ROW LEVEL SECURITY;

-- END OF MIGRATION
