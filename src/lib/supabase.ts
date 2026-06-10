import { createClient } from '@supabase/supabase-js';

// Initialize database client
// IMPORTANT: Use the base Project URL (no /rest/v1/ at the end)
const supabaseUrl = 'https://zpahlcmuowwwiauffrby.supabase.co'; 

// IMPORTANT: Paste the long 'anon' 'public' key from Settings > API here
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwYWhsY211b3d3d2lhdWZmcmJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjc5MjAsImV4cCI6MjA5NjYwMzkyMH0.nqX53srwL36lEzVPbEPC0x7TJmL6YZ2lhmQrDNtVKJw'; 

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
