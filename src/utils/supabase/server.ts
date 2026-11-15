import { createServerClient } from '@supabase/ssr';
import { getCookies, setCookie, setResponseHeader } from '@tanstack/react-start/server';
import { key, url } from './config';

const fallbackUrl = 'https://oxtttywpelbyitgxspfm.supabase.co';
const fallbackKey = 'sb_publishable_Bi-hpAsVX5nS10wE_LugRA_RF8wnu0W';

export function createClient() {
  const finalUrl = url || fallbackUrl;
  const finalKey = key || fallbackKey;
  const jar = new Map(Object.entries(getCookies()));
  return createServerClient(finalUrl, finalKey, {
    cookies: {
      getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
      setAll(changes) {
        try {
          setResponseHeader('Cache-Control', 'private, no-store');
          for (const { name, value, options } of changes) {
            jar.set(name, value);
            setCookie(name, value, options);
          }
        } catch {
          // ignore cookie set errors in read-only / render context
        }
      },
    },
  });
}
