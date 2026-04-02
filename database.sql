-- Criação do banco de dados para o sistema Agendly
-- Execute este SQL no painel do Supabase

-- Tabela de usuários (extensão da auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('provider', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE public.providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  category TEXT NOT NULL,
  profile_image TEXT,
  slug TEXT NOT NULL UNIQUE,
  max_simultaneous INTEGER DEFAULT 1,
  professionals_per_period INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- duração em minutos
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de disponibilidade (horários de funcionamento)
CREATE TABLE public.availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(provider_id, day_of_week)
);

-- Tabela de períodos bloqueados
CREATE TABLE public.blocked_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, date, time) -- Evita agendamentos duplicados no mesmo horário
);

-- Tabela de configurações do fornecedor
CREATE TABLE public.provider_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE UNIQUE,
  require_payment BOOLEAN DEFAULT false,
  payment_type TEXT DEFAULT 'none' CHECK (payment_type IN ('none', 'deposit', 'full')),
  deposit_amount DECIMAL(10,2),
  mercado_pago_link TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_providers_user_id ON public.providers(user_id);
CREATE INDEX idx_providers_slug ON public.providers(slug);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_is_active ON public.services(is_active);
CREATE INDEX idx_availability_provider_id ON public.availability(provider_id);
CREATE INDEX idx_blocked_periods_provider_id ON public.blocked_periods(provider_id);
CREATE INDEX idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_settings_updated_at BEFORE UPDATE ON public.provider_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para criar usuário na tabela users após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas de segurança (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para fornecedores
CREATE POLICY "Providers can view own data" ON public.providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can update own data" ON public.providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert own data" ON public.providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para serviços
CREATE POLICY "Providers can manage own services" ON public.services
  FOR ALL USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Everyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

-- Políticas para agendamentos
CREATE POLICY "Providers can manage own bookings" ON public.bookings
  FOR ALL USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "Customers can view own bookings" ON public.bookings
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Políticas para notificações
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Função para gerar slug único
CREATE OR REPLACE FUNCTION generate_unique_slug(p_name TEXT, p_last_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 1;
BEGIN
  v_slug := lower(regexp_replace(p_name || '-' || p_last_name, '[^a-zA-Z0-9-]', '-', 'g'));
  v_slug := regexp_replace(v_slug, '-+', '-', 'g');
  v_slug := trim(v_slug, '-');
  
  -- Verificar se o slug já existe
  WHILE EXISTS (SELECT 1 FROM public.providers WHERE slug = v_slug) LOOP
    v_slug := lower(regexp_replace(p_name || '-' || p_last_name || '-' || v_counter, '[^a-zA-Z0-9-]', '-', 'g'));
    v_slug := regexp_replace(v_slug, '-+', '-', 'g');
    v_slug := trim(v_slug, '-');
    v_counter := v_counter + 1;
  END LOOP;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION check_time_availability(
  p_provider_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_bookings_count INTEGER;
  v_capacity INTEGER;
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
BEGIN
  -- Verificar se é um dia bloqueado
  IF EXISTS (
    SELECT 1 FROM public.blocked_periods 
    WHERE provider_id = p_provider_id 
    AND start_date <= p_date 
    AND end_date >= p_date
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se está dentro do horário de funcionamento
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  SELECT start_time, end_time INTO v_start_time, v_end_time
  FROM public.availability
  WHERE provider_id = p_provider_id 
  AND day_of_week = v_day_of_week 
  AND is_active = true;
  
  IF v_start_time IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF p_time < v_start_time OR p_time + (p_duration || ' minutes')::INTERVAL > v_end_time THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar capacidade
  SELECT max_simultaneous INTO v_capacity
  FROM public.providers
  WHERE id = p_provider_id;
  
  -- Contar agendamentos confirmados no mesmo horário
  SELECT COUNT(*) INTO v_bookings_count
  FROM public.bookings
  WHERE provider_id = p_provider_id
  AND date = p_date
  AND status IN ('confirmed', 'pending')
  AND (
    (time <= p_time AND time + (duration || ' minutes')::INTERVAL > p_time) OR
    (time < p_time + (p_duration || ' minutes')::INTERVAL AND time + (duration || ' minutes')::INTERVAL >= p_time + (p_duration || ' minutes')::INTERVAL) OR
    (time >= p_time AND time + (duration || ' minutes')::INTERVAL <= p_time + (p_duration || ' minutes')::INTERVAL)
  );
  
  RETURN v_bookings_count < v_capacity;
END;
$$ LANGUAGE plpgsql;
