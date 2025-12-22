import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface FiltrosBusca {
  termo: string;
  status: string[];
  dataInicio?: Date;
  dataFim?: Date;
  profissional?: string;
  servico?: string;
  periodo: 'todos' | 'hoje' | 'amanha' | 'semana' | 'mes' | 'personalizado';
}

interface BuscaAvancadaProps {
  filtros: FiltrosBusca;
  onFiltrosChange: (filtros: FiltrosBusca) => void;
  profissionais?: Array<{ id: string; nome: string }>;
  servicos?: Array<{ id: string; nome: string }>;
  className?: string;
  compactMode?: boolean;
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  { value: 'concluido', label: 'Concluído', color: 'bg-purple-100 text-purple-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

const periodoOptions = [
  { value: 'todos', label: 'Todos os períodos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'amanha', label: 'Amanhã' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
  { value: 'personalizado', label: 'Período personalizado' }
];

export function BuscaAvancada({
  filtros,
  onFiltrosChange,
  profissionais = [],
  servicos = [],
  className,
  compactMode = false
}: BuscaAvancadaProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFiltros, setTempFiltros] = useState<FiltrosBusca>(filtros);

  useEffect(() => {
    setTempFiltros(filtros);
  }, [filtros]);

  const handleTermoChange = (termo: string) => {
    const novosFiltros = { ...tempFiltros, termo };
    setTempFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handleStatusToggle = (status: string) => {
    const novosStatus = tempFiltros.status.includes(status)
      ? tempFiltros.status.filter(s => s !== status)
      : [...tempFiltros.status, status];
    
    const novosFiltros = { ...tempFiltros, status: novosStatus };
    setTempFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handlePeriodoChange = (periodo: string) => {
    const novosFiltros = { 
      ...tempFiltros, 
      periodo: periodo as FiltrosBusca['periodo'],
      ...(periodo !== 'personalizado' && { dataInicio: undefined, dataFim: undefined })
    };
    setTempFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const handleFiltroChange = (campo: keyof FiltrosBusca, valor: any) => {
    const novosFiltros = { ...tempFiltros, [campo]: valor };
    setTempFiltros(novosFiltros);
    onFiltrosChange(novosFiltros);
  };

  const limparFiltros = () => {
    const filtrosLimpos: FiltrosBusca = {
      termo: '',
      status: [],
      periodo: 'todos',
      dataInicio: undefined,
      dataFim: undefined,
      profissional: undefined,
      servico: undefined
    };
    setTempFiltros(filtrosLimpos);
    onFiltrosChange(filtrosLimpos);
  };

  const contarFiltrosAtivos = () => {
    let count = 0;
    if (tempFiltros.termo) count++;
    if (tempFiltros.status.length > 0) count++;
    if (tempFiltros.periodo !== 'todos') count++;
    if (tempFiltros.profissional) count++;
    if (tempFiltros.servico) count++;
    return count;
  };

  const filtrosAtivos = contarFiltrosAtivos();

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className={cn('p-4', compactMode && 'p-3')}>
        {/* Busca principal */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por paciente, email, telefone..."
              value={tempFiltros.termo}
              onChange={(e) => handleTermoChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {filtrosAtivos > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {filtrosAtivos}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filtros Avançados</h4>
                    {filtrosAtivos > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={limparFiltros}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <Badge
                          key={status.value}
                          variant={tempFiltros.status.includes(status.value) ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-colors',
                            tempFiltros.status.includes(status.value) && status.color
                          )}
                          onClick={() => handleStatusToggle(status.value)}
                        >
                          {status.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Período */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Período</label>
                    <Select value={tempFiltros.periodo} onValueChange={handlePeriodoChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {periodoOptions.map((periodo) => (
                          <SelectItem key={periodo.value} value={periodo.value}>
                            {periodo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Datas personalizadas */}
                  {tempFiltros.periodo === 'personalizado' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Data início</label>
                        <Input
                          type="date"
                          value={tempFiltros.dataInicio ? format(tempFiltros.dataInicio, 'yyyy-MM-dd') : ''}
                          onChange={(e) => handleFiltroChange('dataInicio', e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Data fim</label>
                        <Input
                          type="date"
                          value={tempFiltros.dataFim ? format(tempFiltros.dataFim, 'yyyy-MM-dd') : ''}
                          onChange={(e) => handleFiltroChange('dataFim', e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Profissional */}
                  {profissionais.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Profissional</label>
                      <Select 
                        value={tempFiltros.profissional || ''} 
                        onValueChange={(value) => handleFiltroChange('profissional', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os profissionais" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os profissionais</SelectItem>
                          {profissionais.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Serviço */}
                  {servicos.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Serviço</label>
                      <Select 
                        value={tempFiltros.servico || ''} 
                        onValueChange={(value) => handleFiltroChange('servico', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os serviços" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos os serviços</SelectItem>
                          {servicos.map((servico) => (
                            <SelectItem key={servico.id} value={servico.id}>
                              {servico.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Filtros ativos */}
        {filtrosAtivos > 0 && (
          <div className="flex flex-wrap gap-2">
            {tempFiltros.termo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                "{tempFiltros.termo}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleTermoChange('')}
                />
              </Badge>
            )}
            
            {tempFiltros.status.map((status) => {
              const statusConfig = statusOptions.find(s => s.value === status);
              return (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  {statusConfig?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleStatusToggle(status)}
                  />
                </Badge>
              );
            })}
            
            {tempFiltros.periodo !== 'todos' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {periodoOptions.find(p => p.value === tempFiltros.periodo)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handlePeriodoChange('todos')}
                />
              </Badge>
            )}
            
            {tempFiltros.profissional && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {profissionais.find(p => p.id === tempFiltros.profissional)?.nome}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFiltroChange('profissional', undefined)}
                />
              </Badge>
            )}
            
            {tempFiltros.servico && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {servicos.find(s => s.id === tempFiltros.servico)?.nome}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFiltroChange('servico', undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BuscaAvancada;