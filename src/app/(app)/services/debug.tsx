'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getProviderByUserId } from '@/lib/providers'

export default function DebugServices() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        console.log('Current user:', user)
        
        if (user) {
          const { data: provider, error } = await getProviderByUserId(user.id)
          console.log('Provider data:', provider, 'Error:', error)
          
          setDebugInfo({
            user,
            provider,
            providerError: error
          })
        } else {
          setDebugInfo({ user: null, message: 'No user logged in' })
        }
      } catch (error) {
        console.error('Debug error:', error)
        setDebugInfo({ error: (error as Error).message })
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
