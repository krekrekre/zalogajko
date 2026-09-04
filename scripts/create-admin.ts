/**
 * Grants admin rights to a Supabase user, creating the account if it does not exist.
 * Run from project root:
 *
 *   npm run create-admin
 *
 * Credentials come from the environment — nothing is hardcoded:
 *   ADMIN_EMAIL=you@example.com
 *   ADMIN_PASSWORD=<at least 12 characters>
 *
 * Also requires (.env.local or .env):
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase Dashboard → Settings → API → service_role secret)
 *
 * If the account already exists its password is left alone. Pass --reset-password
 * to overwrite it:
 *
 *   npm run create-admin -- --reset-password
 */

import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
config({ path: path.join(projectRoot, ".env.local") });
config({ path: path.join(projectRoot, ".env") });

const MIN_PASSWORD_LENGTH = 12;
const resetPassword = process.argv.includes("--reset-password");

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL
)?.trim();
const SUPABASE_SERVICE_ROLE = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE
)?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function fail(message: string, ...details: string[]): never {
  console.error(message);
  for (const line of details) console.error(line);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  fail(
    "Missing Supabase credentials. In .env.local set:",
    "  NEXT_PUBLIC_SUPABASE_URL=...",
    "  SUPABASE_SERVICE_ROLE_KEY=... (Settings → API → service_role)",
  );
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  fail(
    "Missing admin credentials. Set these before running:",
    "  ADMIN_EMAIL=you@example.com",
    `  ADMIN_PASSWORD=<at least ${MIN_PASSWORD_LENGTH} characters>`,
    "",
    "Keep them in .env.local (git-ignored), not in this script.",
  );
}

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ADMIN_EMAIL)) {
  fail(`ADMIN_EMAIL does not look like an email address: ${ADMIN_EMAIL}`);
}

if (ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
  fail(
    `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters (got ${ADMIN_PASSWORD.length}).`,
    "This account can edit and delete all site content — give it a real password.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** listUsers() is paginated, so walk every page rather than trusting the first. */
async function findUserByEmail(email: string): Promise<User | null> {
  const perPage = 200;
  const target = email.toLowerCase();

  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) fail("Could not list users:", error.message);

    const users = data?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (users.length < perPage) return null;
  }
}

async function main() {
  const existing = await findUserByEmail(ADMIN_EMAIL!);

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`User already exists: ${ADMIN_EMAIL}`);

    if (resetPassword) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
      });
      if (error) fail("Password reset failed:", error.message);
      console.log("Password reset to the value of ADMIN_PASSWORD.");
    } else {
      console.log("Password left unchanged (pass --reset-password to overwrite it).");
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) fail("Create user failed:", error.message);
    if (!data?.user?.id) fail("Create user returned no id.");

    userId = data.user.id;
    console.log(`Created user: ${ADMIN_EMAIL} (id: ${userId})`);
  }

  const { error: insertErr } = await supabase
    .from("admin_users")
    .upsert({ user_id: userId }, { onConflict: "user_id" });

  if (insertErr) {
    fail(
      `Insert into admin_users failed: ${insertErr.message}`,
      "Run this in the Supabase SQL Editor instead:",
      `  INSERT INTO public.admin_users (user_id) VALUES ('${userId}') ON CONFLICT (user_id) DO NOTHING;`,
    );
  }

  console.log(`Admin rights granted. Log in at /login as ${ADMIN_EMAIL}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
