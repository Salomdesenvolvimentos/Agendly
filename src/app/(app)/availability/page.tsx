'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Availability } from '@/types'
import { getAvailabilityByProvider, createAvailability, updateAvailability, deleteAvailability } from '@/lib/availability'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'

const weekDays = [
  { id: 0, name: 'Domingo' },
  { id: 1, name: 'Segunda-feira' },
  { id: 2, name: 'Terça-feira' },
  { id: 3, name: 'Quarta-feira' },
  { id: 4, name: 'Quinta-feira' },
  { id: 5, name: 'Sexta-feira' },
  { id: 6, name: 'Sábado' }
]

export default function AvailabilityPage() {
  const router = useRouter()
  const [providerId, setProviderId] = useState<string>('')
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<{[key: number]: {enabled: boolean, startTime: string, endTime: string}}>({})

  useEffect(() => {
    loadProviderAndAvailability()
  }, [])

  const loadProviderAndAvailability = async () => {
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

      setProviderId(provider.id)
      
      // Usar API route para buscar disponibilidade
      const response = await fetch(`/api/availability?providerId=${provider.id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar disponibilidade')
      }
      
      setAvailability(result.data || [])
      
      // Inicializar formulário com dados existentes
      const initialFormData: {[key: number]: {enabled: boolean, startTime: string, endTime: string}} = {}
      weekDays.forEach(day => {
        const dayAvailability = result.data?.find((a: any) => a.day_of_week === day.id)
        initialFormData[day.id] = {
          enabled: !!dayAvailability,
          startTime: dayAvailability?.start_time || '09:00',
          endTime: dayAvailability?.end_time || '17:00'
        }
      })
      setFormData(initialFormData)
    } catch (error) {
      console.error('Error loading availability:', error)
      alert('Erro ao carregar disponibilidade')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDay = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId]?.enabled
      }
    }))
  }

  const handleTimeChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }))
  }

  const handleSaveAll = async () => {
    if (!providerId) {
      alert('Erro: ID do fornecedor não encontrado')
      return
    }
    
    setSaving(true)
    try {
      console.log('Starting save process for provider:', providerId)
      console.log('Form data:', formData)
      
      // Verificar autenticação atual
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        alert('Sessão expirada. Faça login novamente.')
        router.push('/auth/signin')
        return
      }
      
      console.log('User authenticated:', currentUser.id)

      // Preparar dados para enviar
      const newAvailability: Omit<Availability, 'id' | 'provider_id'>[] = []
      
      weekDays.forEach(day => {
        const dayData = formData[day.id]
        if (dayData?.enabled) {
          newAvailability.push({
            day_of_week: day.id,
            start_time: dayData.startTime,
            end_time: dayData.endTime,
            is_active: true
          })
        }
      })

      console.log('New availability to create:', newAvailability)

      // Usar API route para salvar (ignora RLS)
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          availability: newAvailability
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result.error)
        throw new Error(result.error || 'Erro ao salvar horários')
      }

      console.log('API Success:', result.data)

      // Recarregar dados
      console.log('Reloading data...')
      await loadProviderAndAvailability()
      
      alert('Horários salvos com sucesso!')
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Erro ao salvar horários: ' + (error as Error).message)
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Configurar Horários</h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Dias de atendimento
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Selecione os dias que você atende e configure os horários de funcionamento.
            </p>

            <div className="space-y-4">
              {weekDays.map((day) => {
                const dayData = formData[day.id]
                const isActive = dayData?.enabled || false

                return (
                  <div
                    key={day.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleDay(day.id)}
                          disabled={saving}
                          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            isActive ? 'bg-primary-600' : 'bg-gray-200'
                          } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform ${
                              isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`font-medium ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                          {day.name}
                        </span>
                      </div>
                      
                      {isActive && (
                        <span className="text-sm text-green-600 font-medium">
                          Atendimento ativo
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Início
                        </label>
                        <input
                          type="time"
                          value={dayData?.startTime || '09:00'}
                          onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                          disabled={saving || !isActive}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fim
                        </label>
                        <input
                          type="time"
                          value={dayData?.endTime || '17:00'}
                          onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                          disabled={saving || !isActive}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Salvando...' : 'Salvar Horários'}
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Dica importante
              </h3>
              <p className="text-sm text-blue-700">
                Configure seus horários de atendimento para que os clientes possam ver apenas os horários disponíveis.
                Você pode alterar essas configurações a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
