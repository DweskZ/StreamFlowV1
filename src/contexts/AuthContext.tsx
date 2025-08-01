import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error);
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('Attempting to sign up user with email:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`
        }
      });
      
      console.log('SignUp response data:', data);
      console.log('SignUp response error:', error);
      
      if (error) {
        console.error('SignUp error details:', error);
        setError(error.message);
        toast({ 
          title: 'Error en el registro', 
          description: error.message, 
          variant: 'destructive' 
        });
        throw error;
      } else {
        console.log('SignUp successful, user:', data.user);
        console.log('SignUp session:', data.session);
        
        if (data.user && !data.session) {
          // Email confirmation required
          toast({ 
            title: 'Registro exitoso', 
            description: 'Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión' 
          });
        } else if (data.session) {
          // User is immediately signed in
          toast({ 
            title: 'Registro exitoso', 
            description: 'Tu cuenta ha sido creada exitosamente' 
          });
        }
      }
    } catch (err) {
      console.error('SignUp catch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido durante el registro';
      setError(errorMessage);
      toast({ 
        title: 'Error en el registro', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Correo enviado', 
        description: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' 
      });
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
    if (error) {
      setError(error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const signInWithGithub = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/app`
      }
    });
    if (error) {
      setError(error.message);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const contextValue = useMemo(() => ({
    user, 
    session, 
    loading, 
    error, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword,
    signInWithGoogle,
    signInWithGithub
  }), [user, session, loading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
