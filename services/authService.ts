import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

export const authService = {
  // Sign up with email
  async signUpWithEmail(email: string, password: string, role: UserRole): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          role: role
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Failed to create user' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  },

  // Sign up with phone
  async signUpWithPhone(phone: string, password: string, role: UserRole): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          phone: data.user.phone,
          role: role
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Failed to create user' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  },

  // Sign in with email
  async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          role: (profile?.role as UserRole) || UserRole.WORKER
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Failed to sign in' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  },

  // Sign in with phone
  async signInWithPhone(phone: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const authUser: AuthUser = {
          id: data.user.id,
          phone: data.user.phone,
          role: (profile?.role as UserRole) || UserRole.WORKER
        };
        return { user: authUser, error: null };
      }

      return { user: null, error: 'Failed to sign in' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  },

  // Get current session
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      return {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone,
        role: (profile?.role as UserRole) || UserRole.WORKER
      };
    } catch (error) {
      return null;
    }
  }
};