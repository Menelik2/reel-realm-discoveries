import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'cron' }
    });

    // Use the service role to execute SQL via supabase's pg
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eGJxZGNuaWR2ZGZta3JzaGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTAwODcsImV4cCI6MjA2MzM4NjA4N30.QGFkoeQC7zRrnZYLKLPMr-7HTwUolEhFdzLkWFF-GkE';
    const projectRef = 'suxbqdcnidvdfmkrshem';

    // Call the cron.schedule function via RPC
    const { data, error } = await supabase.rpc('schedule', {
      job_name: 'daily-telegram-post',
      schedule: '0 9 * * *',
      command: `select net.http_post(url:='https://${projectRef}.supabase.co/functions/v1/telegram-auto-post', headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb, body:='{}'::jsonb) as request_id;`
    });

    if (error) {
      console.error('Error scheduling cron job:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Daily Telegram post scheduled at 09:00 UTC!', data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
