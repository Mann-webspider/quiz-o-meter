const { createClient } = require("@supabase/supabase-js");
// const env = require("react-dotenv")
// import "dotenv/config"
const PROJECT_URL = "https://irhebnodzrnjpvxqiyll.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyaGVibm9kenJuanB2eHFpeWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NzQ1MzgsImV4cCI6MjAyNTE1MDUzOH0.THutDNVFj1qA83-ywCWto92rrogUKn-YdQe4o1ew3m4";
const supabase = createClient(PROJECT_URL, SUPABASE_ANON_KEY);
// const auth = supabase.auth

// console.log(env.PROJECT_URL);
export default supabase;
