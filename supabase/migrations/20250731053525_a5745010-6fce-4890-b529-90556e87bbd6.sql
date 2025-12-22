-- Insert some sample appointments
INSERT INTO public.appointments (
  clinic_id, patient_id, appointment_date, status, total_amount, notes
) 
SELECT 
  c.id as clinic_id,
  p.user_id as patient_id,
  NOW() + INTERVAL '1 day' as appointment_date,
  'completed' as status,
  250.00 as total_amount,
  'Consulta de avaliação e limpeza dental'
FROM clinics c
CROSS JOIN profiles p
WHERE p.role = 'patient'
LIMIT 3;

-- Insert sample payments for the appointments
INSERT INTO public.payments (
  appointment_id, amount, status, payment_method
)
SELECT 
  a.id as appointment_id,
  a.total_amount as amount,
  'completed' as status,
  'credit_card' as payment_method
FROM appointments a
WHERE a.total_amount IS NOT NULL;

-- Insert some pending payments
INSERT INTO public.payments (
  appointment_id, amount, status, payment_method
)
SELECT 
  a.id as appointment_id,
  150.00 as amount,
  'pending' as status,
  'pix' as payment_method
FROM appointments a
LIMIT 2;