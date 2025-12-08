
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

async function deleteFinancialData() {
    console.log('Deleting all financial data...');

    // 1. Delete Transactions
    console.log('Deleting transactions...');
    const { error: transError } = await supabase.from('transactions').delete().neq('id', 0);
    if (transError) console.error('Error deleting transactions:', transError);
    else console.log('Transactions deleted.');

    // 2. Delete Budgets
    console.log('Deleting budgets...');
    const { error: budgetError } = await supabase.from('budgets').delete().neq('id', 0);
    if (budgetError) console.error('Error deleting budgets:', budgetError);
    else console.log('Budgets deleted.');

    // 3. Delete Taxes
    console.log('Deleting taxes...');
    const { error: taxError } = await supabase.from('taxes').delete().neq('id', 0);
    if (taxError) console.error('Error deleting taxes:', taxError);
    else console.log('Taxes deleted.');

    console.log('Financial data cleanup complete.');
}

deleteFinancialData();
