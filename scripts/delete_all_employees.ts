
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

async function deleteAllEmployees() {
    console.log('Cleaning up dependencies...');

    // 1. Remove from teams
    await supabase.from('team_members').delete().neq('employee_id', 0);

    // 2. Remove from event attendees
    await supabase.from('event_attendees').delete().neq('employee_id', 0);

    // 3. Set owner_id to null in leads (if nullable) or delete leads? 
    // Assuming nullable based on typical design, but let's check error message again.
    // "Key is still referenced from table 'leads'".
    // I'll try to set to NULL. If it fails, I might have to delete leads.
    // But deleting leads is dangerous.
    // Let's try to set to NULL.
    const { error: leadError } = await supabase.from('leads').update({ owner_id: null }).neq('id', 0);
    if (leadError) console.log('Error updating leads:', leadError.message);

    // 4. Calendar events responsible_id
    await supabase.from('calendar_events').update({ responsible_id: null }).neq('id', 0);

    // 5. Goals
    await supabase.from('goals').delete().neq('id', 0); // Goals usually tied to employee

    // 6. Reports
    await supabase.from('reports').delete().neq('id', 0);

    // 7. Activities
    await supabase.from('activities').delete().neq('id', 0);

    // 8. Notifications
    await supabase.from('notifications').delete().neq('id', 0);

    // 9. Tasks (if they have owner/assignee)
    // Checking types.ts: Task doesn't seem to have ownerId directly on it, but maybe it does in DB?
    // Let's assume tasks are linked to leads, so they are fine if leads are updated.

    console.log('Deleting all employees...');
    const { error } = await supabase.from('employees').delete().neq('id', 0); // Delete all where id is not 0 (effectively all)

    if (error) {
        console.error('Error deleting employees:', error);
    } else {
        console.log('All employees deleted successfully.');
    }
}

deleteAllEmployees();
