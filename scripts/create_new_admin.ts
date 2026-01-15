import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const newAdminEmail = 'admin@naralbiza.com';
const newAdminPassword = 'metrics.01';

async function createNewAdmin() {
    console.log(`Setting up new admin user: ${newAdminEmail}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const existingUser = users.find(u => u.email === newAdminEmail);
    let userId;

    if (existingUser) {
        console.log(`User exists (ID: ${existingUser.id}). Updating...`);
        userId = existingUser.id;
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: newAdminPassword,
            email_confirm: true,
            app_metadata: { role: 'Admin' },
            user_metadata: { name: 'Naralbiza Service', role: 'Admin' }
        });
        if (updateError) {
            console.error('Error updating auth user:', updateError);
            return;
        }
    } else {
        console.log('User does not exist. Creating...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: newAdminEmail,
            password: newAdminPassword,
            email_confirm: true,
            app_metadata: { role: 'Admin' },
            user_metadata: { name: 'Naralbiza Service', role: 'Admin' }
        });
        if (createError) {
            console.error('Error creating auth user:', createError);
            return;
        }
        userId = data.user.id;
    }

    console.log('Syncing to public.users table...');
    const { error: upsertError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            email: newAdminEmail,
            name: 'Naralbiza Service', // Default name
            role: 'Admin',
            active: true,
            avatar_url: `https://ui-avatars.com/api/?name=Naralbiza+Service&background=random`
        });

    if (upsertError) {
        console.error('Error updating public.users:', upsertError);
    } else {
        console.log('Success! New admin user created.');
    }
}

createNewAdmin();
