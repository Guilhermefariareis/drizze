import React, { useState } from 'react';
import { BarChart3, TrendingUp, Globe, Bot, Star, Shield } from 'lucide-react';

interface ServicesSectionProps {
  clinicId?: string;
  isMaster?: boolean;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ clinicId, isMaster = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('todos');

  const services = [
    {
      id: 1,
      name: 'Analytics Avançado',
      category: 'analytics',
      icon: BarChart3,
      features: [
        'Análise detalhada e inteligência de negócio',
        'Dashboard executivo avançado',
        'Previsões de receita',
        'Análise de performance',
        'Métricas de satisfação',
        'Relatórios personalizados'
      ],
      status: 'Disponível',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Marketing Digital',
      category: 'marketing',
      icon: TrendingUp,
      features: [
        'Estratégias completas de marketing digital',
        'Gestão de redes sociais',
        'Campanhas de Google Ads',
        'E-mail marketing automatizado',
        'Landing pages otimizadas',
        'Análise de ROI'
      ],
      status: 'Disponível',
      color: 'orange'
    },
    {
      id: 3,
      name: 'Website Profissional',
      category: 'website',
      icon: Globe,
      features: [
        'Site completo e otimizado para sua clínica',
        'Design responsivo personalizado',
        'SEO otimizado',
        'Integração com agenda',
        'Blog profissional',
        'Certificado SSL'
      ],
      status: 'Disponível',
      color: 'green'
    },
    {
      id: 4,
      name: 'Assistente com IA',
      category: 'ia',
      icon: Bot,
      features: [
        'Atendimento automatizado via WhatsApp',
        'Chatbot inteligente 24/7',
        'Agendamento automático',
        'Respostas personalizadas',
        'Integração WhatsApp Business',
        'Análise de conversas'
      ],
      status: 'Solicitado',
      color: 'purple'
    },
    {
      id: 5,
      name: 'Gestão de Reputação',
      category: 'reputacao',
      icon: Star,
      features: [
        'Gestão eficiente da reputação online',
        'Monitoramento de avaliações',
        'Resposta automática a reviews',
        'Solicitação de avaliações',
        'Relatórios de reputação',
        'Gestão de crise'
      ],
      status: 'Disponível',
      color: 'red'
    },
    {
      id: 6,
      name: 'Segurança Avançada',
      category: 'seguranca',
      icon: Shield,
      features: [
        'Proteção e compliance de dados médicos',
        'Backup automatizado',
        'Criptografia avançada',
        'Compliance LGPD',
        'Auditoria de acesso',
        'Certificações médicas'
      ],
      status: 'Disponível',
      color: 'teal'
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'website', name: 'Website' },
    { id: 'ia', name: 'IA' },
    { id: 'reputacao', name: 'Reputação' },
    { id: 'seguranca', name: 'Segurança' }
  ];

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'todos') return true;
    return service.category === selectedCategory;
  });

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200',
      orange: 'bg-orange-50 border-orange-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
      teal: 'bg-teal-50 border-teal-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 border-gray-200';
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      orange: 'text-orange-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      teal: 'text-teal-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getBadgeColor = (status: string) => {
    return status === 'Disponível' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Serviços Essenciais
        </h1>
        <p className="text-xl text-gray-600">
          Transforme sua clínica com nossos serviços especializados. 
          Cada solução foi desenvolvida para otimizar seus processos e aumentar sua receita.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const IconComponent = service.icon;
          return (
            <div
              key={service.id}
              className={`${getColorClasses(service.color)} rounded-xl border-2 p-6 h-96 flex flex-col relative`}
            >
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 ${getBadgeColor(service.status)} text-xs font-medium rounded-full`}>
                  {service.status}
                </span>
              </div>

              <div className="mb-4">
                <IconComponent className={`h-8 w-8 ${getIconColor(service.color)}`} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.name}
              </h3>

              <div className="flex-1 mb-6">
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Solicitar Proposta
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesSection;
export { ServicesSection };