import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rating: number | null;
  username: string | null;
  email: string | null;
  matchesPlayed: number | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [matchesPlayed, setMatchesPlayed] = useState<number | null>(null);
  const [wins, setWins] = useState<number | null>(null);
  const [losses, setLosses] = useState<number | null>(null);
  const [ties, setTies] = useState<number | null>(null);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('rating, username, matches_played, wins, losses, ties')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setRating(data.rating);
      setUsername(data.username);
      setMatchesPlayed(data.matches_played ?? null);
      setWins(data.wins ?? null);
      setLosses(data.losses ?? null);
      setTies(data.ties ?? null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setRating(null);
      setUsername(null);
      setMatchesPlayed(null);
      setWins(null);
      setLosses(null);
      setTies(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useAuth] initializeAuth: session=', !!session, 'user=', !!session?.user);
      
      setSession(session);
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? null);

      if (session?.user) {
        await fetchProfileData(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] onAuthStateChange:', event, 'session=', !!session, 'user=', !!session?.user);
      setSession(session);
      setUser(session?.user ?? null);
      setEmail(session?.user?.email ?? null);

      if (session?.user) {
        await fetchProfileData(session.user.id);
      } else {
        setRating(null);
        setUsername(null);
        setMatchesPlayed(null);
        setWins(null);
        setLosses(null);
        setTies(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, rating, username, email, matchesPlayed, wins, losses, ties }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};