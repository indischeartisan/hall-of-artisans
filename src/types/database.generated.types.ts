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
      artisan_ids: {
        Row: {
          created_at: string
          display_name_snapshot: string
          id: string
          issued_at: string
          public_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["artisan_id_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name_snapshot: string
          id?: string
          issued_at?: string
          public_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["artisan_id_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name_snapshot?: string
          id?: string
          issued_at?: string
          public_id?: string
          revoked_at?: string | null
          status?: Database["public"]["Enums"]["artisan_id_status"]
          suspended_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_ids_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creation_drafts: {
        Row: {
          created_at: string
          draft_name: string
          id: string
          mode: Database["public"]["Enums"]["creation_mode"]
          payload: Json
          perfume_name: string | null
          schema_version: number
          status: Database["public"]["Enums"]["creation_draft_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_name: string
          id?: string
          mode: Database["public"]["Enums"]["creation_mode"]
          payload?: Json
          perfume_name?: string | null
          schema_version?: number
          status?: Database["public"]["Enums"]["creation_draft_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_name?: string
          id?: string
          mode?: Database["public"]["Enums"]["creation_mode"]
          payload?: Json
          perfume_name?: string | null
          schema_version?: number
          status?: Database["public"]["Enums"]["creation_draft_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creation_drafts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          profile_completed_at: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          profile_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          profile_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          reason: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
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
      assign_app_role: {
        Args: {
          assignment_reason?: string
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: {
          assigned_by: string | null
          created_at: string
          id: string
          reason: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_profile: {
        Args: { new_display_name: string }
        Returns: {
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          profile_completed_at: string | null
          suspended_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      issue_artisan_id: {
        Args: never
        Returns: {
          created_at: string
          display_name_snapshot: string
          id: string
          issued_at: string
          public_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["artisan_id_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "artisan_ids"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      manage_artisan_id: {
        Args: {
          new_status: Database["public"]["Enums"]["artisan_id_status"]
          target_user_id: string
        }
        Returns: {
          created_at: string
          display_name_snapshot: string
          id: string
          issued_at: string
          public_id: string
          revoked_at: string | null
          status: Database["public"]["Enums"]["artisan_id_status"]
          suspended_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "artisan_ids"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      next_artisan_public_id: { Args: never; Returns: string }
      revoke_app_role: {
        Args: {
          role_to_revoke: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "customer" | "reviewer" | "admin" | "super_admin"
      artisan_id_status: "active" | "suspended" | "revoked"
      creation_draft_status: "draft" | "ready"
      creation_mode: "artisan_bench" | "described"
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
      app_role: ["customer", "reviewer", "admin", "super_admin"],
      artisan_id_status: ["active", "suspended", "revoked"],
      creation_draft_status: ["draft", "ready"],
      creation_mode: ["artisan_bench", "described"],
    },
  },
} as const
