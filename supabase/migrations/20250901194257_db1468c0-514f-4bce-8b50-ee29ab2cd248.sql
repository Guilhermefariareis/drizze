-- Corrigir dados da clínica Sorriso Saude com informações corretas do Clinicorp
UPDATE clinics 
SET 
    clinicorp_subscriber_id = 'clinicorp',
    clinicorp_business_id_default = '5778927598043136'
WHERE id = '311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b';