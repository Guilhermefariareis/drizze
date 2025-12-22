# 🔄 Sistema de Backup Completo - Doutorizze

Este diretório contém um sistema completo de backup e restauração para o banco de dados Supabase do projeto Doutorizze.

## 📁 Estrutura dos Arquivos

```
backups/
├── backup-data.js      # Script para backup de dados
├── backup-schema.js    # Script para backup do schema
├── backup-full.js      # Script para backup completo
├── restore.js          # Script para restauração
├── README-backup.md    # Esta documentação
└── [arquivos de backup gerados]
```

## 🚀 Como Usar

### Pré-requisitos

Certifique-se de que as dependências estão instaladas:
```bash
npm install @supabase/supabase-js
```

### 1. Backup Completo (Recomendado)

Para criar um backup completo (dados + schema):
```bash
cd backups
node backup-full.js
```

Este comando irá:
- ✅ Fazer backup de todas as tabelas (dados)
- ✅ Fazer backup da estrutura do banco (schema)
- ✅ Criar um manifesto com metadados
- ✅ Verificar a integridade dos arquivos

### 2. Backup Apenas dos Dados

Para fazer backup somente dos dados:
```bash
cd backups
node backup-data.js
```

### 3. Backup Apenas do Schema

Para fazer backup somente da estrutura:
```bash
cd backups
node backup-schema.js
```

### 4. Listar Backups Disponíveis

Para ver todos os backups criados:
```bash
cd backups
node backup-full.js --list
```

### 5. Restaurar um Backup

⚠️ **ATENÇÃO**: A restauração substitui TODOS os dados existentes!

```bash
cd backups
node restore.js                                    # Listar backups disponíveis
node restore.js data-backup-2025-01-29T10-30-00.json  # Restaurar backup específico
```

## 📊 Tipos de Arquivo Gerados

### Backup de Dados
- **Arquivo**: `data-backup-YYYY-MM-DDTHH-mm-ss.json`
- **Conteúdo**: Todos os dados das tabelas em formato JSON
- **Tabelas incluídas**:
  - `profiles`
  - `clinics`
  - `credit_requests`
  - `subscription_plans`
  - `subscriptions`

### Backup de Schema
- **Arquivo JSON**: `schema-backup-YYYY-MM-DDTHH-mm-ss.json`
- **Arquivo SQL**: `schema-backup-YYYY-MM-DDTHH-mm-ss.sql`
- **Conteúdo**: Estrutura completa das tabelas (colunas, tipos, constraints)

### Manifesto
- **Arquivo**: `manifest-YYYY-MM-DDTHH-mm-ss.json`
- **Conteúdo**: Metadados do backup completo
- **Inclui**: Lista de arquivos, timestamps, versões

## 🔧 Configuração

Os scripts estão configurados para usar:
- **URL do Supabase**: `https://irrtjredcrwucrnagune.supabase.co`
- **Service Role Key**: Configurada nos scripts (necessária para acesso completo)

## ⚠️ Avisos Importantes

### Segurança
- ✅ Os scripts usam a **Service Role Key** para acesso completo
- ⚠️ **NUNCA** exponha esta chave no frontend
- 🔒 Mantenha os arquivos de backup seguros (contêm dados sensíveis)

### Restauração
- ⚠️ A restauração **SUBSTITUI** todos os dados existentes
- 💾 Sempre faça um backup antes de restaurar
- 🧪 Teste a restauração em ambiente de desenvolvimento primeiro

### Performance
- 📊 Backups grandes podem demorar alguns minutos
- 🔄 A restauração é feita em lotes de 100 registros
- 💾 Arquivos de backup podem ser grandes dependendo dos dados

## 🛠️ Solução de Problemas

### Erro: "permission denied for table"
```bash
# Verifique se a Service Role Key está correta
# Verifique se as políticas RLS permitem acesso
```

### Erro: "table does not exist"
```bash
# A tabela pode não existir no banco
# Verifique se o schema está atualizado
```

### Backup muito lento
```bash
# Reduza o número de tabelas no array TABLES
# Execute backups em horários de menor uso
```

## 📋 Checklist de Backup

Antes de fazer alterações importantes:

- [ ] Executar `node backup-full.js`
- [ ] Verificar se todos os arquivos foram criados
- [ ] Confirmar tamanhos dos arquivos (não devem estar vazios)
- [ ] Testar restauração em ambiente de desenvolvimento
- [ ] Documentar o motivo do backup

## 🔄 Automação (Opcional)

Para automatizar backups diários, você pode:

1. **Windows (Task Scheduler)**:
   ```cmd
   # Criar tarefa agendada para executar:
   cd C:\caminho\para\projeto\backups && node backup-full.js
   ```

2. **Linux/Mac (Cron)**:
   ```bash
   # Adicionar ao crontab:
   0 2 * * * cd /caminho/para/projeto/backups && node backup-full.js
   ```

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs de erro no console
2. Confirme se o Supabase está acessível
3. Verifique se as credenciais estão corretas
4. Teste com uma tabela menor primeiro

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Compatibilidade**: Node.js 18+, Supabase