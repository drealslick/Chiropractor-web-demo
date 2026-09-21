import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  url && key ? createClient(url, key) : null;

export function clinicRowId() {
  if (typeof window === 'undefined') return 'default';
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo') || params.get('preset') || params.get('client');
  return demo ? demo.toLowerCase() : 'default';
}