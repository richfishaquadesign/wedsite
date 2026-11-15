import { createMiddleware, createStart } from '@tanstack/react-start';
import { createClient } from './utils/supabase/server';

const refreshSession = createMiddleware().server(async ({ next }) => {
  let supabase = null;
  try {
    supabase = createClient();
    if (supabase) {
      await supabase.auth.getUser();
    }
  } catch (err) {
    console.warn('refreshSession skipped or failed:', err);
  }
  return next({ context: { supabase } });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [refreshSession],
}));
