-- Add plan_type column to pricing_plans table for categorization
ALTER TABLE pricing_plans 
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'clinic'
CHECK (plan_type IN ('patient', 'clinic', 'clinic_advanced'));

-- Create index for better performance on plan_type queries
CREATE INDEX IF NOT EXISTS idx_pricing_plans_plan_type ON pricing_plans(plan_type);

-- Update RLS policies to allow admins to manage plans
DROP POLICY IF EXISTS "Administradores podem gerenciar planos" ON pricing_plans;
DROP POLICY IF EXISTS "Permitir leitura pública de planos ativos" ON pricing_plans;

-- Allow admins to manage all plans
CREATE POLICY "Admins can manage all plans" ON pricing_plans
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Allow public read access to active plans
CREATE POLICY "Public can read active plans" ON pricing_plans
FOR SELECT
TO public
USING (is_active = true);