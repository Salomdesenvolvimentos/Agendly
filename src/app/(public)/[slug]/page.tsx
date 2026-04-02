'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon, 
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { getProviderBySlug } from '@/lib/providers'
import { getServicesByProvider } from '@/lib/services'
import { createBooking } from '@/lib/bookings'
import { getCurrentCustomer, Customer } from '@/lib/customer-auth'
import { Service, BookingFormData } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ProviderPublicPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<any>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState<any>({
    service_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    date: '',
    time: '',
    notes: ''
  })
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      loadProviderData(params.slug as string)
    }
    
    // Verificar se cliente está logado
    const customer = getCurrentCustomer()
    setCurrentCustomer(customer)
  }, [params.slug])

  const loadProviderData = async (slug: string) => {
    try {
      setLoading(true)
      
      // Carregar dados do fornecedor
      const { data: providerData } = await getProviderBySlug(slug)
      if (!providerData) {
        setLoading(false)
        return
      }

      // Verificar se há imagens no sessionStorage (prioridade sobre banco)
      const sessionProfileImage = sessionStorage.getItem('profile_image')
      const sessionCoverImage = sessionStorage.getItem('cover_image')
      
      console.log('Loading provider data:', {
        providerData: {
          profile_image: providerData.profile_image,
          cover_image: providerData.cover_image
        },
        session: {
          profile_image: sessionProfileImage,
          cover_image: sessionCoverImage
        }
      })
      
      const finalProviderData = {
        ...providerData,
        profile_image: sessionProfileImage || providerData.profile_image,
        cover_image: sessionCoverImage || providerData.cover_image
      }
      
      setProvider(finalProviderData)

      // Carregar serviços do fornecedor
      const { data: servicesData } = await getServicesByProvider(providerData.id)
      setServices(servicesData || [])
    } catch (error) {
      console.error('Error loading provider data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookService = (service: Service) => {
    console.log('handleBookService called', { service, currentCustomer })
    
    // Verificar se cliente está logado
    if (!currentCustomer) {
      // Redirecionar para login com returnUrl usando router do Next.js
      const currentUrl = window.location.pathname
      const loginUrl = `/auth/customer-signin?returnUrl=${encodeURIComponent(currentUrl)}`
      console.log('Redirecting to:', loginUrl)
      router.push(loginUrl)
      return
    }

    setSelectedService(service)
    setBookingData({
      ...bookingData,
      service_id: service.id,
      customer_name: currentCustomer.name,
      customer_email: currentCustomer.email,
      customer_phone: currentCustomer.phone || ''
    })
    setShowBookingModal(true)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!provider || !selectedService) return

    try {
      const bookingPayload = {
        ...bookingData,
        provider_id: provider.id,
        total_amount: selectedService.price
      }

      await createBooking(provider.id, bookingData.customer_id, bookingPayload)
      
      alert('Agendamento solicitado com sucesso! Entraremos em contato em breve.')
      setShowBookingModal(false)
      setBookingData({
        service_id: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        date: '',
        time: '',
        notes: ''
      })
      setSelectedService(null)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Erro ao solicitar agendamento. Tente novamente.')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando informações do profissional..." showMotivational={true} />
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fornecedor não encontrado</h1>
          <p className="text-gray-600 mb-6">O link que você acessou não é válido.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Agendly</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {currentCustomer ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{currentCustomer.name}</p>
                    <p className="text-xs text-gray-500">{currentCustomer.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              ) : (
                <Link
                  href={`/auth/customer-signin?returnUrl=${encodeURIComponent(window.location.pathname)}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Fazer Login →
                </Link>
              )}
              
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                Sou um fornecedor →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image */}
          {provider.cover_image && (
            <div 
              className="relative h-80 cursor-pointer group"
              onClick={() => {
                console.log('Cover image clicked:', provider.cover_image)
                setExpandedImage(provider.cover_image)
              }}
            >
              <img 
                src={provider.cover_image} 
                alt="Capa do perfil"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Ícone de expandir */}
              <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
              
              {/* Texto de hint */}
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-gray-700">Clique para expandir</p>
              </div>
            </div>
          )}
          
          {/* Profile Section - Posicionado sobre a capa */}
          {provider.cover_image && (
            <div className="relative -mt-24 px-8 pb-8">
              <div className="text-center">
                {provider.profile_image ? (
                  <div 
                    className="inline-block relative group cursor-pointer"
                    onClick={() => {
                      console.log('Profile image clicked (with cover):', provider.profile_image)
                      setExpandedImage(provider.profile_image)
                    }}
                  >
                    <img 
                      src={provider.profile_image} 
                      alt={provider.name}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl z-10 relative"
                    />
                    
                    {/* Ícone de expandir sobre a foto */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center mx-auto mb-4 shadow-xl z-10 relative">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <div className="flex items-center justify-center text-gray-600 space-x-4 text-sm">
                  {provider.address && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{provider.address}</span>
                    </div>
                  )}
                  {provider.whatsapp && (
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{provider.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section - Quando não tem capa */}
          {!provider.cover_image && (
            <div className="px-8 pb-8">
              <div className="text-center">
                {provider.profile_image ? (
                  <div 
                    className="inline-block relative group cursor-pointer"
                    onClick={() => {
                      console.log('Profile image clicked (no cover):', provider.profile_image)
                      setExpandedImage(provider.profile_image)
                    }}
                  >
                    <img 
                      src={provider.profile_image} 
                      alt={provider.name}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
                    />
                    
                    {/* Ícone de expandir sobre a foto */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <UserCircleIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                <div className="flex items-center justify-center text-gray-600 space-x-4 text-sm">
                  {provider.address && (
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{provider.address}</span>
                    </div>
                  )}
                  {provider.whatsapp && (
                    <div className="flex items-center space-x-1">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{provider.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Services */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Serviços Oferecidos</h2>
            
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <StarIcon className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum serviço disponível
                </h3>
                <p className="text-gray-500">
                  Este fornecedor ainda não adicionou seus serviços.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {service.image && (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        R$ {service.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.duration} min
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleBookService(service)}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Agendar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Agendar: {selectedService.name}
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={bookingData.customer_name}
                  onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Email</label>
                <input
                  type="email"
                  required
                  value={bookingData.customer_email}
                  onChange={(e) => setBookingData({ ...bookingData, customer_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Telefone</label>
                <input
                  type="tel"
                  required
                  value={bookingData.customer_phone}
                  onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Desejada</label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário Desejado</label>
                <input
                  type="time"
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Resumo do agendamento:</strong>
                </p>
                <p className="text-sm text-gray-800">
                  {selectedService.name} - R$ {selectedService.price.toFixed(2)} ({selectedService.duration} min)
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <img 
              src={expandedImage} 
              alt="Imagem expandida"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Botão de fechar */}
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Texto de instrução */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-gray-700">Clique em qualquer lugar para fechar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
