import React, { useState } from 'react';
// ChatWidget removido do site
import { MessageCircle } from 'lucide-react';

const ChatDemo: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Simular ID do usuário (em produção viria da autenticação)
  const userId = 'demo-user-123';
  const sessionId = 'demo-session-456';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Doutorizze</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900">Início</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Especialidades</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Clínicas</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">Contato</a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Agendamento Médico
            <span className="block text-blue-600">Inteligente</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Agende suas consultas de forma rápida e fácil com nosso assistente virtual.
            Disponível 24/7 para te ajudar.
          </p>
          
          {/* Features */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chat Inteligente
              </h3>
              <p className="text-gray-600">
                Converse com nosso assistente virtual para agendar consultas de forma natural e intuitiva.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Disponível 24/7
              </h3>
              <p className="text-gray-600">
                Agende suas consultas a qualquer hora do dia, todos os dias da semana.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmação Instantânea
              </h3>
              <p className="text-gray-600">
                Receba confirmação imediata do seu agendamento por SMS e email.
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-16">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              🩺 Agendar Consulta Agora
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Clique no botão ou no ícone de chat para começar
            </p>
          </div>
        </div>
        
        {/* Demo Instructions */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Como Funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Inicie o Chat</h4>
              <p className="text-sm text-gray-600">
                Clique no ícone de chat para começar a conversa
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Escolha a Especialidade</h4>
              <p className="text-sm text-gray-600">
                Selecione a especialidade médica desejada
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Selecione Data e Hora</h4>
              <p className="text-sm text-gray-600">
                Escolha a data e horário mais convenientes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Confirme os Dados</h4>
              <p className="text-sm text-gray-600">
                Informe seus dados e confirme o agendamento
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Doutorizze. Todos os direitos reservados.</p>
        </div>
      </footer>
      
      {/* Chat Widget - Temporariamente desabilitado */}
      {/* <ChatWidget 
        position="bottom-right"
        theme="auto"
        className=""
      /> */}
    </div>
  );
};

export default ChatDemo;