'use client'

import { usePageLoading } from '@/hooks/usePageLoading'
import SmartPageLoading from './SmartPageLoading'

export default function PageLoadingWrapper({ children }: { children: React.ReactNode }) {
  const isLoading = usePageLoading()

  return (
    <>
      {isLoading && <SmartPageLoading />}
      {children}
    </>
  )
}
