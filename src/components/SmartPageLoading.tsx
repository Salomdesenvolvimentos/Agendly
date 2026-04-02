'use client'

import { useState, useEffect } from 'react'

export default function SmartPageLoading() {
  const [showLoading, setShowLoading] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  const fullText = 'Agendly'

  useEffect(() => {
    // Só mostrar loading se a página demorar mais de 500ms para carregar
    const showTimer = setTimeout(() => {
      setShowLoading(true)
    }, 500)

    return () => clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!showLoading) return

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentCharIndex < fullText.length) {
          setDisplayText(fullText.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(currentCharIndex + 1)
        } else {
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
  }, [currentCharIndex, isDeleting, showLoading])

  if (!showLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 border-4 border-blue-400 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-blue-600 rounded-full animate-ping"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 animate-pulse">
          Carregando...
        </p>
      </div>
    </div>
  )
}
