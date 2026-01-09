import React from 'react';

const ParaDentistasPage = () => {
  return (
    <div className="pt-16 bg-[#0F0F23] text-white">
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#E94560]/10 to-transparent pointer-events-none"></div>
        <img
          src="/imagem-para-o-topo.png"
          alt="Crédito Odontológico Descomplicado - Doutorizze"
          className="w-full h-auto block opacity-80"
        />
      </div>

      {/* Seção de Título */}
      <div className="bg-[#1A1A2E] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E94560]/5 rounded-full blur-[100px]"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="mb-8">
            <span className="inline-block bg-[#E94560]/10 text-[#E94560] border border-[#E94560]/20 px-6 py-3 rounded-full text-lg font-black tracking-widest uppercase">
              Crédito Odontológico Descomplicado
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
            Conheça os <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E94560] to-[#FB923C]">8 benefícios</span> da Doutorizze
          </h1>
          <p className="text-xl md:text-2xl text-white/40 mb-12 leading-relaxed font-medium">
            A plataforma completa que revoluciona a gestão de clínicas odontológicas com tecnologia de ponta.
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-[#E94560] to-[#FB923C] mx-auto rounded-full shadow-glow"></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Seção 1 - Módulo de Crédito Odontológico Integrado */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              1. Módulo de <span className="text-[#3B82F6]">Crédito</span> Integrado
            </h2>
            <div className="w-24 h-1.5 bg-[#3B82F6] mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Múltiplas financeiras, simulações demoradas, pacientes frustrados com reprovações e poucas opções para negativados.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#3B82F6]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#3B82F6] rounded-full mr-5 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
                <p>Integra <span className="text-white font-bold">TODAS</span> as financeiras/fintechs relevantes do setor, além de fundo próprio exclusivo Doutorizze — eliminando o trabalho de acessar várias plataformas separadamente.</p>
                <p>Simulação e aprovação centralizadas: O paciente recebe a melhor oferta possível em segundos, evitando constrangimentos.</p>
                <p>O único modelo com <span className="text-white font-bold">proposta real para negativados</span>, mediante fundo próprio e possibilidade de avalista, protegendo a clínica e abrindo o mercado.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 2 - Marketplace de Emprego e Contratação Inteligente */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              2. Marketplace de <span className="text-[#8B5CF6]">Emprego</span> Inteligente
            </h2>
            <div className="w-24 h-1.5 bg-[#8B5CF6] mx-auto rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                O mercado hoje depende de grupos de WhatsApp, gerando processos caóticos, falta de histórico e dificuldade em filtrar candidatos qualificados.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#8B5CF6]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#8B5CF6] rounded-full mr-5 shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
                <p>Match automatizado por especialidade e localização. Profissional com currículo digital e clínicas com vagas filtradas.</p>
                <p>Reputação validada e <span className="text-white font-bold">Hall da Fama</span>: Avaliações bilaterais que garantem a qualidade e geram histórico público.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 3 - Onboarding Humanizado e Suporte Premium */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              3. Onboarding Humanizado e Suporte Premium
            </h2>
            <div className="w-24 h-1.5 bg-[#4ADE80] mx-auto rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-[2.5rem] p-12 hover:border-[#4ADE80]/30 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ADE80]/5 rounded-full blur-[80px] -z-10"></div>
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#4ADE80] rounded-full mr-5 shadow-[0_0_20px_rgba(74,222,128,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">ONBOARDING HUMANIZADO:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
                <p>O Doutorizze vai além do digital. Receba suporte via áudio, vídeo e ligações humanizadas.</p>
                <p>O usuário nunca se sente abandonado: toda dúvida é respondida em tempo real, tornando o fluxo acolhedor e livre de barreiras.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4 - Compra Direta de Insumos e Economia */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              4. Compra Direta de <span className="text-[#F59E0B]">Insumos</span> e Economia
            </h2>
            <div className="w-24 h-1.5 bg-[#F59E0B] mx-auto rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Intermediários/revendedores encarecem materiais; dono de clínica nunca sabe se está pagando preço justo; dificuldade de criar relacionamento com fornecedores confiáveis.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#F59E0B]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#F59E0B] rounded-full mr-5 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              5. Segurança Jurídica e <span className="text-[#EC4899]">Compliance</span> Total
            </h2>
            <div className="w-24 h-1.5 bg-[#EC4899] mx-auto rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Risco de vazamento de dados, exposição jurídica, dúvidas sobre LGPD e conformidade.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#EC4899]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#EC4899] rounded-full mr-5 shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
                <p>Setor jurídico dedicado: A plataforma conta com equipe própria e exclusiva de advogados e especialistas para garantir adequação completa à LGPD, compliance setorial da saúde e proteção jurídica das operações – desde contratos, consentimento, à resposta rápida para incidentes.</p>
                <p>Governança e trilha de auditoria: Toda movimentação relevante na plataforma é monitorada, logada e auditável, assegurando rastreabilidade, transparência e proteção para clínicas, pacientes e fornecedores.</p>
                <p>Atualização proativa: O setor jurídico e squads de desenvolvimento acompanham em tempo real mudanças regulatórias e se antecipam na implementação de novos requisitos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 6 - Sistema de Reputação Transparente */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              6. Sistema de <span className="text-[#60A5FA]">Reputação</span> Transparente
            </h2>
            <div className="w-24 h-1.5 bg-[#60A5FA] mx-auto rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Avaliações manipuladas, fake reviews, dúvida sobre qualidade de profissionais/serviços, insegurança para contratar ou fechar negócio.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#60A5FA]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#60A5FA] rounded-full mr-5 shadow-[0_0_20px_rgba(96,165,250,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              7. Marketing e <span className="text-[#A78BFA]">Tendências</span> Práticas
            </h2>
            <div className="w-24 h-1.5 bg-[#A78BFA] mx-auto rounded-full shadow-[0_0_15px_rgba(167,139,250,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Ruído, dicas genéricas, excesso de informação sem aplicação prática, dono de clínica não tem tempo para pesquisar.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#A78BFA]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#A78BFA] rounded-full mr-5 shadow-[0_0_20px_rgba(167,139,250,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
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
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              8. IA para Recuperação de <span className="text-[#FB7185]">Leads</span>
            </h2>
            <div className="w-24 h-1.5 bg-[#FB7185] mx-auto rounded-full shadow-[0_0_15px_rgba(251,113,133,0.5)]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-[#E94560]/10 border border-[#E94560]/20 rounded-3xl p-8 group hover:bg-[#E94560]/15 transition-all">
              <div className="flex items-center mb-6">
                <div className="w-1.5 h-10 bg-[#E94560] rounded-full mr-4 shadow-glow"></div>
                <h3 className="text-xl font-black text-[#E94560] tracking-tight">O PROBLEMA HOJE:</h3>
              </div>
              <p className="text-white/60 leading-relaxed font-medium">
                Muitos leads ficam esquecidos porque a equipe não consegue retornar para todos, acumulando contatos na base e desperdiçando oportunidades. A maioria das clínicas perde potenciais pacientes simplesmente por falta de tempo para fazer o follow-up constante.
              </p>
            </div>

            <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 hover:border-[#FB7185]/30 transition-all">
              <div className="flex items-center mb-8">
                <div className="w-2 h-14 bg-[#FB7185] rounded-full mr-5 shadow-[0_0_20px_rgba(251,113,133,0.5)]"></div>
                <h3 className="text-3xl font-black text-white tracking-tight">COMO A DOUTORIZZE RESOLVE:</h3>
              </div>
              <div className="space-y-8 text-white/60 leading-relaxed text-lg font-medium">
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

      {/* Rodapé */}
      <footer className="bg-[#1A1A2E] py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#E94560]/5 rounded-full blur-[120px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h3 className="text-4xl md:text-5xl font-black text-white mb-8">
            Pronto para <span className="text-[#E94560]">revolucionar</span>?
          </h3>
          <p className="text-xl text-white/40 mb-12 font-medium">
            Entre em contato conosco e descubra como a Doutorizze pode transformar seu negócio hoje mesmo.
          </p>

          <a
            href="https://wa.me/5561994408232"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-[#4ADE80] hover:bg-[#22C55E] text-white font-black py-5 px-10 rounded-2xl text-xl transition-all duration-500 transform hover:scale-105 shadow-2xl shadow-[#4ADE80]/20"
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            Fale Conosco no WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ParaDentistasPage;