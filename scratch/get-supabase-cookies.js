const { createBrowserClient } = require("@supabase/ssr");

const SUPABASE_URL = "https://dcsoggbyzpmypeimsudt.supabase.co";
const SUPABASE_KEY = "sb_publishable_t00vhpLdvqdm1dUImI-eBw_H9o9alga";

// Mock the global document.cookie
global.document = {
  _cookie: "",
  get cookie() {
    return this._cookie;
  },
  set cookie(val) {
    this._cookie += (this._cookie ? "; " : "") + val;
  }
};

global.window = {
  location: {
    origin: "http://localhost:3000"
  }
};

async function main() {
  console.log("Creating browser client...");
  const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          global.document.cookie = `${name}=${value}`;
        });
      }
    }
  });

  const testEmail = "testuser711011@web-library.net";
  const testPassword = "Password123!";

  console.log(`Signing in as ${testEmail}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (error) {
    console.error("Sign in failed:", error);
    return;
  }

  console.log("Sign in succeeded!");
  console.log("\nGenerated Cookies in document.cookie:");
  console.log(global.document.cookie);
}

main().catch(console.error);
