import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useClinicorpPatients, type CreatePatientData } from '@/hooks/useClinicorpPatients';
import { useClinicorpApi } from '@/hooks/useClinicorpApi';
import { Search, Plus, Edit, Trash2, User, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ClinicorpPatientsManagerProps {
  clinicId?: string;
}

export default function ClinicorpPatientsManager({ clinicId }: ClinicorpPatientsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPatient, setNewPatient] = useState<CreatePatientData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const {
    patients,
    loading,
    listPatients,
    createPatient,
    searchPatients,
    deletePatient
  } = useClinicorpPatients();

  const { credentials, reloadCredentials } = useClinicorpApi();

  useEffect(() => {
    if (credentials) {
      loadPatients();
    } else {
      reloadCredentials();
    }
  }, [credentials, clinicId]);

  const loadPatients = async () => {
    await listPatients(undefined, clinicId);
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await searchPatients(searchTerm, clinicId);
    } else {
      await loadPatients();
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatient.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    const result = await createPatient(newPatient, clinicId);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
      });
      await loadPatients();
    }
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (confirm(`Tem certeza que deseja excluir o paciente ${patientName}?`)) {
      const success = await deletePatient(patientId, clinicId);
      if (success) {
        await loadPatients();
      }
    }
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Gerenciar Pacientes</h3>
          <p className="text-muted-foreground">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do paciente"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={newPatient.cpf}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={newPatient.birth_date}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, birth_date: e.target.value }))}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePatient} disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Paciente'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes por nome, email ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Buscar
        </Button>
        {searchTerm && (
          <Button variant="outline" onClick={() => { setSearchTerm(''); loadPatients(); }}>
            Limpar
          </Button>
        )}
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lista de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando pacientes...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhum paciente encontrado para a busca' : 'Nenhum paciente cadastrado'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Nascimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          {patient.email && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {formatPhone(patient.phone)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.cpf && formatCpf(patient.cpf)}
                      </TableCell>
                      <TableCell>
                        {patient.birth_date && new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Ativo</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePatient(patient.id, patient.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}