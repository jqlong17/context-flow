import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://phmfenjhvfgiseytxaak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobWZlbmpodmZnaXNleXR4YWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjE2NjYsImV4cCI6MjA1NTc5NzY2Nn0.D9k85Z6rfo7taJzdBaMZJNs2tunGY-jUA68CbaCdcLg';

export const supabase = createClient(supabaseUrl, supabaseKey); 