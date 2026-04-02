'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Provider, Service, CalendarDay, TimeSlot } from '@/types'
import { getProviderBySlug } from '@/lib/providers'
import { getServiceById } from '@/lib/services'
import { getCalendarDays } from '@/lib/availability'
import { createBooking } from '@/lib/bookings'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (params.slug && params.serviceId) {
      loadBookingData()
    }
  }, [params.slug, params.serviceId])

  useEffect(() => {
    if (service && provider) {
      loadCalendarDays()
    }
  }, [service, provider, currentMonth])

  const loadBookingData = async () => {
    try {
      setLoading(true)
      
      const [{ data: providerData }, { data: serviceData }] = await Promise.all([
        getProviderBySlug(params.slug as string),
        getServiceById(params.serviceId as string)
      ])
      
      if (!providerData || !serviceData) {
        setError('Serviço ou fornecedor não encontrado')
        return
      }
      
      if (serviceData.provider_id !== providerData.id) {
        setError('Serviço não pertence a este fornecedor')
        return
      }
      
      setProvider(providerData)
      setService(serviceData)
      
    } catch (error) {
      console.error('Error loading booking data:', error)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarDays = async () => {
    if (!service || !provider) return

    const startDate = startOfMonth(currentMonth)
    const days = await getCalendarDays(provider.id, service.id, startDate, 35)
    setCalendarDays(days)
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    
    if (!selectedDate || !selectedTime || !service || !provider) return

    try {
      setSubmitting(true)
      setError('')

      const { data, error } = await createBooking(provider.id, user.id, {
        service_id: service.id,
        date: selectedDate,
        time: selectedTime,
        notes: notes || undefined,
      })

      if (error) throw error

      router.push(`/booking/confirmation/${data.id}`)
      
    } catch (error) {
      console.error('Error creating booking:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedDaySlots = (): TimeSlot[] => {
    if (!selectedDate) return []
    const day = calendarDays.find(d => d.date === selectedDate)
    return day?.timeSlots || []
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !provider || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Página não encontrada'}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agendar: {service.name}
              </h1>
              <p className="text-gray-600">
                {provider.name} {provider.last_name} • {provider.category}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do serviço
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-medium text-gray-900">{service.name}</h3>
                <p className="text-gray-600 mt-1">{service.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-2xl font-bold text-primary-600">
                    R$ {service.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500">
                    {service.duration} minutos
                  </span>
                </div>
              </div>
              {service.image && (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Selecione uma data
            </h2>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <h3 className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day) => {
                const date = new Date(day.date)
                const isCurrentMonth = isSameMonth(date, currentMonth)
                const isSelected = selectedDate === day.date
                const isTodayDate = isToday(date)

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => day.isAvailable && handleDateSelect(day.date)}
                    disabled={!day.isAvailable}
                    className={`
                      p-2 text-sm rounded transition-colors
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                      ${!day.isAvailable ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-primary-100'}
                      ${isSelected ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
                      ${isTodayDate && !isSelected ? 'bg-primary-100' : ''}
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Selecione um horário para {format(new Date(selectedDate), 'dd/MM/yyyy')}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {getSelectedDaySlots().map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`
                      p-3 text-sm rounded transition-colors
                      ${!slot.available 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'hover:bg-primary-100 border border-gray-300'
                      }
                      ${selectedTime === slot.time 
                        ? 'bg-primary-600 text-white border-primary-600' 
                        : ''
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedTime && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Observações (opcional)
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Alguma informação adicional para o profissional..."
              />
            </div>
          )}

          {/* Submit */}
          {selectedTime && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Resumo do agendamento
                  </p>
                  <p className="text-gray-600">
                    {format(new Date(selectedDate || ''), 'dd/MM/yyyy')} às {selectedTime || ''}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 mt-2">
                    R$ {service.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Agendando...' : 'Confirmar agendamento'}
                </button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  )
}
