
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFlow() {
    console.log("1. Creating test notification...");
    // Insert test record
    const { data, error } = await supabase.from('notificacoes_email').insert({
        destinatario_email: 'delivered@resend.dev', // Safe test email for Resend
        assunto: 'Teste de Verificação Automática',
        conteudo_html: '<p>Se você recebeu isso, o sistema funciona!</p>',
        tipo_evento: 'sistema',
        status: 'pendente'
    }).select().single();

    if (error) {
        console.error("Failed to insert test record:", error);
        return;
    }

    const id = data.id;
    console.log(`   Created record ID: ${id}. Waiting for processor...`);

    // Poll for status change
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000)); // Wait 2s

        const { data: check } = await supabase.from('notificacoes_email').select('status, erro').eq('id', id).single();

        console.log(`   Attempt ${attempts + 1}: Status is '${check.status}'`);

        if (check.status === 'enviado') {
            console.log("✅ SUCCESS: Email processed and sent!");
            return;
        }

        if (check.status === 'erro') {
            console.error("❌ FAILURE: Processing failed with error:", check.erro);
            return;
        }

        attempts++;
    }

    console.warn("⚠️ TIMEOUT: Status remained 'pendente'. Webhook might not be configured or Function is failing silently.");
}

verifyFlow();
