
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
    console.log("Checking if 'notificacoes_email' table exists...");
    const { data, error } = await supabase.from('notificacoes_email').select('count').limit(1);

    if (error) {
        console.error("Error connecting to table:", error);
        if (error.code === '42P01') {
            console.error("CRITICAL: Table 'notificacoes_email' does NOT exist.");
        }
    } else {
        console.log("Success! Table 'notificacoes_email' exists.");
    }
}

checkTable();
