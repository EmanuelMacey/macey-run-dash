import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://sytixskkgfvjjemmoav.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5dGl4c2trZ2Z2ampqZW1tb2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjM5ODcsImV4cCI6MjA3OTA5OTk4N30.iKrDcIPF3oJUdmc_ZdInjxynYYxxRNbr96xdVgbhbQ4';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
