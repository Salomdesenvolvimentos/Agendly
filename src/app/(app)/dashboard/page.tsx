'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  CurrencyDollarIcon,
  PlusCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'
import { getTodayBookings, getUpcomingBookings } from '@/lib/bookings'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      const { data: providerData } = await getProviderByUserId(currentUser.id)
      if (!providerData) {
        router.push('/onboarding')
        return
      }

      setUser(currentUser)
      setProvider(providerData)

      const { data: todayData } = await getTodayBookings(providerData.id)
      const { data: upcomingData } = await getUpcomingBookings(providerData.id, 7)
      
      setTodayBookings(todayData || [])
      setUpcomingBookings(upcomingData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    today: todayBookings.length,
    confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
    pending: todayBookings.filter(b => b.status === 'pending').length,
    revenue: todayBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmados</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Hoje</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                R$ {stats.revenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
            <div className="space-y-4">
              <Link
                href="/services"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <PlusCircleIcon className="w-5 h-5" />
                <span>Adicionar Serviço</span>
              </Link>
              
              <Link
                href="/availability"
                className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CalendarIcon className="w-5 h-5" />
                <span>Configurar Agenda</span>
              </Link>
              
              <Link
                href="/bookings"
                className="w-full bg-white border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ClockIcon className="w-5 h-5" />
                <span>Ver Agendamentos</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h2>
              <Link
                href="/bookings"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agendamento próximo
                </h3>
                <p className="text-gray-500 mb-6">
                  Quando clientes agendarem seus serviços, eles aparecerão aqui.
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusCircleIcon className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.users?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.services?.name || 'Serviço'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {new Date(booking.date).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{booking.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
