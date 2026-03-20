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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eGJxZGNuaWR2ZGZta3JzaGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MTAwODcsImV4cCI6MjA2MzM4NjA4N30.QGFkoeQC7zRrnZYLKLPMr-7HTwUolEhFdzLkWFF-GkE';
    const projectRef = 'suxbqdcnidvdfmkrshem';

    // First, try to unschedule if exists
    try {
      const { data: unscheduleData, error: unscheduleError } = await supabase.rpc('cron_unschedule', {
        job_name: 'daily-telegram-post'
      });
      console.log('Unschedule result:', unscheduleData, unscheduleError);
    } catch (e) {
      console.log('No existing job to unschedule:', e);
    }

    // Schedule via the wrapper function
    const command = `select net.http_post(url:='https://${projectRef}.supabase.co/functions/v1/telegram-auto-post', headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb, body:='{}'::jsonb) as request_id;`;

    const { data, error } = await supabase.rpc('cron_schedule', {
      p_job_name: 'daily-telegram-post',
      p_schedule: '0 9 * * *',
      p_command: command
    });

    if (error) {
      // Try alternate function signature
      console.log('First attempt failed:', error.message);
      
      // Try calling with positional params via raw SQL
      const { data: data2, error: error2 } = await supabase.rpc('schedule', {
        schedule: '0 9 * * *',
        command: command
      });

      if (error2) {
        console.error('Second attempt failed:', error2.message);
        return new Response(
          JSON.stringify({ success: false, error: error.message, error2: error2.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Cron job scheduled!', data: data2 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
