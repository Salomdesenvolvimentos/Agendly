import { supabase, supabaseAdmin } from './supabase'
import { Availability, BlockedPeriod, CalendarDay, TimeSlot } from '@/types'
import { format, addDays, startOfWeek, addMinutes, parseISO, isBefore, isAfter } from 'date-fns'

export async function getAvailabilityByProvider(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('day_of_week')

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting availability:', error)
    return { data: null, error: error as Error }
  }
}

export async function createAvailability(providerId: string, data: Omit<Availability, 'id' | 'provider_id'>) {
  try {
    console.log('Creating availability with:', { providerId, data })
    
    const insertData = {
      provider_id: providerId,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      is_active: data.is_active,
    }
    
    console.log('Insert data:', insertData)
    
    // Usar cliente admin para contornar RLS
    const client = supabaseAdmin || supabase
    
    const { data: availability, error } = await client
      .from('availability')
      .insert(insertData)
      .select()
      .single()

    console.log('Supabase response:', { availability, error })

    if (error) {
      console.error('Supabase error details:', error)
      throw error
    }

    console.log('Availability created successfully:', availability)
    return { data: availability, error: null }
  } catch (error) {
    console.error('Error creating availability:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateAvailability(availabilityId: string, data: Partial<Availability>) {
  try {
    const { data: availability, error } = await supabase
      .from('availability')
      .update(data)
      .eq('id', availabilityId)
      .select()
      .single()

    if (error) throw error

    return { data: availability, error: null }
  } catch (error) {
    console.error('Error updating availability:', error)
    return { data: null, error: error as Error }
  }
}

export async function deleteAvailability(availabilityId: string) {
  try {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', availabilityId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting availability:', error)
    return { error: error as Error }
  }
}

export async function setAvailability(providerId: string, availability: Omit<Availability, 'id' | 'provider_id'>) {
  try {
    const { data, error } = await supabase
      .from('availability')
      .upsert({
        provider_id: providerId,
        day_of_week: availability.day_of_week,
        start_time: availability.start_time,
        end_time: availability.end_time,
        is_active: availability.is_active,
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error setting availability:', error)
    return { data: null, error: error as Error }
  }
}

export async function getBlockedPeriods(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('blocked_periods')
      .select('*')
      .eq('provider_id', providerId)
      .order('start_date')

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error getting blocked periods:', error)
    return { data: null, error: error as Error }
  }
}

export async function addBlockedPeriod(providerId: string, period: Omit<BlockedPeriod, 'id' | 'provider_id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('blocked_periods')
      .insert({
        provider_id: providerId,
        start_date: period.start_date,
        end_date: period.end_date,
        reason: period.reason,
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error adding blocked period:', error)
    return { data: null, error: error as Error }
  }
}

export async function removeBlockedPeriod(periodId: string) {
  try {
    const { error } = await supabase
      .from('blocked_periods')
      .delete()
      .eq('id', periodId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error removing blocked period:', error)
    return { error: error as Error }
  }
}

export async function getAvailableTimeSlots(
  providerId: string,
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  try {
    // Buscar informações do serviço
    const { data: service } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()

    if (!service) throw new Error('Service not found')

    // Buscar disponibilidade do dia da semana
    const dayOfWeek = new Date(date).getDay()
    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('provider_id', providerId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single()

    if (!availability) return []

    // Verificar se o dia está bloqueado
    const { data: blockedPeriods } = await getBlockedPeriods(providerId)
    const isBlocked = blockedPeriods?.some(period => {
      const startDate = new Date(period.start_date)
      const endDate = new Date(period.end_date)
      const checkDate = new Date(date)
      return checkDate >= startDate && checkDate <= endDate
    })

    if (isBlocked) return []

    // Buscar capacidade do fornecedor
    const { data: provider } = await supabase
      .from('providers')
      .select('max_simultaneous')
      .eq('id', providerId)
      .single()

    if (!provider) return []

    // Buscar agendamentos existentes no dia
    const { data: bookings } = await supabase
      .from('bookings')
      .select('time, duration')
      .eq('provider_id', providerId)
      .eq('date', date)
      .in('status', ['confirmed', 'pending'])

    // Gerar slots de tempo
    const startTime = parseISO(`${date}T${availability.start_time}`)
    const endTime = parseISO(`${date}T${availability.end_time}`)
    const slots: TimeSlot[] = []

    let currentTime = startTime
    while (isBefore(currentTime, endTime)) {
      const slotEnd = addMinutes(currentTime, service.duration)
      
      if (isBefore(slotEnd, endTime) || slotEnd.getTime() === endTime.getTime()) {
        // Verificar quantos agendamentos conflitam com este slot
        const conflictingBookings = bookings?.filter(booking => {
          const bookingStart = parseISO(`${date}T${booking.time}`)
          const bookingEnd = addMinutes(bookingStart, booking.duration)
          
          return (
            (isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, currentTime)) ||
            (isBefore(bookingStart, currentTime) && isAfter(bookingEnd, slotEnd)) ||
            (bookingStart.getTime() === currentTime.getTime() && bookingEnd.getTime() === slotEnd.getTime())
          )
        }) || []

        const available = conflictingBookings.length < provider.max_simultaneous

        slots.push({
          time: format(currentTime, 'HH:mm'),
          available,
          capacity: provider.max_simultaneous,
          booked: conflictingBookings.length,
        })
      }

      currentTime = addMinutes(currentTime, 30) // Intervalos de 30 minutos
    }

    return slots
  } catch (error) {
    console.error('Error getting available time slots:', error)
    return []
  }
}

export async function getCalendarDays(
  providerId: string,
  serviceId: string,
  startDate: Date,
  days: number = 30
): Promise<CalendarDay[]> {
  const calendarDays: CalendarDay[] = []

  for (let i = 0; i < days; i++) {
    const currentDate = addDays(startDate, i)
    const dateString = format(currentDate, 'yyyy-MM-dd')
    const dayOfWeek = currentDate.getDay()

    // Buscar disponibilidade para este dia da semana
    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('provider_id', providerId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .single()

    const isAvailable = !!availability

    if (isAvailable) {
      const timeSlots = await getAvailableTimeSlots(providerId, serviceId, dateString)
      const hasAvailableSlots = timeSlots.some(slot => slot.available)

      calendarDays.push({
        date: dateString,
        dayOfWeek,
        isAvailable: hasAvailableSlots,
        timeSlots,
      })
    } else {
      calendarDays.push({
        date: dateString,
        dayOfWeek,
        isAvailable: false,
        timeSlots: [],
      })
    }
  }

  return calendarDays
}
