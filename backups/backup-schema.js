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

async function getTableSchema(tableName) {
  console.log(`Obtendo schema da tabela: ${tableName}`);
  
  try {
    // Fazer uma consulta simples para verificar se a tabela existe
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`Erro ao acessar tabela ${tableName}:`, error);
      return null;
    }

    return {
      table_name: tableName,
      exists: true,
      sample_data: data || [],
      note: 'Schema básico - tabela existe e é acessível'
    };
  } catch (error) {
    console.error(`Erro ao obter schema da tabela ${tableName}:`, error);
    return null;
  }
}



async function backupSchema() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  console.log('Iniciando backup do schema...');
  
  // Lista de tabelas conhecidas do sistema
  const tableNames = ['profiles', 'clinics', 'credit_requests', 'subscription_plans', 'subscriptions'];
  const tables = tableNames.map(name => ({ table_name: name }));
  
  const schemaData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };
  
  let sqlScript = `-- Backup do Schema do Supabase\n-- Gerado em: ${timestamp}\n\n`;
  
  for (const table of tables) {
    const tableSchema = await getTableSchema(table.table_name);
    if (tableSchema) {
      schemaData.tables[table.table_name] = tableSchema;
      
      if (tableSchema.exists) {
        sqlScript += `-- Tabela: ${tableSchema.table_name}\n`;
        sqlScript += `-- ${tableSchema.note}\n`;
        sqlScript += `-- Tabela verificada e acessível\n\n`;
      }
    }
  }
  
  // Salvar schema em JSON
  const jsonFilename = `schema-backup-${timestamp}.json`;
  const jsonFilepath = path.join(__dirname, jsonFilename);
  
  try {
    fs.writeFileSync(jsonFilepath, JSON.stringify(schemaData, null, 2));
    console.log(`✓ Schema JSON salvo em: ${jsonFilename}`);
  } catch (err) {
    console.error('Erro ao salvar schema JSON:', err);
  }
  
  // Salvar script SQL
  const sqlFilename = `schema-backup-${timestamp}.sql`;
  const sqlFilepath = path.join(__dirname, sqlFilename);
  
  try {
    fs.writeFileSync(sqlFilepath, sqlScript);
    console.log(`✓ Script SQL salvo em: ${sqlFilename}`);
    console.log(`Total de tabelas: ${Object.keys(schemaData.tables).length}`);
    
    // Mostrar estatísticas
    Object.entries(schemaData.tables).forEach(([table, schema]) => {
      console.log(`  - ${table}: ${schema.exists ? 'verificada e acessível' : 'erro ao acessar'}`);
    });
    
  } catch (err) {
    console.error('Erro ao salvar script SQL:', err);
  }
}

// Executar backup se chamado diretamente
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  backupSchema().catch(console.error);
}

export { backupSchema, getTableSchema };