'use client'

import { useState, useEffect } from 'react'

interface LoadingSpinnerProps {
  message?: string
  showMotivational?: boolean
}

export default function LoadingSpinner({ message = "Carregando...", showMotivational = true }: LoadingSpinnerProps) {
  const [displayText, setDisplayText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [motivationalMessage, setMotivationalMessage] = useState('')

  const fullText = 'Agendly'
  
  const motivationalMessages = [
    "Você sabia? 80% das empresas que organizam seus agendamentos crescem 2x mais rápido!",
    "Dica: Controlar seu tempo é o primeiro passo para o sucesso profissional.",
    "Fact: Profissionais organizados ganham em média 30% a mais por hora.",
    "💡 Agendar com antecedência reduz o estresse e aumenta a produtividade.",
    "🎯 Empresas com gestão de tempo eficiente têm 95% mais clientes satisfeitos.",
    "📈 Organizar agendamentos é como ter um assistente pessoal 24/7.",
    "⏰ Cada minuto planejado economiza 10 minutos de retrabalho.",
    "🚀 O sucesso começa com uma agenda bem estruturada.",
    "💼 Profissionais que usam sistemas de agendamento perdem menos clientes.",
    "🌟 Sua organização hoje é o seu sucesso amanhã."
  ]

  useEffect(() => {
    // Escolher mensagem motivacional aleatória uma única vez
    if (showMotivational && !motivationalMessage) {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
      setMotivationalMessage(randomMessage)
    }
  }, [showMotivational, motivationalMessage])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentCharIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        } else {
          // Espera um pouco antes de começar a deletar
          setTimeout(() => setIsDeleting(true), 1000)
        }
      } else {
        if (currentCharIndex > 0) {
          setDisplayText(fullText.slice(0, currentCharIndex - 1))
          setCurrentCharIndex(currentCharIndex - 1)
        } else {
          setIsDeleting(false)
        }
      }
    }, isDeleting ? 50 : 150)

    return () => clearTimeout(timeout)
  }, [currentCharIndex, isDeleting])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Logo */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Anel externo animado */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-blue-600 rounded-full animate-ping"></div>
            
            {/* Nome animado no centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        {showMotivational && motivationalMessage && (
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <p className="text-gray-700 font-medium animate-fade-in">
                {motivationalMessage}
              </p>
            </div>
          </div>
        )}

        {/* Barra de progresso animada */}
        <div className="space-y-2 mt-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-progress"></div>
          </div>
        </div>

        <p className="text-sm text-gray-500 animate-pulse mt-4">
          {message}
        </p>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
