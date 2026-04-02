'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon, 
  StarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'
import { Provider } from '@/types'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
    
    // Verificar se há imagens salvas no sessionStorage ao carregar
    const savedProfileImage = sessionStorage.getItem('profile_image')
    const savedCoverImage = sessionStorage.getItem('cover_image')
    
    if (savedProfileImage || savedCoverImage) {
      setProvider((prev: any) => prev ? { 
        ...prev, 
        profile_image: savedProfileImage || prev.profile_image,
        cover_image: savedCoverImage || prev.cover_image
      } : null)
    }
    
    // Escutar mudanças no localStorage para sincronizar foto de perfil
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'profile_image_updated') {
        loadUserData() // Recarregar dados quando foto for atualizada
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
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
      
      // Verificar se há imagens no sessionStorage (prioridade sobre banco)
      const sessionProfileImage = sessionStorage.getItem('profile_image')
      const sessionCoverImage = sessionStorage.getItem('cover_image')
      
      const finalProviderData = {
        ...providerData,
        profile_image: sessionProfileImage || providerData.profile_image,
        cover_image: sessionCoverImage || providerData.cover_image
      }
      
      setProvider(finalProviderData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Serviços', href: '/services', icon: StarIcon },
    { name: 'Agenda', href: '/availability', icon: CalendarIcon },
    { name: 'Agendamentos', href: '/bookings', icon: ClockIcon },
    { name: 'Clientes', href: '/customers', icon: UserGroupIcon },
    { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
  ]

  const handleProfileClick = () => {
    // TODO: Implementar perfil do usuário
    alert('Perfil em desenvolvimento')
  }

  const handleSettingsClick = () => {
    // TODO: Implementar página de configurações
    alert('Configurações em desenvolvimento')
  }

  if (loading) {
    return <LoadingSpinner message="Carregando suas informações..." showMotivational={true} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Agendly</span>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {provider?.profile_image ? (
                  <img 
                    src={provider.profile_image} 
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <UserCircleIcon className="w-16 h-16 text-white" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {provider?.name || 'Carregando...'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Date and Time */}
          <div className="px-4 py-6 border-t border-gray-100">
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
