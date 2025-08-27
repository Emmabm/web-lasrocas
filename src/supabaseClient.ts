import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://gcfjmwnlbpnltguwfrwz.supabase.co',       // 👈 Reemplazalo con tu URL real del proyecto
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjZmptd25sYnBubHRndXdmcnd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDk2ODAsImV4cCI6MjA2MjMyNTY4MH0.qZWy5RdFJtMYl0L7a_neKl7xsaTYg1ubnAhbZw2wpfw' // 👈 Pegá ahí esa clave "anon" completa
);
