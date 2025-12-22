#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('[Error] SUPABASE_URL ou SERVICE_ROLE_KEY ausentes no .env');
  process.exit(1);
}

async function httpJson(method, url, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      'apikey': ANON_KEY || SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      ...headers,
    }
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, ok: res.ok, json, text };
}

async function listAdminUsers(maxPages = 10, perPage = 200) {
  const all = [];
  for (let page = 1; page <= maxPages; page++) {
    const { status, ok, json, text } = await httpJson('GET', `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${perPage}`);
    if (!ok) throw new Error(`Falha ao listar (status ${status}): ${text}`);
    // The Admin API may return either an array or an object { users: [...] }
    let users = [];
    if (Array.isArray(json)) users = json;
    else if (json && Array.isArray(json.users)) users = json.users;
    else users = [];
    if (!users.length) break;
    all.push(...users);
    if (users.length < perPage) break;
  }
  return all;
}

(async () => {
  try {
    const users = await listAdminUsers();
    console.log(`[Info] Total users: ${users.length}`);
    const rows = users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })).slice(0, 200);
    for (const r of rows) {
      console.log(`${String(r.email).padEnd(35)} ${String(r.id).padEnd(40)} ${r.created_at}`);
    }
  } catch (err) {
    console.error('[Fatal Error]', err && err.message ? err.message : err);
    process.exit(1);
  }
})();