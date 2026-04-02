'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Provider, Service } from '@/types'
import { getProviderBySlug } from '@/lib/providers'
import { getServicesByProvider } from '@/lib/services'
import Link from 'next/link'

export default function ProviderPublicPage() {
  const params = useParams()
  const router = useRouter()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.slug) {
      loadProviderData(params.slug as string)
    }
  }, [params.slug])

  const loadProviderData = async (slug: string) => {
    try {
      setLoading(true)
      
      const { data: providerData, error: providerError } = await getProviderBySlug(slug)
      
      if (providerError || !providerData) {
        setError('Fornecedor não encontrado')
        return
      }
      
      setProvider(providerData)
      
      const { data: servicesData } = await getServicesByProvider(providerData.id)
      setServices(servicesData || [])
      
    } catch (error) {
      console.error('Error loading provider data:', error)
      setError('Erro ao carregar dados do fornecedor')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceClick = (serviceId: string) => {
    router.push(`/booking/${provider?.slug}/${serviceId}`)
  }

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

  if (error || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Página não encontrada'}
          </h1>
          <Link href="/" className="text-primary-600 hover:text-primary-700">
            Voltar para o início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {provider.profile_image ? (
                <img
                  src={provider.profile_image}
                  alt={provider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 text-xl font-bold">
                    {provider.name[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {provider.name} {provider.last_name}
                </h1>
                <p className="text-gray-600">{provider.category}</p>
                <p className="text-sm text-gray-500">{provider.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Serviços disponíveis
          </h2>
          
          {services.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Nenhum serviço disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleServiceClick(service.id)}
                >
                  {service.image && (
                    <div className="h-48 w-full">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">
                        R$ {service.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {service.duration} min
                      </span>
                    </div>
                    <button
                      onClick={() => handleServiceClick(service.id)}
                      className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Agendar horário
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-12">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sobre o profissional
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Informações</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Categoria: {provider.category}</li>
                  <li>• Endereço: {provider.address}</li>
                  <li>• WhatsApp: {provider.whatsapp}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Atendimento</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Capacidade simultânea: {provider.max_simultaneous}</li>
                  <li>• Profissionais por período: {provider.professionals_per_period}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500">
            <p>
              Agendado por{' '}
              <Link href="/" className="text-primary-600 hover:text-primary-700">
                Agendly
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
