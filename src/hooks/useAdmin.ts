import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    console.log('🔍 Checking admin status for user:', user?.email, user?.id);
    
    if (!user) {
      console.log('❌ No user found, setting isAdmin to false');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Querying profiles table for user ID:', user.id);

      // Verificar si el usuario es admin consultando su perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        console.log('✅ Admin status result:', data);
        const adminStatus = data?.is_admin || false;
        console.log('🎯 Setting isAdmin to:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('❌ Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading, checkAdminStatus };
}; 