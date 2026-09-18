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
          content: Json
          course_id: string
          id: string
          locale: string
          summary: string | null
          title: string
        }
        Insert: {
          content?: Json
          course_id: string
          id?: string
          locale: string
          summary?: string | null
          title: string
        }
        Update: {
          content?: Json
          course_id?: string
          id?: string
          locale?: string
          summary?: string | null
          title?: string
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
          created_at: string
          id: string
          published_at: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      academy_enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
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
        ]
      }
      academy_lesson_block_translations: {
        Row: {
          block_id: string
          content: Json
          id: string
          locale: string
        }
        Insert: {
          block_id: string
          content?: Json
          id?: string
          locale: string
        }
        Update: {
          block_id?: string
          content?: Json
          id?: string
          locale?: string
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
          content: Json
          created_at: string
          id: string
          lesson_id: string
          position: number
          status: string
          updated_at: string
        }
        Insert: {
          block_type?: string
          content?: Json
          created_at?: string
          id?: string
          lesson_id: string
          position?: number
          status?: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: Json
          created_at?: string
          id?: string
          lesson_id?: string
          position?: number
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
          last_block_position: number | null
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
          last_block_position?: number | null
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
          last_block_position?: number | null
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
        ]
      }
      academy_lesson_translations: {
        Row: {
          content: Json
          id: string
          lesson_id: string
          locale: string
          summary: string | null
          title: string
        }
        Insert: {
          content?: Json
          id?: string
          lesson_id: string
          locale: string
          summary?: string | null
          title: string
        }
        Update: {
          content?: Json
          id?: string
          lesson_id?: string
          locale?: string
          summary?: string | null
          title?: string
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
          id: string
          module_id: string
          position: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_id: string
          position?: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string
          position?: number
          slug?: string
          status?: string
          updated_at?: string
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
          id: string
          locale: string
          module_id: string
          summary: string | null
          title: string
        }
        Insert: {
          id?: string
          locale: string
          module_id: string
          summary?: string | null
          title: string
        }
        Update: {
          id?: string
          locale?: string
          module_id?: string
          summary?: string | null
          title?: string
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
          id: string
          position: number
          status: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
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
          body: string | null
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
          body?: string | null
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
          body?: string | null
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
        ]
      }
      aftercare_messages: {
        Row: {
          case_id: string
          created_at: string
          id: string
          message: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          message: string
          sender_name: string
          sender_role: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          message?: string
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
        ]
      }
      archive_records: {
        Row: {
          archive_number: number
          created_at: string
          creator: string | null
          display_order: number
          id: string
          image_alt: string | null
          image_path: string | null
          is_featured: boolean
          moods: Json
          owner_id: string | null
          slug: string | null
          status: string
          story: string | null
          title: string
          updated_at: string
        }
        Insert: {
          archive_number: number
          created_at?: string
          creator?: string | null
          display_order?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_featured?: boolean
          moods?: Json
          owner_id?: string | null
          slug?: string | null
          status?: string
          story?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          archive_number?: number
          created_at?: string
          creator?: string | null
          display_order?: number
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_featured?: boolean
          moods?: Json
          owner_id?: string | null
          slug?: string | null
          status?: string
          story?: string | null
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
      commission_packages: {
        Row: {
          bottle_size: string | null
          concentration: string | null
          consultations_included: number
          created_at: string
          currency: string
          description: string | null
          display_order: number
          estimated_production: string | null
          id: string
          included_items: Json
          is_active: boolean
          name: string
          price: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          bottle_size?: string | null
          concentration?: string | null
          consultations_included?: number
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          estimated_production?: string | null
          id?: string
          included_items?: Json
          is_active?: boolean
          name: string
          price?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          bottle_size?: string | null
          concentration?: string | null
          consultations_included?: number
          created_at?: string
          currency?: string
          description?: string | null
          display_order?: number
          estimated_production?: string | null
          id?: string
          included_items?: Json
          is_active?: boolean
          name?: string
          price?: number | null
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
          mode: string
          payload: Json
          perfume_name: string | null
          schema_version: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft_name: string
          id?: string
          mode: string
          payload?: Json
          perfume_name?: string | null
          schema_version?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft_name?: string
          id?: string
          mode?: string
          payload?: Json
          perfume_name?: string | null
          schema_version?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_orders: {
        Row: {
          amount: number
          checkout_details: Json
          created_at: string
          currency: string
          customer_email_snapshot: string | null
          customer_name_snapshot: string | null
          customer_phone_snapshot: string | null
          fulfillment_status: string | null
          grand_total: number | null
          id: string
          order_kind: string
          order_number: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          payment_url: string | null
          production_status: string
          shipping_address_snapshot: Json | null
          shipping_amount: number
          shipping_courier: string | null
          shipping_preference: string | null
          shipping_service: string | null
          shipping_status: string
          subtotal: number | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          checkout_details?: Json
          created_at?: string
          currency?: string
          customer_email_snapshot?: string | null
          customer_name_snapshot?: string | null
          customer_phone_snapshot?: string | null
          fulfillment_status?: string | null
          grand_total?: number | null
          id?: string
          order_kind?: string
          order_number?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          payment_url?: string | null
          production_status?: string
          shipping_address_snapshot?: Json | null
          shipping_amount?: number
          shipping_courier?: string | null
          shipping_preference?: string | null
          shipping_service?: string | null
          shipping_status?: string
          subtotal?: number | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          checkout_details?: Json
          created_at?: string
          currency?: string
          customer_email_snapshot?: string | null
          customer_name_snapshot?: string | null
          customer_phone_snapshot?: string | null
          fulfillment_status?: string | null
          grand_total?: number | null
          id?: string
          order_kind?: string
          order_number?: string
          paid_at?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          payment_url?: string | null
          production_status?: string
          shipping_address_snapshot?: Json | null
          shipping_amount?: number
          shipping_courier?: string | null
          shipping_preference?: string | null
          shipping_service?: string | null
          shipping_status?: string
          subtotal?: number | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          avoid_if: Json | null
          best_used_for: Json | null
          category_id: string | null
          clean: number | null
          created_at: string
          created_by: string | null
          darkness: number | null
          description: string | null
          display_order: number
          family: string | null
          floral: number | null
          freshness: number | null
          green: number | null
          id: string
          image_alt: string | null
          image_path: string | null
          intensity: number | null
          is_featured: boolean
          layers: Json | null
          legacy_bench_id: string | null
          legacy_library_id: string | null
          longevity: number | null
          material_type: string | null
          media_id: string | null
          moods: Json | null
          name: string
          pairs_well_with: Json | null
          powdery: number | null
          slug: string
          status: string
          strangeness: number | null
          sweetness: number | null
          tags: Json | null
          updated_at: string
          updated_by: string | null
          warmth: number | null
          woody: number | null
        }
        Insert: {
          avoid_if?: Json | null
          best_used_for?: Json | null
          category_id?: string | null
          clean?: number | null
          created_at?: string
          created_by?: string | null
          darkness?: number | null
          description?: string | null
          display_order?: number
          family?: string | null
          floral?: number | null
          freshness?: number | null
          green?: number | null
          id?: string
          image_alt?: string | null
          image_path?: string | null
          intensity?: number | null
          is_featured?: boolean
          layers?: Json | null
          legacy_bench_id?: string | null
          legacy_library_id?: string | null
          longevity?: number | null
          material_type?: string | null
          media_id?: string | null
          moods?: Json | null
          name: string
          pairs_well_with?: Json | null
          powdery?: number | null
          slug: string
          status?: string
          strangeness?: number | null
          sweetness?: number | null
          tags?: Json | null
          updated_at?: string
          updated_by?: string | null
          warmth?: number | null
          woody?: number | null
        }
        Update: {
          avoid_if?: Json | null
          best_used_for?: Json | null
          category_id?: string | null
          clean?: number | null
          created_at?: string
          created_by?: string | null
          darkness?: number | null
          description?: string | null
          display_order?: number
          family?: string | null
          floral?: number | null
          freshness?: number | null
          green?: number | null
          id?: string
          image_alt?: string | null
          image_path?: string | null
          intensity?: number | null
          is_featured?: boolean
          layers?: Json | null
          legacy_bench_id?: string | null
          legacy_library_id?: string | null
          longevity?: number | null
          material_type?: string | null
          media_id?: string | null
          moods?: Json | null
          name?: string
          pairs_well_with?: Json | null
          powdery?: number | null
          slug?: string
          status?: string
          strangeness?: number | null
          sweetness?: number | null
          tags?: Json | null
          updated_at?: string
          updated_by?: string | null
          warmth?: number | null
          woody?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "material_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          read_at: string | null
          recipient_id: string
          request_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          read_at?: string | null
          recipient_id: string
          request_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          recipient_id?: string
          request_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
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
          estimated_ready_at_snapshot: string | null
          fulfillment_status: string | null
          id: string
          item_type: string
          name_snapshot: string | null
          order_id: string
          price_snapshot: number | null
          product_id: string | null
          production_status: string
          quantity: number
          review_request_id: string | null
          sale_type_snapshot: string | null
          shipping_status: string
          sku_snapshot: string | null
          submission_id: string | null
          submission_snapshot: Json | null
          tracking_number: string | null
          unit_price_snapshot: number | null
          user_id: string
          variant_id: string | null
          variant_label_snapshot: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          creation_name: string
          currency?: string
          estimated_ready_at_snapshot?: string | null
          fulfillment_status?: string | null
          id?: string
          item_type?: string
          name_snapshot?: string | null
          order_id: string
          price_snapshot?: number | null
          product_id?: string | null
          production_status?: string
          quantity?: number
          review_request_id?: string | null
          sale_type_snapshot?: string | null
          shipping_status?: string
          sku_snapshot?: string | null
          submission_id?: string | null
          submission_snapshot?: Json | null
          tracking_number?: string | null
          unit_price_snapshot?: number | null
          user_id: string
          variant_id?: string | null
          variant_label_snapshot?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          creation_name?: string
          currency?: string
          estimated_ready_at_snapshot?: string | null
          fulfillment_status?: string | null
          id?: string
          item_type?: string
          name_snapshot?: string | null
          order_id?: string
          price_snapshot?: number | null
          product_id?: string | null
          production_status?: string
          quantity?: number
          review_request_id?: string | null
          sale_type_snapshot?: string | null
          shipping_status?: string
          sku_snapshot?: string | null
          submission_id?: string | null
          submission_snapshot?: Json | null
          tracking_number?: string | null
          unit_price_snapshot?: number | null
          user_id?: string
          variant_id?: string | null
          variant_label_snapshot?: string | null
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          id: string
          order_id: string
          payload: Json
          processed_at: string | null
          provider: string
          provider_event_id: string
          received_at: string
          transaction_status: string | null
        }
        Insert: {
          id?: string
          order_id: string
          payload: Json
          processed_at?: string | null
          provider: string
          provider_event_id: string
          received_at?: string
          transaction_status?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          received_at?: string
          transaction_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhook_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          price: number
          product_id: string
          size_ml: number | null
          sku: string
          stock_quantity: number | null
          updated_at: string
          weight_grams: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          price: number
          product_id: string
          size_ml?: number | null
          sku: string
          stock_quantity?: number | null
          updated_at?: string
          weight_grams: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          price?: number
          product_id?: string
          size_ml?: number | null
          sku?: string
          stock_quantity?: number | null
          updated_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_line: string
          created_at: string
          currency: string
          description: string | null
          estimated_ready_at: string | null
          id: string
          name: string
          notes: Json | null
          preorder_closes_at: string | null
          price: number
          sale_type: Database["public"]["Enums"]["product_sale_type"]
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number | null
          thumbnail_url: string | null
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          brand_line: string
          created_at?: string
          currency?: string
          description?: string | null
          estimated_ready_at?: string | null
          id?: string
          name: string
          notes?: Json | null
          preorder_closes_at?: string | null
          price: number
          sale_type: Database["public"]["Enums"]["product_sale_type"]
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          brand_line?: string
          created_at?: string
          currency?: string
          description?: string | null
          estimated_ready_at?: string | null
          id?: string
          name?: string
          notes?: Json | null
          preorder_closes_at?: string | null
          price?: number
          sale_type?: Database["public"]["Enums"]["product_sale_type"]
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          certificate_name: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          preferred_locale: string
          profile_completed_at: string | null
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          certificate_name?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          preferred_locale?: string
          profile_completed_at?: string | null
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          certificate_name?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          is_profile_complete?: boolean
          portrait_path?: string | null
          preferred_locale?: string
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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          label: string
          metadata?: Json
          request_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          label?: string
          metadata?: Json
          request_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_activity_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          request_id: string
          sender_name: string
          sender_role: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          request_id?: string
          sender_name?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          artisan_review?: Json | null
          assigned_at?: string | null
          assigned_reviewer_id?: string | null
          base_notes?: Json | null
          bottle_size?: string | null
          completed_at?: string | null
          concentration?: string | null
          consultation_completed_at?: string | null
          consultation_started_at?: string | null
          country_code?: string | null
          created_at?: string
          creation_id?: string | null
          creation_mode?: string | null
          currency?: string
          customer_notes?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          estimated_production?: string | null
          final_price?: number | null
          fragrance_brief?: Json | null
          fragrance_direction?: string | null
          heart_notes?: Json | null
          id?: string
          included_items?: Json | null
          package_snapshot?: Json | null
          paid_at?: string | null
          perfume_name?: string
          preview_snapshot?: Json | null
          pricing_region?: string | null
          ready_for_payment_at?: string | null
          recommended_adjustments?: Json | null
          request_number?: string
          reviewed_at?: string | null
          revisions_included?: number | null
          selected_package_id?: string | null
          shipped_at?: string | null
          status?: string
          story_card_data?: Json | null
          submission_id?: string | null
          submission_snapshot?: Json | null
          submitted_at?: string | null
          top_notes?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          artisan_review?: Json | null
          assigned_at?: string | null
          assigned_reviewer_id?: string | null
          base_notes?: Json | null
          bottle_size?: string | null
          completed_at?: string | null
          concentration?: string | null
          consultation_completed_at?: string | null
          consultation_started_at?: string | null
          country_code?: string | null
          created_at?: string
          creation_id?: string | null
          creation_mode?: string | null
          currency?: string
          customer_notes?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          estimated_production?: string | null
          final_price?: number | null
          fragrance_brief?: Json | null
          fragrance_direction?: string | null
          heart_notes?: Json | null
          id?: string
          included_items?: Json | null
          package_snapshot?: Json | null
          paid_at?: string | null
          perfume_name?: string
          preview_snapshot?: Json | null
          pricing_region?: string | null
          ready_for_payment_at?: string | null
          recommended_adjustments?: Json | null
          request_number?: string
          reviewed_at?: string | null
          revisions_included?: number | null
          selected_package_id?: string | null
          shipped_at?: string | null
          status?: string
          story_card_data?: Json | null
          submission_id?: string | null
          submission_snapshot?: Json | null
          submitted_at?: string | null
          top_notes?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_selected_package_id_fkey"
            columns: ["selected_package_id"]
            isOneToOne: false
            referencedRelation: "commission_packages"
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
          created_at: string
          enrolled_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "academy_enrollments"
          isOneToOne: false
          isSetofReturn: true
        }
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
          customer_email_snapshot: string | null
          customer_name_snapshot: string | null
          customer_phone_snapshot: string | null
          fulfillment_status: string | null
          grand_total: number | null
          id: string
          order_kind: string
          order_number: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          payment_url: string | null
          production_status: string
          shipping_address_snapshot: Json | null
          shipping_amount: number
          shipping_courier: string | null
          shipping_preference: string | null
          shipping_service: string | null
          shipping_status: string
          subtotal: number | null
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
      assign_review_request: {
        Args: { reviewer_id: string; target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_profile_complete: boolean
          portrait_path: string | null
          preferred_locale: string
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
          body: string | null
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
          customer_email_snapshot: string | null
          customer_name_snapshot: string | null
          customer_phone_snapshot: string | null
          fulfillment_status: string | null
          grand_total: number | null
          id: string
          order_kind: string
          order_number: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          payment_url: string | null
          production_status: string
          shipping_address_snapshot: Json | null
          shipping_amount: number
          shipping_courier: string | null
          shipping_preference: string | null
          shipping_service: string | null
          shipping_status: string
          subtotal: number | null
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
      create_shop_order: {
        Args: { cart_items: Json; shipping?: Json }
        Returns: {
          amount: number
          checkout_details: Json
          created_at: string
          currency: string
          customer_email_snapshot: string | null
          customer_name_snapshot: string | null
          customer_phone_snapshot: string | null
          fulfillment_status: string | null
          grand_total: number | null
          id: string
          order_kind: string
          order_number: string
          paid_at: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          payment_url: string | null
          production_status: string
          shipping_address_snapshot: Json | null
          shipping_amount: number
          shipping_courier: string | null
          shipping_preference: string | null
          shipping_service: string | null
          shipping_status: string
          subtotal: number | null
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
      mark_notifications_read: {
        Args: { target_request_id?: string }
        Returns: number
      }
      mark_staff_request_messages_read: {
        Args: { target_request_id: string }
        Returns: undefined
      }
      next_artisan_public_id: { Args: never; Returns: string }
      process_doku_payment_event: {
        Args: {
          event_payload: Json
          provider_status: string
          target_event_id: string
          target_order_id: string
        }
        Returns: Json
      }
      resolve_aftercare_case: {
        Args: { target_case_id: string }
        Returns: {
          assigned_reviewer_id: string | null
          body: string | null
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
      select_review_package: {
        Args: { target_package_id: string; target_request_id: string }
        Returns: {
          approved_at: string | null
          artisan_review: Json | null
          assigned_at: string | null
          assigned_reviewer_id: string | null
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
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
          created_at: string
          id: string
          message: string
          read_at: string | null
          request_id: string
          sender_name: string
          sender_role: string
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
          base_notes: Json | null
          bottle_size: string | null
          completed_at: string | null
          concentration: string | null
          consultation_completed_at: string | null
          consultation_started_at: string | null
          country_code: string | null
          created_at: string
          creation_id: string | null
          creation_mode: string | null
          currency: string
          customer_notes: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          estimated_production: string | null
          final_price: number | null
          fragrance_brief: Json | null
          fragrance_direction: string | null
          heart_notes: Json | null
          id: string
          included_items: Json | null
          package_snapshot: Json | null
          paid_at: string | null
          perfume_name: string
          preview_snapshot: Json | null
          pricing_region: string | null
          ready_for_payment_at: string | null
          recommended_adjustments: Json | null
          request_number: string
          reviewed_at: string | null
          revisions_included: number | null
          selected_package_id: string | null
          shipped_at: string | null
          status: string
          story_card_data: Json | null
          submission_id: string | null
          submission_snapshot: Json | null
          submitted_at: string | null
          top_notes: Json | null
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
      product_sale_type: "READY_STOCK" | "PREORDER"
      product_status: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "ARCHIVED"
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
    Enums: {
      app_role: ["customer", "reviewer", "admin", "super_admin"],
      artisan_id_status: ["active", "suspended", "revoked"],
      product_sale_type: ["READY_STOCK", "PREORDER"],
      product_status: ["DRAFT", "ACTIVE", "SOLD_OUT", "ARCHIVED"],
    },
  },
} as const

