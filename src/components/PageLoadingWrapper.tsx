'use client'

import SmartPageLoading from './SmartPageLoading'

export default function PageLoadingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}
