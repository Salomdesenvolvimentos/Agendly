export interface User {
  id: string
  email: string
  name?: string
  role: 'provider' | 'customer'
  created_at: string
}

export interface Provider {
  id: string
  user_id: string
  name: string
  last_name: string
  whatsapp: string
  address: string
  category: string
  profile_image?: string
  cover_image?: string
  slug: string
  max_simultaneous: number
  professionals_per_period: number
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  provider_id: string
  name: string
  description: string
  price: number
  duration: number // em minutos
  image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Availability {
  id: string
  provider_id: string
  day_of_week: number // 0-6 (domingo-sábado)
  start_time: string // HH:mm
  end_time: string // HH:mm
  is_active: boolean
}

export interface BlockedPeriod {
  id: string
  provider_id: string
  start_date: string
  end_date: string
  reason?: string
  created_at: string
}

export interface Booking {
  id: string
  provider_id: string
  customer_id: string
  service_id: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  total_amount: number
  notes?: string
  created_at: string
  updated_at: string
  services?: {
    id: string
    name: string
    duration: number
    price: number
  }
  providers?: {
    id: string
    name: string
    last_name: string
    whatsapp: string
    address: string
    slug: string
  }
  users?: {
    id: string
    email: string
    name?: string
  }
}

export interface ProviderSettings {
  id: string
  provider_id: string
  require_payment: boolean
  payment_type: 'none' | 'deposit' | 'full'
  deposit_amount?: number
  mercado_pago_link?: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface TimeSlot {
  time: string
  available: boolean
  capacity: number
  booked: number
}

export interface CalendarDay {
  date: string
  dayOfWeek: number
  isAvailable: boolean
  timeSlots: TimeSlot[]
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

// Tipos para formulários
export interface ProviderFormData {
  name: string
  last_name: string
  whatsapp: string
  address: string
  category: string
  profile_image?: File
  cover_image?: File
}

export interface ServiceFormData {
  name: string
  description: string
  price: number
  duration: number
  image?: File
}

export interface BookingFormData {
  service_id: string
  date: string
  time: string
  notes?: string
}
