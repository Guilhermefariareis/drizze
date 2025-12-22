-- Garantir que RLS está habilitado na tabela clinics
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "clinics_public_read_anon" ON public.clinics;
DROP POLICY IF EXISTS "clinics_public_read_auth" ON public.clinics;
DROP POLICY IF EXISTS "Everyone can view active clinics" ON public.clinics;

-- Criar políticas simples para leitura pública de clínicas ativas
CREATE POLICY "clinics_public_read_anon" 
ON public.clinics FOR SELECT 
TO anon 
USING (
  COALESCE(is_active, active, status = 'active', true) = true
);

CREATE POLICY "clinics_public_read_auth" 
ON public.clinics FOR SELECT 
TO authenticated 
USING (
  COALESCE(is_active, active, status = 'active', true) = true
);

-- Garantir que as colunas necessárias existam
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clinics' AND column_name = 'is_active') THEN
    ALTER TABLE public.clinics ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clinics' AND column_name = 'active') THEN
    ALTER TABLE public.clinics ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'clinics' AND column_name = 'status') THEN
    ALTER TABLE public.clinics ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;