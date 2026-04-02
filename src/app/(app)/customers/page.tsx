'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'
import { getBookingsByProvider } from '@/lib/bookings'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  totalBookings: number
  lastBooking?: string
  totalSpent: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      const { data: provider } = await getProviderByUserId(currentUser.id)
      if (!provider) {
        alert('Você precisa completar seu cadastro de fornecedor primeiro')
        router.push('/onboarding')
        return
      }

      // Buscar todos os agendamentos do fornecedor
      const { data: bookings } = await getBookingsByProvider(provider.id)
      
      if (!bookings || bookings.length === 0) {
        setCustomers([])
        return
      }

      // Agrupar clientes e calcular estatísticas
      const customerMap = new Map<string, Customer>()

      bookings.forEach(booking => {
        const customerId = booking.customer_id
        const existingCustomer = customerMap.get(customerId)

        if (existingCustomer) {
          // Atualizar cliente existente
          existingCustomer.totalBookings += 1
          existingCustomer.totalSpent += booking.total_amount || 0
          
          // Atualizar último agendamento se for mais recente
          if (booking.date && (!existingCustomer.lastBooking || booking.date > existingCustomer.lastBooking)) {
            existingCustomer.lastBooking = booking.date
          }
        } else {
          // Criar novo cliente
          customerMap.set(customerId, {
            id: customerId,
            name: booking.users?.name || 'Cliente não identificado',
            email: booking.users?.email || '',
            phone: booking.users?.phone || '',
            totalBookings: 1,
            lastBooking: booking.date,
            totalSpent: booking.total_amount || 0
          })
        }
      })

      const customersArray = Array.from(customerMap.values()).sort((a, b) => {
        // Ordenar por último agendamento (mais recente primeiro)
        if (!a.lastBooking) return 1
        if (!b.lastBooking) return -1
        return new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime()
      })

      setCustomers(customersArray)
    } catch (error) {
      console.error('Error loading customers:', error)
      alert('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  const averageBookingsPerCustomer = totalCustomers > 0 
    ? (customers.reduce((sum, customer) => sum + customer.totalBookings, 0) / totalCustomers).toFixed(1)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie sua base de clientes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Média de Agendamentos</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{averageBookingsPerCustomer}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar clientes por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <UserCircleIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Tente buscar com outros termos.'
                  : 'Quando clientes agendarem seus serviços, eles aparecerão aqui.'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/services"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Serviço
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {customer.email && (
                            <div className="flex items-center space-x-1">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center space-x-1">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-6 mt-2 text-sm">
                          <span className="text-gray-600">
                            <strong>{customer.totalBookings}</strong> agendamentos
                          </span>
                          <span className="text-gray-600">
                            <strong>R$ {customer.totalSpent.toFixed(2)}</strong> total
                          </span>
                          {customer.lastBooking && (
                            <span className="text-gray-600">
                              Último: {new Date(customer.lastBooking).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
