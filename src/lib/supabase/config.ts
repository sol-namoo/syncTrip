export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://your-project.supabase.co";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "your-anon-key";

export const isSupabaseConfigured =
  !supabaseUrl.includes("your-project") && supabaseAnonKey !== "your-anon-key";
