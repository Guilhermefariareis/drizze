import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { format, addDays, startOfDay, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HorariosDebugProps {
  clinicaId: string;
}

const HorariosDebug: React.FC<HorariosDebugProps> = ({ clinicaId }) => {
  const { 
    obterHorariosDisponiveis, 
    horariosFuncionamento, 
    loading, 
    carregarHorariosFuncionamento 
  } = useHorariosDisponiveis(clinicaId);
  
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [profissionalId, setProfissionalId] = useState('');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [executando, setExecutando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Função para garantir que os horários sejam carregados
  const garantirHorariosCarregados = async () => {
    console.log('🔧 [DEBUG] Garantindo que horários estejam carregados...');
    console.log('🔧 [DEBUG] Horários funcionamento atual:', horariosFuncionamento.length);
    
    if (horariosFuncionamento.length === 0) {
      console.log('🔧 [DEBUG] Nenhum horário encontrado, carregando...');
      await carregarHorariosFuncionamento();
      
      // Aguardar um pouco para o estado ser atualizado
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔧 [DEBUG] Após carregar, horários:', horariosFuncionamento.length);
    }
  };

  const testarHorarios = async () => {
    if (!dataSelecionada) {
      setMensagem('Por favor, selecione uma data');
      return;
    }

    setExecutando(true);
    setMensagem('');
    
    try {
      console.log('🧪 [DEBUG] Iniciando teste de horários...');
      console.log('🧪 [DEBUG] clinicaId:', clinicaId);
      console.log('🧪 [DEBUG] dataSelecionada:', dataSelecionada);
      console.log('🧪 [DEBUG] profissionalId:', profissionalId || 'vazio');
      console.log('🧪 [DEBUG] horariosFuncionamento:', horariosFuncionamento);
      
      // Garantir que os horários estejam carregados
      await garantirHorariosCarregados();
      
      const dataObj = new Date(dataSelecionada);
      const diaSemana = dataObj.getDay();
      const hoje = startOfDay(new Date());
      const dataConsulta = startOfDay(dataObj);
      
      console.log('🧪 [DEBUG] Dia da semana:', diaSemana);
      console.log('🧪 [DEBUG] Data é no passado?', isBefore(dataConsulta, hoje));
      
      // Verificar se há horários para este dia da semana
      const horariosDia = horariosFuncionamento.filter(h => h.dia_semana === diaSemana);
      console.log('🧪 [DEBUG] Horários para este dia:', horariosDia.length);
      
      if (horariosDia.length === 0) {
        setMensagem(`❌ Nenhum horário de funcionamento cadastrado para ${format(dataObj, 'EEEE', { locale: ptBR })}`);
        setHorarios([]);
        return;
      }
      
      console.log('🧪 [DEBUG] Chamando obterHorariosDisponiveis...');
      const horariosDisponiveis = await obterHorariosDisponiveis(dataSelecionada, profissionalId || undefined);
      console.log('🧪 [DEBUG] Horários recebidos:', horariosDisponiveis.length, horariosDisponiveis);
      
      setHorarios(horariosDisponiveis);
      
      if (horariosDisponiveis.length === 0) {
        setMensagem('⚠️ Nenhum horário disponível encontrado. Verifique os horários de funcionamento cadastrados.');
      } else {
        const disponiveis = horariosDisponiveis.filter(h => h.disponivel).length;
        setMensagem(`✅ ${horariosDisponiveis.length} horários encontrados (${disponiveis} disponíveis)`);
      }
      
    } catch (error) {
      console.error('🧪 [DEBUG] Erro ao obter horários:', error);
      setMensagem(`❌ Erro ao carregar horários: ${error}`);
      setHorarios([]);
    } finally {
      setExecutando(false);
    }
  };

  const gerarDatasTeste = () => {
    const hoje = new Date();
    const datas = [];
    
    for (let i = 0; i < 14; i++) {
      const data = addDays(hoje, i);
      const diaSemana = data.getDay();
      const temHorarios = horariosFuncionamento.some(h => h.dia_semana === diaSemana);
      
      datas.push({
        data: format(data, 'yyyy-MM-dd'),
        diaSemana: diaSemana,
        diaNome: format(data, 'EEEE', { locale: ptBR }),
        temHorarios: temHorarios,
        ehHoje: i === 0
      });
    }
    
    return datas;
  };

  // Testar automaticamente ao carregar
  useEffect(() => {
    if (clinicaId && dataSelecionada) {
      testarHorarios();
    }
  }, [clinicaId, dataSelecionada]);

  return (
    <Card className="mt-4 border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Clock className="h-5 w-5" />
          🔧 Debug de Horários - Solução de Problemas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status dos Horários de Funcionamento */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Horários de Funcionamento Cadastrados
          </h3>
          {loading ? (
            <div className="text-gray-600">Carregando...</div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">
                {horariosFuncionamento.length} horários encontrados
              </div>
              {horariosFuncionamento.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {horariosFuncionamento.map((horario, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-sm">
                      <div className="font-medium">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][horario.dia_semana]}
                      </div>
                      <div className="text-gray-600">
                        {horario.hora_inicio} - {horario.hora_fim}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Nenhum horário de funcionamento cadastrado!</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Seletor de Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data-debug">Data para Teste:</Label>
            <Input
              id="data-debug"
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          
          <div>
            <Label htmlFor="profissional-debug">Profissional ID (opcional):</Label>
            <Input
              id="profissional-debug"
              type="text"
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              placeholder="Deixe vazio para testar sem filtro"
            />
          </div>
        </div>

        {/* Dias da Semana com Horários */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Dias da Semana com Horários Cadastrados
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {gerarDatasTeste().slice(0, 7).map((item, index) => (
              <Button
                key={index}
                variant={item.temHorarios ? "default" : "destructive"}
                size="sm"
                onClick={() => setDataSelecionada(item.data)}
                className="text-xs"
              >
                {item.diaNome.slice(0, 3)}
                {item.ehHoje && <span className="ml-1">📅</span>}
              </Button>
            ))}
          </div>
        </div>

        {/* Botão de Teste */}
        <Button 
          onClick={testarHorarios} 
          disabled={executando}
          className="w-full"
          size="lg"
        >
          {executando ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Testando Horários...
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              🧪 Testar Horários para {format(new Date(dataSelecionada), 'dd/MM/yyyy')}
            </>
          )}
        </Button>

        {/* Mensagem de Status */}
        {mensagem && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            mensagem.includes('✅') ? 'bg-green-100 text-green-800' :
            mensagem.includes('❌') ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {mensagem.includes('✅') ? <CheckCircle className="h-4 w-4" /> :
             mensagem.includes('❌') ? <AlertCircle className="h-4 w-4" /> :
             <Clock className="h-4 w-4" />}
            <span className="font-medium">{mensagem}</span>
          </div>
        )}

        {/* Horários Encontrados */}
        {horarios.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              Horários Disponíveis ({horarios.filter(h => h.disponivel).length}/{horarios.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
              {horarios.map((horario, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-center text-sm font-medium ${
                    horario.disponivel 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {horario.horario}
                  </div>
                  {!horario.disponivel && horario.motivo && (
                    <div className="text-xs mt-1 opacity-75">
                      {horario.motivo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instruções de Solução */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            Solução de Problemas
          </h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p><strong>Horários não aparecem?</strong> Verifique:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Se há horários de funcionamento cadastrados para o dia da semana</li>
              <li>Se a data selecionada não é no passado</li>
              <li>Se o profissional está disponível naquele dia</li>
              <li>Se já existem agendamentos ocupando todos os horários</li>
            </ul>
            <p className="mt-2"><strong>Sem horários cadastrados?</strong> Os horários mock serão usados automaticamente.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HorariosDebug;