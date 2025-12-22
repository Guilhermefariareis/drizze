import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DebugHorariosProps {
  clinicaId: string;
}

const DebugHorarios: React.FC<DebugHorariosProps> = ({ clinicaId }) => {
  const { obterHorariosDisponiveis, horariosFuncionamento, loading } = useHorariosDisponiveis(clinicaId);
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [profissionalId, setProfissionalId] = useState('');
  const [resultado, setResultado] = useState<any[]>([]);
  const [executando, setExecutando] = useState(false);

  const testarHorarios = async () => {
    if (!dataSelecionada) {
      alert('Por favor, selecione uma data');
      return;
    }

    setExecutando(true);
    console.log('🧪 [DEBUG] Testando horários...');
    console.log('🧪 [DEBUG] clinicaId:', clinicaId);
    console.log('🧪 [DEBUG] dataSelecionada:', dataSelecionada);
    console.log('🧪 [DEBUG] profissionalId:', profissionalId || 'vazio');
    console.log('🧪 [DEBUG] horariosFuncionamento:', horariosFuncionamento);
    
    try {
      const horarios = await obterHorariosDisponiveis(dataSelecionada, profissionalId || undefined);
      console.log('🧪 [DEBUG] Horários recebidos:', horarios);
      setResultado(horarios);
      
      if (horarios.length === 0) {
        console.log('🧪 [DEBUG] NENHUM HORÁRIO ENCONTRADO!');
        console.log('🧪 [DEBUG] Verifique:');
        console.log('  - Se há horários de funcionamento cadastrados');
        console.log('  - Se a data é válida (não no passado)');
        console.log('  - Se o dia da semana tem horários configurados');
      }
    } catch (error) {
      console.error('🧪 [DEBUG] Erro ao obter horários:', error);
      alert('Erro ao obter horários: ' + error);
    } finally {
      setExecutando(false);
    }
  };

  const gerarDatasTeste = () => {
    const hoje = new Date();
    const datas = [];
    
    for (let i = 0; i < 7; i++) {
      const data = addDays(hoje, i);
      const diaSemana = data.getDay();
      const temHorarios = horariosFuncionamento.some(h => h.dia_semana === diaSemana);
      
      datas.push({
        data: format(data, 'yyyy-MM-dd'),
        diaSemana: diaSemana,
        diaNome: format(data, 'EEEE', { locale: ptBR }),
        temHorarios: temHorarios
      });
    }
    
    return datas;
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>🧪 Debug de Horários</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Horários de Funcionamento Cadastrados:</Label>
            <div className="text-sm text-gray-600">
              {horariosFuncionamento.length} horários encontrados
            </div>
            {horariosFuncionamento.length > 0 && (
              <div className="mt-2 space-y-1">
                {horariosFuncionamento.map((horario, index) => (
                  <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                    Dia {horario.dia_semana}: {horario.hora_inicio} - {horario.hora_fim}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Data para Teste:</Label>
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
            />
          </div>

          <div>
            <Label>Profissional ID (opcional):</Label>
            <Input
              type="text"
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              placeholder="Deixe vazio para testar sem filtro"
            />
          </div>

          <div className="space-y-2">
            <Label>Dias da semana disponíveis:</Label>
            {gerarDatasTeste().map((item, index) => (
              <div key={index} className={`text-sm p-2 rounded ${item.temHorarios ? 'bg-green-100' : 'bg-red-100'}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDataSelecionada(item.data)}
                  className="w-full justify-start"
                >
                  {item.diaNome} ({item.data}) - {item.temHorarios ? '✅ Tem horários' : '❌ Sem horários'}
                </Button>
              </div>
            ))}
          </div>

          <Button 
            onClick={testarHorarios} 
            disabled={executando || loading}
            className="w-full"
          >
            {executando ? 'Testando...' : loading ? 'Carregando...' : '🧪 Testar Horários'}
          </Button>

          {resultado.length > 0 && (
            <div className="mt-4">
              <Label>Horários Encontrados ({resultado.length}):</Label>
              <div className="max-h-40 overflow-y-auto space-y-1 mt-2">
                {resultado.map((horario, index) => (
                  <div key={index} className={`text-sm p-2 rounded ${horario.disponivel ? 'bg-green-100' : 'bg-red-100'}`}>
                    {horario.horario} - {horario.disponivel ? '✅ Disponível' : '❌ Indisponível'}
                    {horario.motivo && <span className="ml-2 text-xs">({horario.motivo})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resultado.length === 0 && !executando && dataSelecionada && (
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <p className="text-yellow-800 font-medium">⚠️ Nenhum horário encontrado!</p>
              <p className="text-yellow-700 text-sm mt-2">
                Possíveis causas:
              </p>
              <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside">
                <li>Nenhum horário de funcionamento cadastrado para este dia da semana</li>
                <li>Data selecionada é no passado</li>
                <li>Horários já estão todos ocupados</li>
                <li>Erro no carregamento dos dados</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugHorarios;