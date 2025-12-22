import React, { useState, useEffect } from 'react';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestHorariosProps {
  clinicaId: string;
}

const TestHorarios: React.FC<TestHorariosProps> = ({ clinicaId }) => {
  const { obterHorariosDisponiveis, loading, error } = useHorariosDisponiveis(clinicaId);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarios, setHorarios] = useState<any[]>([]);
  const [profissionalId, setProfissionalId] = useState('');

  const testarHorarios = async () => {
    if (!dataSelecionada) {
      alert('Por favor, selecione uma data');
      return;
    }

    console.log('🧪 Testando horários para:', dataSelecionada, 'clinicaId:', clinicaId, 'profissionalId:', profissionalId);
    
    try {
      const horariosDisponiveis = await obterHorariosDisponiveis(dataSelecionada, profissionalId || undefined);
      console.log('🧪 Horários recebidos:', horariosDisponiveis);
      setHorarios(horariosDisponiveis);
    } catch (error) {
      console.error('🧪 Erro ao obter horários:', error);
      alert('Erro ao obter horários: ' + error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🧪 Teste de Horários</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Data:</Label>
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
        
        <Button onClick={testarHorarios} disabled={loading}>
          {loading ? 'Carregando...' : 'Testar Horários'}
        </Button>
        
        {error && (
          <div className="text-red-500">
            Erro: {error}
          </div>
        )}
        
        {horarios.length > 0 && (
          <div>
            <h4 className="font-bold mb-2">Horários encontrados ({horarios.length}):</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {horarios.map((horario, index) => (
                <div key={index} className={`p-2 rounded ${horario.disponivel ? 'bg-green-100' : 'bg-red-100'}`}>
                  {horario.horario} - {horario.disponivel ? 'Disponível' : 'Indisponível'}
                  {horario.motivo && <span className="text-sm ml-2">({horario.motivo})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {horarios.length === 0 && dataSelecionada && !loading && (
          <div className="text-yellow-600">
            Nenhum horário encontrado para esta data
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHorarios;