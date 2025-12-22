const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function createTestAppointments() {
  try {
    console.log('🔄 Criando agendamentos de teste...');

    // Primeiro, vamos buscar usuários e clínicas existentes
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, email, role')
      .limit(10);

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name')
      .limit(5);

    if (clinicsError) {
      console.error('❌ Erro ao buscar clínicas:', clinicsError);
      return;
    }

    const { data: professionals, error: professionalsError } = await supabase
      .from('professionals')
      .select('id, profile_id')
      .limit(5);

    if (professionalsError) {
      console.error('❌ Erro ao buscar profissionais:', professionalsError);
      return;
    }

    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, profile_id')
      .limit(5);

    if (patientsError) {
      console.error('❌ Erro ao buscar pacientes:', patientsError);
      return;
    }

    console.log('📊 Dados encontrados:');
    console.log(`- ${profiles?.length || 0} perfis`);
    console.log(`- ${clinics?.length || 0} clínicas`);
    console.log(`- ${professionals?.length || 0} profissionais`);
    console.log(`- ${patients?.length || 0} pacientes`);

    if (!clinics?.length || !professionals?.length || !patients?.length) {
      console.log('⚠️ Dados insuficientes para criar agendamentos');
      return;
    }

    // Criar agendamentos de teste
    const testAppointments = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const appointmentDate = new Date(today);
      appointmentDate.setDate(today.getDate() + i + 1); // Próximos 5 dias
      appointmentDate.setHours(9 + (i * 2), 0, 0, 0); // Horários espaçados

      const appointment = {
        patient_id: patients[i % patients.length].id,
        professional_id: professionals[i % professionals.length].id,
        clinic_id: clinics[i % clinics.length].id,
        scheduled_date: appointmentDate.toISOString(),
        duration_minutes: 60,
        status: ['scheduled', 'confirmed', 'completed'][i % 3],
        notes: `Consulta de teste ${i + 1}`,
        price: 150.00 + (i * 50),
        payment_status: 'pending'
      };

      testAppointments.push(appointment);
    }

    // Inserir agendamentos
    const { data: insertedAppointments, error: insertError } = await supabase
      .from('appointments')
      .insert(testAppointments)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir agendamentos:', insertError);
      return;
    }

    console.log('✅ Agendamentos criados com sucesso!');
    console.log(`📅 ${insertedAppointments?.length || 0} agendamentos inseridos`);
    
    // Mostrar resumo dos agendamentos criados
    insertedAppointments?.forEach((apt, index) => {
      const date = new Date(apt.scheduled_date);
      console.log(`${index + 1}. ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - Status: ${apt.status}`);
    });

    // Verificar total de agendamentos na tabela
    const { count, error: countError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Total de agendamentos na tabela: ${count}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestAppointments();