// src/lib/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'client' | 'admin' | 'vendor'
          name: string
          email: string
          wishlist: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: 'client' | 'admin' | 'vendor'
          name: string
          email: string
          wishlist?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'client' | 'admin' | 'vendor'
          name?: string
          email?: string
          wishlist?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          city: string
          postal_code: string
          country: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          city?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          title: string
          slug: string
          price: number
          sale_price: number | null
          images: string[]
          category: string
          sizes: string[]
          stock: number
          description: string
          specs: Json
          rating: number
          is_new: boolean
          is_featured: boolean
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          price: number
          sale_price?: number | null
          images: string[]
          category: string
          sizes: string[]
          stock?: number
          description: string
          specs?: Json
          rating?: number
          is_new?: boolean
          is_featured?: boolean
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          price?: number
          sale_price?: number | null
          images?: string[]
          category?: string
          sizes?: string[]
          stock?: number
          description?: string
          specs?: Json
          rating?: number
          is_new?: boolean
          is_featured?: boolean
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          user_name?: string
          rating?: number
          comment?: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          size: string | null
          quantity: number
          unit_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          size?: string | null
          quantity?: number
          unit_price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          size?: string | null
          quantity?: number
          unit_price?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          subtotal: number
          taxes: number
          shipping: number
          total: number
          status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          payment_method: 'transfer' | 'cash_on_delivery'
          payment_proof_url: string | null
          shipping_name: string
          shipping_email: string
          shipping_phone: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string
          shipping_country: string
          delivery_type: 'home' | 'pickup'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          subtotal: number
          taxes: number
          shipping: number
          total: number
          status?: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          payment_method: 'transfer' | 'cash_on_delivery'
          payment_proof_url?: string | null
          shipping_name: string
          shipping_email: string
          shipping_phone: string
          shipping_address: string
          shipping_city: string
          shipping_postal_code: string
          shipping_country: string
          delivery_type: 'home' | 'pickup'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          subtotal?: number
          taxes?: number
          shipping?: number
          total?: number
          status?: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
          payment_method?: 'transfer' | 'cash_on_delivery'
          payment_proof_url?: string | null
          shipping_name?: string
          shipping_email?: string
          shipping_phone?: string
          shipping_address?: string
          shipping_city?: string
          shipping_postal_code?: string
          shipping_country?: string
          delivery_type?: 'home' | 'pickup'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_title: string
          size: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_title: string
          size?: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_title?: string
          size?: string | null
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}