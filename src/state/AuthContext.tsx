import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { env } from '../config/env';
import { getSupabase } from '../lib/supabase';

export type Profile = {
  id: string;
  user_type: 'listener' | 'artist';
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  country: string | null;
  region: string | null;
  date_of_birth: string | null;
};

export type AppSession = { userId: string; email: string };

type AuthContextValue = {
  loading: boolean;
  session: AppSession | null;
  profile: Profile | null;
  backendReady: boolean;
  profileComplete: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, dobISO: string) => Promise<string | null>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (fields: Partial<Profile>) => Promise<string | null>;
  enterDemo: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  user_type: 'artist',
  display_name: 'Demo Artist',
  handle: 'demoartist',
  avatar_url: null,
  country: 'United States',
  region: 'Texas',
  date_of_birth: '2000-01-01',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !session || session.userId === 'demo-user') return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.userId)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
  }, [supabase, session]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSession(s ? { userId: s.user.id, email: s.user.email ?? '' } : null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? { userId: s.user.id, email: s.user.email ?? '' } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return 'Backend not connected yet';
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? error.message : null;
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string, dobISO: string) => {
      if (!supabase) return 'Backend not connected yet';
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { date_of_birth: dobISO } },
      });
      return error ? error.message : null;
    },
    [supabase],
  );

  const resendConfirmation = useCallback(
    async (email: string) => {
      if (!supabase) return;
      await supabase.auth.resend({ type: 'signup', email });
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, [supabase]);

  const saveProfile = useCallback(
    async (fields: Partial<Profile>) => {
      if (!supabase || !session) return 'Backend not connected yet';
      const row = { id: session.userId, ...fields };
      const { error } = await supabase.from('profiles').upsert(row);
      if (error) return error.message;
      await refreshProfile();
      return null;
    },
    [supabase, session, refreshProfile],
  );

  const enterDemo = useCallback(() => {
    setSession({ userId: 'demo-user', email: 'demo@herd.app' });
    setProfile(DEMO_PROFILE);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      profile,
      backendReady: env.isSupabaseConfigured,
      profileComplete: Boolean(profile?.display_name && profile?.handle),
      signIn,
      signUp,
      resendConfirmation,
      signOut,
      refreshProfile,
      saveProfile,
      enterDemo,
    }),
    [loading, session, profile, signIn, signUp, resendConfirmation, signOut, refreshProfile, saveProfile, enterDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
