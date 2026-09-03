import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // `checking` covers the initial getSession() round-trip. Without it the app
  // flashes the login screen for a moment on every reload while Supabase
  // rehydrates the stored session.
  const [checking, setChecking] = useState(true);
  const [roles, setRoles] = useState([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      // Deliberately only setState here. Calling another supabase method
      // inside this callback can deadlock the client's internal lock, so the
      // role fetch lives in its own effect keyed on the user id.
      setSession(next ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setRolesLoaded(true);
      return;
    }
    let cancelled = false;
    setRolesLoaded(false);
    supabase
      .from('app_roles')
      .select('app, role')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error('Failed to load app_roles:', error);
        // No rows is the normal case for the store login, not a failure.
        setRoles(data ?? []);
        setRolesLoaded(true);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const value = {
    session,
    user: session?.user ?? null,
    // Gate rendering on this so the UI never briefly shows editor controls to
    // a viewer while app_roles is still in flight.
    loading: checking || (!!userId && !rolesLoaded),
    isMenuEditor: roles.some(r => r.app === 'menu' && r.role === 'editor'),
    isSchedulerEditor: roles.some(r => r.app === 'scheduler' && r.role === 'editor'),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
