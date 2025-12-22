import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useHorarios } from '@/hooks/useHorarios';
import { useClinicProfile } from '@/hooks/useClinicProfile';
import { toast } from 'sonner';
import { AppSidebar } from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';

interface HorarioFuncionamento {
  id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  intervalo_inicio?: string;
  intervalo_fim?: string;
}

interface BloqueioHorario {
  id?: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  motivo?: string;
}

const ConfiguracaoHorariosPage = () => {
  const { user } = useAuth();
  const { clinic, loading: clinicLoading } = useClinicProfile();
  
  // Obter clinicaId da clínica associada ao usuário
  const clinicaId = clinic?.id || '';
  
  const {
    horariosFuncionamento,
    bloqueiosHorario,
    loading,
    criarHorarioFuncionamento,
    atualizarHorarioFuncionamento,
    removerHorarioFuncionamento,
    criarBloqueioHorario,
    removerBloqueioHorario,
    recarregar
  } = useHorarios(clinicaId);

  const [novoHorario, setNovoHorario] = useState<HorarioFuncionamento>({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fim: '18:00'
  });

  const [novoBloqueio, setNovoBloqueio] = useState<BloqueioHorario>({
    data: '',
    hora_inicio: '08:00',
    hora_fim: '18:00'
  });

  const diasSemana = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' }
  ];

  useEffect(() => {
    if (clinic?.id && !clinicLoading) {
      recarregar();
    }
  }, [clinic?.id, clinicLoading, recarregar]);

  const handleSalvarHorario = async () => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!clinic?.id) {
      toast.error('Clínica não encontrada. Verifique se você está associado a uma clínica.');
      return;
    }

    try {
      const horarioComClinica = {
        ...novoHorario,
        clinica_id: clinic.id
      };
      
      await criarHorarioFuncionamento(horarioComClinica);
      setNovoHorario({
        dia_semana: 1,
        hora_inicio: '08:00',
        hora_fim: '18:00'
      });
      toast.success('Horário de funcionamento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      toast.error('Erro ao salvar horário de funcionamento');
    }
  };

  const handleRemoverHorario = async (id: string) => {
    try {
      await removerHorarioFuncionamento(id);
      toast.success('Horário removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover horário');
    }
  };

  const handleSalvarBloqueio = async () => {
    if (!novoBloqueio.data) {
      toast.error('Por favor, selecione uma data');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!clinic?.id) {
      toast.error('Clínica não encontrada. Verifique se você está associado a uma clínica.');
      return;
    }

    try {
      const bloqueioComClinica = {
        ...novoBloqueio,
        clinica_id: clinic.id
      };
      
      await criarBloqueioHorario(bloqueioComClinica);
      setNovoBloqueio({
        data: '',
        hora_inicio: '08:00',
        hora_fim: '18:00'
      });
      toast.success('Bloqueio de horário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar bloqueio:', error);
      toast.error('Erro ao criar bloqueio de horário');
    }
  };

  const handleRemoverBloqueio = async (id: string) => {
    try {
      await removerBloqueioHorario(id);
      toast.success('Bloqueio removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover bloqueio');
    }
  };

  const getDiaSemanaLabel = (dia: number) => {
    return diasSemana.find(d => d.value === dia)?.label || 'Desconhecido';
  };

  if (loading || clinicLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <Navbar />
        <div className="flex-1 overflow-auto pt-4">
          <div className="container mx-auto p-6 space-y-6">
            <div className="w-full max-w-none space-y-6">
              <Tabs defaultValue="funcionamento" className="w-full">
            <TabsList className="grid w-full max-w-none grid-cols-2">
              <TabsTrigger value="funcionamento" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horários de Funcionamento
              </TabsTrigger>
              <TabsTrigger value="bloqueios" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bloqueios de Horário
              </TabsTrigger>
            </TabsList>

            <TabsContent value="funcionamento" className="w-full space-y-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Adicionar Horário de Funcionamento</CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dia-semana">Dia da Semana</Label>
                  <Select
                    value={novoHorario.dia_semana.toString()}
                    onValueChange={(value) => setNovoHorario({ ...novoHorario, dia_semana: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map((dia) => (
                        <SelectItem key={dia.value} value={dia.value.toString()}>
                          {dia.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hora-inicio">Hora Início</Label>
                  <Input
                    id="hora-inicio"
                    type="time"
                    value={novoHorario.hora_inicio}
                    onChange={(e) => setNovoHorario({ ...novoHorario, hora_inicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="hora-fim">Hora Fim</Label>
                  <Input
                    id="hora-fim"
                    type="time"
                    value={novoHorario.hora_fim}
                    onChange={(e) => setNovoHorario({ ...novoHorario, hora_fim: e.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSalvarHorario} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intervalo-inicio">Intervalo Início (Opcional)</Label>
                  <Input
                    id="intervalo-inicio"
                    type="time"
                    value={novoHorario.intervalo_inicio || ''}
                    onChange={(e) => setNovoHorario({ ...novoHorario, intervalo_inicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="intervalo-fim">Intervalo Fim (Opcional)</Label>
                  <Input
                    id="intervalo-fim"
                    type="time"
                    value={novoHorario.intervalo_fim || ''}
                    onChange={(e) => setNovoHorario({ ...novoHorario, intervalo_fim: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Horários Configurados</CardTitle>
            </CardHeader>
            <CardContent>
              {!horariosFuncionamento || horariosFuncionamento.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum horário de funcionamento configurado
                </p>
              ) : (
                <div className="w-full space-y-3">
                  {horariosFuncionamento?.map((horario) => (
                    <div key={horario.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">
                          {getDiaSemanaLabel(horario.dia_semana)}
                        </Badge>
                        <span className="font-medium">
                          {horario.hora_inicio} - {horario.hora_fim}
                        </span>
                        {horario.intervalo_inicio && horario.intervalo_fim && (
                          <span className="text-sm text-muted-foreground">
                            (Intervalo: {horario.intervalo_inicio} - {horario.intervalo_fim})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoverHorario(horario.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bloqueios" className="w-full space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Criar Bloqueio de Horário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="data-bloqueio">Data</Label>
                  <Input
                    id="data-bloqueio"
                    type="date"
                    value={novoBloqueio.data}
                    onChange={(e) => setNovoBloqueio({ ...novoBloqueio, data: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="hora-inicio-bloqueio">Hora Início</Label>
                  <Input
                    id="hora-inicio-bloqueio"
                    type="time"
                    value={novoBloqueio.hora_inicio}
                    onChange={(e) => setNovoBloqueio({ ...novoBloqueio, hora_inicio: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="hora-fim-bloqueio">Hora Fim</Label>
                  <Input
                    id="hora-fim-bloqueio"
                    type="time"
                    value={novoBloqueio.hora_fim}
                    onChange={(e) => setNovoBloqueio({ ...novoBloqueio, hora_fim: e.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSalvarBloqueio} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Bloqueio
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="motivo-bloqueio">Motivo (Opcional)</Label>
                <Input
                  id="motivo-bloqueio"
                  placeholder="Ex: Feriado, Manutenção, etc."
                  value={novoBloqueio.motivo || ''}
                  onChange={(e) => setNovoBloqueio({ ...novoBloqueio, motivo: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Bloqueios Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {!bloqueiosHorario || bloqueiosHorario.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum bloqueio de horário configurado
                </p>
              ) : (
                <div className="w-full space-y-3">
                  {bloqueiosHorario?.map((bloqueio) => (
                    <div key={bloqueio.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="destructive">
                          {new Date(bloqueio.data).toLocaleDateString('pt-BR')}
                        </Badge>
                        <span className="font-medium">
                          {bloqueio.hora_inicio} - {bloqueio.hora_fim}
                        </span>
                        {bloqueio.motivo && (
                          <span className="text-sm text-muted-foreground">
                            ({bloqueio.motivo})
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoverBloqueio(bloqueio.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoHorariosPage;