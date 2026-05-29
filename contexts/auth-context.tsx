import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AUTH_STORAGE_KEY = '@orthodox/auth-user';
const GUEST_STORAGE_KEY = '@orthodox/auth-guest';

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isGuest: boolean;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function makeUserFromEmail(email: string): AuthUser {
  const cleaned = email.trim().toLowerCase();
  const displayName = cleaned.split('@')[0] ?? cleaned;
  return {
    id: cleaned,
    email: cleaned,
    displayName,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [storedUser, storedGuest] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(GUEST_STORAGE_KEY),
        ]);
        if (!mounted) return;
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
          setIsGuest(false);
        } else if (storedGuest === '1') {
          setIsGuest(true);
        }
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Placeholder: replace with Supabase auth.signInWithPassword later.
    const next = makeUserFromEmail(email);
    setUser(next);
    setIsGuest(false);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
  }, []);

  const signUp = useCallback(async (email: string, _password: string) => {
    // Placeholder: replace with Supabase auth.signUp later.
    const next = makeUserFromEmail(email);
    setUser(next);
    setIsGuest(false);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setIsGuest(false);
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY]);
  }, []);

  const continueAsGuest = useCallback(async () => {
    setIsGuest(true);
    setUser(null);
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, '1');
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isGuest, isReady, signIn, signUp, signOut, continueAsGuest }),
    [user, isGuest, isReady, signIn, signUp, signOut, continueAsGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
