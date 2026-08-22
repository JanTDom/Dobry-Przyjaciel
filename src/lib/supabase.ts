import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://itiwhghmykxpnpktdlpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXdoZ2hteWt4cG5wa3RkbHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODE5NDYsImV4cCI6MjEwMjk1Nzk0Nn0.ugDsSNmTH3lvdfOl4MjiVG53idD6sv6eXNYZHIacw7M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
