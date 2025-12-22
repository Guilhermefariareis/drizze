const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Presente' : 'Ausente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSession() {
  console.log('🔍 Verificando sessão atual...');
  
  try {
    // Verificar sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return;
    }
    
    if (!session) {
      console.log('⚠️ Nenhuma sessão ativa encontrada');
      console.log('ℹ️ Isso é normal - as sessões são específicas do navegador');
      return;
    }
    
    console.log('✅ Sessão ativa encontrada');
    console.log('📧 Email:', session.user.email);
    console.log('🆔 User ID:', session.user.id);
    
    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }
    
    if (profile) {
      console.log('✅ Perfil encontrado:');
      console.log('👤 Nome:', profile.full_name);
      console.log('🎭 Role:', profile.role);
      console.log('📅 Criado em:', profile.created_at);
    } else {
      console.log('⚠️ Perfil não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugSession();