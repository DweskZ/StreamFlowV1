import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    new_releases: boolean;
    playlist_updates: boolean;
  };
  playback: {
    autoplay: boolean;
    crossfade: boolean;
    gapless: boolean;
    volume: number;
    quality: 'low' | 'medium' | 'high';
  };
  privacy: {
    profile_public: boolean;
    listening_history_public: boolean;
    show_online_status: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'es',
  notifications: {
    email: true,
    push: true,
    new_releases: true,
    playlist_updates: true
  },
  playback: {
    autoplay: true,
    crossfade: false,
    gapless: true,
    volume: 0.7,
    quality: 'medium'
  },
  privacy: {
    profile_public: false,
    listening_history_public: false,
    show_online_status: true
  }
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar preferencias del usuario desde localStorage por ahora
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    try {
      // Por ahora, usar localStorage hasta que la tabla profiles esté creada
      const storedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
      
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        setPreferences({ ...defaultPreferences, ...parsedPreferences });
      } else {
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Guardar preferencias del usuario en localStorage por ahora
  const savePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return false;

    setSaving(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      // Guardar en localStorage por ahora
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(updatedPreferences));
      
      setPreferences(updatedPreferences);
      
      toast({
        title: 'Preferencias guardadas',
        description: 'Tus preferencias se han guardado correctamente.',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las preferencias.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, preferences, toast]);

  // Funciones específicas para actualizar preferencias
  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    await savePreferences({ theme });
  }, [savePreferences]);

  const updatePlaybackSettings = useCallback(async (playback: Partial<UserPreferences['playback']>) => {
    await savePreferences({ playback: { ...preferences.playback, ...playback } });
  }, [savePreferences, preferences.playback]);

  const updateNotificationSettings = useCallback(async (notifications: Partial<UserPreferences['notifications']>) => {
    await savePreferences({ notifications: { ...preferences.notifications, ...notifications } });
  }, [savePreferences, preferences.notifications]);

  const updatePrivacySettings = useCallback(async (privacy: Partial<UserPreferences['privacy']>) => {
    await savePreferences({ privacy: { ...preferences.privacy, ...privacy } });
  }, [savePreferences, preferences.privacy]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    updateTheme,
    updatePlaybackSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    reloadPreferences: loadPreferences
  };
}; 