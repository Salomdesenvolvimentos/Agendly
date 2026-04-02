'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    setLoading(true)
    // Implementar lógica de reenvio de email aqui
    setTimeout(() => {
      setLoading(false)
      alert('Email de verificação reenviado!')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifique seu email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enviamos um link de verificação para o seu endereço de email.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {email ? (
                <>Verifique a caixa de entrada de <span className="font-semibold">{email}</span></>
              ) : (
                'Verifique sua caixa de entrada'
              )}
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Não recebeu o email? Verifique sua pasta de spam ou clique abaixo para reenviar.
            </p>

            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Enviando...' : 'Reenviar email de verificação'}
            </button>

            <div className="text-sm text-gray-600">
              <p className="mb-2">
                Já verificou seu email?{' '}
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Faça login
                </button>
              </p>
              
              <p>
                Email errado?{' '}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Criar nova conta
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailInner />
    </Suspense>
  )
}
