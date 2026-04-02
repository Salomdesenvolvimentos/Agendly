'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Booking } from '@/types'
import { getBookingsByCustomer } from '@/lib/bookings'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export default function CustomerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
      return
    }

    if (user && user.role === 'provider') {
      router.push('/dashboard')
      return
    }

    if (user && user.role === 'customer') {
      loadBookings()
    }
  }, [user, loading, router])

  const loadBookings = async () => {
    if (!user) return

    try {
      const { data } = await getBookingsByCustomer(user.id)
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      case 'completed':
        return 'Concluído'
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'refunded':
        return 'Reembolsado'
      default:
        return status
    }
  }

  if (loading || loadingBookings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {user.name || 'Cliente'}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Bem-vindo à sua área de cliente
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                Meu perfil
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de agendamentos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{bookings.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✓</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Confirmados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total gasto
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        R$ {bookings.reduce((sum, b) => sum + b.total_amount, 0).toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Meus agendamentos
              </h3>
              
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Você ainda não tem agendamentos.</p>
                  <p className="mt-2">
                    <Link href="/" className="text-primary-600 hover:text-primary-700">
                      Encontre um profissional
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {booking.services?.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                              {getPaymentStatusText(booking.payment_status)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong>Profissional:</strong>{' '}
                              {booking.providers?.name} {booking.providers?.last_name}
                            </p>
                            <p>
                              <strong>Data:</strong>{' '}
                              {booking.date && format(new Date(booking.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </p>
                            <p>
                              <strong>Horário:</strong> {booking.time}
                            </p>
                            <p>
                              <strong>Duração:</strong> {booking.services?.duration} minutos
                            </p>
                            <p>
                              <strong>Valor:</strong> R$ {booking.total_amount.toFixed(2)}
                            </p>
                            {booking.notes && (
                              <p>
                                <strong>Observações:</strong> {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          {booking.providers?.slug && (
                            <Link
                              href={`/u/${booking.providers.slug}`}
                              target="_blank"
                              className="text-primary-600 hover:text-primary-700 text-sm"
                            >
                              Ver perfil
                            </Link>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => router.push(`/booking/reschedule/${booking.id}`)}
                              className="text-gray-600 hover:text-gray-900 text-sm"
                            >
                              Remarcar
                            </button>
                          )}
                          
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => router.push(`/booking/cancel/${booking.id}`)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
