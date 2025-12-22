import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

export interface IntentDetectionResult {
  intent: 'cadastro' | 'vantagens' | 'como_funciona' | 'contato' | 'clinicas' | 'pacientes' | 'faq' | 'saudacao' | 'despedida' | 'outros';
  confidence: number;
  entities: {
    tipo_usuario?: 'clinica' | 'paciente';
    topico?: string;
    categoria?: string;
  };
  suggestedResponse?: string;
}

export interface ChatResponse {
  message: string;
  intent: string;
  buttons?: Array<{
    id: string;
    text: string;
    action: string;
    data?: any;
  }>;
  quickReplies?: string[];
  nextStep?: string;
}

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async detectIntent(message: string, context: any = {}): Promise<IntentDetectionResult> {
    try {
      const prompt = `
Você é o assistente virtual de suporte do Doutorizze. Analise a mensagem do usuário e determine a intenção:

Mensagem: "${message}"
Contexto atual: ${JSON.stringify(context)}

O Doutorizze é uma plataforma inovadora odontológica que conecta pacientes e clínicas dentárias de forma simples e eficiente.

Classifique a intenção como uma das seguintes opções:
- cadastro: como se cadastrar na plataforma (clínica ou paciente)
- vantagens: benefícios e diferenciais do Doutorizze
- como_funciona: funcionamento da plataforma e seus recursos
- contato: solicitar contato com atendente humano
- clinicas: dúvidas específicas para clínicas (cadastro, gestão, recursos)
- pacientes: dúvidas específicas para pacientes (busca, perfil)
- faq: perguntas frequentes gerais
- saudacao: cumprimento inicial ou apresentação
- despedida: finalização da conversa
- outros: assuntos não relacionados ao Doutorizze

Extração de entidades (se aplicável):
- tipo_usuario: se é clínica ou paciente
- topico: assunto específico mencionado
- categoria: categoria da dúvida

Responda APENAS em formato JSON válido:
{
  "intent": "categoria_da_intencao",
  "confidence": 0.95,
  "entities": {
    "tipo_usuario": "valor_ou_null",
    "topico": "valor_ou_null",
    "categoria": "valor_ou_null"
  },
  "suggestedResponse": "resposta_sugerida"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as IntentDetectionResult;
    } catch (error) {
      console.error('Error detecting intent:', error);
      // Fallback to simple keyword detection
      return this.fallbackIntentDetection(message);
    }
  }

  async generateResponse(intent: string, entities: any, context: any): Promise<ChatResponse> {
    try {
      const prompt = `
Você é o assistente virtual de suporte do Doutorizze. Gere uma resposta útil e amigável.

Intenção detectada: ${intent}
Entidades extraídas: ${JSON.stringify(entities)}
Contexto da conversa: ${JSON.stringify(context)}

Sobre o Doutorizze:
🦷 Plataforma líder odontológica online
👥 Conecta pacientes e clínicas dentárias em todo o Brasil
🆓 Cadastro 100% gratuito para clínicas e pacientes
🔍 Busca inteligente por especialidades e localização
📊 Gestão completa de perfis e informações
⭐ Avaliações e feedback de pacientes
💬 Suporte especializado e atendimento personalizado

Diretrizes para respostas:
- Seja sempre amigável, profissional e prestativo
- Forneça informações específicas e detalhadas sobre o Doutorizze
- Para cadastro, explique o processo completo passo a passo
- Para dúvidas técnicas, seja claro e didático
- Mantenha o foco EXCLUSIVAMENTE em suporte e FAQ sobre a plataforma
- NUNCA mencione agendamentos, consultas ou funcionalidades de marcação
- Use linguagem simples, acessível e emojis quando apropriado
- Sempre ofereça opções de ajuda adicional ou contato com atendente
- Destaque os benefícios e diferenciais da plataforma como ferramenta de conexão

Responda em formato JSON:
{
  "message": "mensagem_de_resposta",
  "intent": "${intent}",
  "buttons": [
    {"id": "btn1", "text": "Texto do Botão", "action": "acao", "data": {}}
  ],
  "quickReplies": ["Resposta Rápida 1", "Resposta Rápida 2"],
  "nextStep": "proximo_passo"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as ChatResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.fallbackResponse(intent);
    }
  }

  async searchFAQ(query: string, faqItems: any[]): Promise<any[]> {
    try {
      const prompt = `
Encontre as perguntas mais relevantes da FAQ para a consulta do usuário.

Consulta: "${query}"

FAQ disponível:
${faqItems.map(item => `- ${item.pergunta}: ${item.resposta}`).join('\n')}

Retorne os IDs das 3 perguntas mais relevantes em ordem de relevância.
Responda APENAS em formato JSON:
{
  "relevantIds": ["id1", "id2", "id3"],
  "confidence": 0.85
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return faqItems.filter(item => result.relevantIds?.includes(item.id));
    } catch (error) {
      console.error('Error searching FAQ:', error);
      // Fallback to simple text search
      return this.fallbackFAQSearch(query, faqItems);
    }
  }

  private fallbackIntentDetection(message: string): IntentDetectionResult {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based detection
    if (lowerMessage.includes('cadastr') || lowerMessage.includes('registr') || lowerMessage.includes('criar conta')) {
      return {
        intent: 'cadastro',
        confidence: 0.7,
        entities: {},
        suggestedResponse: 'Vou te ajudar com o cadastro no Doutorizze!'
      };
    }
    
    if (lowerMessage.includes('vantag') || lowerMessage.includes('benefíci') || lowerMessage.includes('por que usar')) {
      return {
        intent: 'vantagens',
        confidence: 0.7,
        entities: {},
        suggestedResponse: 'Posso te explicar as vantagens do Doutorizze!'
      };
    }
    
    if (lowerMessage.includes('como funciona') || lowerMessage.includes('como usar') || lowerMessage.includes('como é')) {
      return {
        intent: 'como_funciona',
        confidence: 0.7,
        entities: {},
        suggestedResponse: 'Vou explicar como o Doutorizze funciona!'
      };
    }
    
    if (lowerMessage.includes('contato') || lowerMessage.includes('atendente') || lowerMessage.includes('falar') || lowerMessage.includes('ajuda')) {
      return {
        intent: 'contato',
        confidence: 0.7,
        entities: {},
        suggestedResponse: 'Vou te conectar com nosso atendimento!'
      };
    }
    
    if (lowerMessage.includes('faq') || lowerMessage.includes('dúvida') || lowerMessage.includes('pergunta')) {
      return {
        intent: 'faq',
        confidence: 0.7,
        entities: {},
        suggestedResponse: 'Posso esclarecer suas dúvidas sobre o Doutorizze!'
      };
    }
    
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia')) {
      return {
        intent: 'saudacao',
        confidence: 0.8,
        entities: {},
        suggestedResponse: 'Olá! Como posso te ajudar com o Doutorizze hoje?'
      };
    }
    
    return {
      intent: 'outros',
      confidence: 0.5,
      entities: {},
      suggestedResponse: 'Posso te ajudar com dúvidas sobre o Doutorizze. O que você precisa saber?'
    };
  }

  private fallbackResponse(intent: string): ChatResponse {
    const responses: Record<string, ChatResponse> = {
      cadastro: {
        message: '📝 Para se cadastrar no Doutorizze, acesse nosso site e clique em "Cadastrar". O processo é rápido e simples! Precisa de ajuda com algum passo específico?',
        intent: 'cadastro',
        buttons: [
          { id: 'btn_paciente', text: '👤 Sou Paciente', action: 'cadastro_tipo', data: { tipo: 'paciente' } },
          { id: 'btn_clinica', text: '🏥 Sou Clínica', action: 'cadastro_tipo', data: { tipo: 'clinica' } },
          { id: 'btn_info_cadastro', text: '❓ Mais informações', action: 'info_cadastro' }
        ],
        nextStep: 'selecting_user_type'
      },
      vantagens: {
        message: '⭐ O Doutorizze oferece busca inteligente de clínicas, conexão direta com profissionais, cadastro gratuito e muito mais! Quer saber sobre alguma vantagem específica?',
        intent: 'vantagens',
        buttons: [
          { id: 'btn_pacientes', text: '👤 Para Pacientes', action: 'vantagens_tipo', data: { tipo: 'pacientes' } },
          { id: 'btn_clinicas', text: '🏥 Para Clínicas', action: 'vantagens_tipo', data: { tipo: 'clinicas' } },
          { id: 'btn_geral', text: '🌟 Vantagens Gerais', action: 'vantagens_geral' }
        ],
        nextStep: 'showing_benefits'
      },
      como_funciona: {
        message: '🔄 O Doutorizze funciona de forma simples: cadastre-se → busque → compare → conecte-se! Precisa de detalhes sobre alguma etapa?',
        intent: 'como_funciona',
        buttons: [
          { id: 'btn_processo', text: '🔄 Processo Completo', action: 'explicar_processo' },
          { id: 'btn_cadastro', text: '📝 Como se Cadastrar', action: 'explicar_cadastro' },
          { id: 'btn_busca', text: '🔍 Como Buscar', action: 'explicar_busca' }
        ],
        nextStep: 'explaining_platform'
      },
      contato: {
        message: '💬 Precisa falar com nosso atendimento? Temos várias formas de contato para te ajudar!',
        intent: 'contato',
        buttons: [
          { id: 'btn_whatsapp', text: '📱 WhatsApp', action: 'open_whatsapp' },
          { id: 'btn_email', text: '📧 Email', action: 'open_email' },
          { id: 'btn_telefone', text: '📞 Telefone', action: 'show_phone' }
        ],
        nextStep: 'showing_contact'
      },
      saudacao: {
        message: '👋 Olá! Sou seu assistente virtual do Doutorizze! Como posso ajudá-lo hoje?',
        intent: 'saudacao',
        quickReplies: ['Como me cadastro?', 'Quais as vantagens?', 'Como funciona?', 'Falar com atendente'],
        nextStep: 'waiting_intent'
      },
      faq: {
        message: '🤝 Estou aqui para esclarecer todas suas dúvidas sobre o Doutorizze! Pode perguntar sobre cadastro, vantagens, funcionamento ou qualquer outra coisa.',
        intent: 'faq',
        buttons: [
          { id: 'btn_cadastro', text: '📝 Cadastro', action: 'faq_category', data: { category: 'cadastro' } },
          { id: 'btn_vantagens', text: '⭐ Vantagens', action: 'faq_category', data: { category: 'vantagens' } },
          { id: 'btn_funcionamento', text: '🔄 Funcionamento', action: 'faq_category', data: { category: 'funcionamento' } },
          { id: 'btn_contato', text: '💬 Falar com Atendente', action: 'show_contact_info' }
        ],
        nextStep: 'handling_faq',
        commonQuestions: [
          { question: 'Como me cadastro no Doutorizze?', category: 'cadastro', keywords: ['cadastro', 'registrar', 'criar conta'] },
          { question: 'Como funciona a plataforma Doutorizze?', category: 'funcionamento', keywords: ['funciona', 'plataforma', 'como usar'] },
          { question: 'Quais são as vantagens do Doutorizze?', category: 'vantagens', keywords: ['vantagens', 'beneficios', 'porque usar'] },
          { question: 'Como busco clínicas na minha região?', category: 'busca', keywords: ['buscar', 'encontrar', 'clinicas', 'regiao'] },
          { question: 'O Doutorizze é gratuito?', category: 'preco', keywords: ['gratuito', 'gratis', 'preco', 'custo'] },
          { question: 'Como entro em contato com o suporte?', category: 'suporte', keywords: ['contato', 'suporte', 'ajuda', 'atendimento'] },
          { question: 'Como me conectar com profissionais?', category: 'conexao', keywords: ['conectar', 'profissionais', 'medicos', 'contato'] },
          { question: 'Que tipos de clínicas posso encontrar?', category: 'clinicas', keywords: ['tipos', 'especialidades', 'clinicas', 'areas'] }
        ]
      }
    };

    return responses[intent] || {
      message: '🤔 Não entendi completamente sua pergunta. Pode reformular? Estou aqui para ajudar com dúvidas sobre cadastro, vantagens, funcionamento da plataforma e muito mais!',
      intent: 'outros',
      quickReplies: ['Como me cadastro?', 'Quais as vantagens?', 'Como funciona?', 'Falar com atendente'],
      nextStep: 'waiting_intent'
    };
  }

  private fallbackFAQSearch(query: string, faqItems: any[]): any[] {
    const faqs = [
      {
        question: "Como me cadastro no Doutorizze?",
        answer: "🔹 Para se cadastrar no Doutorizze:\n\n👤 **Para Pacientes:**\n• Acesse nosso site ou app\n• Clique em 'Cadastrar'\n• Preencha seus dados pessoais\n• Confirme seu e-mail\n• Pronto! Já pode buscar clínicas\n\n🏥 **Para Clínicas:**\n• Acesse a área 'Clínicas'\n• Preencha os dados da clínica\n• Envie documentação\n• Aguarde aprovação (24-48h)\n• Configure seus serviços e horários",
        keywords: ["cadastro", "cadastrar", "registrar", "conta", "inscrever", "criar conta"]
      },
      {
        question: "Quais são as vantagens do Doutorizze?",
        answer: "⭐ **Principais vantagens:**\n\n🔍 **Busca Inteligente:** Encontre clínicas por localização e especialidade\n\n📱 **Multiplataforma:** Acesse pelo site, app ou WhatsApp\n\n🤝 **Conexão Direta:** Conecte-se diretamente com profissionais\n\n⭐ **Avaliações:** Veja opiniões de outros pacientes\n\n🛡️ **Segurança:** Dados protegidos e informações confiáveis\n\n💰 **Gratuito:** Cadastro e busca totalmente gratuitos",
        keywords: ["vantagens", "benefícios", "por que", "motivos", "diferencial"]
      },
      {
        question: "Como funciona o Doutorizze?",
        answer: "🔄 **Como funciona:**\n\n1️⃣ **Cadastre-se:** Crie sua conta gratuitamente\n\n2️⃣ **Busque:** Digite sua cidade e especialidade desejada\n\n3️⃣ **Compare:** Veja clínicas, serviços e avaliações\n\n4️⃣ **Conecte-se:** Entre em contato diretamente com a clínica\n\n5️⃣ **Avalie:** Compartilhe sua experiência\n\n💡 **É simples, rápido e gratuito!**",
        keywords: ["como funciona", "funcionamento", "processo", "passo a passo", "tutorial"]
      },
      {
        question: "Como entro em contato com uma clínica?",
        answer: "📞 **Para entrar em contato:**\n\n1️⃣ **Busque** a clínica desejada\n\n2️⃣ **Acesse** o perfil da clínica\n\n3️⃣ **Veja** as informações de contato\n\n4️⃣ **Escolha:** Telefone, WhatsApp ou e-mail\n\n5️⃣ **Entre em contato** diretamente\n\n💡 **Dica:** Todas as informações estão no perfil da clínica!",
        keywords: ["contato", "telefone", "whatsapp", "email", "falar", "conectar"]
      },
      {
        question: "O Doutorizze é gratuito?",
        answer: "💰 **Sobre os custos:**\n\n✅ **Gratuito para pacientes:**\n• Cadastro gratuito\n• Busca de clínicas gratuita\n• Acesso a informações gratuito\n• Contato com clínicas gratuito\n\n🏥 **Para clínicas:**\n• Planos a partir de R$ 99/mês\n• Recursos avançados de gestão\n• Maior visibilidade\n\n💡 **Pacientes não pagam nada para usar!",
        keywords: ["gratuito", "gratis", "preço", "valor", "custo", "pagar"]
      },
      {
        question: "Como entro em contato com o suporte?",
        answer: "🆘 **Contato com Suporte:**\n\n📱 **WhatsApp:** (11) 99999-9999\n\n📧 **E-mail:** suporte@doutorizze.com.br\n\n📞 **Telefone:** (11) 3333-3333\n\n🕐 **Horário:** Segunda a Sexta, 8h às 18h\n\n💬 **Chat:** Disponível no site e app\n\n💡 **Resposta rápida garantida!",
        keywords: ["suporte", "ajuda", "contato", "atendimento", "problema", "dúvida"]
      }
    ];
    
    // Busca simples por palavras-chave
    const queryLower = query.toLowerCase();
    return faqItems.length > 0 ? faqItems
      .filter(item => 
        item.pergunta?.toLowerCase().includes(queryLower) ||
        item.resposta?.toLowerCase().includes(queryLower) ||
        item.question?.toLowerCase().includes(queryLower) ||
        item.answer?.toLowerCase().includes(queryLower) ||
        item.keywords?.some((keyword: string) => queryLower.includes(keyword.toLowerCase())) ||
        queryLower.split(' ').some(word => 
          item.pergunta?.toLowerCase().includes(word) ||
          item.question?.toLowerCase().includes(word)
        )
      )
      .slice(0, 3) : faqs
      .filter(item => 
        item.question?.toLowerCase().includes(queryLower) ||
        item.answer?.toLowerCase().includes(queryLower) ||
        item.keywords?.some((keyword: string) => queryLower.includes(keyword.toLowerCase())) ||
        queryLower.split(' ').some(word => 
          item.question?.toLowerCase().includes(word)
        )
      )
      .slice(0, 3);
  }
}

export const aiService = AIService.getInstance();