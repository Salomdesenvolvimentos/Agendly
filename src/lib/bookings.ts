import { supabase } from './supabase'
import { Booking, BookingFormData } from '@/types'
import { getAvailableTimeSlots } from './availability'

export async function createBooking(
  providerId: string,
  customerId: string,
  data: BookingFormData
) {
  try {
    // Verificar disponibilidade do horário
    const availableSlots = await getAvailableTimeSlots(
      providerId,
      data.service_id,
      data.date
    )

    const selectedSlot = availableSlots.find(slot => slot.time === data.time)
    
    if (!selectedSlot || !selectedSlot.available) {
      throw new Error('Horário não disponível')
    }

    // Buscar informações do serviço
    const { data: service } = await supabase
      .from('services')
      .select('price, duration')
      .eq('id', data.service_id)
      .single()

    if (!service) throw new Error('Service not found')

    // Criar agendamento
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        provider_id: providerId,
        customer_id: customerId,
        service_id: data.service_id,
        date: data.date,
        time: data.time,
        status: 'pending',
        payment_status: 'pending',
        total_amount: service.price,
        notes: data.notes,
      })
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        providers (
          id,
          name,
          last_name,
          whatsapp,
          address
        )
      `)
      .single()

    if (error) throw error

    return { data: booking, error: null }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { data: null, error: error as Error }
  }
}

export async function getBookingsByProvider(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        users!bookings_customer_id_fkey (
          id,
          email,
          name
        )
      `)
      .eq('provider_id', providerId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting bookings by provider:', error)
    return { data: null, error: error as Error }
  }
}

export async function getBookingsByCustomer(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        providers (
          id,
          name,
          last_name,
          whatsapp,
          address,
          slug
        )
      `)
      .eq('customer_id', customerId)
      .order('date', { ascending: false })
      .order('time', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting bookings by customer:', error)
    return { data: null, error: error as Error }
  }
}

export async function getBookingById(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        providers (
          id,
          name,
          last_name,
          whatsapp,
          address,
          slug
        ),
        users!bookings_customer_id_fkey (
          id,
          email,
          name
        )
      `)
      .eq('id', bookingId)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return { data, error: error as Error }
  } catch (error) {
    console.error('Error getting booking by ID:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return { data: null, error: error as Error }
  }
}

export async function updatePaymentStatus(
  bookingId: string,
  paymentStatus: 'pending' | 'paid' | 'refunded'
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ paymentStatus })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { data: null, error: error as Error }
  }
}

export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'cancelled',
        notes: reason || 'Cancelado pelo usuário'
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return { data: null, error: error as Error }
  }
}

export async function getTodayBookings(providerId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        users!bookings_customer_id_fkey (
          id,
          email,
          name
        )
      `)
      .eq('provider_id', providerId)
      .eq('date', today)
      .in('status', ['confirmed', 'pending'])
      .order('time', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting today bookings:', error)
    return { data: null, error: error as Error }
  }
}

export async function getUpcomingBookings(providerId: string, days: number = 7) {
  try {
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + days)
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          id,
          name,
          duration,
          price
        ),
        users!bookings_customer_id_fkey (
          id,
          email,
          name
        )
      `)
      .eq('provider_id', providerId)
      .gte('date', today.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .in('status', ['confirmed', 'pending'])
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting upcoming bookings:', error)
    return { data: null, error: error as Error }
  }
}
