import { useState } from 'react';
import { MessageCircle, Phone, Video, Send, Paperclip, Search, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';

interface Chat {
  id: string;
  clinicName: string;
  clinicAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  sender: 'patient' | 'clinic';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
}

const mockChats: Chat[] = [
  {
    id: '1',
    clinicName: 'Clínica Dental doltorizze',
    clinicAvatar: '/api/placeholder/40/40',
    lastMessage: 'Seu agendamento está confirmado para amanhã às 14h',
    lastMessageTime: '10:30',
    unreadCount: 2,
    online: true,
    messages: [
      {
        id: '1',
        sender: 'patient',
        content: 'Olá, gostaria de confirmar minha consulta',
        timestamp: '10:25',
        type: 'text'
      },
      {
        id: '2',
        sender: 'clinic',
        content: 'Olá! Claro, sua consulta está confirmada para amanhã às 14h. Por favor, chegue 15 minutos antes.',
        timestamp: '10:27',
        type: 'text'
      },
      {
        id: '3',
        sender: 'clinic',
        content: 'Lembre-se de trazer um documento com foto',
        timestamp: '10:30',
        type: 'text'
      }
    ]
  },
  {
    id: '2',
    clinicName: 'Odonto Excellence',
    clinicAvatar: '/api/placeholder/40/40',
    lastMessage: 'Obrigado pela avaliação!',
    lastMessageTime: 'Ontem',
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: '1',
        sender: 'patient',
        content: 'Muito obrigado pelo excelente atendimento',
        timestamp: 'Ontem 15:20',
        type: 'text'
      },
      {
        id: '2',
        sender: 'clinic',
        content: 'Obrigado pela avaliação! Foi um prazer cuidar do seu sorriso 😊',
        timestamp: 'Ontem 15:25',
        type: 'text'
      }
    ]
  },
  {
    id: '3',
    clinicName: 'Sorriso Perfeito',
    clinicAvatar: '/api/placeholder/40/40',
    lastMessage: 'Enviamos o orçamento por email',
    lastMessageTime: '2 dias',
    unreadCount: 1,
    online: true,
    messages: [
      {
        id: '1',
        sender: 'patient',
        content: 'Gostaria de um orçamento para implante',
        timestamp: '2 dias 09:15',
        type: 'text'
      },
      {
        id: '2',
        sender: 'clinic',
        content: 'Enviamos o orçamento detalhado para seu e-mail. Qualquer dúvida, estamos à disposição!',
        timestamp: '2 dias 11:30',
        type: 'text'
      }
    ]
  }
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, message]
    });

    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mensagens</h1>
            <p className="text-muted-foreground">
              Converse diretamente com suas clínicas favoritas
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
            {/* Chat List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {filteredChats.map(chat => (
                        <div
                          key={chat.id}
                          className={`p-3 cursor-pointer hover:bg-secondary transition-colors ${selectedChat.id === chat.id ? 'bg-secondary' : ''
                            }`}
                          onClick={() => setSelectedChat(chat)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={chat.clinicAvatar} />
                                <AvatarFallback>
                                  {chat.clinicName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {chat.online && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium truncate">{chat.clinicName}</h4>
                                <span className="text-xs text-muted-foreground">
                                  {chat.lastMessageTime}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage}
                              </p>
                            </div>

                            {chat.unreadCount > 0 && (
                              <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {chat.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedChat.clinicAvatar} />
                          <AvatarFallback>
                            {selectedChat.clinicName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedChat.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold">{selectedChat.clinicName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedChat.online ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {selectedChat.messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${message.sender === 'patient'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary'
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                              {message.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                <Separator />

                {/* Message Input */}
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>

                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />

                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Nova Conversa
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Ligar para Clínica
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videochamada
                  </Button>
                  <Button variant="outline">
                    Agendar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}