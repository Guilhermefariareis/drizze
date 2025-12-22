import { backupAllData } from './backup-data.js';
import { backupSchema } from './backup-schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFullBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  console.log('🚀 Iniciando backup completo...');
  console.log(`Timestamp: ${timestamp}\n`);
  
  const startTime = Date.now();
  
  try {
    // 1. Backup do Schema
    console.log('📋 Fase 1: Backup do Schema');
    console.log('=' .repeat(40));
    await backupSchema();
    console.log('\n');
    
    // 2. Backup dos Dados
    console.log('📊 Fase 2: Backup dos Dados');
    console.log('=' .repeat(40));
    await backupAllData();
    console.log('\n');
    
    // 3. Criar arquivo de manifesto
    console.log('📝 Fase 3: Criando manifesto do backup');
    console.log('=' .repeat(40));
    
    const manifest = {
      backup_id: `full-backup-${timestamp}`,
      created_at: new Date().toISOString(),
      type: 'full_backup',
      files: {
        schema_json: `schema-backup-${timestamp}.json`,
        schema_sql: `schema-backup-${timestamp}.sql`,
        data_json: `data-backup-${timestamp}.json`
      },
      metadata: {
        supabase_url: 'https://irrtjredcrwucrnagune.supabase.co',
        backup_version: '1.0.0',
        node_version: process.version
      }
    };
    
    const manifestPath = path.join(__dirname, `manifest-${timestamp}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✓ Manifesto criado: manifest-${timestamp}.json`);
    
    // 4. Verificar integridade dos arquivos
    console.log('\n🔍 Fase 4: Verificando integridade dos arquivos');
    console.log('=' .repeat(40));
    
    const files = Object.values(manifest.files);
    let allFilesExist = true;
    
    for (const file of files) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✓ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`✗ ${file} - ARQUIVO NÃO ENCONTRADO!`);
        allFilesExist = false;
      }
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '=' .repeat(50));
    if (allFilesExist) {
      console.log('🎉 BACKUP COMPLETO REALIZADO COM SUCESSO!');
    } else {
      console.log('⚠️  BACKUP CONCLUÍDO COM PROBLEMAS!');
    }
    console.log('=' .repeat(50));
    console.log(`⏱️  Tempo total: ${duration} segundos`);
    console.log(`📁 Arquivos criados:`);
    files.forEach(file => console.log(`   - ${file}`));
    console.log(`   - manifest-${timestamp}.json`);
    
    console.log('\n💡 Para restaurar este backup:');
    console.log(`   node restore.js data-backup-${timestamp}.json`);
    
    return {
      success: allFilesExist,
      manifest,
      duration,
      files: [...files, `manifest-${timestamp}.json`]
    };
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE O BACKUP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para listar todos os backups disponíveis
function listAllBackups() {
  const backupDir = __dirname;
  const files = fs.readdirSync(backupDir);
  
  const manifests = files
    .filter(f => f.startsWith('manifest-') && f.endsWith('.json'))
    .map(f => {
      try {
        const content = JSON.parse(fs.readFileSync(path.join(backupDir, f), 'utf8'));
        return { filename: f, ...content };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  console.log('📋 HISTÓRICO DE BACKUPS COMPLETOS\n');
  
  if (manifests.length === 0) {
    console.log('Nenhum backup completo encontrado.');
    return;
  }
  
  manifests.forEach((manifest, index) => {
    const date = new Date(manifest.created_at).toLocaleString('pt-BR');
    console.log(`${index + 1}. ${manifest.backup_id}`);
    console.log(`   📅 Criado em: ${date}`);
    console.log(`   📁 Arquivos: ${Object.keys(manifest.files).length + 1}`);
    
    // Verificar se os arquivos ainda existem
    const missingFiles = Object.values(manifest.files).filter(file => 
      !fs.existsSync(path.join(backupDir, file))
    );
    
    if (missingFiles.length > 0) {
      console.log(`   ⚠️  Arquivos faltando: ${missingFiles.length}`);
    } else {
      console.log(`   ✅ Todos os arquivos presentes`);
    }
    console.log('');
  });
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    listAllBackups();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('🔧 SISTEMA DE BACKUP COMPLETO\n');
    console.log('Uso:');
    console.log('  node backup-full.js          # Criar novo backup completo');
    console.log('  node backup-full.js --list   # Listar backups existentes');
    console.log('  node backup-full.js --help   # Mostrar esta ajuda\n');
    console.log('Este script cria um backup completo incluindo:');
    console.log('  - Schema do banco (JSON + SQL)');
    console.log('  - Todos os dados das tabelas (JSON)');
    console.log('  - Manifesto com metadados do backup\n');
    return;
  }
  
  await createFullBackup();
}

// Executar se chamado diretamente
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch(console.error);
}

export { createFullBackup, listAllBackups };