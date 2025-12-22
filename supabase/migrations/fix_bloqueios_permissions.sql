-- Conceder permissões para a tabela horarios_bloqueados
GRANT ALL PRIVILEGES ON horarios_bloqueados TO authenticated;
GRANT SELECT ON horarios_bloqueados TO anon;

-- Criar políticas RLS para horarios_bloqueados
CREATE POLICY "Users can view bloqueios from their clinic" ON horarios_bloqueados
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_professionals cp
      WHERE cp.clinic_id = horarios_bloqueados.clinica_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = horarios_bloqueados.clinica_id
      AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert bloqueios for their clinic" ON horarios_bloqueados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_professionals cp
      WHERE cp.clinic_id = horarios_bloqueados.clinica_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = horarios_bloqueados.clinica_id
      AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update bloqueios from their clinic" ON horarios_bloqueados
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clinic_professionals cp
      WHERE cp.clinic_id = horarios_bloqueados.clinica_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = horarios_bloqueados.clinica_id
      AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete bloqueios from their clinic" ON horarios_bloqueados
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clinic_professionals cp
      WHERE cp.clinic_id = horarios_bloqueados.clinica_id
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = horarios_bloqueados.clinica_id
      AND (c.owner_id = auth.uid() OR c.master_user_id = auth.uid())
    )
  );

-- Habilitar RLS na tabela
ALTER TABLE horarios_bloqueados ENABLE ROW LEVEL SECURITY;