import React from 'react';
import { Bell, Check, CheckCheck, Calendar, Clock, X, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificacoesDropdown: React.FC = () => {
  const {
    notificacoes,
    loading,
    naoLidas,
    marcarComoLida,
    marcarTodasComoLidas
  } = useNotificacoes();

  const getIconeNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'confirmacao':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'lembrete':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelamento':
        return <X className="h-4 w-4 text-red-600" />;
      case 'reagendamento':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCorNotificacao = (tipo: string) => {
    switch (tipo) {
      case 'confirmacao':
        return 'border-l-green-500';
      case 'lembrete':
        return 'border-l-blue-500';
      case 'cancelamento':
        return 'border-l-red-500';
      case 'reagendamento':
        return 'border-l-orange-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatarDataRelativa = (data: string) => {
    try {
      return formatDistanceToNow(new Date(data), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {naoLidas > 99 ? '99+' : naoLidas}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLidas}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            Carregando notificações...
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            Nenhuma notificação encontrada
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notificacoes.map((notificacao) => (
              <DropdownMenuItem
                key={notificacao.id}
                className={`p-0 cursor-pointer ${!notificacao.lida ? 'bg-blue-50' : ''}`}
                onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
              >
                <div className={`w-full p-3 border-l-4 ${getCorNotificacao(notificacao.tipo)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIconeNotificacao(notificacao.tipo)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium truncate ${
                          !notificacao.lida ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notificacao.titulo}
                        </h4>
                        {!notificacao.lida && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      
                      {notificacao.agendamento && (
                        <div className="text-xs text-gray-500 mb-1">
                          <span className="font-medium">
                            {notificacao.agendamento.clinic_credentials?.clinic_name}
                          </span>
                          {' • '}
                          <span>
                            {new Date(notificacao.agendamento.data_hora).toLocaleDateString('pt-BR')}
                          </span>
                          {' às '}
                          <span>{notificacao.agendamento.horario}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        {formatarDataRelativa(notificacao.data_envio)}
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        {notificacoes.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-blue-600 hover:text-blue-800">
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificacoesDropdown;