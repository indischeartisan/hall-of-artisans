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
      archive_records: {
        Row: {
          archive_number: string
          created_at: string
          creator: string
          display_order: number
          id: string
          image_alt: string | null
          image_path: string | null
          is_featured: boolean
          moods: string[]
          owner_id: string | null
          slug: string
          status: string
          story: string
          title: string
          updated_at: string
        }
        Insert: {
          archive_number: string
          created_at?: string
          creator: string
          display_order?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_featured?: boolean
          moods?: string[]
          owner_id?: string | null
          slug: string
          status?: string
          story?: string
          title: string
          updated_at?: string
        }
        Update: {
          archive_number?: string
          created_at?: string
          creator?: string
          display_order?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_featured?: boolean
          moods?: string[]
          owner_id?: string | null
          slug?: string
          status?: string
          story?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      cms_entries: {
        Row: {
          content: Json
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          locale: string
          published_at: string | null
          seo: Json
          slug: string
          status: string
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          published_at?: string | null
          seo?: Json
          slug: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          locale?: string
          published_at?: string | null
          seo?: Json
          slug?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          created_by: string | null
          id: string
          media_type: string
          metadata: Json
          mime_type: string
          public_url: string | null
          storage_path: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          media_type: string
          metadata?: Json
          mime_type: string
          public_url?: string | null
          storage_path: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          media_type?: string
          metadata?: Json
          mime_type?: string
          public_url?: string | null
          storage_path?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      commission_packages: {
        Row: {
          bottle_size: string
          concentration: string
          consultations_included: number
          created_at: string
          currency: string
          description: string
          display_order: number
          estimated_production: string
          id: string
          included_items: string[]
          is_active: boolean
          name: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          bottle_size: string
          concentration: string
          consultations_included?: number
          created_at?: string
          currency?: string
          description?: string
          display_order?: number
          estimated_production: string
          id?: string
          included_items?: string[]
          is_active?: boolean
          name: string
          price: number
          slug: string
          updated_at?: string
        }
        Update: {
          bottle_size?: string
          concentration?: string
          consultations_included?: number
          created_at?: string
          currency?: string
          description?: string
          display_order?: number
          estimated_production?: string
          id?: string
          included_items?: string[]
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
      customer_orders: {
        Row: {
          amount: number
          checkout_details: Json
          created_at: string
          currency: string
          id: string
          order_number: string
          payment_status: string
          production_status: string
          shipping_preference: string
          shipping_status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          checkout_details: Json
          created_at?: string
          currency: string
          id?: string
          order_number: string
          payment_status?: string
          production_status?: string
          shipping_preference?: string
          shipping_status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          checkout_details?: Json
          created_at?: string
          currency?: string
          id?: string
          order_number?: string
          payment_status?: string
          production_status?: string
          shipping_preference?: string
          shipping_status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          avoid_if: string[]
          best_used_for: string[]
          category_id: string
          clean: number
          created_at: string
          created_by: string | null
          darkness: number
          description: string | null
          display_order: number
          family: string | null
          floral: number
          freshness: number
          green: number
          id: string
          image_alt: string | null
          image_path: string | null
          intensity: number
          is_featured: boolean
          layers: string[]
          legacy_bench_id: string | null
          legacy_library_id: string | null
          longevity: number
          material_type: string | null
          media_id: string | null
          moods: string[]
          name: string
          pairs_well_with: string[]
          powdery: number
          slug: string
          status: string
          strangeness: number
          sweetness: number
          tags: string[]
          updated_at: string
          updated_by: string | null
          warmth: number
          woody: number
        }
        Insert: {
          avoid_if?: string[]
          best_used_for?: string[]
          category_id: string
          clean?: number
          created_at?: string
          created_by?: string | null
          darkness?: number
          description?: string | null
          display_order?: number
          family?: string | null
          floral?: number
          freshness?: number
          green?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          intensity?: number
          is_featured?: boolean
          layers?: string[]
          legacy_bench_id?: string | null
          legacy_library_id?: string | null
          longevity?: number
          material_type?: string | null
          media_id?: string | null
          moods?: string[]
          name: string
          pairs_well_with?: string[]
          powdery?: number
          slug: string
          status?: string
          strangeness?: number
          sweetness?: number
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          warmth?: number
          woody?: number
        }
        Update: {
          avoid_if?: string[]
          best_used_for?: string[]
          category_id?: string
          clean?: number
          created_at?: string
          created_by?: string | null
          darkness?: number
          description?: string | null
          display_order?: number
          family?: string | null
          floral?: number
          freshness?: number
          green?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          intensity?: number
          is_featured?: boolean
          layers?: string[]
          legacy_bench_id?: string | null
          legacy_library_id?: string | null
          longevity?: number
          material_type?: string | null
          media_id?: string | null
          moods?: string[]
          name?: string
          pairs_well_with?: string[]
          powdery?: number
          slug?: string
          status?: string
          strangeness?: number
          sweetness?: number
          tags?: string[]
          updated_at?: string
          updated_by?: string | null
          warmth?: number
          woody?: number
        }
        Relationships: [
          {
            foreignKeyName: "materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "cms_media"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          amount: number
          created_at: string
          creation_name: string
          currency: string
          id: string
          order_id: string
          production_status: string
          review_request_id: string
          shipping_status: string
          submission_id: string
          submission_snapshot: Json
          tracking_number: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          creation_name: string
          currency: string
          id?: string
          order_id: string
          production_status?: string
          review_request_id: string
          shipping_status?: string
          submission_id: string
          submission_snapshot: Json
          tracking_number?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          creation_name?: string
          currency?: string
          id?: string
          order_id?: string
          production_status?: string
          review_request_id?: string
          shipping_status?: string
          submission_id?: string
          submission_snapshot?: Json
          tracking_number?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: true
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_user_id_fkey"
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
      request_activity: {
        Row: {
          created_at: string
          event_type: string
          id: string
          label: string
          metadata: Json
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          label: string
          metadata?: Json
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          label?: string
          metadata?: Json
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_activity_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          request_id: string
          sender_name: string
          sender_role: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          request_id?: string
          sender_name?: string
          sender_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_requests: {
        Row: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          artisan_review?: Json | null
          assigned_at?: string | null
          assigned_reviewer_id?: string | null
          base_notes?: string[]
          bottle_size: string
          completed_at?: string | null
          concentration: string
          consultation_completed_at?: string | null
          consultation_started_at?: string | null
          country_code?: string
          created_at?: string
          creation_id?: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency?: string
          customer_notes?: string
          estimated_price_max?: number
          estimated_price_min?: number
          estimated_production?: string | null
          final_price?: number | null
          fragrance_brief?: string
          fragrance_direction?: string[]
          heart_notes?: string[]
          id?: string
          included_items?: string[]
          package_snapshot?: Json | null
          paid_at?: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region?: string
          ready_for_payment_at?: string | null
          recommended_adjustments?: string[]
          request_number?: string
          reviewed_at?: string | null
          revisions_included?: number | null
          selected_package_id?: string | null
          shipped_at?: string | null
          status?: string
          story_card_data?: Json
          submission_id?: string | null
          submission_snapshot?: Json | null
          submitted_at?: string | null
          top_notes?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          artisan_review?: Json | null
          assigned_at?: string | null
          assigned_reviewer_id?: string | null
          base_notes?: string[]
          bottle_size?: string
          completed_at?: string | null
          concentration?: string
          consultation_completed_at?: string | null
          consultation_started_at?: string | null
          country_code?: string
          created_at?: string
          creation_id?: string
          creation_mode?: Database["public"]["Enums"]["creation_mode"]
          currency?: string
          customer_notes?: string
          estimated_price_max?: number
          estimated_price_min?: number
          estimated_production?: string | null
          final_price?: number | null
          fragrance_brief?: string
          fragrance_direction?: string[]
          heart_notes?: string[]
          id?: string
          included_items?: string[]
          package_snapshot?: Json | null
          paid_at?: string | null
          perfume_name?: string
          preview_snapshot?: Json
          pricing_region?: string
          ready_for_payment_at?: string | null
          recommended_adjustments?: string[]
          request_number?: string
          reviewed_at?: string | null
          revisions_included?: number | null
          selected_package_id?: string | null
          shipped_at?: string | null
          status?: string
          story_card_data?: Json
          submission_id?: string | null
          submission_snapshot?: Json | null
          submitted_at?: string | null
          top_notes?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_selected_package_id_fkey"
            columns: ["selected_package_id"]
            isOneToOne: false
            referencedRelation: "commission_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      assign_review_request: {
        Args: { reviewer_id: string; target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_review_request: {
        Args: { target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
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
      create_order_checkout: {
        Args: { checkout_payload: Json; request_ids: string[] }
        Returns: {
          amount: number
          checkout_details: Json
          created_at: string
          currency: string
          id: string
          order_number: string
          payment_status: string
          production_status: string
          shipping_preference: string
          shipping_status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "customer_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_review_preview: {
        Args: { request_payload: Json }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      customer_transition_review_request: {
        Args: {
          activity_label?: string
          next_status: string
          target_request_id: string
        }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
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
      list_active_reviewers: {
        Args: never
        Returns: {
          display_name: string
          user_id: string
        }[]
      }
      get_assigned_customer_summaries: {
        Args: never
        Returns: {
          artisan_id: string | null
          display_name: string
          user_id: string
        }[]
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
      select_review_package: {
        Args: { target_package_id: string; target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_customer_request_message: {
        Args: { message_body: string; target_request_id: string }
        Returns: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "request_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_staff_request_message: {
        Args: { message_body: string; target_request_id: string }
        Returns: {
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "request_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      staff_transition_review_request: {
        Args: {
          activity_label?: string
          next_status: string
          proposal?: Json
          target_request_id: string
        }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_review_request: {
        Args: { target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: string[]
          bottle_size: string
          completed_at: string | null
          concentration: string
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string
          created_at: string
          creation_id: string
          creation_mode: Database["public"]["Enums"]["creation_mode"]
          currency: string
          customer_notes: string
          estimated_price_max: number
          estimated_price_min: number
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json
          pricing_region: string
          ready_for_payment_at: string | null
          recommended_adjustments: string[]
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: string[]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "review_requests"
          isOneToOne: true
          isSetofReturn: false
        }
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
