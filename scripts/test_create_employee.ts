
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateEmployee() {
    console.log('Testing employee creation...');

    const testEmployee = {
        name: 'Test Employee',
        position: 'Tester',
        role: 'IT',
        is_admin: false,
        email: `test${Date.now()}@example.com`,
        active: true,
        avatar_url: 'https://ui-avatars.com/api/?name=Test+Employee'
    };

    const { data, error } = await supabase.from('employees').insert(testEmployee).select().single();

    if (error) {
        console.error('Error creating employee:', error);
    } else {
        console.log('Employee created successfully:', data);
    }
}

testCreateEmployee();
