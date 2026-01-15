import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Phone, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Agendamento {
  id: string;
  data_hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'no_show';
  observacoes: string | null;
  valor: number | null;
  tipo_consulta: string;
  codigo_confirmacao: string | null;
  clinicas: {
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
  servico: {
    nome: string;
    valor: number | null;
    duracao_minutos: number | null;
  } | null;
  profissional: {
    id: string;
    profiles: {
      nome: string;
    } | null;
    especialidade?: string | null;
  } | null;
}

const MeusAgendamentos = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAgendamentos();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscription real-time para atualizações automáticas
    const setupSubscription = async () => {
      // Buscar o profile primeiro
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'agendamentos',
            filter: `paciente_id=eq.${profile.id}`
          },
          () => {
            console.log('🔄 [Realtime] Mudança detectada nos agendamentos. Atualizando...');
            fetchAgendamentos();
          }
        )
        .subscribe();

      return channel;
    };

    const subscriptionPromise = setupSubscription();

    return () => {
      subscriptionPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [user]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);

      console.log('🔍 [MeusAgendamentos] Buscando agendamentos para usuário:', user?.id);

      // Primeiro buscar o profile do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil do usuário:', profileError);
        toast.error('Erro ao carregar dados do perfil');
        return;
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clinicas:clinics(name, phone, address),
          servico:servico_id(nome, valor, duracao_minutos),
          profissional:profissional_id(id, profiles(nome:full_name))
        `)
        .eq('paciente_id', profile.id)
        .order('data_hora', { ascending: false });

      console.log('🔍 [MeusAgendamentos] Resultado da query:', { data, error, userID: user?.id });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        toast.error('Erro ao carregar agendamentos');
        return;
      }

      setAgendamentos(((data as any) as Agendamento[]) || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAgendamento = async (agendamentoId: string) => {
    try {
      setCancellingId(agendamentoId);

      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', agendamentoId);

      if (error) {
        console.error('Erro ao cancelar agendamento:', error);
        toast.error('Erro ao cancelar agendamento');
        return;
      }

      toast.success('Agendamento cancelado com sucesso');
      fetchAgendamentos(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' },
      confirmado: { label: 'Confirmado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' },
      cancelado: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' },
      concluido: { label: 'Concluído', className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]' },
      no_show: { label: 'Reagendado', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return (
      <Badge variant="outline" className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const canCancelAgendamento = (status: string, dataHora: string) => {
    const agendamentoDate = new Date(dataHora);
    const now = new Date();
    return (status === 'pendente' || status === 'confirmado') && agendamentoDate > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center group">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)]"></div>
          <p className="text-gray-400 font-medium animate-pulse">Carregando seus agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Meus Agendamentos</h1>
              <p className="text-gray-400 text-lg">Gerencie suas consultas de forma simples e rápida.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/search'}
              className="bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all px-6 h-12"
            >
              Novo Agendamento
            </Button>
          </div>

          {agendamentos.length === 0 ? (
            <Card className="bg-[#141416]/60 backdrop-blur-xl border-white/5 text-center py-20 shadow-2xl">
              <CardContent>
                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20 shadow-inner">
                  <Calendar className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  Inicie sua jornada de saúde
                </h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Você ainda não possui consultas agendadas. Clique no botão acima para encontrar a clínica ideal.
                </p>
                <Button
                  onClick={() => window.location.href = '/search'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all hover:scale-[1.02]"
                >
                  Buscar Clínicas
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {agendamentos.map((agendamento) => {
                const { date, time } = formatDateTime(agendamento.data_hora);
                return (
                  <Card key={agendamento.id} className="bg-[#141416]/60 backdrop-blur-xl border-white/5 hover:border-indigo-500/30 transition-all duration-300 group shadow-lg">
                    <CardHeader className="pb-4 border-b border-white/5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                            <MapPin className="h-6 w-6 text-indigo-500" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {agendamento.clinicas?.name || 'Clínica não informada'}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-indigo-500/5 text-indigo-400 border-indigo-500/20 uppercase tracking-wider text-[10px] font-bold">
                                {agendamento.tipo_consulta.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(agendamento.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Data</p>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{date}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Horário</p>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            <span className="font-medium">{time}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Investimento</p>
                          <div className="flex items-center gap-2 text-emerald-400">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">
                              {formatPrice(agendamento.valor || agendamento.servico?.valor || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase font-semibold">Contato</p>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm truncate">{agendamento.clinicas?.phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Serviço & Especialista</p>
                            <h4 className="text-lg font-bold text-white">
                              {agendamento.servico?.nome || agendamento.tipo_consulta.replace('_', ' ').toUpperCase()}
                            </h4>
                            {agendamento.profissional && (
                              <p className="text-sm text-indigo-400 font-medium mt-1">
                                Dr(a). {(agendamento.profissional as any).profiles?.nome || 'Especialista'}
                              </p>
                            )}
                          </div>

                          {agendamento.codigo_confirmacao && (
                            <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-center">
                              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Check-in</p>
                              <span className="text-xl font-mono font-bold text-white tracking-widest">{agendamento.codigo_confirmacao}</span>
                            </div>
                          )}
                        </div>

                        {agendamento.clinicas?.address && (
                          <div className="flex items-start gap-3 pt-2 border-t border-white/5 mt-2">
                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-400 leading-relaxed italic">
                              {agendamento.clinicas.address}
                            </span>
                          </div>
                        )}

                        {agendamento.observacoes && (
                          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl mt-4">
                            <p className="text-sm text-amber-200/70 italic">
                              <strong className="text-amber-400 not-italic mr-2">Nota:</strong> {agendamento.observacoes}
                            </p>
                          </div>
                        )}
                      </div>

                      {canCancelAgendamento(agendamento.status, agendamento.data_hora) && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelAgendamento(agendamento.id)}
                            disabled={cancellingId === agendamento.id}
                            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all font-medium"
                          >
                            {cancellingId === agendamento.id ? (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                Cancelando...
                              </div>
                            ) : 'Cancelar Agendamento'}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/5 bg-[#0d0d0f]">
        <Footer />
      </div>
    </div>
  );
};

export default MeusAgendamentos;
