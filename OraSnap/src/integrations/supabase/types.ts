export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          target_audience: string | null
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_audience?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          booking_date: string
          commission_rate: number | null
          created_at: string | null
          end_time: string
          event_type: string
          id: string
          location: string
          notes: string | null
          payment_date: string | null
          payment_status: string | null
          photographer_id: string
          start_time: string
          status: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date: string
          commission_rate?: number | null
          created_at?: string | null
          end_time: string
          event_type: string
          id?: string
          location: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string | null
          photographer_id: string
          start_time: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string
          commission_rate?: number | null
          created_at?: string | null
          end_time?: string
          event_type?: string
          id?: string
          location?: string
          notes?: string | null
          payment_date?: string | null
          payment_status?: string | null
          photographer_id?: string
          start_time?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          booking_id: string
          created_at: string | null
          description: string | null
          id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_captions: {
        Row: {
          captions_data: Json
          created_at: string
          id: string
          image_thumbnail: string | null
          image_url: string
          photographer_id: string
        }
        Insert: {
          captions_data: Json
          created_at?: string
          id?: string
          image_thumbnail?: string | null
          image_url: string
          photographer_id: string
        }
        Update: {
          captions_data?: Json
          created_at?: string
          id?: string
          image_thumbnail?: string | null
          image_url?: string
          photographer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_captions_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          content_id: string
          content_preview: string | null
          content_type: string
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          content_id: string
          content_preview?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string
          content_preview?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      photographer_verifications: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string
          id: string
          notes: string | null
          photographer_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url: string
          id?: string
          notes?: string | null
          photographer_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string
          id?: string
          notes?: string | null
          photographer_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photographer_verifications_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          block_reason: string | null
          country: string | null
          created_at: string | null
          currency: string
          custom_commission_rate: number | null
          email: string
          experience_years: number | null
          id: string
          is_blocked: boolean | null
          is_featured: boolean | null
          location: string
          name: string
          phone: string | null
          portfolio: string[] | null
          price_per_hour: number
          rating: number | null
          review_count: number | null
          specialty: string
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          block_reason?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          custom_commission_rate?: number | null
          email: string
          experience_years?: number | null
          id?: string
          is_blocked?: boolean | null
          is_featured?: boolean | null
          location: string
          name: string
          phone?: string | null
          portfolio?: string[] | null
          price_per_hour: number
          rating?: number | null
          review_count?: number | null
          specialty: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          block_reason?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          custom_commission_rate?: number | null
          email?: string
          experience_years?: number | null
          id?: string
          is_blocked?: boolean | null
          is_featured?: boolean | null
          location?: string
          name?: string
          phone?: string | null
          portfolio?: string[] | null
          price_per_hour?: number
          rating?: number | null
          review_count?: number | null
          specialty?: string
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          block_reason: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_blocked: boolean | null
          notify_booking_reminders: boolean | null
          notify_booking_updates: boolean | null
          notify_promotions: boolean | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          block_reason?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_blocked?: boolean | null
          notify_booking_reminders?: boolean | null
          notify_booking_updates?: boolean | null
          notify_promotions?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          block_reason?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_blocked?: boolean | null
          notify_booking_reminders?: boolean | null
          notify_booking_updates?: boolean | null
          notify_promotions?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          id: string
          photographer_id: string
          rating: number
          user_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photographer_id: string
          rating: number
          user_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photographer_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_photographer: {
        Args: { photographer_id: string }
        Returns: {
          avatar_url: string
          bio: string
          country: string
          currency: string
          experience_years: number
          id: string
          location: string
          name: string
          portfolio: string[]
          price_per_hour: number
          rating: number
          review_count: number
          specialty: string
          tags: string[]
        }[]
      }
      get_public_photographers: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          country: string
          currency: string
          experience_years: number
          id: string
          location: string
          name: string
          portfolio: string[]
          price_per_hour: number
          rating: number
          review_count: number
          specialty: string
          tags: string[]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "photographer"
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
    Enums: {
      app_role: ["admin", "user", "photographer"],
    },
  },
} as const
