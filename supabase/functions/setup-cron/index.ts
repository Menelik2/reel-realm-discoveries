import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const dbUrl = Deno.env.get('SUPABASE_DB_URL');
  if (!dbUrl) {
    return new Response(
      JSON.stringify({ success: false, error: 'SUPABASE_DB_URL not set' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const sql = postgres(dbUrl);

  try {
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eGJxZGNuaWR2ZGZta3JzaGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTAwODcsImV4cCI6MjA2MzM4NjA4N30.QGFkoeQC7zRrnZYLKLPMr-7HTwUolEhFdzLkWFF-GkE';
    const projectRef = 'suxbqdcnidvdfmkrshem';

    // Ensure extensions are enabled
    await sql`CREATE EXTENSION IF NOT EXISTS pg_cron CASCADE`;
    await sql`CREATE EXTENSION IF NOT EXISTS pg_net CASCADE`;

    // Remove existing job if any
    try {
      await sql`SELECT cron.unschedule('daily-telegram-post')`;
      console.log('Removed existing cron job');
    } catch (e) {
      console.log('No existing job to remove');
    }

    // Schedule the daily job at 09:00 UTC
    const command = `select net.http_post(url:='https://${projectRef}.supabase.co/functions/v1/telegram-auto-post', headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb, body:='{}'::jsonb) as request_id;`;

    const result = await sql`SELECT cron.schedule('daily-telegram-post', '0 9 * * *', ${command})`;

    console.log('Cron job scheduled:', result);

    // Verify
    const jobs = await sql`SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'daily-telegram-post'`;

    await sql.end();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily Telegram post scheduled at 09:00 UTC every day!',
        jobs 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    await sql.end();
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
