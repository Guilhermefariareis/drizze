import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ClinicNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  admin_response_data?: any;
  parcelamais_response_data?: any;
  created_at: string;
  loan_request_id: string;
}

export default function ClinicNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ClinicNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<ClinicNotification | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // Primeiro buscar a clínica do usuário
      const { data: clinic, error: clinicError } = await supabase
        .from('clinics')
        .select('id')
        .eq('owner_id', user?.id)
        .maybeSingle();

      if (clinicError) throw clinicError;
      if (!clinic) {
        setNotifications([]);
        return;
      }

      const { data, error } = await supabase
        .from('clinic_notifications')
        .select('*')
        .eq('clinic_id', clinic.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('clinic_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success text-success-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div>Carregando notificações...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Doutorizze
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma notificação disponível
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  !notification.is_read ? 'bg-muted/50 border-primary' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Badge className={getTypeColor(notification.type)} variant="outline">
                          {notification.type}
                        </Badge>
                        {!notification.is_read && (
                          <Badge variant="destructive" className="text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedNotification(notification);
                            if (!notification.is_read) {
                              markAsRead(notification.id);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getIcon(notification.type)}
                            {notification.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Mensagem:</h4>
                            <p className="text-sm">{notification.message}</p>
                          </div>
                          
                          {notification.admin_response_data && (
                            <div>
                              <h4 className="font-semibold mb-2">Resposta da Administração:</h4>
                              <div className="bg-muted p-3 rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(notification.admin_response_data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {notification.parcelamais_response_data && (
                            <div>
                              <h4 className="font-semibold mb-2">Resposta do Doutorizze:</h4>
                              <div className="bg-muted p-3 rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {JSON.stringify(notification.parcelamais_response_data, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Recebido em: {new Date(notification.created_at).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}