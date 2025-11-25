/**
 * Supabase Database Types
 * Auto-generated types for the database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin' | 'super-admin'
          customer_type: 'new' | 'returning' | 'vip'
          profile_image: string | null
          is_active: boolean
          is_verified: boolean
          total_orders: number
          total_spent: number
          loyalty_points: number
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super-admin'
          customer_type?: 'new' | 'returning' | 'vip'
          profile_image?: string | null
          is_active?: boolean
          is_verified?: boolean
          total_orders?: number
          total_spent?: number
          loyalty_points?: number
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super-admin'
          customer_type?: 'new' | 'returning' | 'vip'
          profile_image?: string | null
          is_active?: boolean
          is_verified?: boolean
          total_orders?: number
          total_spent?: number
          loyalty_points?: number
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string | null
          country: string
          is_default: boolean
          type: 'shipping' | 'billing'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state?: string
          postal_code?: string | null
          country?: string
          is_default?: boolean
          type?: 'shipping' | 'billing'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string | null
          country?: string
          is_default?: boolean
          type?: 'shipping' | 'billing'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          is_featured: boolean
          seo: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          is_featured?: boolean
          seo?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          is_featured?: boolean
          seo?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          slug: string
          design_code: string | null
          description: string | null
          short_description: string | null
          category_id: string | null
          product_type: 'ready-made' | 'custom-only' | 'both'
          availability_status: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued'
          primary_image: string | null
          thumbnail_image: string | null
          fabric: Json | null
          pricing: Json
          customization: Json | null
          inventory: Json | null
          seo: Json | null
          is_featured: boolean
          is_new_arrival: boolean
          is_best_seller: boolean
          is_active: boolean
          is_deleted: boolean
          deleted_at: string | null
          views: number
          clicks: number
          purchased: number
          average_rating: number
          total_reviews: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          design_code?: string | null
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          product_type?: 'ready-made' | 'custom-only' | 'both'
          availability_status?: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued'
          primary_image?: string | null
          thumbnail_image?: string | null
          fabric?: Json | null
          pricing: Json
          customization?: Json | null
          inventory?: Json | null
          seo?: Json | null
          is_featured?: boolean
          is_new_arrival?: boolean
          is_best_seller?: boolean
          is_active?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          views?: number
          clicks?: number
          purchased?: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          design_code?: string | null
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          product_type?: 'ready-made' | 'custom-only' | 'both'
          availability_status?: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued'
          primary_image?: string | null
          thumbnail_image?: string | null
          fabric?: Json | null
          pricing?: Json
          customization?: Json | null
          inventory?: Json | null
          seo?: Json | null
          is_featured?: boolean
          is_new_arrival?: boolean
          is_best_seller?: boolean
          is_active?: boolean
          is_deleted?: boolean
          deleted_at?: string | null
          views?: number
          clicks?: number
          purchased?: number
          average_rating?: number
          total_reviews?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      product_colors: {
        Row: {
          id: string
          product_id: string
          name: string
          hex_code: string | null
          image: string | null
          in_stock: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          hex_code?: string | null
          image?: string | null
          in_stock?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          hex_code?: string | null
          image?: string | null
          in_stock?: boolean
          display_order?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_info: Json
          status: string
          order_type: 'standard' | 'custom' | 'replica'
          priority: 'normal' | 'high' | 'urgent'
          source: 'website' | 'whatsapp' | 'instagram' | 'phone' | 'walk-in'
          shipping_address: Json | null
          billing_address: Json | null
          pricing: Json
          payment: Json | null
          tracking: Json | null
          custom_details: Json | null
          notes: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id?: string | null
          customer_info: Json
          status?: string
          order_type?: 'standard' | 'custom' | 'replica'
          priority?: 'normal' | 'high' | 'urgent'
          source?: 'website' | 'whatsapp' | 'instagram' | 'phone' | 'walk-in'
          shipping_address?: Json | null
          billing_address?: Json | null
          pricing: Json
          payment?: Json | null
          tracking?: Json | null
          custom_details?: Json | null
          notes?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_info?: Json
          status?: string
          order_type?: 'standard' | 'custom' | 'replica'
          priority?: 'normal' | 'high' | 'urgent'
          source?: 'website' | 'whatsapp' | 'instagram' | 'phone' | 'walk-in'
          shipping_address?: Json | null
          billing_address?: Json | null
          pricing?: Json
          payment?: Json | null
          tracking?: Json | null
          custom_details?: Json | null
          notes?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          custom_details: Json | null
          measurements: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_snapshot: Json
          quantity?: number
          unit_price: number
          total_price: number
          custom_details?: Json | null
          measurements?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          unit_price?: number
          total_price?: number
          custom_details?: Json | null
          measurements?: Json | null
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          note: string | null
          updated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          note?: string | null
          updated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          note?: string | null
          updated_by?: string | null
          created_at?: string
        }
      }
      order_notes: {
        Row: {
          id: string
          order_id: string
          text: string
          added_by: string
          is_important: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          text: string
          added_by: string
          is_important?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          text?: string
          added_by?: string
          is_important?: boolean
          created_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          user_id: string
          label: string
          measurements: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          measurements: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          measurements?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          is_approved: boolean
          admin_response: string | null
          admin_response_at: string | null
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_response?: string | null
          admin_response_at?: string | null
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          admin_response?: string | null
          admin_response_at?: string | null
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          author_id: string
          category: string | null
          tags: string[] | null
          is_published: boolean
          published_at: string | null
          views: number
          seo: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          author_id: string
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          views?: number
          seo?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          author_id?: string
          category?: string | null
          tags?: string[] | null
          is_published?: boolean
          published_at?: string | null
          views?: number
          seo?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loyalty_points: {
        Row: {
          id: string
          user_id: string
          points: number
          type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
          source: string | null
          reference_id: string | null
          description: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
          source?: string | null
          reference_id?: string | null
          description?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          type?: 'earned' | 'redeemed' | 'expired' | 'adjusted'
          source?: string | null
          reference_id?: string | null
          description?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          referral_code: string
          status: 'pending' | 'completed' | 'rewarded'
          reward_points: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          referral_code: string
          status?: 'pending' | 'completed' | 'rewarded'
          reward_points?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          referral_code?: string
          status?: 'pending' | 'completed' | 'rewarded'
          reward_points?: number
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'admin' | 'super-admin'
      customer_type: 'new' | 'returning' | 'vip'
      product_type: 'ready-made' | 'custom-only' | 'both'
      availability_status: 'in-stock' | 'made-to-order' | 'out-of-stock' | 'discontinued'
      order_status: 'pending-payment' | 'payment-verified' | 'material-arranged' | 'in-progress' | 'quality-check' | 'ready-dispatch' | 'dispatched' | 'delivered' | 'cancelled' | 'refunded'
      order_type: 'standard' | 'custom' | 'replica'
      order_priority: 'normal' | 'high' | 'urgent'
      order_source: 'website' | 'whatsapp' | 'instagram' | 'phone' | 'walk-in'
      address_type: 'shipping' | 'billing'
      points_type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
      referral_status: 'pending' | 'completed' | 'rewarded'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
