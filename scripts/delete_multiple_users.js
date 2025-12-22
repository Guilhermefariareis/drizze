#!/usr/bin/env node
/**
 * Bulk Users Delete — dry-run first, single confirmation, dependency-aware
 *
 * Default: DRY-RUN (no writes). Only deletes if you pass --execute and confirm "EXCLUIR TODOS".
 * Order per user: delete dependent public rows -> delete profile -> delete auth user.
 *
 * Usage:
 *   node scripts/delete_multiple_users.js --emails email1@ex.com,email2@ex.com
 *   node scripts/delete_multiple_users.js --emails email1@ex.com,email2@ex.com --execute
 *   node scripts/delete_multiple_users.js --emails email1@ex.com,email2@ex.com --execute --yes "EXCLUIR TODOS"
 *
 * Requires .env:
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import readline from 'node:readline';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[delete_multiple_users] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { emails: [], execute: false, yes: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--emails' && args[i + 1]) { opts.emails = String(args[++i]).split(',').map(s => s.trim()).filter(Boolean); }
    else if (a === '--execute') { opts.execute = true; }
    else if (a === '--yes' && args[i + 1]) { opts.yes = String(args[++i]); }
  }
  if (!opts.emails.length) {
    console.error('[delete_multiple_users] Missing --emails email1,email2');
    process.exit(1);
  }
  return opts;
}

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    const match = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (users.length < perPage) break;
    page++;
  }
  return null;
}

async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return { profile: null, error: error.message };
  return { profile: data || null, error: null };
}

async function selectIds(table, column, userId) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq(column, userId);
    if (error) return { ids: [], error: error.message };
    return { ids: (data || []).map(r => r.id), error: null };
  } catch (e) {
    return { ids: [], error: String(e?.message || e) };
  }
}

async function collectDeleteTargets(userId) {
  const spec = {
    appointments: ['user_id', 'profile_id', 'created_by', 'patient_id'],
    messages: ['user_id', 'sender_id', 'receiver_id', 'profile_id'],
    notifications: ['user_id', 'profile_id', 'target_user_id'],
    // add more tables as needed
  };
  const targets = {};
  for (const [table, columns] of Object.entries(spec)) {
    const idSet = new Set();
    const errors = [];
    for (const col of columns) {
      const { ids, error } = await selectIds(table, col, userId);
      if (error) errors.push(`${table}.${col}: ${error}`);
      ids.forEach(id => idSet.add(id));
    }
    targets[table] = { ids: [...idSet], errors };
  }
  return targets;
}

async function deleteByIds(table, ids) {
  if (!ids.length) return { deleted: 0, error: null };
  try {
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .in('id', ids);
    if (error) return { deleted: 0, error: error.message };
    return { deleted: count || ids.length, error: null };
  } catch (e) {
    return { deleted: 0, error: String(e?.message || e) };
  }
}

async function confirmInteractive(promptText) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => rl.question(promptText, resolve));
  rl.close();
  return answer;
}

function printUserPreview(user, profile, targets) {
  console.log(`\n[Preview] ${user.email} (${user.id})`);
  console.table([{ id: user.id, email: user.email, created_at: user.created_at, profile_exists: !!profile }]);
  const rows = [];
  for (const [table, info] of Object.entries(targets)) {
    rows.push({ table, rows: info.ids.length, errors: info.errors.length });
  }
  console.table(rows);
  for (const [table, info] of Object.entries(targets)) {
    if (info.errors.length) {
      console.log(`- Warnings in ${table}:`);
      info.errors.forEach(e => console.log(`  * ${e}`));
    }
  }
}

async function executeDeletion(user, targets) {
  const report = [];
  const perTableTotals = {};
  // delete dependent rows
  for (const [table, info] of Object.entries(targets)) {
    const { deleted, error } = await deleteByIds(table, info.ids);
    report.push({ user: user.email, step: `delete ${table}`, deleted, error: error || '' });
    perTableTotals[table] = (perTableTotals[table] || 0) + (error ? 0 : deleted);
  }
  // delete profile
  let profileDeleted = 0, profileErr = '';
  try {
    const { error, count } = await supabase
      .from('profiles')
      .delete({ count: 'exact' })
      .eq('id', user.id);
    profileDeleted = count || 0;
    profileErr = error?.message || '';
  } catch (e) {
    profileDeleted = 0;
    profileErr = String(e?.message || e);
  }
  report.push({ user: user.email, step: 'delete profiles', deleted: profileDeleted, error: profileErr });
  perTableTotals['profiles'] = (perTableTotals['profiles'] || 0) + (profileErr ? 0 : profileDeleted);

  // delete auth user via Admin API
  let authErr = '';
  try {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    authErr = error?.message || '';
  } catch (e) {
    authErr = String(e?.message || e);
  }
  report.push({ user: user.email, step: 'delete auth.users', deleted: authErr ? 0 : 1, error: authErr });

  return { report, perTableTotals };
}

async function main() {
  const { emails, execute, yes } = parseArgs();
  console.log(`[delete_multiple_users] Processing ${emails.length} emails`);

  // Dry-run preview for all
  const targetsPerUser = [];
  const foundUsers = [];
  const notFound = [];

  for (const email of emails) {
    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`[Preview] NOT FOUND: ${email}`);
      notFound.push(email);
      continue;
    }
    const { profile } = await getProfile(user.id);
    const targets = await collectDeleteTargets(user.id);
    printUserPreview(user, profile, targets);
    foundUsers.push(user);
    targetsPerUser.push({ user, profile, targets });
  }

  console.log(`\n[Summary] Found ${foundUsers.length}/${emails.length} users; Not found: ${notFound.length}`);
  if (!execute) {
    console.log('\n[Dry-run] No changes were made. Pass --execute to proceed.');
    return;
  }

  let confirmation = yes;
  if (!confirmation) {
    confirmation = await confirmInteractive(`\nDeseja excluir todos esses ${foundUsers.length} usuários? Digite EXCLUIR TODOS para confirmar: `);
  }
  if (confirmation !== 'EXCLUIR TODOS') {
    console.log('[Aborted] Confirmation not given. No changes were made.');
    return;
  }

  const finalReport = [];
  const totalsByTable = {};
  let successCount = 0;
  let failureCount = 0;

  for (const entry of targetsPerUser) {
    const { user, targets } = entry;
    try {
      const { report, perTableTotals } = await executeDeletion(user, targets);
      finalReport.push(...report);
      for (const [table, count] of Object.entries(perTableTotals)) {
        totalsByTable[table] = (totalsByTable[table] || 0) + count;
      }
      successCount++;
    } catch (e) {
      failureCount++;
      finalReport.push({ user: user.email, step: 'error', deleted: 0, error: String(e?.message || e) });
    }
  }

  console.log('\n[Final Report — per step]')
  console.table(finalReport)

  const totalsRows = Object.entries(totalsByTable).map(([table, count]) => ({ table, deleted: count }))
  console.log('\n[Totals by table]')
  console.table(totalsRows)

  console.log(`\n[Summary] Success: ${successCount}, Failures: ${failureCount}, Not found: ${notFound.length}`)
  if (notFound.length) {
    console.log('Not found emails:')
    notFound.forEach(e => console.log(` - ${e}`))
  }
  process.exit(failureCount > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('[delete_multiple_users] Fatal error:', err?.message || err)
  process.exit(1)
})