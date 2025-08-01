export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          playlist_id: string
          position: number
          track_data: Json
          track_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id: string
          position?: number
          track_data: Json
          track_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          playlist_id?: string
          position?: number
          track_data?: Json
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "user_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          display_name: string
          features: Json | null
          has_ads: boolean | null
          has_high_quality: boolean | null
          id: string
          interval_count: number
          interval_type: string
          is_active: boolean | null
          max_downloads: number | null
          max_playlists: number | null
          name: string
          price: number
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_name: string
          features?: Json | null
          has_ads?: boolean | null
          has_high_quality?: boolean | null
          id?: string
          interval_count?: number
          interval_type: string
          is_active?: boolean | null
          max_downloads?: number | null
          max_playlists?: number | null
          name: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          display_name?: string
          features?: Json | null
          has_ads?: boolean | null
          has_high_quality?: boolean | null
          id?: string
          interval_count?: number
          interval_type?: string
          is_active?: boolean | null
          max_downloads?: number | null
          max_playlists?: number | null
          name?: string
          price?: number
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tracks_cache: {
        Row: {
          album_image_url: string | null
          album_name: string | null
          artist_name: string
          cached_at: string | null
          deezer_data: Json
          duration: number | null
          explicit: boolean | null
          id: string
          last_accessed: string | null
          name: string
          popularity_score: number | null
          preview_url: string | null
        }
        Insert: {
          album_image_url?: string | null
          album_name?: string | null
          artist_name: string
          cached_at?: string | null
          deezer_data: Json
          duration?: number | null
          explicit?: boolean | null
          id: string
          last_accessed?: string | null
          name: string
          popularity_score?: number | null
          preview_url?: string | null
        }
        Update: {
          album_image_url?: string | null
          album_name?: string | null
          artist_name?: string
          cached_at?: string | null
          deezer_data?: Json
          duration?: number | null
          explicit?: boolean | null
          id?: string
          last_accessed?: string | null
          name?: string
          popularity_score?: number | null
          preview_url?: string | null
        }
        Relationships: []
      }
      user_artist_stats: {
        Row: {
          artist_id: string | null
          artist_name: string
          id: string
          last_played: string | null
          play_count: number | null
          total_time: number | null
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          artist_name: string
          id?: string
          last_played?: string | null
          play_count?: number | null
          total_time?: number | null
          user_id: string
        }
        Update: {
          artist_id?: string | null
          artist_name?: string
          id?: string
          last_played?: string | null
          play_count?: number | null
          total_time?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          track_data: Json
          track_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          track_data: Json
          track_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          track_data?: Json
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      user_listening_history: {
        Row: {
          completed: boolean | null
          device_type: string | null
          id: string
          play_duration: number | null
          played_at: string | null
          source_id: string | null
          source_type: string | null
          track_data: Json
          track_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          device_type?: string | null
          id?: string
          play_duration?: number | null
          played_at?: string | null
          source_id?: string | null
          source_type?: string | null
          track_data: Json
          track_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          device_type?: string | null
          id?: string
          play_duration?: number | null
          played_at?: string | null
          source_id?: string | null
          source_type?: string | null
          track_data?: Json
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_play_queue: {
        Row: {
          added_at: string | null
          id: string
          is_current: boolean | null
          position: number
          session_id: string | null
          track_data: Json
          track_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          is_current?: boolean | null
          position?: number
          session_id?: string | null
          track_data: Json
          track_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          is_current?: boolean | null
          position?: number
          session_id?: string | null
          track_data?: Json
          track_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_playlists: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          followers_count: number | null
          id: string
          is_collaborative: boolean | null
          is_public: boolean | null
          name: string
          sort_order: number | null
          total_duration: number | null
          total_tracks: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name: string
          sort_order?: number | null
          total_duration?: number | null
          total_tracks?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          id?: string
          is_collaborative?: boolean | null
          is_public?: boolean | null
          name?: string
          sort_order?: number | null
          total_duration?: number | null
          total_tracks?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          audio_quality: string | null
          autoplay_enabled: boolean | null
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string
          notifications_enabled: boolean | null
          preferred_language: string | null
          public_playlists: boolean | null
          shuffle_enabled: boolean | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          audio_quality?: string | null
          autoplay_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          notifications_enabled?: boolean | null
          preferred_language?: string | null
          public_playlists?: boolean | null
          shuffle_enabled?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_quality?: string | null
          autoplay_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          notifications_enabled?: boolean | null
          preferred_language?: string | null
          public_playlists?: boolean | null
          shuffle_enabled?: boolean | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          favorite_artist: string | null
          favorite_genre: string | null
          id: string
          last_activity: string | null
          total_favorites: number | null
          total_playlists: number | null
          total_plays: number | null
          total_time_listened: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_artist?: string | null
          favorite_genre?: string | null
          id?: string
          last_activity?: string | null
          total_favorites?: number | null
          total_playlists?: number | null
          total_plays?: number | null
          total_time_listened?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_artist?: string | null
          favorite_genre?: string | null
          id?: string
          last_activity?: string | null
          total_favorites?: number | null
          total_playlists?: number | null
          total_plays?: number | null
          total_time_listened?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_stats_on_play: {
        Args: {
          p_user_id: string
          p_track_id: string
          p_artist_name: string
          p_duration?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
