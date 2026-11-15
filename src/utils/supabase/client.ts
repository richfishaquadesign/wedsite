import { createBrowserClient } from '@supabase/ssr';
import { key, url } from './config';

export function createClient() {
  return createBrowserClient(url, key);
}
