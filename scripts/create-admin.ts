/**
 * One-time script: creates admin user admin@food.com / admin123 and adds them to admin_users.
 * Run from project root:
 *
 *   npx tsx scripts/create-admin.ts
 *
 * Requires .env.local (or .env):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase Dashboard → Settings → API → service_role secret)
 */

import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
config({ path: path.join(projectRoot, ".env.local") });
config({ path: path.join(projectRoot, ".env") });

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL
)?.trim();
const SUPABASE_SERVICE_ROLE = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE
)?.trim();

const ADMIN_EMAIL = "admin@food.com";
const ADMIN_PASSWORD = "admin123";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error("Missing env. In .env.local set:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL=...");
  console.error("  SUPABASE_SERVICE_ROLE_KEY=... (Settings → API → service_role)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL);

  let userId: string;
  if (existing) {
    console.log("User already exists:", ADMIN_EMAIL);
    userId = existing.id;
    // Optionally update password (in case it was changed)
    await supabase.auth.admin.updateUserById(userId, { password: ADMIN_PASSWORD });
    console.log("Password reset to:", ADMIN_PASSWORD);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) {
      console.error("Create user failed:", error.message);
      process.exit(1);
    }
    if (!data?.user?.id) {
      console.error("No user id returned");
      process.exit(1);
    }
    userId = data.user.id;
    console.log("Created user:", ADMIN_EMAIL, "id:", userId);
  }

  const { error: insertErr } = await supabase
    .from("admin_users")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (insertErr) {
    console.error("Insert into admin_users failed:", insertErr.message);
    console.error("Run this in Supabase SQL Editor:");
    console.error(`  INSERT INTO public.admin_users (user_id) VALUES ('${userId}') ON CONFLICT (user_id) DO NOTHING;`);
    process.exit(1);
  }

  console.log("Admin user ready. Log in at /login with:");
  console.log("  Email:", ADMIN_EMAIL);
  console.log("  Password:", ADMIN_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
