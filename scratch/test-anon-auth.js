const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://dcsoggbyzpmypeimsudt.supabase.co";
const SUPABASE_KEY = "sb_publishable_t00vhpLdvqdm1dUImI-eBw_H9o9alga";

async function main() {
  console.log("Initializing Supabase Client...");
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });

  console.log("Attempting anonymous sign in...");
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign in failed:", error);
  } else {
    console.log("Anonymous sign in succeeded!", data);
  }
}
main();
