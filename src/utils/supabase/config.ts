const cleanEnv = (v: string | undefined, fallback: string) =>
  String(v || fallback)
    .replace(/^\uFEFF/, '')
    .trim() || fallback;

export const url = cleanEnv(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  'https://oxtttywpelbyitgxspfm.supabase.co',
);
export const key = cleanEnv(
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  'sb_publishable_Bi-hpAsVX5nS10wE_LugRA_RF8wnu0W',
);
