import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Agendamento, useAgendamentos } from '@/hooks/useAgendamentos';
import { ptBR } from 'date-fns/locale';
import { format, parseISO, isToday, isSameDay } from 'date-fns';
import {
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    Stethoscope,
    Check,
    X,
    Edit,
    Phone,
    MessageSquare,
    AlertCircle,
    MoreVertical,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// Componente Principal
export function AgendamentosManagerV2() {
    const { agendamentos, loading, buscarAgendamentos, confirmarAgendamento, cancelarAgendamento } = useAgendamentos();
    const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('todos');

    // Estado para visualização da Agenda
    const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

    // Filtragem Principal
    const filteredAgendamentos = agendamentos.filter(a => {
        const matchesSearch = a.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.profissional?.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || a.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Agendamentos da data selecionada para a Agenda (Bottom View)
    const agendaDoDia = agendamentos.filter(a =>
        isSameDay(parseISO(a.data_hora), dataSelecionada)
    ).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());

    // Próximos 7 dias para navegação
    const diasAgenda = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
    });

    // Selecionar o primeiro automaticamente ao carregar
    useEffect(() => {
        if (!selectedAgendamento && filteredAgendamentos.length > 0) {
            setSelectedAgendamento(filteredAgendamentos[0]);
        }
    }, [loading, filteredAgendamentos]);

    const handleConfirmar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await confirmarAgendamento(id);
            toast.success('Agendamento confirmado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao confirmar agendamento.');
        }
    };

    const handleCancelar = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                await cancelarAgendamento(id, 'Cancelado pelo painel da clínica');
                toast.success('Agendamento cancelado.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro ao cancelar.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'pendente': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'concluido': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const safeDate = (dateString: string | undefined, fmt: string) => {
        if (!dateString) return '--';
        try {
            return format(parseISO(dateString), fmt, { locale: ptBR });
        } catch {
            return '--';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4 p-1 overflow-hidden">

            {/* AREA SUPERIOR: SPLIT VIEW (LISTA + DETALHES) */}
            <div className="flex flex-1 gap-6 min-h-0">

                {/* LEFT SIDEBAR: LISTA DE AGENDAMENTOS */}
                <div className="w-1/3 flex flex-col gap-4 bg-[#1A1A2E]/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 min-h-0">
                    {/* Header da Lista */}
                    <div className="space-y-4 shrink-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Agendamentos
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* Real-time Indicator */}
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    LIVE
                                </span>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                    {filteredAgendamentos.length}
                                </Badge>
                            </div>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Buscar paciente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['todos', 'pendente', 'confirmado', 'concluido'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista Scrollável */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredAgendamentos.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                Nenhum agendamento encontrado.
                            </div>
                        ) : (
                            filteredAgendamentos.map((agendamento) => (
                                <div
                                    key={agendamento.id}
                                    onClick={() => setSelectedAgendamento(agendamento)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 group relative ${selectedAgendamento?.id === agendamento.id
                                        ? 'bg-white/10 border-primary/50 shadow-lg shadow-primary/5'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    {/* Indicador de Seleção */}
                                    {selectedAgendamento?.id === agendamento.id && (
                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                                    )}

                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-white/10">
                                                {agendamento.paciente?.nome?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium text-sm leading-tight ${selectedAgendamento?.id === agendamento.id ? 'text-white' : 'text-gray-200'
                                                    }`}>
                                                    {agendamento.paciente?.nome || 'Paciente Desconhecido'}
                                                </h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {safeDate(agendamento.data_hora, "HH:mm")}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`text-[10px] px-2 h-5 ${getStatusColor(agendamento.status)}`}>
                                            {agendamento.status}
                                        </Badge>
                                    </div>

                                    {/* Quick Actions Hover */}
                                    <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                        {agendamento.status === 'pendente' && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                                onClick={(e) => handleConfirmar(agendamento.id, e)}
                                                title="Confirmar agora"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT MAIN: DETALHES + PAINEL DE AÇÃO */}
                <div className="flex-1 bg-[#1A1A2E]/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden min-h-0 overflow-y-auto custom-scrollbar">
                    {selectedAgendamento ? (
                        <>
                            {/* Top Toolbar - AÇÕES RÁPIDAS e PERMANENTES */}
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                                <div>
                                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {selectedAgendamento.paciente?.nome}
                                        <Badge variant="outline" className={`${getStatusColor(selectedAgendamento.status)} text-sm px-3 py-1`}>
                                            {selectedAgendamento.status.toUpperCase()}
                                        </Badge>
                                    </h1>
                                    <p className="text-gray-400 flex items-center gap-2 mt-2 text-base">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        {safeDate(selectedAgendamento.data_hora, "dd 'de' MMMM 'de' yyyy")}
                                        <span className="w-1 h-1 bg-gray-600 rounded-full mx-2" />
                                        <Clock className="w-4 h-4 text-primary" />
                                        {safeDate(selectedAgendamento.data_hora, "HH:mm")}
                                    </p>
                                </div>

                                {/* ACTION BUTTONS */}
                                <div className="flex items-center gap-3">
                                    {selectedAgendamento.status === 'pendente' && (
                                        <Button
                                            onClick={(e) => handleConfirmar(selectedAgendamento.id, e)}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-11 px-6 font-semibold"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Confirmar Agendamento
                                        </Button>
                                    )}

                                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-11">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Remarcar
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11"
                                        onClick={(e) => handleCancelar(selectedAgendamento.id, e)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>

                            {/* Content Body - Informações Detalhadas */}
                            <div className="grid grid-cols-2 gap-8">
                                {/* Coluna 1: Dados do Serviço */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Stethoscope className="w-4 h-4" />
                                            Detalhes do Serviço
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Procedimento</p>
                                                <p className="text-lg font-medium text-white">{selectedAgendamento.servico?.nome || 'Consulta Geral'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Profissional</p>
                                                    <p className="text-white flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5 text-primary" />
                                                        {selectedAgendamento.profissional?.nome}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Duração</p>
                                                    <p className="text-white flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                                        {selectedAgendamento.servico?.duracao_minutos || 60} min
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Valor</p>
                                                <p className="text-xl font-bold text-emerald-400">
                                                    {selectedAgendamento.servico?.preco
                                                        ? `R$ ${selectedAgendamento.servico.preco.toFixed(2)}`
                                                        : 'A combinar'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            Observações
                                        </h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {selectedAgendamento.observacoes || 'Nenhuma observação registrada para este agendamento.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Coluna 2: Dados do Paciente */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Paciente
                                        </h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
                                                {selectedAgendamento.paciente?.nome?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-white">{selectedAgendamento.paciente?.nome}</p>
                                                <p className="text-sm text-gray-400">Paciente Frequente</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Telefone</p>
                                                    <p className="text-sm text-white">{selectedAgendamento.paciente?.telefone || '(00) 00000-0000'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="text-sm text-white">{selectedAgendamento.paciente?.email || 'email@exemplo.com'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <Calendar className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Selecione um agendamento</p>
                            <p className="text-sm">Clique na lista à esquerda para ver detalhes e ações.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* AGENDA VIEW (NEW BOTTOM SECTION) */}
            <div className="h-[30%] bg-[#1A1A2E]/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 flex flex-col">
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <Calendar className="w-4 h-4" />
                    Agenda Diária
                </h3>

                <div className="flex gap-4 h-full">
                    {/* Navegação de Dias */}
                    <div className="flex flex-col gap-2 min-w-[100px] overflow-y-auto pr-2 custom-scrollbar">
                        {diasAgenda.map(dia => {
                            const selected = isSameDay(dia, dataSelecionada);
                            return (
                                <button
                                    key={dia.toISOString()}
                                    onClick={() => setDataSelecionada(dia)}
                                    className={`p-2 rounded-lg text-left transition-all ${selected
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <p className="text-xs font-bold uppercase">{format(dia, 'EEE', { locale: ptBR })}</p>
                                    <p className="text-lg font-bold">{format(dia, 'd')}</p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Linha do Tempo / Agenda */}
                    <div className="flex-1 bg-black/20 rounded-xl p-3 overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center gap-4">
                        {agendaDoDia.length === 0 ? (
                            <div className="w-full text-center text-gray-500 text-sm flex items-center justify-center h-full">
                                Nenhum agendamento para este dia.
                            </div>
                        ) : (
                            agendaDoDia.map(agendamento => (
                                <div
                                    key={agendamento.id}
                                    onClick={() => setSelectedAgendamento(agendamento)}
                                    className={`inline-flex flex-col min-w-[140px] p-3 rounded-xl border cursor-pointer hover:scale-105 transition-transform ${selectedAgendamento?.id === agendamento.id
                                            ? 'bg-white/10 border-primary shadow-lg shadow-primary/10'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <p className="text-sm font-bold text-white mb-1">
                                        {safeDate(agendamento.data_hora, 'HH:mm')}
                                    </p>
                                    <p className="text-xs font-medium text-gray-300 truncate max-w-[120px]">
                                        {agendamento.paciente?.nome}
                                    </p>
                                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                        {agendamento.servico?.nome}
                                    </p>
                                    <div className={`mt-2 h-1 rounded-full w-full ${agendamento.status === 'confirmado' ? 'bg-emerald-500' :
                                            agendamento.status === 'pendente' ? 'bg-blue-500' :
                                                'bg-gray-500'
                                        }`} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
