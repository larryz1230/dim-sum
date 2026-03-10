import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

const CACHE_DEADLINE = 5 * 60 * 1000;
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  rating: number | null;
  username: string | null;
  email: string | null;
  matchesPlayed: number | null;
  wins: number | null;
  losses: number | null;
  ties: number | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [matchesPlayed, setMatchesPlayed] = useState<number | null>(null);
  const [wins, setWins] = useState<number | null>(null);
  const [losses, setLosses] = useState<number | null>(null);
  const [ties, setTies] = useState<number | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const fetchProfileData = async (userId: string, force = false) => {
    const now = Date.now();
    if (!force && lastFetched && (now - lastFetched < CACHE_DEADLINE)) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('rating, username, matches_played, wins, losses, ties')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setRating(data.rating);
        setUsername(data.username);
        setMatchesPlayed(data.matches_played ?? 0);
        setWins(data.wins ?? 0);
        setLosses(data.losses ?? 0);
        setTies(data.ties ?? 0);
        setLastFetched(now);
      }
    } catch (err) {}
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email ?? null);
        fetchProfileData(session.user.id);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setEmail(currentUser?.email ?? null);

      if (currentUser) {
        fetchProfileData(currentUser.id, true);
      } else {
        setRating(null);
        setUsername(null);
        setMatchesPlayed(null);
        setWins(null);
        setLosses(null);
        setTies(null);
        setLastFetched(null);
      }
      setLoading(false);
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, rating, username, email, matchesPlayed, wins, losses, ties,
      refreshProfile: () => fetchProfileData(user?.id || '', true)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};