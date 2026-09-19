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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brands: {
        Row: {
          background_color: string
          body_font: string
          created_at: string
          description: string | null
          font_family: string
          heading_font: string
          id: string
          logo: string | null
          name: string
          primary_color: string
          secondary_color: string
          text_color: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          background_color?: string
          body_font?: string
          created_at?: string
          description?: string | null
          font_family?: string
          heading_font?: string
          id?: string
          logo?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          background_color?: string
          body_font?: string
          created_at?: string
          description?: string | null
          font_family?: string
          heading_font?: string
          id?: string
          logo?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          text_color?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          error: string | null
          id: string
          name: string
          reminded_at: string | null
          responded_at: string | null
          sent_at: string | null
          status: string
          token: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          email: string
          error?: string | null
          id?: string
          name?: string
          reminded_at?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          token?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          email?: string
          error?: string | null
          id?: string
          name?: string
          reminded_at?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string | null
          created_at: string
          end_date: string | null
          form_id: string | null
          id: string
          message: string
          name: string
          reminder_days: number
          start_date: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          end_date?: string | null
          form_id?: string | null
          id?: string
          message?: string
          name?: string
          reminder_days?: number
          start_date?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          end_date?: string | null
          form_id?: string | null
          id?: string
          message?: string
          name?: string
          reminder_days?: number
          start_date?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          auto_publish: boolean
          brand_id: string | null
          created_at: string
          fields: Json
          headline: string
          id: string
          intro: string
          name: string
          slug: string
          status: string
          thank_you: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_publish?: boolean
          brand_id?: string | null
          created_at?: string
          fields?: Json
          headline?: string
          id?: string
          intro?: string
          name?: string
          slug?: string
          status?: string
          thank_you?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_publish?: boolean
          brand_id?: string | null
          created_at?: string
          fields?: Json
          headline?: string
          id?: string
          intro?: string
          name?: string
          slug?: string
          status?: string
          thank_you?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      layouts: {
        Row: {
          brand_id: string | null
          configuration: Json
          created_at: string
          id: string
          name: string
          public_slug: string
          selected_testimonials: string[]
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          name: string
          public_slug?: string
          selected_testimonials?: string[]
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          name?: string
          public_slug?: string
          selected_testimonials?: string[]
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "layouts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          current_period_end: string | null
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan: string
          polar_customer_id: string | null
          polar_product_id: string | null
          polar_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          current_period_end?: string | null
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: string
          polar_customer_id?: string | null
          polar_product_id?: string | null
          polar_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          current_period_end?: string | null
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: string
          polar_customer_id?: string | null
          polar_product_id?: string | null
          polar_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          brand_id: string | null
          campaign_id: string | null
          company_logo: string | null
          company_name: string | null
          content: string
          created_at: string
          customer_avatar: string | null
          customer_email: string | null
          customer_name: string
          form_id: string | null
          id: string
          job_title: string | null
          rating: number
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          campaign_id?: string | null
          company_logo?: string | null
          company_name?: string | null
          content: string
          created_at?: string
          customer_avatar?: string | null
          customer_email?: string | null
          customer_name: string
          form_id?: string | null
          id?: string
          job_title?: string | null
          rating?: number
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          campaign_id?: string | null
          company_logo?: string | null
          company_name?: string | null
          content?: string
          created_at?: string
          customer_avatar?: string | null
          customer_email?: string | null
          customer_name?: string
          form_id?: string | null
          id?: string
          job_title?: string | null
          rating?: number
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_owner_plan: { Args: { _user_id: string }; Returns: string }
      get_public_form: {
        Args: { _slug: string }
        Returns: {
          background_color: string
          body_font: string
          brand_logo: string
          brand_name: string
          fields: Json
          heading_font: string
          headline: string
          id: string
          intro: string
          name: string
          primary_color: string
          text_color: string
          thank_you: string
        }[]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
