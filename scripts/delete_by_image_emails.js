#!/usr/bin/env node
/**
 * Delete Users by Image Emails — lists, previews, backs up clinic refs, and deletes
 *
 * - Default: DRY-RUN (no writes). Use --execute to perform changes.
 * - Protects master@doutorizze.com.br from deletion always.
 * - Backs up clinic references (master_user_id, owner_user_id) before clearing them.
 * - Deletes auth user via Admin API after clearing references.
 *
 * Usage:
 *   node scripts/delete_by_image_emails.js                 # dry-run with default emails
 *   node scripts/delete_by_image_emails.js --execute       # execute deletions
 *   node scripts/delete_by_image_emails.js --emails e1@x.com,e2@x.com [--execute]
 *
 * Requires .env:
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[delete_by_image_emails] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { emails: [
    'paciente@notificacoes.com',
    'admin@auditoriza.com',
    'clinica@lexaproprime.com',
    'paciente02@exemplo.com',
    'teste_manual_1754607@exemplo.com',
  ], execute: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--emails' && args[i+1]) { opts.emails = String(args[++i]).split(',').map(s => s.trim()).filter(Boolean); }
    else if (a === '--execute') { opts.execute = true; }
    else if (a === '--dry-run') { opts.execute = false; }
  }
  return opts;
}

async function listUsersAll(max = 1000) {
  const pageSize = 200;
  let page = 1;
  const collected = [];
  while (collected.length < max) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) throw error;
    const users = data?.users ?? [];
    if (!users.length) break;
    collected.push(...users);
    if (users.length < pageSize) break;
    page++;
  }
  return collected;
}

async function getClinicRefs(userId) {
  const refs = { master_user_id: [], owner_user_id: [] };
  const errors = [];
  try {
    const { data: mData, error: mErr } = await supabase
      .from('clinics')
      .select('id, master_user_id')
      .eq('master_user_id', userId);
    if (mErr) errors.push(`clinics.master_user_id: ${mErr.message}`);
    else refs.master_user_id = (mData || []).map(r => ({ id: r.id, master_user_id: r.master_user_id }));
  } catch (e) {
    errors.push(`clinics.master_user_id: ${String(e?.message || e)}`);
  }
  try {
    const { data: oData, error: oErr } = await supabase
      .from('clinics')
      .select('id, owner_user_id')
      .eq('owner_user_id', userId);
    if (oErr) errors.push(`clinics.owner_user_id: ${oErr.message}`);
    else refs.owner_user_id = (oData || []).map(r => ({ id: r.id, owner_user_id: r.owner_user_id }));
  } catch (e) {
    errors.push(`clinics.owner_user_id: ${String(e?.message || e)}`);
  }
  return { refs, errors };
}

function ensureBackupDir() {
  const dir = path.resolve(process.cwd(), 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeBackup(email, userId, clinicRefs) {
  const dir = ensureBackupDir();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(dir, `clinic-refs-backup-${email}-${stamp}.json`);
  const payload = { email, userId, clinicRefs };
  fs.writeFileSync(filename, JSON.stringify(payload, null, 2));
  return filename;
}

async function clearClinicRefs(userId) {
  const actions = [];
  try {
    const { error } = await supabase
      .from('clinics')
      .update({ master_user_id: null })
      .eq('master_user_id', userId);
    actions.push({ column: 'master_user_id', ok: !error, error: error?.message || '' });
  } catch (e) {
    actions.push({ column: 'master_user_id', ok: false, error: String(e?.message || e) });
  }
  try {
    const { error } = await supabase
      .from('clinics')
      .update({ owner_user_id: null })
      .eq('owner_user_id', userId);
    actions.push({ column: 'owner_user_id', ok: !error, error: error?.message || '' });
  } catch (e) {
    actions.push({ column: 'owner_user_id', ok: false, error: String(e?.message || e) });
  }
  return actions;
}

async function deleteAuthUser(userId) {
  try {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    return { ok: !error, error: error?.message || '' };
  } catch (e) {
    return { ok: false, error: String(e?.message || e) };
  }
}

async function main() {
  const { emails, execute } = parseArgs();
  const protectedEmail = 'master@doutorizze.com.br';
  console.log(`[delete_by_image_emails] Emails target: ${emails.join(', ')} | execute=${execute}`);

  const allUsers = await listUsersAll(1000);
  const byEmail = new Map(allUsers.map(u => [(u.email || '').toLowerCase(), u]));

  const previewRows = [];
  const tasks = [];

  for (const email of emails) {
    const lower = email.toLowerCase();
    const user = byEmail.get(lower) || null;
    if (!user) {
      previewRows.push({ email, found: false, user_id: '', clinics_master: 0, clinics_owner: 0, protected: lower === protectedEmail });
      continue;
    }
    const { refs, errors } = await getClinicRefs(user.id);
    previewRows.push({ email, found: true, user_id: user.id, clinics_master: refs.master_user_id.length, clinics_owner: refs.owner_user_id.length, protected: lower === protectedEmail, errors: errors.length });
    tasks.push({ email, user, refs, errors });
  }

  console.log('\n[Preview] Users and clinic references');
  console.table(previewRows);

  if (!execute) {
    console.log('\n[Dry-run] No changes were made. Use --execute to perform deletions.');
    return;
  }

  const finalReport = [];
  for (const t of tasks) {
    if (t.email.toLowerCase() === protectedEmail) {
      finalReport.push({ email: t.email, step: 'protected', ok: true, note: 'skipped' });
      continue;
    }
    const backupFile = writeBackup(t.email, t.user.id, t.refs);
    finalReport.push({ email: t.email, step: 'backup', ok: true, note: backupFile });

    const clearActions = await clearClinicRefs(t.user.id);
    clearActions.forEach(a => finalReport.push({ email: t.email, step: `clear clinics.${a.column}`, ok: a.ok, note: a.error ? `WARN: ${a.error}` : '' }));

    const del = await deleteAuthUser(t.user.id);
    finalReport.push({ email: t.email, step: 'delete auth.user', ok: del.ok, note: del.error });
  }

  console.log('\n[Final Report]');
  console.table(finalReport);
}

main().catch(err => {
  console.error('[delete_by_image_emails] Fatal error:', err?.message || err);
  process.exit(1);
});