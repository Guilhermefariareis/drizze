const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Verificando configuração do Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrowserSession() {
  try {
    console.log('\n🔍 Verificando sessão ativa...');
    
    // Verificar se há uma sessão ativa
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError.message);
      return;
    }

    if (!session) {
      console.log('❌ Nenhuma sessão ativa encontrada');
      console.log('💡 O usuário precisa fazer login no navegador');
      return;
    }

    console.log('✅ Sessão ativa encontrada!');
    console.log('📧 Email:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    
    // Verificar o perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      return;
    }

    if (profile) {
      console.log('👤 Perfil encontrado:');
      console.log('   - Nome:', profile.full_name);
      console.log('   - Role:', profile.role);
      console.log('   - Email:', profile.email);
    } else {
      console.log('❌ Perfil não encontrado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkBrowserSession();