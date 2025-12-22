import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Building2, Search, Filter, Download, Eye, MoreHorizontal, TrendingUp, AlertCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminAppointments() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const appointments = [
    {
      id: 1,
      patientName: "João Silva",
      dentistName: "Dr. Maria Santos",
      clinicName: "Clínica Dental doltorizze",
      service: "Consulta de Rotina",
      date: "2024-01-22",
      time: "14:00",
      duration: "30 min",
      status: "confirmada",
      price: "R$ 150,00",
      createdAt: "2024-01-20 10:30"
    },
    {
      id: 2,
      patientName: "Ana Costa",
      dentistName: "Dr. Carlos Lima",
      clinicName: "Odonto Excellence",
      service: "Implante Dentário",
      date: "2024-01-23",
      time: "09:30",
      duration: "120 min",
      status: "pendente",
      price: "R$ 2.500,00",
      createdAt: "2024-01-21 15:20"
    },
    {
      id: 3,
      patientName: "Pedro Oliveira",
      dentistName: "Dra. Fernanda Silva",
      clinicName: "Sorriso Perfeito",
      service: "Limpeza",
      date: "2024-01-21",
      time: "16:00",
      duration: "45 min",
      status: "concluida",
      price: "R$ 120,00",
      createdAt: "2024-01-19 09:15"
    },
    {
      id: 4,
      patientName: "Lucia Ferreira",
      dentistName: "Dr. Roberto Costa",
      clinicName: "Clínica Dental doltorizze",
      service: "Ortodontia",
      date: "2024-01-24",
      time: "11:00",
      duration: "60 min",
      status: "cancelada",
      price: "R$ 300,00",
      createdAt: "2024-01-18 14:45"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-primary text-primary-foreground';
      case 'pendente': return 'bg-warning text-warning-foreground';
      case 'concluida': return 'bg-success text-success-foreground';
      case 'cancelada': return 'bg-destructive text-destructive-foreground';
      case 'reagendada': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.dentistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appointment.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { title: "Consultas Hoje", value: "47", change: "+8%", icon: Calendar, color: "text-primary" },
    { title: "Pendentes", value: "12", change: "-5%", icon: Clock, color: "text-warning" },
    { title: "Concluídas", value: "189", change: "+15%", icon: TrendingUp, color: "text-success" },
    { title: "Canceladas", value: "8", change: "+2%", icon: AlertCircle, color: "text-destructive" }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Gerenciar Consultas</h1>
            <p className="text-muted-foreground">Monitore e gerencie todas as consultas da plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-success font-medium">{stat.change} vs ontem</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Lista de Consultas</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por paciente, dentista ou clínica..." 
                    className="pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="reagendada">Reagendada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Consulta</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Clínica</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.map(appointment => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.service}</p>
                            <p className="text-sm text-muted-foreground">ID: {appointment.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{appointment.dentistName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.clinicName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{appointment.date}</p>
                            <p className="text-sm text-muted-foreground">{appointment.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{appointment.price}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Reagendar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}