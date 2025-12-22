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

function listBackupFiles() {
  const backupDir = __dirname;
  const files = fs.readdirSync(backupDir);
  
  const dataBackups = files.filter(f => f.startsWith('data-backup-') && f.endsWith('.json'));
  const schemaBackups = files.filter(f => f.startsWith('schema-backup-') && f.endsWith('.json'));
  
  return { dataBackups, schemaBackups };
}

async function restoreTableData(tableName, data) {
  try {
    console.log(`Restaurando dados da tabela: ${tableName} (${data.length} registros)`);
    
    if (data.length === 0) {
      console.log(`  - Tabela ${tableName} está vazia no backup`);
      return true;
    }
    
    // Limpar tabela antes de restaurar (CUIDADO!)
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 'impossible-id'); // Deletar todos os registros
    
    if (deleteError) {
      console.error(`  - Erro ao limpar tabela ${tableName}:`, deleteError);
      return false;
    }
    
    // Inserir dados em lotes para evitar timeouts
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        console.error(`  - Erro ao inserir lote ${Math.floor(i/batchSize) + 1} na tabela ${tableName}:`, insertError);
        return false;
      }
      
      inserted += batch.length;
      console.log(`  - Inseridos ${inserted}/${data.length} registros`);
    }
    
    console.log(`✓ Restauração da tabela ${tableName} concluída`);
    return true;
    
  } catch (err) {
    console.error(`Erro inesperado ao restaurar tabela ${tableName}:`, err);
    return false;
  }
}

async function restoreFromDataBackup(backupFilename) {
  const filepath = path.join(__dirname, backupFilename);
  
  if (!fs.existsSync(filepath)) {
    console.error(`Arquivo de backup não encontrado: ${backupFilename}`);
    return false;
  }
  
  try {
    console.log(`Carregando backup de dados: ${backupFilename}`);
    const backupData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    console.log(`Backup criado em: ${backupData.timestamp}`);
    console.log(`Tabelas no backup: ${Object.keys(backupData.tables).length}`);
    
    // Confirmar antes de prosseguir
    console.log('\n⚠️  ATENÇÃO: Esta operação irá SUBSTITUIR todos os dados existentes!');
    console.log('Pressione Ctrl+C para cancelar ou Enter para continuar...');
    
    // Em ambiente de produção, você pode querer adicionar uma confirmação interativa
    // await new Promise(resolve => process.stdin.once('data', resolve));
    
    let successCount = 0;
    const totalTables = Object.keys(backupData.tables).length;
    
    for (const [tableName, tableData] of Object.entries(backupData.tables)) {
      const success = await restoreTableData(tableName, tableData);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n✓ Restauração concluída: ${successCount}/${totalTables} tabelas restauradas com sucesso`);
    return successCount === totalTables;
    
  } catch (err) {
    console.error('Erro ao restaurar backup:', err);
    return false;
  }
}

function showAvailableBackups() {
  const { dataBackups, schemaBackups } = listBackupFiles();
  
  console.log('=== BACKUPS DISPONÍVEIS ===\n');
  
  console.log('📊 Backups de Dados:');
  if (dataBackups.length === 0) {
    console.log('  Nenhum backup de dados encontrado');
  } else {
    dataBackups.forEach((file, index) => {
      const timestamp = file.replace('data-backup-', '').replace('.json', '');
      console.log(`  ${index + 1}. ${file} (${timestamp})`);
    });
  }
  
  console.log('\n🏗️  Backups de Schema:');
  if (schemaBackups.length === 0) {
    console.log('  Nenhum backup de schema encontrado');
  } else {
    schemaBackups.forEach((file, index) => {
      const timestamp = file.replace('schema-backup-', '').replace('.json', '');
      console.log(`  ${index + 1}. ${file} (${timestamp})`);
    });
  }
  
  console.log('\n💡 Para restaurar um backup:');
  console.log('   node restore.js <nome-do-arquivo>');
  console.log('   Exemplo: node restore.js data-backup-2025-01-29T10-30-00-000Z.json');
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showAvailableBackups();
    return;
  }
  
  const backupFile = args[0];
  
  if (backupFile.startsWith('data-backup-')) {
    await restoreFromDataBackup(backupFile);
  } else if (backupFile.startsWith('schema-backup-')) {
    console.log('⚠️  Restauração de schema não implementada ainda.');
    console.log('Use o arquivo .sql gerado para restaurar o schema manualmente.');
  } else {
    console.error('Arquivo de backup não reconhecido. Use um arquivo que comece com "data-backup-" ou "schema-backup-"');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { restoreFromDataBackup, restoreTableData, listBackupFiles };