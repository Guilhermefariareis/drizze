#!/usr/bin/env node
/**
 * Delete Users (Direct REST) — default DRY-RUN, uses Supabase Auth Admin REST
 * Handles FK: clears clinics.master_user_id (and owner_user_id if exists) before deletion.
 *
 * Usage:
 *   node scripts/delete_users_direct.js --emails email1@ex.com,email2@ex.com
 *   node scripts/delete_users_direct.js --emails email1@ex.com,email2@ex.com --execute
 *   node scripts/delete_users_direct.js --emails email1@ex.com,email2@ex.com --execute --verbose
 *   node scripts/delete_users_direct.js --emails email1@ex.com,email2@ex.com --dry-run
 *
 * Requires .env:
 *   SUPABASE_URL or VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[delete_users_direct] Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/VITE_SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = { emails: [], execute: false, verbose: false }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--emails' && args[i + 1]) { opts.emails = String(args[++i]).split(',').map(s => s.trim()).filter(Boolean) }
    else if (a === '--execute') { opts.execute = true }
    else if (a === '--verbose') { opts.verbose = true }
    else if (a === '--dry-run') { opts.execute = false }
  }
  if (!opts.emails.length) {
    console.error('[delete_users_direct] Missing --emails email1,email2')
    process.exit(1)
  }
  return opts
}

async function findUserByEmail(email) {
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users ?? []
    const match = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
    if (match) return match
    if (users.length < perPage) break
    page++
  }
  return null
}

async function countClinicsBy(userId, column) {
  try {
    const { count, error } = await supabase
      .from('clinics')
      .select('id', { count: 'exact', head: true })
      .eq(column, userId)
    if (error) return { count: 0, error: error.message }
    return { count: count || 0, error: null }
  } catch (e) {
    return { count: 0, error: String(e?.message || e) }
  }
}

async function clearClinicsUserRefs(userId) {
  const columns = ['master_user_id', 'owner_user_id']
  const actions = []
  for (const col of columns) {
    const { count, error: countErr } = await countClinicsBy(userId, col)
    if (countErr) {
      actions.push({ column: col, cleared: 0, error: countErr })
      continue
    }
    if (count === 0) {
      actions.push({ column: col, cleared: 0, error: '' })
      continue
    }
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ [col]: null })
        .eq(col, userId)
      if (error) actions.push({ column: col, cleared: 0, error: error.message })
      else actions.push({ column: col, cleared: count, error: '' })
    } catch (e) {
      actions.push({ column: col, cleared: 0, error: String(e?.message || e) })
    }
  }
  return actions
}

async function deleteUserDirect(userId, verbose = false) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/admin/users/${userId}`
  const headers = {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Accept': 'application/json',
  }
  try {
    const res = await fetch(url, { method: 'DELETE', headers })
    const text = await res.text()
    if (verbose) {
      console.log(`[delete_users_direct] DELETE ${url} -> ${res.status}`)
      if (text) console.log('[delete_users_direct] Response body:', text)
    }
    if (res.status === 204 || res.status === 200) {
      return { ok: true, status: res.status, body: text || '' }
    }
    let body = text
    try { body = JSON.stringify(JSON.parse(text)) } catch {}
    return { ok: false, status: res.status, body }
  } catch (e) {
    return { ok: false, status: 0, body: String(e?.message || e) }
  }
}

async function main() {
  const { emails, execute, verbose } = parseArgs()
  console.log(`[delete_users_direct] Processing ${emails.length} emails`)

  const results = []
  const found = []
  const notFound = []

  for (const email of emails) {
    const user = await findUserByEmail(email)
    if (!user) {
      console.log(`[Preview] NOT FOUND: ${email}`)
      notFound.push(email)
      results.push({ email, status: 'not_found', code: '', error: '' })
      continue
    }
    console.table([{ id: user.id, email: user.email, created_at: user.created_at }])
    found.push(user)

    // FK cleanup plan
    const fkPlan = await clearClinicsUserRefs(user.id)
    if (!execute) {
      fkPlan.forEach(p => {
        if (p.error) console.log(`[Dry-run] clinics.${p.column}: would clear refs, but warning: ${p.error}`)
        else if (p.cleared > 0) console.log(`[Dry-run] clinics.${p.column}: would clear ${p.cleared} row(s)`) 
      })
      console.log(`[Dry-run] Would DELETE auth user via REST: ${user.email} (${user.id})`)
      results.push({ email: user.email, status: 'dry_run', code: '', error: '' })
      continue
    }

    // Execute FK cleanup
    const fkMsgs = []
    for (const p of fkPlan) {
      if (p.error) fkMsgs.push(`clinics.${p.column}: WARN ${p.error}`)
      else if (p.cleared > 0) fkMsgs.push(`clinics.${p.column}: cleared ${p.cleared}`)
    }
    if (fkMsgs.length) console.log('[FK Cleanup]', fkMsgs.join(' | '))

    const del = await deleteUserDirect(user.id, verbose)
    if (del.ok) {
      console.log(`[OK] Deleted auth user: ${user.email}`)
      results.push({ email: user.email, status: 'deleted', code: String(del.status), error: '' })
    } else {
      console.log(`[FAIL] Could not delete auth user: ${user.email} — status ${del.status}`)
      results.push({ email: user.email, status: 'failed', code: String(del.status), error: del.body })
    }
  }

  console.log('\n[Final Report]')
  console.table(results)

  console.log(`\n[Summary] Found: ${found.length}, Not found: ${notFound.length}, Deleted: ${results.filter(r => r.status === 'deleted').length}, Failed: ${results.filter(r => r.status === 'failed').length}`)
  if (notFound.length) {
    console.log('Not found emails:')
    notFound.forEach(e => console.log(` - ${e}`))
  }

  process.exit(results.some(r => r.status === 'failed') ? 1 : 0)
}

main().catch(err => {
  console.error('[delete_users_direct] Fatal error:', err?.message || err)
  process.exit(1)
})