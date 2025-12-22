import { useState } from 'react';
import { ArrowLeft, Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotificacoesPage = () => {
  const navigate = useNavigate();
  const { notificacoes, carregando, marcarComoLida, marcarTodasComoLidas } = useNotificacoes();
  const [filtro, setFiltro] = useState<'todas' | 'nao_lidas' | 'lidas'>('todas');

  const notificacoesFiltradas = notificacoes.filter(notif => {
    if (filtro === 'nao_lidas') return !notif.lida;
    if (filtro === 'lidas') return notif.lida;
    return true;
  });

  const handleMarcarComoLida = async (id: string) => {
    try {
      await marcarComoLida(id);
      toast.success('Notificação marcada como lida');
    } catch (error) {
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      await marcarTodasComoLidas();
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas as notificações como lidas');
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'confirmacao':
        return 'bg-green-100 text-green-800';
      case 'lembrete':
        return 'bg-blue-100 text-blue-800';
      case 'cancelamento':
        return 'bg-red-100 text-red-800';
      case 'reagendamento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'confirmacao':
        return 'Confirmação';
      case 'lembrete':
        return 'Lembrete';
      case 'cancelamento':
        return 'Cancelamento';
      case 'reagendamento':
        return 'Reagendamento';
      default:
        return 'Notificação';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-primary" />
                Notificações
              </h1>
              <p className="text-gray-600 mt-1">
                Acompanhe suas notificações de agendamentos
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filtro */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {filtro === 'todas' ? 'Todas' : filtro === 'nao_lidas' ? 'Não lidas' : 'Lidas'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFiltro('todas')}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('nao_lidas')}>
                  Não lidas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltro('lidas')}>
                  Lidas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marcar todas como lidas */}
            {notificacoes.some(n => !n.lida) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarTodasComoLidas}
                disabled={carregando}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notificacoes.length}</p>
                </div>
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Não lidas</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {notificacoes.filter(n => !n.lida).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lidas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {notificacoes.filter(n => n.lida).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Suas Notificações</span>
              <Badge variant="secondary">
                {notificacoesFiltradas.length} {notificacoesFiltradas.length === 1 ? 'notificação' : 'notificações'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {carregando ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando notificações...</p>
              </div>
            ) : notificacoesFiltradas.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filtro === 'todas' ? 'Nenhuma notificação' : 
                   filtro === 'nao_lidas' ? 'Nenhuma notificação não lida' : 
                   'Nenhuma notificação lida'}
                </h3>
                <p className="text-gray-500">
                  {filtro === 'todas' ? 'Você não possui notificações ainda.' : 
                   filtro === 'nao_lidas' ? 'Todas as suas notificações foram lidas.' : 
                   'Você não possui notificações lidas.'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-gray-200">
                  {notificacoesFiltradas.map((notificacao, index) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notificacao.lida ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge
                              variant="secondary"
                              className={getTipoColor(notificacao.tipo)}
                            >
                              {getTipoLabel(notificacao.tipo)}
                            </Badge>
                            {!notificacao.lida && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {notificacao.titulo}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {notificacao.mensagem}
                          </p>
                          
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notificacao.data_envio), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notificacao.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarcarComoLida(notificacao.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificacoesPage;