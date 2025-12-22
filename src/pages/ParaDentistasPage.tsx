import React from 'react';

const ParaDentistasPage = () => {
  return (
    <div className="pt-16">
      {/* Hero Section - Imagem completa sem cortes */}
      <div className="w-full">
        <img 
          src="/imagem-para-o-topo.png" 
          alt="Crédito Odontológico Descomplicado - Doutorizze" 
          className="w-full h-auto block"
        />
      </div>

      {/* Seção de Título - Separada da imagem */}
      <div className="bg-gradient-to-r from-blue-900 to-teal-800 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="mb-6">
            <span className="inline-block bg-teal-500 text-white px-6 py-3 rounded-full text-lg font-semibold">
              Crédito Odontológico Descomplicado
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Conheça os 8 benefícios da Doutorizze
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            A plataforma completa que revoluciona a gestão de clínicas odontológicas
          </p>
          <div className="w-24 h-1 bg-teal-400 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Seção 1 - Módulo de Crédito Odontológico Integrado */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              1. Módulo de Crédito Odontológico Integrado
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">
                Múltiplas financeiras, simulações demoradas, pacientes frustrados com reprovações e poucas opções para negativados.
              </p>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Integra TODAS as financeiras/fintechs relevantes do setor, além de fundo próprio exclusivo Doutorizze — eliminando o trabalho de acessar várias plataformas separadamente.</p>
                
                <p>Simulação e aprovação centralizadas: O paciente recebe a melhor oferta possível em segundos, já sabe o valor disponível antes de ir à clínica, e evita constrangimentos de ser reprovado "na cara do dentista".</p>
                
                <p>Fluxo resolve a grande dor do setor: Clínica não perde tempo operando vários sistemas ou treinando alguém para isso; não depende de um funcionário específico para operar crédito; dentista não se distrai do atendimento para virar analista financeiro.</p>
                
                <p>Comunicação transparente e educativa: Antes de qualquer etapa, paciente sabe exatamente como funcionam as simulações, as regras do crédito e o que esperar do atendimento—diminuindo ansiedade e aumentando confiança no processo e na clínica.</p>
                
                <p>Atende também negativados: O único modelo com proposta real, mediante fundo próprio e possibilidade de avalista, protegendo a clínica e abrindo o mercado para quem nunca conseguiria crédito nas outras plataformas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 - Marketplace de Emprego e Contratação Inteligente */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              2. Marketplace de Emprego e Contratação Inteligente
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-1 h-8 bg-red-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-sm">
                O mercado hoje depende quase totalmente de grupos de WhatsApp e indicações informais, gerando processos caóticos e confusos: é difícil filtrar candidatos, perder histórico e garantir qualidade, além de especialistas atuarem fora de sua área por falta de oportunidades segmentadas.
              </p>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Match automatizado entre clínicas e profissionais, por especialidade, habilidade e localização: Sai o modelo de "indicação no susto" de grupos de WhatsApp; entra o recrutamento digital filtrado, rápido e auditável. Profissional monta seu currículo detalhado, destacando especialidade, procedimento, expertise, cidades e disponível – clínicas publicam vagas (fixas ou substituições) e o sistema notifica só candidatos do perfil perfeito.</p>
                
                <p>Protege e potencializa o especialista: Dentistas e profissionais deixam de depender apenas de chance ou amizade para encontrar vagas, preenchendo suas agendas com o que sabem e amam fazer — médico ganha mais, clínica não contrata errado.</p>
                
                <p>Substituição rápida e segura: Na ausência urgente, ou férias, o próprio dentista pode selecionar colegas do mesmo nível para cobrir, garantindo qualidade e segurança para paciente e clínica.</p>
                
                <p>Reputação validada e Hall da Fama: Toda contratação e experiência gera avaliação bilateral (clínica → profissional, profissional → clínica), ranqueando no Hall da Fama. Isso cria histórico público, eliminando fake reviews e protegendo contra profissionais sem referência.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3 - Onboarding Humanizado e Suporte Premium */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              3. Onboarding Humanizado e Suporte Premium
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Onboarding omnichannel e consultivo: O Doutorizze vai além do login e senha. Pacientes e clínicas recebem ligações, áudios humanizados, mensagens e vídeos tutoriais sob demanda—tudo personalizado no canal de preferência. O usuário nunca sente abandono: toda dúvida é respondida em tempo real, tornando o fluxo acolhedor, claro e livre de barreiras digitais.</p>
                
                <p>Escudo contra abandono ou frustração: Se há dúvida/resistência, humanos assumem imediatamente a comunicação, resolvendo problemas de verdade — nem paciente nem clínica ficam "perdidos" no fluxo digital.</p>
                
                <p>Comunicação transparente e educativa: Antes de qualquer etapa, paciente sabe exatamente como funcionam as simulações, as regras do crédito e o que esperar do atendimento—diminuindo ansiedade e aumentando confiança no processo e na clínica.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4 - Compra Direta de Insumos e Economia */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              4. Compra Direta de Insumos e Economia
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-red-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                Intermediários/revendedores encarecem materiais; dono de clínica nunca sabe se está pagando preço justo; dificuldade de criar relacionamento com fornecedores confiáveis.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Eliminação dos intermediários/revendedores: As clínicas acessam diretamente fornecedores e fabricantes de materiais, equipamentos e insumos odontológicos, pulando camadas de revenda que oneram custos e dificultam a comunicação.</p>
                
                <p>Networking inédito do setor: A Doutorizze conecta clínicas a uma rede de fornecimento ampla e qualificada — fortalecendo acordos comerciais, eficiência e atualização, e potencializando acesso a novidades do setor.</p>
                
                <p>Orçamentos mais competitivos e rápidas negociações: Clínicas recebem propostas de vários fornecedores em tempo real, acelerando aquisições e maximizando sua margem de lucro.</p>
                
                <p>Gestão e reputação de fornecedores: Apenas fornecedores verificados, com histórico de entrega, avaliações transparentes e compliance ativo integram o ecossistema, garantindo segurança e confiança às clínicas.</p>
                
                <p>Benefícios para fornecedores: Acesso direto a uma base qualificada de compradores, possibilidade de criar campanhas promocionais, eventos, e fortalecer presença no mercado odontológico de maneira escalável e automatizada.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 5 - Segurança Jurídica e Compliance Total */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              5. Segurança Jurídica e Compliance Total
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-red-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                Risco de vazamento de dados, exposição jurídica, dúvidas sobre LGPD e conformidade.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Setor jurídico dedicado: A plataforma conta com equipe própria e exclusiva de advogados e especialistas para garantir adequação completa à LGPD, compliance setorial da saúde e proteção jurídica das operações – desde contratos, consentimento, à resposta rápida para incidentes.</p>
                
                <p>Governança e trilha de auditoria: Toda movimentação relevante na plataforma é monitorada, logada e auditável, assegurando rastreabilidade, transparência e proteção para clínicas, pacientes e fornecedores.</p>
                
                <p>Atualização proativa: O setor jurídico e squads de desenvolvimento acompanham em tempo real mudanças regulatórias e se antecipam na implementação de novos requisitos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 6 - Sistema de Reputação Transparente */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              6. Sistema de Reputação Transparente
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-red-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                Avaliações manipuladas, fake reviews, dúvida sobre qualidade de profissionais/serviços, insegurança para contratar ou fechar negócio.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Sistema de reputação inviolável: Cada atendimento, contratação ou interação relevante gera avaliação bilateral — tanto clínica avalia profissional (e fornecedor), quanto o profissional/paciente avalia a clínica, resultando em reputação pública e auditável.</p>
                
                <p>Hall da Fama: Os melhores profissionais e clínicas ranqueados por indicadores concretos e validados ocupam destaque, atraindo mais oportunidades e estabelecendo padrão de confiança no setor.</p>
                
                <p>Validação dupla: Nenhuma avaliação é "fake" ou manipulada — só é publicada após confirmação de ambas as partes envolvidas, e toda notificação de avaliação é auditável por código ou via integração própria do Doutorizze.</p>
                
                <p>Auditoria real dos resultados: Especialistas dentistas auditam fotos e feedback dos tratamentos concluídos (início e fim). Isso garante que o serviço foi honestamente entregue e avalia a qualidade com olhar técnico.</p>
                
                <p>Transparência e segurança: O ciclo de reputação protege usuários, pacientes e o ecossistema de contratações e fornecedores, elevando o padrão do mercado e evitando fraude, notas injustas, ou manipulações típicas de plataformas abertas.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 7 - Marketing e Tendências Práticas */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              7. Marketing e Tendências Práticas
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-red-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                Ruído, dicas genéricas, excesso de informação sem aplicação prática, dono de clínica não tem tempo para pesquisar.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>Feed de tendências e novidades relevantes: Em vez de aglutinar ruído ou conteúdo solto da internet, Doutorizze filtra, organiza e entrega SÓ o que é útil, novo e aplicável à odontologia e à rotina prática das clínicas.</p>
                
                <p>Curadoria com inteligência insider: Todo conteúdo vem de alguém que convive com a inovação, usa IA no dia a dia, testa ferramentas novas e filtra aquilo que realmente funciona para o mercado dental, cortando "fake hype".</p>
                
                <p>Marketing prático para odontologia: Campanhas, modelos de anúncio, dicas de explorar redes sociais, estratégias de aquisição de pacientes, automação real (e não só teoria)—tudo mastigado para o dono da clínica que não tem tempo (ou paciência) de fuçar mil opções.</p>
                
                <p>Filtro por impacto direto: Só entra conteúdo que traga ganho real de produtividade ou resultado, e toda dica é contextualizada para a rotina do consultório brasileiro.</p>
                
                <p>Valor para o profissional: Ajuda o dentista/gestor a navegar no mar de novidades digitais, mostrando o que fazer, como agir e o que descartar—sempre com base em experiência aplicada e testada antes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 8 - IA para Recuperação de Leads */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
              8. IA para Recuperação de Leads
            </h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-red-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-red-700">Problema hoje:</h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-lg">
                Muitos leads ficam esquecidos porque a equipe não consegue retornar para todos, acumulando contatos na base e desperdiçando oportunidades. A maioria das clínicas perde potenciais pacientes simplesmente por falta de tempo para fazer o follow-up constante.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-2 h-12 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-2xl font-bold text-blue-700">Como Doutorizze resolve:</h3>
              </div>
              <div className="space-y-6 text-gray-800 leading-relaxed text-lg">
                <p>A IA não deixa nenhum contato esquecido. Ela liga, envia mensagens de texto, áudios humanizados, vídeos e até imagens de resultados antes e depois, fazendo remarketing diário para todos os leads da base — inclusive aqueles que não atenderam ou ficaram sem resposta no primeiro contato.</p>
                
                <p>Clínicas acumulam centenas de leads, mas o tempo e a equipe impedem de fazer múltimos retornos. Com a IA, todos recebem atenção personalizada diariamente, aumentando chances de conversão e ocupando agendas ociosas.</p>
                
                <p>Os pacientes se sentem acompanhados, recebem informações relevantes, têm dúvidas sanadas rapidamente e veem resultados reais dos procedimentos, criando interesse ativo e confiança.</p>
                
                <p>A IA atualiza planilhas automaticamente, mostrando exatamente até onde o paciente foi no funil de atendimento — você sabe quem respondeu, quem agendou, quem ficou "travado" e pode atuar cirurgicamente para cada caso.</p>
                
                <p>Sua equipe deixa de gastar horas tentando recuperar leads e pode focar no atendimento presencial, sem perder oportunidades por excesso de pendências.</p>
                
                <p>O que antes era um esforço manual (e muitas vezes impossível de administrar) vira rotina inteligente, automatizada e contínua — gerando receita, reduzindo perdas e crescendo o negócio de forma previsível.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Rodapé com Botão WhatsApp */}
      <footer className="bg-gradient-to-r from-blue-900 to-teal-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para revolucionar?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Entre em contato conosco e descubra como a Doutorizze pode transformar seu negócio
          </p>
          
          <a 
            href="https://wa.me/5561994408232" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-green-500/25"
          >
            <svg 
              className="w-8 h-8" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Fale Conosco no WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ParaDentistasPage;