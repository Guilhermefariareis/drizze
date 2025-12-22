import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://irrtjredcrwucrnagune.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlycnRqcmVkY3J3dWNybmFndW5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkxMjc1OCwiZXhwIjoyMDY5NDg4NzU4fQ.f4fDqfkZwdBnQjU81sJZSop4WHWGpbvAxJCKzPWsvh0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de tabelas para backup
const TABLES = [
  'profiles',
  'clinics', 
  'credit_requests',
  'subscription_plans',
  'subscriptions'
];

async function backupTableData(tableName) {
  try {
    console.log(`Fazendo backup da tabela: ${tableName}`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erro ao fazer backup da tabela ${tableName}:`, error);
      return null;
    }
    
    console.log(`✓ Backup da tabela ${tableName} concluído: ${data.length} registros`);
    return data;
  } catch (err) {
    console.error(`Erro inesperado ao fazer backup da tabela ${tableName}:`, err);
    return null;
  }
}

async function backupAllData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };
  
  console.log('Iniciando backup de dados...');
  
  for (const table of TABLES) {
    const data = await backupTableData(table);
    if (data !== null) {
      backupData.tables[table] = data;
    }
  }
  
  // Salvar backup em arquivo JSON
  const filename = `data-backup-${timestamp}.json`;
  const filepath = path.join(__dirname, filename);
  
  try {
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    console.log(`\n✓ Backup de dados salvo em: ${filename}`);
    console.log(`Total de tabelas: ${Object.keys(backupData.tables).length}`);
    
    // Mostrar estatísticas
    Object.entries(backupData.tables).forEach(([table, data]) => {
      console.log(`  - ${table}: ${data.length} registros`);
    });
    
  } catch (err) {
    console.error('Erro ao salvar arquivo de backup:', err);
  }
}

// Executar backup se chamado diretamente
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  backupAllData().catch(console.error);
}

export { backupAllData, backupTableData };