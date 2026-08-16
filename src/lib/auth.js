import { supabase } from './supabase';

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** fn is called immediately with the current session, then again on every change. */
export function onAuthChange(fn) {
  getSession().then(fn);
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => fn(session));
  return () => sub.subscription.unsubscribe();
}
