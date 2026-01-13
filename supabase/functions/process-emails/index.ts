
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload = await req.json();
        console.log("Webhook payload received:", payload);

        const { record } = payload;

        if (!record || !record.destinatario_email) {
            return new Response(JSON.stringify({ message: "Invalid payload or not an email record" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (record.status !== 'pendente') {
            return new Response(JSON.stringify({ message: "Email already processed" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        console.log(`Sending email to ${record.destinatario_email}`);

        // Use fetch instead of SDK to avoid Node.js compatibility issues
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Naralbiza <onboarding@resend.dev>",
                to: [record.destinatario_email],
                subject: record.assunto,
                html: record.conteudo_html,
            }),
        });

        const emailData = await res.json();

        if (!res.ok) {
            console.error("Resend API Error:", emailData);
            // Update record with error
            await supabase
                .from("notificacoes_email")
                .update({
                    status: "erro",
                    erro: JSON.stringify(emailData),
                    tentativas: (record.tentativas || 0) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq("id", record.id);

            return new Response(JSON.stringify({ error: emailData }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            });
        }

        console.log("Email sent successfully:", emailData);

        // Update record as sent
        await supabase
            .from("notificacoes_email")
            .update({
                status: "enviado",
                erro: null,
                updated_at: new Date().toISOString()
            })
            .eq("id", record.id);

        return new Response(JSON.stringify(emailData), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Worker Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
