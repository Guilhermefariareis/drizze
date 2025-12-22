-- Corrigir permissões para as tabelas necessárias

-- Garantir que as tabelas tenham as permissões corretas
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

GRANT ALL PRIVILEGES ON clinics TO authenticated;
GRANT SELECT ON clinics TO anon;

GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Verificar se as políticas RLS estão corretas
-- Para credit_requests
DROP POLICY IF EXISTS "Users can view their own credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can view requests for their clinic" ON credit_requests;
DROP POLICY IF EXISTS "Users can create credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Clinics can update requests for their clinic" ON credit_requests;

CREATE POLICY "Users can view their own credit requests" ON credit_requests
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Clinics can view requests for their clinic" ON credit_requests
    FOR SELECT USING (
        clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create credit requests" ON credit_requests
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Clinics can update requests for their clinic" ON credit_requests
    FOR UPDATE USING (
        clinic_id IN (
            SELECT id FROM clinics 
            WHERE master_user_id = auth.uid() OR owner_id = auth.uid()
        )
    );

-- Para clinics
DROP POLICY IF EXISTS "Clinics can view their own data" ON clinics;
CREATE POLICY "Clinics can view their own data" ON clinics
    FOR SELECT USING (master_user_id = auth.uid() OR owner_id = auth.uid());

-- Para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);