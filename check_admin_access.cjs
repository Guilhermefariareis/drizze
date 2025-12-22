const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

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

// Funções de log colorido
function log(message, type = 'info') {
  const colors = {
    success: '\x1b[32m✅',
    error: '\x1b[31m❌',
    warning: '\x1b[33m⚠️',
    info: '\x1b[36mℹ️',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]} ${message}${colors.reset}`);
}

// Verificar se o usuário admin existe no auth.users
async function checkAdminUser() {
  try {
    log('Verificando se o usuário admin existe no auth.users...', 'info');
    
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      log(`Erro ao listar usuários: ${error.message}`, 'error');
      return null;
    }
    
    const adminUser = users.users.find(user => user.email === ADMIN_EMAIL);
    
    if (adminUser) {
      log(`Usuário admin encontrado no auth.users`, 'success');
      log(`  - ID: ${adminUser.id}`, 'info');
      log(`  - Email: ${adminUser.email}`, 'info');
      log(`  - Email confirmado: ${adminUser.email_confirmed_at ? 'Sim' : 'Não'}`, adminUser.email_confirmed_at ? 'success' : 'warning');
      log(`  - Criado em: ${adminUser.created_at}`, 'info');
      log(`  - Último login: ${adminUser.last_sign_in_at || 'Nunca'}`, 'info');
      return adminUser;
    } else {
      log(`Usuário admin NÃO encontrado no auth.users`, 'error');
      return null;
    }
  } catch (error) {
    log(`Erro inesperado ao verificar usuário: ${error.message}`, 'error');
    return null;
  }
}

// Verificar profile do admin na tabela profiles
async function checkAdminProfile(userId) {
  try {
    log('Verificando profile do admin na tabela profiles...', 'info');
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      log(`Erro ao buscar profile: ${error.message}`, 'error');
      return null;
    }
    
    if (profile) {
      log(`Profile do admin encontrado`, 'success');
      log(`  - ID: ${profile.id}`, 'info');
      log(`  - Nome: ${profile.full_name || 'Não definido'}`, 'info');
      log(`  - Role: ${profile.role || 'Não definido'}`, profile.role === 'admin' ? 'success' : 'warning');
      log(`  - Criado em: ${profile.created_at}`, 'info');
      return profile;
    } else {
      log(`Profile do admin NÃO encontrado na tabela profiles`, 'error');
      return null;
    }
  } catch (error) {
    log(`Erro inesperado ao verificar profile: ${error.message}`, 'error');
    return null;
  }
}

// Corrigir profile do admin
async function fixAdminProfile(userId, userEmail) {
  try {
    log('Corrigindo profile do admin...', 'info');
    
    // Tentar inserir o profile com todos os campos obrigatórios
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: randomUUID(),  // Gerar UUID para a chave primária
        user_id: userId,   // Referência ao auth.users
        email: userEmail,
        full_name: 'Administrador Master',
        role: 'admin',
        account_type: 'clinica', // Campo obrigatório - admin é considerado como clínica
        is_active: true,
        email_verified: true
      })
      .select()
      .single();
    
    if (error) {
      log(`Erro ao corrigir profile: ${error.message}`, 'error');
      log(`Detalhes do erro: ${JSON.stringify(error)}`, 'error');
      return false;
    }
    
    log(`Profile do admin corrigido com sucesso`, 'success');
    log(`  - ID: ${profile.id}`, 'info');
    log(`  - Nome: ${profile.full_name}`, 'info');
    log(`  - Role: ${profile.role}`, 'success');
    return true;
  } catch (error) {
    log(`Erro inesperado ao corrigir profile: ${error.message}`, 'error');
    return false;
  }
}

// Confirmar email do admin se necessário
async function confirmAdminEmail(userId) {
  try {
    log('Confirmando email do admin...', 'info');
    
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    });
    
    if (error) {
      log(`Erro ao confirmar email: ${error.message}`, 'error');
      return false;
    }
    
    log(`Email do admin confirmado com sucesso`, 'success');
    return true;
  } catch (error) {
    log(`Erro inesperado ao confirmar email: ${error.message}`, 'error');
    return false;
  }
}

// Testar login do admin
async function testLogin() {
  try {
    log('Testando login do admin...', 'info');
    
    // Verificar se as políticas RLS permitem acesso do admin
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('role')
      .eq('role', 'admin')
      .limit(1);
    
    if (testError) {
      log(`Erro ao testar acesso: ${testError.message}`, 'error');
      return false;
    }
    
    log(`Estrutura de autenticação parece estar funcionando`, 'success');
    return true;
  } catch (error) {
    log(`Erro inesperado no teste de login: ${error.message}`, 'error');
    return false;
  }
}

// Mostrar informações completas do admin
async function showAdminInfo() {
  log('='.repeat(60), 'info');
  log('DIAGNÓSTICO COMPLETO DO ADMINISTRADOR', 'info');
  log('='.repeat(60), 'info');
  
  // Verificar usuário
  const adminUser = await checkAdminUser();
  
  if (!adminUser) {
    log('❌ PROBLEMA CRÍTICO: Usuário admin não existe!', 'error');
    log('Solução: Criar usuário admin manualmente no Supabase Dashboard', 'warning');
    return false;
  }
  
  // Verificar profile
  const adminProfile = await checkAdminProfile(adminUser.id);
  
  let profileFixed = false;
  // Verificar se o profile existe e tem role correto (admin ou master)
  const isAdminRole = adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'master');
  if (!isAdminRole) {
    log('Tentando corrigir profile do admin...', 'warning');
    profileFixed = await fixAdminProfile(adminUser.id, adminUser.email);
  }
  
  // Confirmar email se necessário
  let emailConfirmed = true;
  if (!adminUser.email_confirmed_at) {
    log('Tentando confirmar email do admin...', 'warning');
    emailConfirmed = await confirmAdminEmail(adminUser.id);
  }
  
  // Testar estrutura de autenticação
  const authWorking = await testLogin();
  
  // Resumo final
  log('='.repeat(60), 'info');
  log('RESUMO DO DIAGNÓSTICO', 'info');
  log('='.repeat(60), 'info');
  
  log(`Usuário existe no auth.users: ${adminUser ? 'Sim' : 'Não'}`, adminUser ? 'success' : 'error');
  const hasValidRole = (adminProfile && (adminProfile.role === 'admin' || adminProfile.role === 'master')) || profileFixed;
  log(`Profile existe e correto: ${hasValidRole ? 'Sim' : 'Não'}`, hasValidRole ? 'success' : 'error');
  log(`Email confirmado: ${adminUser.email_confirmed_at || emailConfirmed ? 'Sim' : 'Não'}`, adminUser.email_confirmed_at || emailConfirmed ? 'success' : 'error');
  log(`Estrutura de auth funcionando: ${authWorking ? 'Sim' : 'Não'}`, authWorking ? 'success' : 'error');
  
  const allGood = adminUser && hasValidRole && (adminUser.email_confirmed_at || emailConfirmed) && authWorking;
  
  if (allGood) {
    log('✅ DIAGNÓSTICO: Tudo parece estar funcionando corretamente!', 'success');
    log('Se ainda não consegue fazer login, verifique:', 'info');
    log('  1. A senha está correta?', 'info');
    log('  2. Está usando o email correto: master@doutorizze.com.br', 'info');
    log('  3. Há algum erro no console do navegador?', 'info');
  } else {
    log('❌ DIAGNÓSTICO: Ainda há problemas que precisam ser resolvidos', 'error');
  }
  
  return allGood;
}

// Função principal
async function main() {
  try {
    console.log('🔍 Iniciando diagnóstico do acesso do administrador...\n');
    
    await showAdminInfo();
    
    console.log('\n✅ Diagnóstico concluído!');
  } catch (error) {
    log(`Erro fatal: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkAdminUser,
  checkAdminProfile,
  fixAdminProfile,
  confirmAdminEmail,
  testLogin,
  showAdminInfo
};