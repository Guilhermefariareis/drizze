const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Testando fluxo de login do administrador...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLoginFlow() {
  try {
    console.log('\n🔐 Fazendo login como admin...');
    
    // Fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'master@doutorizze.com.br',
      password: '123456',
    });

    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }

    if (!authData.user) {
      console.error('❌ Usuário não encontrado após login');
      return;
    }

    console.log('✅ Login bem-sucedido!');
    console.log('📧 Email:', authData.user.email);
    console.log('🆔 User ID:', authData.user.id);

    // Verificar perfil na tabela profiles
    console.log('\n🔍 Verificando perfil na tabela profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      
      // Tentar buscar por ID direto
      console.log('\n🔍 Tentando buscar perfil por ID direto...');
      const { data: profileById, error: profileByIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileByIdError) {
        console.error('❌ Erro ao buscar perfil por ID:', profileByIdError.message);
      } else if (profileById) {
        console.log('✅ Perfil encontrado por ID:');
        console.log('   - Nome:', profileById.full_name);
        console.log('   - Role:', profileById.role);
        console.log('   - Email:', profileById.email);
      }
    } else if (profile) {
      console.log('✅ Perfil encontrado:');
      console.log('   - Nome:', profile.full_name);
      console.log('   - Role:', profile.role);
      console.log('   - Email:', profile.email);
    }

    // Verificar se é admin baseado no role
    const userRole = profile?.role;
    const isAdmin = userRole === 'admin' || userRole === 'master';
    
    console.log('\n🔐 Verificação de permissões:');
    console.log('   - Role:', userRole);
    console.log('   - É Admin?', isAdmin ? 'SIM' : 'NÃO');

    // Verificar fallback por email
    const masterEmails = [
      'master@doutorizze.com.br',
      'admin@doutorizze.com.br',
      'suporte@doutorizze.com.br'
    ];

    const isAdminByEmail = masterEmails.includes(authData.user.email || '');
    console.log('   - É Admin por email?', isAdminByEmail ? 'SIM' : 'NÃO');

    const finalIsAdmin = isAdmin || isAdminByEmail;
    console.log('   - Resultado final:', finalIsAdmin ? 'ADMIN CONFIRMADO' : 'NÃO É ADMIN');

    if (finalIsAdmin) {
      console.log('\n✅ SUCESSO: Usuário deve ter acesso ao dashboard admin');
      console.log('🎯 Deve redirecionar para: /admin');
    } else {
      console.log('\n❌ PROBLEMA: Usuário não tem permissões de admin');
    }

    // Fazer logout
    await supabase.auth.signOut();
    console.log('\n🚪 Logout realizado');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAdminLoginFlow();