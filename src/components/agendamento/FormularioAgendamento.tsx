import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Save, X, Loader2, User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useHorariosDisponiveis } from '@/hooks/useHorariosDisponiveisSimples';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco: number;
}

interface AgendamentoData {
  id?: string;
  servico_id: string;
  paciente_id?: string;
  paciente_dados_id?: string;
  clinica_id: string;
  profissional_id?: string;
  data_hora: string;
  horario: string;
  status?: 'pendente' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  valor?: number;
  tipo_agendamento?: 'interno' | 'paciente';
  nome_paciente?: string;
  telefone_paciente?: string;
  email_paciente?: string;
}

interface FormularioAgendamentoProps {
  clinicaId: string;
  agendamento?: AgendamentoData;
  onSalvar: (agendamento: AgendamentoData) => Promise<void>;
  onCancelar: () => void;
  modo?: 'criar' | 'editar';
  hideTypeSelection?: boolean;
}

const FormularioAgendamento: React.FC<FormularioAgendamentoProps> = ({
  clinicaId,
  agendamento,
  onSalvar,
  onCancelar,
  modo = 'criar',
  hideTypeSelection = false
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<AgendamentoData>({
    servico_id: hideTypeSelection ? '' : '',
    clinica_id: clinicaId || '',
    profissional_id: '',
    paciente_id: user?.id || '',
    data_hora: '',
    horario: '',
    observacoes: '',
    valor: 0,
    tipo_agendamento: hideTypeSelection ? 'interno' : 'paciente',
    nome_paciente: '',
    telefone_paciente: '',
    email_paciente: '',
    ...agendamento
  });



  // Atualizar clinica_id no formData quando clinicaId prop mudar
  useEffect(() => {
    if (clinicaId && clinicaId !== formData.clinica_id) {
      setFormData(prev => ({ ...prev, clinica_id: clinicaId }));
    }
  }, [clinicaId, formData.clinica_id]);

  // Atualizar formData quando prop agendamento muda (para modo de edição)
  useEffect(() => {
    if (agendamento && modo === 'editar') {
      setFormData(prev => ({
        ...prev,
        ...agendamento,
        data_hora: agendamento.data_hora || '',
        horario: agendamento.horario || '',
        tipo_agendamento: agendamento.tipo_agendamento || 'paciente'
      }));
    }
  }, [agendamento, modo]);

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<Array<{ horario: string; disponivel: boolean }>>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});



  const { obterHorariosDisponiveis } = useHorariosDisponiveis(clinicaId);

  // Carregar dados do perfil do usuário para pre-fill
  useEffect(() => {
    const carregarPerfil = async () => {
      // Só pre-encher se o usuário estiver logado e os campos estiverem vazios
      if (user && (!formData.nome_paciente || !formData.email_paciente || !formData.telefone_paciente)) {
        try {
          // Buscar perfil do usuário logado
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Erro ao buscar perfil para pre-fill:', error);
            return;
          }

          if (data) {
            setFormData(prev => ({
              ...prev,
              nome_paciente: prev.nome_paciente || data.full_name || '',
              email_paciente: prev.email_paciente || data.email || user.email || '',
              telefone_paciente: prev.telefone_paciente || data.phone || ''
            }));
          } else if (user.email && !formData.email_paciente) {
            // Fallback para o email do auth se o perfil não tiver ou não existir
            setFormData(prev => ({
              ...prev,
              email_paciente: prev.email_paciente || user.email || ''
            }));
          }
        } catch (err) {
          console.error('Erro na carga de perfil para pre-fill:', err);
        }
      }
    };

    carregarPerfil();
  }, [user]); // Depender apenas do user para pre-fill inicial

  // Carregar dados iniciais (serviços e profissionais)
  useEffect(() => {
    const carregarDados = async () => {
      if (!clinicaId) {
        setLoadingData(false);
        return;
      }

      try {
        // Só carregar serviços se não for formulário interno
        if (!hideTypeSelection) {
          const { data: servicosData, error: servicosError } = await (supabase as any).from('servicos')
            .select('*')
            .eq('clinic_id', clinicaId);

          if (servicosError) throw servicosError;
          setServicos(servicosData || []);
        }

        // Carregar profissionais
        const { data: profissionaisData, error: profissionaisError } = await supabase
          .from('clinic_professionals')
          .select(`
              *,
              profiles!inner(full_name)
            `)
          .eq('clinic_id', clinicaId);

        if (profissionaisError) throw profissionaisError;
        setProfissionais(profissionaisData || []);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do formulário');
      } finally {
        setLoadingData(false);
      }
    };

    carregarDados();
  }, [clinicaId, hideTypeSelection]);

  // Efeito para carregar horários quando data mudar
  useEffect(() => {
    const carregarHorarios = async () => {
      if (!formData.data_hora || !clinicaId) {
        setHorariosDisponiveis([]);
        return;
      }

      setLoadingHorarios(true);

      // Timeout de 5 segundos para evitar loading infinito
      const timeoutId = setTimeout(() => {
        console.error('Timeout ao carregar horários - usando horários padrão');
        setHorariosDisponiveis([]);
        setLoadingHorarios(false);
      }, 5000);

      try {
        // Formatar a data corretamente (YYYY-MM-DD)
        const data = new Date(formData.data_hora);
        const dataFormatada = data instanceof Date && !isNaN(data.getTime())
          ? data.toISOString().split('T')[0]
          : formData.data_hora.split('T')[0];

        // Simplificar: sempre carregar horários quando tiver data
        const profissionalId = formData.profissional_id === 'any' ? undefined : formData.profissional_id;

        const horarios = await obterHorariosDisponiveis(dataFormatada, profissionalId);
        clearTimeout(timeoutId);
        setHorariosDisponiveis(horarios);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        clearTimeout(timeoutId);
        setHorariosDisponiveis([]);
      } finally {
        clearTimeout(timeoutId);
        setLoadingHorarios(false);
      }
    };

    carregarHorarios();
  }, [formData.data_hora, clinicaId, obterHorariosDisponiveis]);

  const handleInputChange = (field: keyof AgendamentoData, value: any) => {
    if (field === 'horario' && value && formData.data_hora) {
      const dataAtual = formData.data_hora.split('T')[0];
      const novaDataHora = `${dataAtual}T${value}:00`;
      setFormData(prev => ({ ...prev, [field]: value, data_hora: novaDataHora }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.data_hora) newErrors.data_hora = 'Data é obrigatória';
    if (!formData.horario) newErrors.horario = 'Horário é obrigatório';
    if (!formData.servico_id && !hideTypeSelection) newErrors.servico_id = 'Serviço é obrigatório';
    if (!formData.profissional_id && !hideTypeSelection) newErrors.profissional_id = 'Profissional é obrigatório'; // Tornar opcional para agendamento interno

    if (formData.tipo_agendamento === 'paciente') {
      if (!formData.nome_paciente?.trim()) newErrors.nome_paciente = 'Nome do paciente é obrigatório';
      if (!formData.telefone_paciente?.trim()) newErrors.telefone_paciente = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      // Para agendamento interno, não precisa de serviço ou profissional
      const servicoSelecionado = !hideTypeSelection ? servicos.find(s => s.id === formData.servico_id) : null;
      const valorFinal = !hideTypeSelection ? (formData.valor || (servicoSelecionado?.preco || 0)) : 0;

      let profileId = formData.paciente_id;
      let pacienteDadosId = (formData as any).paciente_dados_id;

      // 1. [FIX] Manter o User ID (Auth ID) como paciente_id para garantir compatibilidade com RLS e queries
      // O bloco anterior buscava o Profile ID (UUID aleatório) e substituía o Auth ID,
      // causando mismatch com o Dashboard que busca pelo Auth ID.

      /* 
      // Lógica antiga removida:
      if (user && formData.tipo_agendamento === 'paciente') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          profileId = profile.id;
        }
      } 
      */

      // Garantir que se for paciente logado, usa o ID do usuário
      if (user && formData.tipo_agendamento === 'paciente') {
        profileId = user.id;
      }

      // 2. Tentar encontrar ou criar o registro na tabela 'pacientes' para ter o paciente_dados_id
      // Isso é CRÍTICO para que o nome apareça na agenda da clínica
      if (formData.nome_paciente && !pacienteDadosId) {
        // Tentar buscar por telefone ou email primeiro - Usando any para evitar erro de tipo se a tabela não estiver gerada
        const { data: existente } = await (supabase as any).from('pacientes')
          .select('id')
          .or(`telefone.eq.${formData.telefone_paciente},email.eq.${formData.email_paciente}`)
          .maybeSingle();

        if (existente) {
          pacienteDadosId = existente.id;
        } else {
          // Criar novo paciente
          const { data: novo } = await (supabase as any).from('pacientes')
            .insert([{
              nome: formData.nome_paciente,
              telefone: formData.telefone_paciente,
              email: formData.email_paciente
            }])
            .select('id')
            .single();

          if (novo) {
            pacienteDadosId = novo.id;
          }
        }
      }

      const agendamentoData: any = {
        ...formData,
        paciente_id: profileId,
        paciente_dados_id: pacienteDadosId,
        clinica_id: clinicaId,
        valor: valorFinal,
        status: formData.status || 'pendente',
        tipo_agendamento: hideTypeSelection ? 'interno' : formData.tipo_agendamento,
        tipo_consulta: hideTypeSelection ? 'interno' : formData.tipo_agendamento, // Sincronizar com tipo_consulta
      };

      // Limpar campos de ID vazios para evitar erro de UUID no banco
      const dadosParaEnviar = { ...agendamentoData };
      if (!dadosParaEnviar.servico_id) delete (dadosParaEnviar as any).servico_id;
      if (!dadosParaEnviar.profissional_id || dadosParaEnviar.profissional_id === 'any') delete (dadosParaEnviar as any).profissional_id;
      if (!dadosParaEnviar.paciente_id) delete (dadosParaEnviar as any).paciente_id;
      if (!dadosParaEnviar.paciente_dados_id) delete (dadosParaEnviar as any).paciente_dados_id;

      await onSalvar(dadosParaEnviar as any);

    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      toast.error('Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };
  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {modo === 'editar' ? 'Editar Agendamento' : 'Novo Agendamento'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de agendamento - só mostrar se não for hideTypeSelection */}
            {!hideTypeSelection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_agendamento">Tipo de Agendamento</Label>
                  <Select
                    value={formData.tipo_agendamento}
                    onValueChange={(value) => handleInputChange('tipo_agendamento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paciente">Paciente</SelectItem>
                      <SelectItem value="interno">Interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Dados do Paciente - sempre mostrar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-white">Dados do Paciente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_paciente">Nome *</Label>
                  <Input
                    id="nome_paciente"
                    value={formData.nome_paciente}
                    onChange={(e) => handleInputChange('nome_paciente', e.target.value)}
                    placeholder="Nome completo do paciente"
                    className={errors.nome_paciente ? 'border-red-500' : ''}
                  />
                  {errors.nome_paciente && (
                    <p className="text-sm text-red-500">{errors.nome_paciente}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone_paciente">Telefone *</Label>
                  <Input
                    id="telefone_paciente"
                    value={formData.telefone_paciente}
                    onChange={(e) => handleInputChange('telefone_paciente', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={errors.telefone_paciente ? 'border-red-500' : ''}
                  />
                  {errors.telefone_paciente && (
                    <p className="text-sm text-red-500">{errors.telefone_paciente}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_paciente">Email</Label>
                <Input
                  id="email_paciente"
                  type="email"
                  value={formData.email_paciente}
                  onChange={(e) => handleInputChange('email_paciente', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            {/* Serviço e Profissional - só mostrar se não for agendamento interno */}
            {!hideTypeSelection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servico_id">Serviço *</Label>
                  <Select
                    value={formData.servico_id}
                    onValueChange={(value) => handleInputChange('servico_id', value)}
                  >
                    <SelectTrigger className={errors.servico_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicos.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {servico.nome}
                            <Badge variant="secondary">{formatCurrency(servico.preco)}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.servico_id && (
                    <p className="text-sm text-red-500">{errors.servico_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional_id">Profissional</Label>
                  <Select
                    value={formData.profissional_id}
                    onValueChange={(value) => handleInputChange('profissional_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer profissional</SelectItem>
                      {profissionais.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {prof.profiles?.full_name || 'Profissional'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Data e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_hora">Data *</Label>
                <Input
                  id="data_hora"
                  type="date"
                  value={formData.data_hora ? formData.data_hora.split('T')[0] : ''}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const novaData = e.target.value;
                    if (novaData) {
                      const dataHora = formData.horario
                        ? `${novaData}T${formData.horario}:00`
                        : `${novaData}T00:00:00`;
                      handleInputChange('data_hora', dataHora);
                    } else {
                      handleInputChange('data_hora', '');
                    }
                  }}
                  className={errors.data_hora ? 'border-red-500' : ''}
                />
                {errors.data_hora && (
                  <p className="text-sm text-red-500">{errors.data_hora}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horário *</Label>
                <Select
                  value={formData.horario}
                  onValueChange={(value) => handleInputChange('horario', value)}
                  disabled={loadingHorarios}
                >
                  <SelectTrigger className={errors.horario ? 'border-red-500' : ''}>
                    <SelectValue placeholder={loadingHorarios ? "Carregando horários..." : "Selecione um horário"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingHorarios ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          Carregando horários...
                        </div>
                      </SelectItem>
                    ) : horariosDisponiveis.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Nenhum horário disponível
                      </SelectItem>
                    ) : (
                      horariosDisponiveis.map((item) => (
                        <SelectItem
                          key={item.horario}
                          value={item.horario}
                          disabled={!item.disponivel}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {item.horario}
                            {!item.disponivel && (
                              <Badge variant="secondary" className="text-xs">
                                Ocupado
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.horario && (
                  <p className="text-sm text-red-500">{errors.horario}</p>
                )}
              </div>
            </div>

            {/* Descrição do Agendamento - só para agendamento interno */}
            {hideTypeSelection && (
              <div className="space-y-2">
                <Label htmlFor="descricao_agendamento">Descrição do Agendamento</Label>
                <Textarea
                  id="descricao_agendamento"
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Descreva o motivo do agendamento interno..."
                  rows={3}
                />
              </div>
            )}

            {/* Observações - para todos os tipos */}
            {!hideTypeSelection && (
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {modo === 'editar' ? 'Atualizando...' : 'Confirmando...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {modo === 'editar' ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancelar}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* TESTE DE HORÁRIOS - AGORA VAI FUNCIONAR! */}

    </div>
  );
}

// Função auxiliar para formatar moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default FormularioAgendamento;