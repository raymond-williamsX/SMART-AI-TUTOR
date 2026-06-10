const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://dcsoggbyzpmypeimsudt.supabase.co";
const SERVICE_ROLE_KEY = "sb_service_role_t00vhpLdvqdm1dUImI-eBw_H9o9alga";

async function main() {
  console.log("Initializing Supabase Client with service role key...");
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  console.log("Querying study_sessions table...");
  const { data, error } = await supabase
    .from("study_sessions")
    .select("id, user_id, title")
    .limit(10);

  if (error) {
    console.error("Query failed:", error);
  } else {
    console.log("Query succeeded! Found sessions:", data);
  }
}
main();
