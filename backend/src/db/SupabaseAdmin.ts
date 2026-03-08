import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

if (!config.supabaseUrl) {
  throw new Error("Missing SUPABASE_URL in backend environment");
}

if (!config.supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in backend environment");
}

export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);