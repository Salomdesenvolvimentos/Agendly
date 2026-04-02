'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPath = useRef(pathname)
  const timeoutRef = useRef<any>()

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Só mostrar loading se a rota realmente mudou E não for a primeira carga
    if (pathname !== previousPath.current && previousPath.current !== '') {
      setIsLoading(true)
      previousPath.current = pathname
      
      // Esconder loading rapidamente para não atrapalhar UX
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname])

  return isLoading
}
