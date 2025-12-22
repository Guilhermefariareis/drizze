// Mock data for testing the schedule system
export interface HorarioFuncionamentoMock {
  id: string;
  clinic_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_CLINIC_ID = '311e1db5-ae3a-4998-9eb4-71e7a8bd7f1b';

export function getMockHorariosFuncionamento(clinicId?: string): HorarioFuncionamentoMock[] {
  const targetClinicId = clinicId || DEFAULT_CLINIC_ID;
  
  return [
    // Segunda-feira (1)
    {
      id: `mock-${targetClinicId}-1-morning`,
      clinic_id: targetClinicId,
      dia_semana: 1,
      hora_inicio: '08:00',
      hora_fim: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `mock-${targetClinicId}-1-afternoon`,
      clinic_id: targetClinicId,
      dia_semana: 1,
      hora_inicio: '14:00',
      hora_fim: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    
    // Terça-feira (2)
    {
      id: `mock-${targetClinicId}-2-morning`,
      clinic_id: targetClinicId,
      dia_semana: 2,
      hora_inicio: '08:00',
      hora_fim: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `mock-${targetClinicId}-2-afternoon`,
      clinic_id: targetClinicId,
      dia_semana: 2,
      hora_inicio: '14:00',
      hora_fim: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    
    // Quarta-feira (3)
    {
      id: `mock-${targetClinicId}-3-morning`,
      clinic_id: targetClinicId,
      dia_semana: 3,
      hora_inicio: '08:00',
      hora_fim: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `mock-${targetClinicId}-3-afternoon`,
      clinic_id: targetClinicId,
      dia_semana: 3,
      hora_inicio: '14:00',
      hora_fim: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    
    // Quinta-feira (4)
    {
      id: `mock-${targetClinicId}-4-morning`,
      clinic_id: targetClinicId,
      dia_semana: 4,
      hora_inicio: '08:00',
      hora_fim: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `mock-${targetClinicId}-4-afternoon`,
      clinic_id: targetClinicId,
      dia_semana: 4,
      hora_inicio: '14:00',
      hora_fim: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    
    // Sexta-feira (5)
    {
      id: `mock-${targetClinicId}-5-morning`,
      clinic_id: targetClinicId,
      dia_semana: 5,
      hora_inicio: '08:00',
      hora_fim: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: `mock-${targetClinicId}-5-afternoon`,
      clinic_id: targetClinicId,
      dia_semana: 5,
      hora_inicio: '14:00',
      hora_fim: '18:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

export function getMockHorariosPorDia(diaSemana: number, clinicId?: string): HorarioFuncionamentoMock[] {
  const horarios = getMockHorariosFuncionamento(clinicId);
  return horarios.filter(h => h.dia_semana === diaSemana);
}