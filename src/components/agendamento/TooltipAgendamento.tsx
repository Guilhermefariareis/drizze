import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Stethoscope, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TooltipAgendamentoProps {
  agendamento: {
    id: string;
    status: string;
    paciente_nome: string;
    servico_nome: string;
    valor?: number;
    data_hora: string;
    observacoes?: string;
  };
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TooltipAgendamento: React.FC<TooltipAgendamentoProps> = ({
  agendamento,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    
    let x = rect.left + rect.width / 2;
    let y = rect.top;
    
    // Ajustar posição baseada na prop position
    switch (position) {
      case 'top':
        y = rect.top - (tooltipRect?.height || 0) - 10;
        break;
      case 'bottom':
        y = rect.bottom + 10;
        break;
      case 'left':
        x = rect.left - (tooltipRect?.width || 0) - 10;
        y = rect.top + rect.height / 2;
        break;
      case 'right':
        x = rect.right + 10;
        y = rect.top + rect.height / 2;
        break;
    }
    
    // Verificar limites da tela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (x + (tooltipRect?.width || 0) > windowWidth) {
      x = windowWidth - (tooltipRect?.width || 0) - 10;
    }
    if (x < 10) {
      x = 10;
    }
    if (y < 10) {
      y = rect.bottom + 10;
    }
    if (y + (tooltipRect?.height || 0) > windowHeight) {
      y = rect.top - (tooltipRect?.height || 0) - 10;
    }
    
    setTooltipPosition({ x, y });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-500 text-white';
      case 'confirmado':
        return 'bg-emerald-500 text-white';
      case 'cancelado':
        return 'bg-red-500 text-white';
      case 'concluido':
        return 'bg-violet-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  const formatarDataHora = (dataHora: string) => {
    try {
      const data = new Date(dataHora);
      return {
        data: format(data, 'dd/MM/yyyy', { locale: ptBR }),
        hora: format(data, 'HH:mm', { locale: ptBR }),
        diaSemana: format(data, 'EEEE', { locale: ptBR })
      };
    } catch {
      return {
        data: 'Data inválida',
        hora: '--:--',
        diaSemana: ''
      };
    }
  };

  const { data, hora, diaSemana } = formatarDataHora(agendamento.data_hora);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative inline-block w-full h-full"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: position === 'top' || position === 'bottom' 
              ? 'translateX(-50%)' 
              : position === 'left' || position === 'right'
              ? 'translateY(-50%)'
              : 'none'
          }}
        >
          <Card className="shadow-lg border-2 bg-white max-w-xs">
            <CardContent className="p-3 space-y-2">
              {/* Header com status */}
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getStatusColor(agendamento.status)}`}>
                  {getStatusLabel(agendamento.status)}
                </Badge>
                <span className="text-xs text-gray-500 capitalize">
                  {diaSemana}
                </span>
              </div>
              
              {/* Informações principais */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">
                    {agendamento.paciente_nome}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-3 w-3 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {agendamento.servico_nome}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-orange-500" />
                  <span className="text-sm text-gray-700">
                    {data} às {hora}
                  </span>
                </div>
                
                {agendamento.valor && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-emerald-500" />
                    <span className="text-sm text-gray-700">
                      R$ {agendamento.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
                
                {agendamento.observacoes && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-3 w-3 text-purple-500 mt-0.5" />
                    <span className="text-xs text-gray-600 leading-tight">
                      {agendamento.observacoes}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default TooltipAgendamento;