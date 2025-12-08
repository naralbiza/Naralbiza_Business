
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

async function testGetEmployees() {
    console.log('Testing fetching employees...');

    const { data, error } = await supabase.from('employees').select('*');

    if (error) {
        console.error('Error fetching employees:', error);
    } else {
        console.log('Employees fetched successfully:', data?.length);
        console.log(data);
    }
}

testGetEmployees();
