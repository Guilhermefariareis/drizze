#!/usr/bin/env node
/**
 * Safe Users Viewer — READ-ONLY
 * Lists Supabase users and previews dependent records in public tables.
 *
 * What it does:
 * - Lists users (email, created_at)
 * - Shows profile existence and role
 * - Counts potential dependencies in: profiles, appointments, clinics, messages, notifications
 * - Pretty output via console.table
 *
 * What it DOES NOT do:
 * - No deletions, no updates, no writes — 100% read-only
 *
 * Usage:
 *   node scripts/view_users_safe.js [--max 50] [--filter email_substring]
 *
 * Requires .env with:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (service role is needed to bypass RLS for admin listing)
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[view_users_safe] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { max: 100, filter: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--max' && args[i + 1]) {
      opts.max = Number(args[i + 1]) || opts.max;
      i++;
    } else if (a === '--filter' && args[i + 1]) {
      opts.filter = String(args[i + 1]).toLowerCase();
      i++;
    }
  }
  return opts;
}

async function listUsersAll(max = 1000, filter = '') {
  const pageSize = Math.min(max, 200);
  let page = 1;
  const collected = [];
  while (collected.length < max) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) throw error;
    const users = data?.users ?? [];
    if (!users.length) break;
    for (const u of users) {
      if (filter && !(u.email || '').toLowerCase().includes(filter)) continue;
      collected.push(u);
      if (collected.length >= max) break;
    }
    if (users.length < pageSize) break;
    page++;
  }
  return collected;
}

async function countByColumn(table, column, value) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq(column, value);
    if (error) {
      // Column might not exist or RLS, treat as 0 and annotate
      return { count: 0, column, ok: false, error: error.message };
    }
    return { count: count || 0, column, ok: true };
  } catch (e) {
    return { count: 0, column, ok: false, error: String(e?.message || e) };
  }
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

async function buildDependencies(user) {
  const userId = user.id;
  const tables = {
    profiles: ['id'],
    appointments: ['user_id', 'profile_id', 'created_by', 'patient_id'],
    clinics: ['user_id', 'owner_id', 'profile_id'],
    messages: ['user_id', 'sender_id', 'receiver_id', 'profile_id'],
    notifications: ['user_id', 'profile_id', 'target_user_id'],
  };

  const result = {};
  let total = 0;

  for (const [table, columns] of Object.entries(tables)) {
    result[table] = { total: 0, byColumn: [] };
    for (const col of columns) {
      const r = await countByColumn(table, col, userId);
      result[table].byColumn.push(r);
      if (r.ok) {
        result[table].total += r.count;
        total += r.count;
      }
    }
  }
  return { dependencies: result, totalDependencies: total };
}

function roleFrom(user, profile) {
  return (
    profile?.role ||
    user?.user_metadata?.role ||
    (user?.email || '').toLowerCase().includes('admin') ? 'admin' :
    (user?.email || '').toLowerCase().includes('clinic') ? 'clinic' :
    'patient'
  );
}

async function main() {
  const { max, filter } = parseArgs();
  console.log(`[view_users_safe] Listing users (max=${max}, filter='${filter}')...`);
  const users = await listUsersAll(max, filter);
  console.log(`[view_users_safe] Found ${users.length} users`);

  const summaryRows = [];
  const detailsPerUser = [];

  for (const user of users) {
    const { profile } = await getProfile(user.id);
    const { dependencies, totalDependencies } = await buildDependencies(user);
    const role = roleFrom(user, profile);

    summaryRows.push({
      id: user.id,
      email: user.email,
      role,
      profile_exists: !!profile,
      created_at: user.created_at,
      deps_total: totalDependencies,
      profiles: dependencies.profiles.total,
      appointments: dependencies.appointments.total,
      clinics: dependencies.clinics.total,
      messages: dependencies.messages.total,
      notifications: dependencies.notifications.total,
    });

    detailsPerUser.push({ user: { id: user.id, email: user.email }, dependencies });
  }

  console.log('\n[Summary] Users and dependency counts');
  console.table(summaryRows);

  console.log('\n[Details] Per-table breakdown (by column)');
  for (const entry of detailsPerUser) {
    console.log(`\nUser: ${entry.user.email} (${entry.user.id})`);
    for (const [table, info] of Object.entries(entry.dependencies)) {
      const rows = info.byColumn.map(r => ({ table, column: r.column, ok: r.ok, count: r.count, error: r.error || '' }));
      console.table(rows);
    }
  }

  console.log('\n[Done] This was a READ-ONLY preview. No data was modified.');
}

main().catch(err => {
  console.error('[view_users_safe] Error:', err?.message || err);
  process.exit(1);
});