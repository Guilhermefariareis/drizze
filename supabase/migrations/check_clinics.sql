-- Verificar clínicas existentes para usar no teste
SELECT id, name, created_at 
FROM clinics 
ORDER BY created_at 
LIMIT 5;