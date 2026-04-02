'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PageLoadingInner() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPath = useRef(pathname)
  const timeoutRef = useRef<any>(null)

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Só mostrar loading se a rota realmente mudou E não for a primeira carga
    if (pathname !== previousPath.current && previousPath.current !== '') {
      setIsLoading(true)

      // Esconder loading após 500ms (para evitar flicker em navegações rápidas)
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }

    previousPath.current = pathname

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname, searchParams])

  return isLoading
}

export function usePageLoading() {
  return <Suspense fallback={null}><PageLoadingInner /></Suspense>
}
