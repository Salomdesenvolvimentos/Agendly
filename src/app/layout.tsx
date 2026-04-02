import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import PageLoadingWrapper from '@/components/PageLoadingWrapper'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <AuthProvider>
          <PageLoadingWrapper>
            {children}
          </PageLoadingWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
