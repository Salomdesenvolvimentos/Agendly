# Agendly - Sistema de Agendamento de Serviços

Plataforma SaaS completa para agendamento de serviços multi-fornecedor, construída com Next.js e Supabase.

## 🚀 Funcionalidades

### Para Fornecedores
- ✅ Cadastro completo de perfil profissional
- ✅ Gestão de serviços (preços, duração, descrição)
- ✅ Configuração de horários de funcionamento
- ✅ Controle de capacidade simultânea
- ✅ Bloqueio de períodos (férias, eventos)
- ✅ Dashboard com métricas e agendamentos
- ✅ Link público exclusivo para clientes

### Para Clientes
- ✅ Acesso via link do fornecedor
- ✅ Visualização de serviços disponíveis
- ✅ Calendário interativo de agendamento
- ✅ Histórico de agendamentos
- ✅ Gestão de cancelamentos e remarcações

### Sistema
- ✅ Autenticação segura com Supabase Auth
- ✅ Banco de dados PostgreSQL
- ✅ Sistema robusto de disponibilidade
- ✅ Controle de overbooking
- ✅ Interface responsiva e moderna
- ✅ Multi-tenant (isolamento entre fornecedores)

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 14 (App Router)
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Tipagem**: TypeScript
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd agendly
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Execute o SQL do banco de dados:
- Abra o painel do Supabase
- Vá para SQL Editor
- Execute o conteúdo do arquivo `database.sql`

5. Inicie o desenvolvimento:
```bash
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── (auth)/            # Rotas de autenticação
│   ├── dashboard/          # Dashboard do fornecedor
│   ├── customer/           # Área do cliente
│   ├── u/[slug]/          # Página pública do fornecedor
│   └── booking/           # Fluxo de agendamento
├── components/            # Componentes reutilizáveis
├── lib/                  # Utilitários e integrações
│   ├── auth.ts           # Funções de autenticação
│   ├── providers.ts      # CRUD de fornecedores
│   ├── services.ts       # CRUD de serviços
│   ├── bookings.ts       # CRUD de agendamentos
│   └── availability.ts  # Lógica de disponibilidade
├── hooks/               # Hooks personalizados
├── types/               # Tipos TypeScript
└── utils/               # Funções utilitárias
```

## 🗄️ Modelo de Dados

### Principais Tabelas

- **users**: Informações básicas dos usuários
- **providers**: Dados dos fornecedores
- **services**: Serviços oferecidos
- **availability**: Horários de funcionamento
- **bookings**: Agendamentos
- **blocked_periods**: Períodos indisponíveis
- **provider_settings**: Configurações do fornecedor

## 🔐 Autenticação

O sistema utiliza Supabase Auth com dois tipos de usuário:

- **provider**: Fornecedor de serviços
- **customer**: Cliente

O fluxo é determinado pelo campo `role` na tabela `users`.

## 📅 Lógica de Agendamento

O sistema implementa uma lógica robusta:

1. **Verificação de disponibilidade**:
   - Dias da semana configurados
   - Horários de funcionamento
   - Períodos bloqueados
   - Capacidade simultânea

2. **Controle de overbooking**:
   - Verificação atômica no banco
   - Controle de capacidade por horário
   - Lock otimista para concorrência

3. **Geração de slots**:
   - Intervalos configuráveis (30 min)
   - Cálculo automático de disponibilidade
   - Interface visual intuitiva

## 🎨 Interface

### Design System
- **Cores**: Paleta moderna com azul primário
- **Tipografia**: Inter font family
- **Responsivo**: Mobile-first approach
- **Componentes**: Baseados em Tailwind CSS

### Experiência do Usuário
- Onboarding guiado para novos fornecedores
- Fluxo simplificado de agendamento
- Feedback visual em todas as ações
- Navegação intuitiva

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

### Manual
```bash
npm run build
npm start
```

## 🔧 Configurações Adicionais

### Mercado Pago
Para habilitar pagamentos:
1. Crie conta no Mercado Pago
2. Configure as credenciais no `.env.local`
3. Ative nas configurações do fornecedor

### Notificações
O sistema suporta:
- Email (via Supabase)
- Notificações push (futuro)
- WhatsApp (via integração)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a MIT License.

## 🆘 Suporte

Para dúvidas e suporte:
- Abra uma issue no GitHub
- Contate o desenvolvedor

---

**Agendly** - Simplificando agendamentos para profissionais e clientes.
