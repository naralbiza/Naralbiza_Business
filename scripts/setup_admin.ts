import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must be SERVICE KEY, not Anon

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    console.log('Please ensure your .env.local file contains the Service Role Key (not just the Anon Key).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const adminEmail = 'admin@naralbiza.com';
const adminPassword = 'Naralbiza2024!';

async function setupAdmin() {
    console.log(`Setting up admin user: ${adminEmail}`);

    // 1. Check if user exists in Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const existingUser = users.find(u => u.email === adminEmail);
    let userId;

    if (existingUser) {
        console.log(`User exists (ID: ${existingUser.id}). Updating metadata and password...`);
        userId = existingUser.id;

        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: adminPassword,
            email_confirm: true,
            app_metadata: { role: 'Admin' }, // CRITICAL for new RLS
            user_metadata: { name: 'Admin User', role: 'Admin' }
        });

        if (updateError) {
            console.error('Error updating auth user:', updateError);
            return;
        }
    } else {
        console.log('User does not exist. Creating new admin user...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true,
            app_metadata: { role: 'Admin' }, // CRITICAL for new RLS
            user_metadata: { name: 'Admin User', role: 'Admin' }
        });

        if (createError) {
            console.error('Error creating auth user:', createError);
            return;
        }
        userId = data.user.id;
    }

    console.log('Auth user configured correctly with app_metadata.');

    // 2. Ensure entry in public.users
    console.log('Syncing to public.users table...');
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: adminEmail,
            name: 'Admin User',
            role: 'Admin',
            active: true
        });

    if (upsertError) {
        console.error('Error updating public.users:', upsertError);
    } else {
        console.log('Success! Admin user is ready and RLS compliant.');
    }
}

setupAdmin();
