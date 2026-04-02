'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  BellIcon, 
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string>('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
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
      
      // Carregar imagem de perfil existente se houver
      if (providerData.profile_image) {
        setProfilePreview(providerData.profile_image)
      }
      
      // Carregar imagem de capa existente se houver
      if (providerData.cover_image) {
        setCoverPreview(providerData.cover_image)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB')
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('A imagem deve ter no máximo 5MB')
        return
      }

      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!profileImage && !coverImage) {
        alert('Selecione uma imagem para alterar')
        return
      }

      let profileImageUrl = provider?.profile_image || ''
      let coverImageUrl = provider?.cover_image || ''
      
      // Salvar imagem de perfil se houver
      if (profileImage && profilePreview) {
        profileImageUrl = profilePreview
      }
      
      // Salvar imagem de capa se houver
      if (coverImage && coverPreview) {
        coverImageUrl = coverPreview
      }
      
      // Atualizar estado local do provider para refletir imediatamente
      setProvider((prev: any) => prev ? { 
        ...prev, 
        profile_image: profileImageUrl,
        cover_image: coverImageUrl
      } : null)
      
      // Salvar em localStorage para sincronizar com outras páginas
      localStorage.setItem('profile_image_updated', Date.now().toString())
      
      // Salvar em sessionStorage para persistência durante a sessão
      sessionStorage.setItem('profile_image', profileImageUrl)
      sessionStorage.setItem('cover_image', coverImageUrl)
      
      // Simular chamada API
      console.log('Salvando imagens:', { profile: profileImageUrl, cover: coverImageUrl })
      
      // Mostrar feedback
      alert('Imagens atualizadas com sucesso!')
      
      // Limpar estados
      setProfileImage(null)
      setCoverImage(null)
      
    } catch (error) {
      console.error('Error saving images:', error)
      alert('Erro ao salvar imagens')
    }
  }

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notificações', icon: BellIcon },
    { id: 'security', name: 'Segurança', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Pagamentos', icon: CreditCardIcon },
    { id: 'preferences', name: 'Preferências', icon: GlobeAltIcon },
    { id: 'help', name: 'Ajuda', icon: QuestionMarkCircleIcon },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie sua conta e preferências</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Informações do Perfil</h2>
              
              {/* Profile Image Upload */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profilePreview ? (
                    <img 
                      src={profilePreview} 
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-xl flex items-center justify-center">
                      <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    title="Alterar foto"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                  
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{provider?.name || 'Carregando...'}</h3>
                  <p className="text-sm text-gray-600">{user?.email || ''}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                  </p>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Capa do Perfil</h4>
                <div className="space-y-3">
                  <div className="relative">
                    {coverPreview ? (
                      <img 
                        src={coverPreview} 
                        alt="Capa do perfil"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Clique para adicionar uma capa</p>
                        </div>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => document.getElementById('cover-image-upload')?.click()}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 p-2 rounded-lg hover:bg-white transition-colors shadow-lg"
                      title="Alterar capa"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </button>
                    
                    <input
                      id="cover-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Capa exibida no topo da sua página pública. Recomendado: 1200x400px.
                  </p>
                </div>
              </div>

              {/* Public Link */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Seu Link Público</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/${provider?.slug || ''}`}
                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${provider?.slug || ''}`)
                      alert('Link copiado para a área de transferência!')
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Compartilhe este link com seus clientes para que eles possam ver seus serviços e agendar horários.
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Visualização da Página Pública</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const previewUrl = `${window.location.origin}/${provider?.slug || ''}`
                      window.open(previewUrl, '_blank')
                    }}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm"
                  >
                    Abrir Preview em Nova Aba
                  </button>
                  <p className="text-xs text-gray-600">
                    Veja como sua página aparece para os clientes. Teste o processo de agendamento e a experiência completa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={provider?.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={provider?.whatsapp || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={provider?.address || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {(profileImage || coverImage) && (
                  <button 
                    onClick={() => {
                      setProfileImage(null)
                      setProfilePreview(provider?.profile_image || '')
                      setCoverImage(null)
                      setCoverPreview(provider?.cover_image || '')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar Alterações
                  </button>
                )}
                <button 
                  onClick={handleSaveProfile}
                  disabled={!profileImage && !coverImage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {(profileImage || coverImage) ? 'Salvar Alterações' : 'Nenhuma alteração'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h2>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Notificações de novos agendamentos por email
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Lembretes de agendamentos
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Notificações de cancelamentos
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Newsletter e atualizações
                  </span>
                </label>
              </div>

              <div className="flex justify-end mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Segurança da Conta</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Alterar Senha</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Senha atual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Nova senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nova senha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Atualizar Senha
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Autenticação de Dois Fatores</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                    Configurar 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Pagamentos</h2>
              
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <CreditCardIcon className="mx-auto h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gerenciamento de Pagamentos
                </h3>
                <p className="text-gray-500 mb-6">
                  Configure métodos de pagamento e visualize seu histórico de transações.
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Configurar Pagamentos
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Preferências do Sistema</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuso Horário</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formato de Data</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Ajuda e Suporte</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Central de Ajuda</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Encontre respostas para perguntas frequentes e tutoriais.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Acessar Central de Ajuda →
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Contato Direto</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Precisa de ajuda? Nossa equipe está à disposição.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Entrar em Contato →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
