import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* HERO Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Agendly
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Receba agendamentos com um link simples. 
          Crie sua página, compartilhe no Instagram e deixe seus clientes agendarem sozinhos.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Perfeito para barbeiros, manicures, designers e prestadores de serviço
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/auth/signup" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Criar minha agenda grátis
          </Link>
          <Link 
            href="/auth/signin" 
            className="bg-gray-200 text-gray-800 px-8 py-4 rounded-lg hover:bg-gray-300 transition-colors text-lg font-semibold"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Crie sua conta</h3>
              <p className="text-gray-600">Cadastre seus serviços e horários</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compartilhe seu link</h3>
              <p className="text-gray-600">Coloque no Instagram ou WhatsApp</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receba agendamentos</h3>
              <p className="text-gray-600">Seus clientes marcam sozinhos</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que usar o Agendly?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Pare de responder "tem horário?"</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Organize sua agenda automaticamente</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Receba agendamentos 24h por dia</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Controle seus horários e disponibilidade</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Tudo em um link simples</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✔</span>
              <p className="text-gray-700">Aparência profissional para seu negócio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece agora gratuitamente
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crie sua agenda e comece a receber agendamentos hoje mesmo.
          </p>
          <Link 
            href="/auth/signup" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
          >
            Criar minha agenda
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>Agendly © 2026</p>
        </div>
      </footer>
    </main>
  )
}
