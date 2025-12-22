import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irrtjredcrwucrnagune.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycnRqcmVkY3J3dWNybmFndW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkxMjc1OCwiZXhwIjoyMDY5NDg4NzU4fQ.f4fDqfkZwdBnQjU81sJZSop4WHWGpbvAxJCKzPWsvh0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertPatientPlans() {
  try {
    // Primeiro, verificar se já existem planos para pacientes
    const { data: existingPlans, error: checkError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_type', 'patient');

    if (checkError) {
      console.error('Erro ao verificar planos existentes:', checkError);
      return;
    }

    if (existingPlans && existingPlans.length > 0) {
      console.log('Planos para pacientes já existem:', existingPlans.length);
      return;
    }

    // Inserir novos planos
    const plansToInsert = [
      {
        name: 'Básico',
        price: 29.90,
        period: 'mensal',
        description: 'Ideal para cuidados básicos de saúde dental',
        features: ['Consultas de rotina', 'Limpeza dental', 'Orientações preventivas', 'Suporte online'],
        is_popular: false,
        is_active: true,
        display_order: 1,
        plan_type: 'patient'
      },
      {
        name: 'Premium',
        price: 59.90,
        period: 'mensal',
        description: 'Plano completo com todos os benefícios',
        features: ['Consultas ilimitadas', 'Limpeza dental', 'Tratamentos básicos', 'Emergências 24h', 'Suporte prioritário', 'Desconto em procedimentos'],
        is_popular: true,
        is_active: true,
        display_order: 2,
        plan_type: 'patient'
      },
      {
        name: 'Família',
        price: 99.90,
        period: 'mensal',
        description: 'Cobertura completa para toda a família',
        features: ['Até 4 pessoas', 'Consultas ilimitadas', 'Tratamentos completos', 'Emergências 24h', 'Ortodontia básica', 'Suporte dedicado'],
        is_popular: false,
        is_active: true,
        display_order: 3,
        plan_type: 'patient'
      }
    ];

    const { data, error } = await supabase
      .from('pricing_plans')
      .insert(plansToInsert)
      .select();

    if (error) {
      console.error('Erro ao inserir planos:', error);
      return;
    }

    console.log('Planos inseridos com sucesso:', data);
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

insertPatientPlans();