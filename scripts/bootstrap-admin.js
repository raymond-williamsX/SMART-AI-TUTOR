const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env manually to avoid extra CLI dependencies
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.slice(0, index).trim();
        const val = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
    console.info("Loaded credentials from local .env successfully.");
  }
} catch (err) {
  console.warn("Unable to parse local .env file. Relying on system process variables.");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.error("Usage: node scripts/bootstrap-admin.js <email-address>");
  process.exit(1);
}

async function main() {
  const email = emailArg.trim().toLowerCase();
  console.info(`Connecting to Supabase at ${url}...`);
  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.info(`Searching for user with email "${email}"...`);
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error: Failed to fetch user directory:", error.message);
    process.exit(1);
  }

  const user = data.users.find(u => u.email && u.email.toLowerCase() === email);
  if (!user) {
    console.error(`Error: User with email "${email}" not found in auth database. Ask them to register first.`);
    process.exit(1);
  }

  console.info(`Found user ID: ${user.id}. Registering admin role...`);

  // 1. Insert into admin_users table
  const { error: dbError } = await supabase
    .from('admin_users')
    .insert({ user_id: user.id });

  if (dbError) {
    if (dbError.code === '23505') {
      console.warn("Note: User is already present in the database admin_users table.");
    } else {
      console.error("Error: Failed to register user in admin table:", dbError.message);
      process.exit(1);
    }
  } else {
    console.info("Added user to admin_users table successfully.");
  }

  // 2. Set role in app_metadata
  const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { role: 'admin' }
  });

  if (authError) {
    console.error("Error: Failed to update user app_metadata claims:", authError.message);
    process.exit(1);
  }

  console.info(`Success: User "${email}" has been successfully promoted to Administrator.`);
  process.exit(0);
}

main();
