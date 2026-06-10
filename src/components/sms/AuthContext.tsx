import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Role = 'guard' | 'supervisor' | 'ops' | 'admin';
import type { Tab } from './Sidebar';

export interface Profile {
  id: string; full_name: string; role: Role; rank: string; assigned_sites: string[];
}

export const ROLE_LABEL: Record<Role, string> = {
  guard: 'Security Guard', supervisor: 'Supervisor', ops: 'Ops Manager', admin: 'Administrator',
};

// RBAC: which modules each role can access
export const ROLE_TABS: Record<Role, Tab[]> = {
  guard: ['patrol'],
  supervisor: ['ops', 'patrol', 'client'],
  ops: ['ops', 'patrol', 'compliance', 'client'],
  admin: ['ops', 'patrol', 'dtr', 'compliance', 'client'],
};

interface AuthState {
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (data: { email: string; password: string; full_name: string; role: Role; rank: string; assigned_sites: string[] }) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside provider');
  return c;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data as Profile);
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  // ==========================================
  // CRITICAL FIX: UPDATED SIGNUP FUNCTION
  // ==========================================
  const signUp: AuthState['signUp'] = async ({ email, password, full_name, role, rank, assigned_sites }) => {
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, 
      password,
      options: { data: { full_name, role, rank, assigned_sites } },
    });

    if (authError) return authError.message;

    // 2. CRITICAL FIX: Insert the user into the public 'profiles' table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id, // Links to auth.users
          full_name: full_name,
          role: role,
          rank: rank,
          assigned_sites: assigned_sites
        }]);

      // If profile creation fails, return the error so the UI can show it
      if (profileError) {
        console.error("Profile creation failed:", profileError);
        return profileError.message; 
      }
    }

    return null; // Success!
  };

  const signOut = async () => { await supabase.auth.signOut(); setProfile(null); };

  return <Ctx.Provider value={{ loading, profile, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
};
