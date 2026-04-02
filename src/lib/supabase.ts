import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded')
console.log('Supabase Service Role Key:', supabaseServiceKey ? 'Loaded' : 'Not Loaded')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin para operações que precisam de permissões elevadas
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'provider' | 'customer'
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role: 'provider' | 'customer'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'provider' | 'customer'
          created_at?: string
        }
      }
      providers: {
        Row: {
          id: string
          user_id: string
          name: string
          last_name: string
          whatsapp: string
          address: string
          category: string
          profile_image: string | null
          slug: string
          max_simultaneous: number
          professionals_per_period: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          last_name: string
          whatsapp: string
          address: string
          category: string
          profile_image?: string | null
          slug: string
          max_simultaneous: number
          professionals_per_period: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          last_name?: string
          whatsapp?: string
          address?: string
          category?: string
          profile_image?: string | null
          slug?: string
          max_simultaneous?: number
          professionals_per_period?: number
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          provider_id: string
          name: string
          description: string
          price: number
          duration: number
          image: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          name: string
          description: string
          price: number
          duration: number
          image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active: boolean
        }
        Insert: {
          id?: string
          provider_id: string
          day_of_week: number
          start_time: string
          end_time: string
          is_active?: boolean
        }
        Update: {
          id?: string
          provider_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          is_active?: boolean
        }
      }
      blocked_periods: {
        Row: {
          id: string
          provider_id: string
          start_date: string
          end_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          start_date: string
          end_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          start_date?: string
          end_date?: string
          reason?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          provider_id: string
          customer_id: string
          service_id: string
          date: string
          time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          customer_id: string
          service_id: string
          date: string
          time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          customer_id?: string
          service_id?: string
          date?: string
          time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      provider_settings: {
        Row: {
          id: string
          provider_id: string
          require_payment: boolean
          payment_type: 'none' | 'deposit' | 'full'
          deposit_amount: number | null
          mercado_pago_link: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          require_payment?: boolean
          payment_type?: 'none' | 'deposit' | 'full'
          deposit_amount?: number | null
          mercado_pago_link?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          require_payment?: boolean
          payment_type?: 'none' | 'deposit' | 'full'
          deposit_amount?: number | null
          mercado_pago_link?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
