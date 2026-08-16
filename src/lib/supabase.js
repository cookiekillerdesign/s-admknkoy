import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(url && key);

if (!supabaseReady && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
    'Copy .env.example to .env, fill in your project keys, and restart the dev server. ' +
    'See README-ADMIN.md.'
  );
}

// When env vars are missing we still export a client with dummy values so the
// app doesn't crash on import — every call will simply fail gracefully and
// the UI falls back to the static PROJECTS list (see src/lib/projects.js).
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key'
);
