
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPersistence() {
    console.log('--- Testing Data Persistence ---');
    console.log('Project URL:', supabaseUrl);

    // 1. Test Leads
    console.log('\n[1] Testing LEADS...');
    const testLead = {
        name: 'Persistence Test Lead',
        company: 'Test Co',
        email: 'test@example.com',
        priority: 'Média',
        status: 'Novo',
        value: 1000,
        source: 'Automated Test'
    };

    const { data: leadData, error: leadError } = await supabase.from('leads').insert(testLead).select().single();
    if (leadError) {
        console.error('FAILED to create lead:', leadError.message);
    } else {
        console.log('SUCCESS: Lead created with ID:', leadData.id);

        // 2. Test Update Lead
        const { error: updateError } = await supabase.from('leads').update({ company: 'Updated Co' }).eq('id', leadData.id);
        if (updateError) {
            console.error('FAILED to update lead:', updateError.message);
        } else {
            console.log('SUCCESS: Lead updated.');
        }

        // Cleanup
        await supabase.from('leads').delete().eq('id', leadData.id);
        console.log('Cleanup: Lead deleted.');
    }

    // 3. Test Clients
    console.log('\n[2] Testing CLIENTS...');
    const testClient = {
        name: 'Persistence Test Client',
        company: 'Client Co',
        email: 'client@example.com',
        status: 'Ativo',
        since: new Date().toISOString().split('T')[0]
    };

    const { data: clientData, error: clientError } = await supabase.from('clients').insert(testClient).select().single();
    if (clientError) {
        console.error('FAILED to create client:', clientError.message);
    } else {
        console.log('SUCCESS: Client created with ID:', clientData.id);

        // 4. Test Interaction
        const { error: interactionError } = await supabase.from('interactions').insert({
            client_id: clientData.id,
            type: 'Email',
            notes: 'Test interaction',
            date: new Date().toISOString()
        });
        if (interactionError) {
            console.error('FAILED to create interaction:', interactionError.message);
        } else {
            console.log('SUCCESS: Interaction created.');
        }

        // Cleanup
        await supabase.from('clients').delete().eq('id', clientData.id);
        console.log('Cleanup: Client deleted.');
    }

    console.log('\n--- Persistence Test Finished ---');
}

testPersistence();
