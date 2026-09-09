// Runtime config. Values come from EXPO_PUBLIC_* env vars (see .env.example).
// Anon keys are safe to ship in the bundle - RLS is the boundary. Service
// keys and Cloudflare credentials stay server-side, always.
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  radioStreamUrl: process.env.EXPO_PUBLIC_RADIO_STREAM_URL ?? '',
  appEnv: process.env.EXPO_PUBLIC_ENV ?? 'development',
  get isSupabaseConfigured(): boolean {
    return this.supabaseUrl.length > 0 && this.supabaseAnonKey.length > 0;
  },
};
