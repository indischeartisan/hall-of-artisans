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
      academy_course_translations: {
        Row: {
          audience: Json
          course_id: string
          created_at: string
          full_description: string | null
          learning_outcomes: Json
          locale: string
          short_description: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: Json
          course_id: string
          created_at?: string
          full_description?: string | null
          learning_outcomes?: Json
          locale: string
          short_description?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: Json
          course_id?: string
          created_at?: string
          full_description?: string | null
          learning_outcomes?: Json
          locale?: string
          short_description?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_course_translations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_courses: {
        Row: {
          access_type: string
          cover_path: string | null
          created_at: string
          created_by: string | null
          estimated_minutes: number
          hero_path: string | null
          id: string
          level: string
          published_at: string | null
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_type: string
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number
          hero_path?: string | null
          id?: string
          level?: string
          published_at?: string | null
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_type?: string
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          estimated_minutes?: number
          hero_path?: string | null
          id?: string
          level?: string
          published_at?: string | null
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      academy_enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrolled_at: string
          expires_at: string | null
          id: string
          revoked_at: string | null
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          source: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          revoked_at?: string | null
          source?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_block_translations: {
        Row: {
          block_id: string
          content: Json
          created_at: string
          locale: string
          updated_at: string
        }
        Insert: {
          block_id: string
          content?: Json
          created_at?: string
          locale: string
          updated_at?: string
        }
        Update: {
          block_id?: string
          content?: Json
          created_at?: string
          locale?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_block_translations_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "academy_lesson_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_blocks: {
        Row: {
          block_type: string
          created_at: string
          id: string
          lesson_id: string
          position: number
          settings: Json
          status: string
          updated_at: string
        }
        Insert: {
          block_type: string
          created_at?: string
          id?: string
          lesson_id: string
          position: number
          settings?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          created_at?: string
          id?: string
          lesson_id?: string
          position?: number
          settings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_blocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_block_position: number
          last_opened_at: string | null
          lesson_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_block_position?: number
          last_opened_at?: string | null
          lesson_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_block_position?: number
          last_opened_at?: string | null
          lesson_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lesson_translations: {
        Row: {
          created_at: string
          introduction: string | null
          learning_objectives: Json
          lesson_id: string
          locale: string
          materials_needed: Json
          opening_line: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          introduction?: string | null
          learning_objectives?: Json
          lesson_id: string
          locale: string
          materials_needed?: Json
          opening_line?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          introduction?: string | null
          learning_objectives?: Json
          lesson_id?: string
          locale?: string
          materials_needed?: Json
          opening_line?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_lesson_translations_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "academy_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_lessons: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_preview: boolean
          lesson_type: string
          module_id: string
          position: number
          practice_minutes: number
          published_at: string | null
          reading_minutes: number
          requires_previous_lesson: boolean
          slug: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_type?: string
          module_id: string
          position: number
          practice_minutes?: number
          published_at?: string | null
          reading_minutes?: number
          requires_previous_lesson?: boolean
          slug: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_type?: string
          module_id?: string
          position?: number
          practice_minutes?: number
          published_at?: string | null
          reading_minutes?: number
          requires_previous_lesson?: boolean
          slug?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_module_translations: {
        Row: {
          created_at: string
          description: string | null
          learning_outcome: string | null
          locale: string
          module_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          learning_outcome?: string | null
          locale: string
          module_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          learning_outcome?: string | null
          locale?: string
          module_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_module_translations_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "academy_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_modules: {
        Row: {
          course_id: string
          created_at: string
          estimated_minutes: number
          id: string
          illustration_path: string | null
          position: number
          status: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          estimated_minutes?: number
          id?: string
          illustration_path?: string | null
          position: number
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          estimated_minutes?: number
          id?: string
          illustration_path?: string | null
          position?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      aftercare_cases: {
        Row: {
          assigned_reviewer_id: string | null
          body: string
          created_at: string
          id: string
          kind: string
          linked_review_request_id: string | null
          rating: number | null
          resolved_at: string | null
          review_request_id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_reviewer_id?: string | null
          body: string
          created_at?: string
          id?: string
          kind: string
          linked_review_request_id?: string | null
          rating?: number | null
          resolved_at?: string | null
          review_request_id: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_reviewer_id?: string | null
          body?: string
          created_at?: string
          id?: string
          kind?: string
          linked_review_request_id?: string | null
          rating?: number | null
          resolved_at?: string | null
          review_request_id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aftercare_cases_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aftercare_cases_linked_review_request_id_fkey"
            columns: ["linked_review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aftercare_cases_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aftercare_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aftercare_messages: {
        Row: {
          case_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "aftercare_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "aftercare_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aftercare_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          certificate_name: string | null
          country_code: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          preferred_locale: string | null
          pricing_region: string | null
          profile_completed_at: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          certificate_name?: string | null
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          preferred_locale?: string | null
          pricing_region?: string | null
          profile_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          certificate_name?: string | null
          country_code?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          preferred_locale?: string | null
          pricing_region?: string | null
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
          follow_up_kind?: string | null
          fragrance_brief?: string
          fragrance_direction?: string[]
          heart_notes?: string[]
          id?: string
          included_items?: string[]
          package_snapshot?: Json | null
          paid_at?: string | null
          parent_request_id?: string | null
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
          follow_up_kind?: string | null
          fragrance_brief?: string
          fragrance_direction?: string[]
          heart_notes?: string[]
          id?: string
          included_items?: string[]
          package_snapshot?: Json | null
          paid_at?: string | null
          parent_request_id?: string | null
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
            foreignKeyName: "review_requests_parent_request_id_fkey"
            columns: ["parent_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
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
      academy_enroll_in_free_course: {
        Args: { target_course_slug: string }
        Returns: {
          course_id: string
          enrolled_at: string
          enrollment_id: string
          status: string
        }[]
      }
      academy_resolve_course_access: {
        Args: { target_course_slug: string }
        Returns: string
      }
      admin_transition_order: {
        Args: {
          next_stage: string
          target_order_id: string
          target_tracking_number?: string
        }
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
          certificate_name: string | null
          country_code: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          preferred_locale: string | null
          pricing_region: string | null
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
      create_aftercare_case: {
        Args: {
          case_body: string
          case_kind: string
          case_rating?: number
          case_subject: string
          target_request_id: string
        }
        Returns: {
          assigned_reviewer_id: string | null
          body: string
          created_at: string
          id: string
          kind: string
          linked_review_request_id: string | null
          rating: number | null
          resolved_at: string | null
          review_request_id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "aftercare_cases"
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
      get_assigned_customer_summaries: {
        Args: never
        Returns: {
          artisan_id: string
          display_name: string
          user_id: string
        }[]
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
      resolve_aftercare_case: {
        Args: { target_case_id: string }
        Returns: {
          assigned_reviewer_id: string | null
          body: string
          created_at: string
          id: string
          kind: string
          linked_review_request_id: string | null
          rating: number | null
          resolved_at: string | null
          review_request_id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "aftercare_cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
      send_aftercare_message: {
        Args: { message_body: string; target_case_id: string }
        Returns: {
          case_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_role: string
        }
        SetofOptions: {
          from: "*"
          to: "aftercare_messages"
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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
          follow_up_kind: string | null
          fragrance_brief: string
          fragrance_direction: string[]
          heart_notes: string[]
          id: string
          included_items: string[]
          package_snapshot: Json | null
          paid_at: string | null
          parent_request_id: string | null
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

