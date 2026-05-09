import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://boyxptcgjesmghtpytub.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJveXhwdGNnamVzbWdodHB5dHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMTA4MjYsImV4cCI6MjA5Mzg4NjgyNn0.23oIIB3zmyBUgMIufEr7hzTTimFK5Pb6KhDT1d0NI9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);