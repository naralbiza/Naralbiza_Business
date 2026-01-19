
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// Use service role key if available for admin tasks, but usually anon key is what we have in frontend envs.
// If valid RLS policies are in place, we might need a logged-in session or service role.
// However, 'public.users' might be readable.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUsers() {
    console.log('Searching for users...');

    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .or(`name.ilike.%Evanilson%,name.ilike.%Peso%,email.eq.naralbizaservice@gmail.com`);

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log('Found users:');
    users.forEach(u => {
        console.log(`- [${u.role}] ${u.name} (${u.email}) ID: ${u.id}`);
    });
}

findUsers();
