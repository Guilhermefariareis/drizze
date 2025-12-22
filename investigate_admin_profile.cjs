const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://irrtjredcrwucrnagune.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycnRqcmVkY3J3dWNybmFndW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkxMjc1OCwiZXhwIjoyMDY5NDg4NzU4fQ.f4fDqfkZwdBnQjU81sJZSop4WHWGpbvAxJCKzPWsvh0';

const ADMIN_EMAIL = 'master@doutorizze.com.br';

// Criar cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function investigateAdminProfile() {
  console.log('🔍 Investigando profiles com email do admin...\n');
  
  // 1. Buscar usuário admin no auth.users
  const { data: adminUser, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.log('❌ Erro ao buscar usuários:', userError.message);
    return;
  }
  
  const admin = adminUser.users.find(user => user.email === ADMIN_EMAIL);
  
  if (!admin) {
    console.log('❌ Usuário admin não encontrado no auth.users');
    return;
  }
  
  console.log('✅ Usuário admin encontrado:');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log('');
  
  // 2. Buscar TODOS os profiles com o email do admin
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', ADMIN_EMAIL);
  
  if (profileError) {
    console.log('❌ Erro ao buscar profiles:', profileError.message);
    return;
  }
  
  console.log(`📋 Encontrados ${profiles.length} profile(s) com email ${ADMIN_EMAIL}:`);
  
  profiles.forEach((profile, index) => {
    console.log(`\n--- Profile ${index + 1} ---`);
    console.log(`ID: ${profile.id}`);
    console.log(`User ID: ${profile.user_id}`);
    console.log(`Email: ${profile.email}`);
    console.log(`Nome: ${profile.full_name}`);
    console.log(`Role: ${profile.role}`);
    console.log(`Account Type: ${profile.account_type}`);
    console.log(`Ativo: ${profile.is_active}`);
    console.log(`Email Verificado: ${profile.email_verified}`);
    console.log(`Criado em: ${profile.created_at}`);
    
    // Verificar se o user_id corresponde ao admin atual
    if (profile.user_id === admin.id) {
      console.log('✅ Este profile corresponde ao usuário admin atual!');
    } else {
      console.log('⚠️ Este profile NÃO corresponde ao usuário admin atual');
      console.log(`   Expected user_id: ${admin.id}`);
      console.log(`   Actual user_id: ${profile.user_id}`);
    }
  });
  
  // 3. Buscar profile pelo user_id correto
  console.log('\n🔍 Buscando profile pelo user_id correto...');
  const { data: correctProfile, error: correctError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', admin.id)
    .single();
  
  if (correctError) {
    console.log('❌ Nenhum profile encontrado com o user_id correto');
  } else {
    console.log('✅ Profile encontrado com user_id correto:');
    console.log(`   ID: ${correctProfile.id}`);
    console.log(`   Email: ${correctProfile.email}`);
    console.log(`   Role: ${correctProfile.role}`);
  }
}

// Executar investigação
investigateAdminProfile()
  .then(() => {
    console.log('\n✅ Investigação concluída!');
  })
  .catch(error => {
    console.log('❌ Erro na investigação:', error.message);
  });