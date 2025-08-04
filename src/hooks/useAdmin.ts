import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastCheckedUserId = useRef<string | null>(null);

  useEffect(() => {
    // Solo verificar si el usuario cambió
    if (user?.id !== lastCheckedUserId.current) {
      lastCheckedUserId.current = user?.id || null;
      checkAdminStatus();
    }
  }, [user?.id]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Verificar si el usuario es admin consultando su perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single para evitar errores

      if (error) {
        // Solo loggear errores que no sean "no rows found"
        if (error.code !== 'PGRST116') {
          console.warn('⚠️ Error checking admin status:', error.message);
        }
        setIsAdmin(false);
      } else {
        const adminStatus = data?.is_admin || false;
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.warn('⚠️ Unexpected error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, checkAdminStatus };
}; 