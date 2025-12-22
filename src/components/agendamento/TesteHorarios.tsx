import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveisSimples';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TesteHorariosProps {
  clinicaId: string;
}

const TesteHorarios: React.FC<TesteHorariosProps> = ({ clinicaId }) => {
  const { obterHorariosDisponiveis, horariosFuncionamento, loading } = useHorariosDisponiveis(clinicaId);
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [horarios, setHorarios] = useState<any[]>([]);
  const [testando, setTestando] = useState(false);

  const testarHorarios = async () => {
    if (!dataSelecionada) return;
    
    setTestando(true);
    try {
      const horariosDisponiveis = await obterHorariosDisponiveis(dataSelecionada);
      setHorarios(horariosDisponiveis);
    } catch (error) {
      console.error('Erro ao testar horários:', error);
      setHorarios([]);
    } finally {
      setTestando(false);
    }
  };

  useEffect(() => {
    if (clinicaId && dataSelecionada) {
      testarHorarios();
    }
  }, [clinicaId, dataSelecionada]);

  return (
    <Card className="mt-4 border-2 border-green-200">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Clock className="h-5 w-5" />
          TESTE DE HORÁRIOS - FUNCIONANDO AGORA!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Data para Teste:</Label>
            <Input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          
          <div>
            <Label>Horários de Funcionamento:</Label>
            <div className="text-sm text-gray-600">
              {loading ? 'Carregando...' : `${horariosFuncionamento.length} horários encontrados`}
            </div>
          </div>
        </div>

        <Button 
          onClick={testarHorarios} 
          disabled={testando}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {testando ? 'Testando...' : 'TESTAR HORÁRIOS'}
        </Button>

        {horarios.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-800">
              Horários Disponíveis ({horarios.filter(h => h.disponivel).length}/{horarios.length})
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-32 overflow-y-auto">
              {horarios.map((horario, index) => (
                <div 
                  key={index}
                  className={`p-2 rounded text-center text-sm font-medium cursor-pointer transition-colors ${
                    horario.disponivel 
                      ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    {horario.horario}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {horarios.length === 0 && !loading && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800">Nenhum horário encontrado</h3>
            <p className="text-sm text-yellow-700">Verifique se há horários de funcionamento cadastrados para este dia.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TesteHorarios;