import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import PageLoadingWrapper from '@/components/PageLoadingWrapper'

export const metadata: Metadata = {
  title: 'Agendly - Sistema de Agendamento',
  description: 'Plataforma de agendamento de serviços multi-fornecedor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <PageLoadingWrapper>
            {children}
          </PageLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
