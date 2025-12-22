-- Verificar e corrigir permissões para todas as tabelas importantes

-- Permissões para subscription_plans
GRANT ALL PRIVILEGES ON subscription_plans TO authenticated;
GRANT SELECT ON subscription_plans TO anon;

-- Permissões para subscriptions
GRANT ALL PRIVILEGES ON subscriptions TO authenticated;
GRANT SELECT ON subscriptions TO anon;

-- Permissões para credit_requests
GRANT ALL PRIVILEGES ON credit_requests TO authenticated;
GRANT SELECT ON credit_requests TO anon;

-- Permissões para clinics
GRANT ALL PRIVILEGES ON clinics TO authenticated;
GRANT SELECT ON clinics TO anon;

-- Permissões para profiles
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Permissões para professionals
GRANT ALL PRIVILEGES ON professionals TO authenticated;
GRANT SELECT ON professionals TO anon;

-- Permissões para patients
GRANT ALL PRIVILEGES ON patients TO authenticated;
GRANT SELECT ON patients TO anon;

-- Permissões para appointments
GRANT ALL PRIVILEGES ON appointments TO authenticated;
GRANT SELECT ON appointments TO anon;

-- Permissões para payments
GRANT ALL PRIVILEGES ON payments TO authenticated;
GRANT SELECT ON payments TO anon;

-- Permissões para specialties
GRANT ALL PRIVILEGES ON specialties TO authenticated;
GRANT SELECT ON specialties TO anon;

-- Permissões para treatments
GRANT ALL PRIVILEGES ON treatments TO authenticated;
GRANT SELECT ON treatments TO anon;

-- Permissões para reviews
GRANT ALL PRIVILEGES ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;

-- Permissões para favorites
GRANT ALL PRIVILEGES ON favorites TO authenticated;
GRANT SELECT ON favorites TO anon;

-- Permissões para messages
GRANT ALL PRIVILEGES ON messages TO authenticated;
GRANT SELECT ON messages TO anon;

-- Permissões para notifications
GRANT ALL PRIVILEGES ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;