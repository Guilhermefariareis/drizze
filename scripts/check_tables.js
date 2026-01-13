
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
    const { data, error } = await supabase.rpc('get_tables')
    if (error) {
        // If RPC doesn't exist, try a simple query
        console.log('RPC get_tables failed, trying direct queries...')

        const { count: creditCount, error: creditError } = await supabase.from('credit_requests').select('*', { count: 'exact', head: true })
        console.log('credit_requests:', creditError ? 'Error/Not Found' : `Found (${creditCount} rows)`)

        const { count: loanCount, error: loanError } = await supabase.from('loan_requests').select('*', { count: 'exact', head: true })
        console.log('loan_requests:', loanError ? 'Error/Not Found' : `Found (${loanCount} rows)`)
    } else {
        console.log('Tables:', data)
    }
}

checkTables()
