-- Verificar se o ID do usuário logado corresponde ao email gomessjr@outlook.com
SELECT 
    'Verificação do usuário logado' as tipo,
    id,
    email,
    created_at
FROM auth.users 
WHERE id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa' OR email = 'gomessjr@outlook.com';

-- Verificar se existe clínica para este ID específico
SELECT 
    'Clínicas para o usuário logado' as tipo,
    id,
    name,
    owner_id,
    master_user_id
FROM clinics 
WHERE owner_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa' 
   OR master_user_id = '96d13cf1-82ea-4437-913e-bf8ed0b3e7aa';

-- Verificar a estrutura da tabela agendamento_notificacoes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agendamento_notificacoes'
ORDER BY ordinal_position;

-- Adicionar a coluna data_envio se não existir
ALTER TABLE agendamento_notificacoes 
ADD COLUMN IF NOT EXISTS data_envio TIMESTAMP WITH TIME ZONE;

-- Verificar se a coluna foi adicionada
SELECT 
    'Verificação pós-alteração' as tipo,
    column_name, 
    data_type 
FROM information_schema.columns
WHERE table_name = 'agendamento_notificacoes' 
  AND column_name = 'data_envio';