#!/usr/bin/env node
/**
 * Safe User Delete — interactive, confirmation-based, and dependency-aware
 *
 * Default: DRY-RUN (no writes). Only deletes if you pass --execute and confirm "SIM".
 * Order: delete dependent public rows -> delete profile -> delete auth user.
 *
 * Usage:
 *   node scripts/delete_user_safe.js --email user@example.com             # DRY-RUN preview
 *   node scripts/delete_user_safe.js --email user@example.com --execute    # Executes after confirmation
 *   node scripts/delete_user_safe.js --email user@example.com --execute --yes SIM   # Non-interactive confirm
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
  console.error('[delete_user_safe] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { email: '', execute: false, yes: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--email' && args[i + 1]) { opts.email = String(args[++i]); }
    else if (a === '--execute') { opts.execute = true; }
    else if (a === '--yes' && args[i + 1]) { opts.yes = String(args[++i]); }
  }
  if (!opts.email) {
    console.error('[delete_user_safe] Missing --email user@example.com');
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
  // Define dependency tables and columns that may reference the user
  const spec = {
    appointments: ['user_id', 'profile_id', 'created_by', 'patient_id'],
    messages: ['user_id', 'sender_id', 'receiver_id', 'profile_id'],
    notifications: ['user_id', 'profile_id', 'target_user_id'],
    // add more safely as needed:
    // clinic_leads: ['user_id', 'profile_id'],
    // credit_requests: ['user_id', 'profile_id', 'patient_id'],
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

function printPreview(user, profile, targets) {
  console.log('\n[Preview] User to delete');
  console.table([{ id: user.id, email: user.email, created_at: user.created_at, profile_exists: !!profile }]);

  console.log('\n[Preview] Dependent rows per table (unique ids)');
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
  // 1) Delete dependent rows per table
  for (const [table, info] of Object.entries(targets)) {
    const { deleted, error } = await deleteByIds(table, info.ids);
    report.push({ step: `delete ${table}`, deleted, error: error || '' });
  }
  // 2) Delete profile
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
  report.push({ step: 'delete profiles', deleted: profileDeleted, error: profileErr });

  // 3) Delete auth user via Admin API
  let authErr = '';
  try {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    authErr = error?.message || '';
  } catch (e) {
    authErr = String(e?.message || e);
  }
  report.push({ step: 'delete auth.users', deleted: authErr ? 0 : 1, error: authErr });

  return report;
}

async function main() {
  const { email, execute, yes } = parseArgs();
  console.log(`[delete_user_safe] Looking up user by email: ${email}`);
  const user = await findUserByEmail(email);
  if (!user) {
    console.error('[delete_user_safe] User not found');
    process.exit(1);
  }

  const { profile } = await getProfile(user.id);
  const targets = await collectDeleteTargets(user.id);
  printPreview(user, profile, targets);

  if (!execute) {
    console.log('\n[Dry-run] No changes were made. Pass --execute to proceed.');
    return;
  }

  let confirmation = yes;
  if (!confirmation) {
    confirmation = await confirmInteractive('\nType "SIM" to confirm deletion (anything else cancels): ');
  }
  if (confirmation !== 'SIM') {
    console.log('[Aborted] Confirmation not given. No changes were made.');
    return;
  }

  console.log('\n[Executing] Deleting dependent rows, then profile, then auth user...');
  const report = await executeDeletion(user, targets);
  console.log('\n[Report]');
  console.table(report);
  console.log('\n[Done] Deletion flow completed.');
}

main().catch(err => {
  console.error('[delete_user_safe] Error:', err?.message || err);
  process.exit(1);
});