import "dotenv/config";

export const config = {
    port: Number(process.env.PORT ?? 9090),
    corsOrigin: process.env.CORS_ORIGIN ?? "*", // TODO: change
    supabaseUrl: process.env.SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};