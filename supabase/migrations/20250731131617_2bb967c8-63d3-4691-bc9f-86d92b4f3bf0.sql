-- Tabela para configurações gerais do site
CREATE TABLE public.site_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para depoimentos
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  treatment TEXT,
  clinic TEXT,
  commission_percentage NUMERIC(4,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações de parceria
CREATE TABLE public.partnership_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL,
  min_treatments INTEGER NOT NULL,
  max_treatments INTEGER,
  commission_percentage NUMERIC(4,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_configs ENABLE ROW LEVEL SECURITY;

-- Políticas para site_configurations
CREATE POLICY "Only admins can manage site configurations" 
ON public.site_configurations 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Everyone can view site configurations" 
ON public.site_configurations 
FOR SELECT 
USING (true);

-- Políticas para testimonials
CREATE POLICY "Only admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Everyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

-- Políticas para partnership_configs
CREATE POLICY "Only admins can manage partnership configs" 
ON public.partnership_configs 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Everyone can view active partnership configs" 
ON public.partnership_configs 
FOR SELECT 
USING (is_active = true);

-- Trigger para updated_at
CREATE TRIGGER update_site_configurations_updated_at
BEFORE UPDATE ON public.site_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partnership_configs_updated_at
BEFORE UPDATE ON public.partnership_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.site_configurations (config_key, config_value, description) VALUES
('hero_title', '"Encontre o Tratamento Dental Ideal"', 'Título principal da homepage'),
('hero_subtitle', '"Conectamos você aos melhores dentistas da sua região com facilidade de pagamento em até 48 parcelas"', 'Subtítulo da homepage'),
('loan_simulator_rate', '0.025', 'Taxa de juros mensal do simulador (2.5% = 0.025)'),
('contact_info', '{"phone": "(11) 3456-7890", "email": "contato@doutorizze.com", "address": "São Paulo, SP"}', 'Informações de contato'),
('partnership_benefits', '[
  {"icon": "TrendingUp", "title": "Aumento de Receita", "description": "Aumente seu faturamento em até 40% com mais pacientes conseguindo realizar tratamentos"},
  {"icon": "Users", "title": "Mais Pacientes", "description": "Acesso a milhares de pacientes que buscam tratamentos dentários com facilidade de pagamento"},
  {"icon": "CreditCard", "title": "Pagamento Garantido", "description": "Receba o valor integral do tratamento de forma antecipada, sem risco de inadimplência"}
]', 'Benefícios da parceria exibidos na página');

-- Inserir depoimentos padrão
INSERT INTO public.testimonials (name, rating, comment, treatment, clinic, commission_percentage) VALUES
('Maria Silva', 5, 'Excelente atendimento! Consegui parcelar meu tratamento ortodôntico sem complicações. A clínica é muito profissional.', 'Ortodontia', 'Odonto Center', 2.5),
('João Santos', 5, 'O processo foi muito simples e rápido. Aprovaram meu crédito na hora e já comecei o tratamento. Recomendo!', 'Implantes', 'Dental Plus', 3.0),
('Ana Costa', 4, 'Ótima experiência! As parcelas cabem no meu orçamento e o tratamento está sendo perfeito.', 'Clareamento', 'Sorriso Novo', 2.8);

-- Inserir configurações de parceria padrão
INSERT INTO public.partnership_configs (tier_name, min_treatments, max_treatments, commission_percentage, features, display_order) VALUES
('Iniciante', 1, 50, 3.5, '["Dashboard básico", "Suporte por email", "Pagamento em 48h"]', 1),
('Profissional', 51, 200, 2.8, '["Dashboard avançado", "Suporte prioritário", "Pagamento em 24h"]', 2),
('Enterprise', 201, NULL, 2.0, '["Dashboard completo", "Gerente dedicado", "Pagamento imediato"]', 3);