#!/usr/bin/env node
/*
  check_and_delete_direct.js
  - Verifica usuários diretamente em auth.users via REST (Accept-Profile: auth)
  - Para cada usuário encontrado, tenta deletar:
      1) DELETE direto (SQL via PostgREST REST)
      2) DELETE via Admin API REST
  - Suporta preview (dry-run) e execução real (--execute)
  - Uso:
    node scripts/check_and_delete_direct.js --emails "clinica@exemplo.com,paciente@exemplo.com" [--execute]
*/

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carrega .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[Error] SUPABASE_URL ou SERVICE_ROLE_KEY ausentes no .env');
  process.exit(1);
}

// Util: parse args
function parseArgs() {
  const args = process.argv.slice(2);
  const out = { emails: [], execute: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--emails') {
      const v = args[i + 1] || '';
      i++;
      out.emails = v.split(',').map(s => s.trim()).filter(Boolean);
    } else if (a === '--execute') {
      out.execute = true;
    } else if (a === '--dry-run') {
      out.execute = false;
    }
  }
  return out;
}

const { emails, execute } = parseArgs();
if (!emails.length) {
  console.log('[Usage] node scripts/check_and_delete_direct.js --emails "a@b.com,c@d.com" [--execute]');
  process.exit(0);
}

// Helpers de HTTP
async function httpJson(method, url, headers = {}, body) {
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': ANON_KEY || SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, ok: res.ok, json, text };
}

function buildInFilter(values) {
  // PostgREST in.("a","b") precisa ser URL-encoded
  const escaped = values.map(v => `"${v}"`).join(',');
  return `in.(${escaped})`;
}

async function listAdminUsers(maxPages = 10, perPage = 200) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const url = `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`;
    const { status, ok, json, text } = await httpJson('GET', url);
    if (!ok) {
      throw new Error(`Falha ao listar usuários via Admin API (status ${status}): ${text}`);
    }
    if (!Array.isArray(json) || json.length === 0) break;
    all.push(...json);
    if (json.length < perPage) break;
  }
  return all;
}
async function queryAuthUsersByEmails(emails) {
  const filter = buildInFilter(emails);
  const url = `${SUPABASE_URL}/rest/v1/users?select=id,email,created_at&email=${encodeURIComponent(filter)}`;
  const r = await httpJson('GET', url, {
    'Accept-Profile': 'auth',
    'Content-Profile': 'auth',
    'Prefer': 'count=exact'
  });
  if (r.ok) {
    return Array.isArray(r.json) ? r.json : [];
  }
  if (r.status === 406) {
    console.warn('[Warn] PostgREST não expõe schema auth. Fazendo fallback para Admin API.');
    const set = new Set(emails.map(e => e.toLowerCase()));
    const adminUsers = await listAdminUsers();
    return adminUsers
      .filter(u => u.email && set.has(String(u.email).toLowerCase()))
      .map(u => ({ id: u.id, email: u.email, created_at: u.created_at }));
  }
  throw new Error(`Falha ao consultar auth.users (status ${r.status}): ${r.text}`);
}

async function deleteAuthUserBySql(id) {
  const url = `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(id)}`;
  const { status, ok, json, text } = await httpJson('DELETE', url, {
    'Accept-Profile': 'auth',
    'Content-Profile': 'auth'
  });
  const success = ok || status === 204 || status === 200;
  return { success, status, body: json ?? text };
}

async function deleteAuthUserByAdmin(id) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(id)}`;
  const { status, ok, json, text } = await httpJson('DELETE', url);
  const success = ok || status === 204 || status === 200;
  return { success, status, body: json ?? text };
}

function printPreview(found, emails) {
  const foundEmails = new Set(found.map(u => u.email));
  for (const e of emails) {
    if (foundEmails.has(e)) {
      console.log(`[Preview] FOUND: ${e}`);
    } else {
      console.log(`[Preview] NOT FOUND: ${e}`);
    }
  }
}

function pad(str, n) { return String(str).padEnd(n); }

(async () => {
  console.log(`[Start] check_and_delete_direct | execute=${execute} | emails=${emails.join(', ')}`);
  try {
    const found = await queryAuthUsersByEmails(emails);
    console.log(`[Info] auth.users matched: ${found.length}`);
    printPreview(found, emails);

    const byEmail = new Map(found.map(u => [u.email, u]));
    const report = [];

    for (const e of emails) {
      const entry = { email: e, exists: false, sql: null, admin: null, final: 'not_found' };
      const user = byEmail.get(e);
      if (!user) {
        report.push(entry);
        continue;
      }
      entry.exists = true;

      if (!execute) {
        entry.final = 'preview_only';
        report.push(entry);
        continue;
      }

      // 1) Tenta DELETE direto
      try {
        const r1 = await deleteAuthUserBySql(user.id);
        entry.sql = { success: r1.success, status: r1.status, body: r1.body };
      } catch (err) {
        entry.sql = { success: false, status: 0, body: String(err && err.message || err) };
      }

      // 2) Tenta DELETE via Admin API
      try {
        const r2 = await deleteAuthUserByAdmin(user.id);
        entry.admin = { success: r2.success, status: r2.status, body: r2.body };
      } catch (err) {
        entry.admin = { success: false, status: 0, body: String(err && err.message || err) };
      }

      // Final status
      const okSql = entry.sql && entry.sql.success;
      const okAdmin = entry.admin && entry.admin.success;
      if (okSql || okAdmin) {
        entry.final = 'deleted';
      } else {
        entry.final = 'failed';
      }

      report.push(entry);
    }

    // Imprime relatório
    console.log('\n[Final Report]');
    console.log(pad('Email', 35), pad('Exists', 8), pad('SQL(status)', 12), pad('Admin(status)', 14), 'Final');
    for (const r of report) {
      const sqlStatus = r.sql ? r.sql.status : '';
      const adminStatus = r.admin ? r.admin.status : '';
      console.log(pad(r.email, 35), pad(String(r.exists), 8), pad(String(sqlStatus), 12), pad(String(adminStatus), 14), r.final);
    }

    const summary = {
      found: report.filter(r => r.exists).length,
      deleted: report.filter(r => r.final === 'deleted').length,
      failed: report.filter(r => r.final === 'failed').length,
      protected: report.filter(r => r.final === 'protected').length,
      not_found: report.filter(r => r.final === 'not_found').length,
      preview_only: report.filter(r => r.final === 'preview_only').length,
    };

    console.log(`\n[Summary] Found: ${summary.found}, Deleted: ${summary.deleted}, Failed: ${summary.failed}, Not found: ${summary.not_found}, Preview: ${summary.preview_only}`);

    if (!execute) {
      console.log('[Done] This was a READ-ONLY preview. No data was modified.');
    }
  } catch (err) {
    console.error('[Fatal Error]', err && err.message ? err.message : err);
    process.exit(1);
  }
})();