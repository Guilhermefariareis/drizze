import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Mail, UserPlus, Users, Settings, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ProfessionalsManagerProps {
  clinicId: string;
}

const ProfessionalsManager = ({ clinicId }: ProfessionalsManagerProps) => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('dentist');
  const [permissions, setPermissions] = useState({
    access_agenda: true,
    access_patients: false,
    access_reports: false,
    access_financial: false,
    access_advanced_services: false
  });

  useEffect(() => {
    fetchProfessionals();
  }, [clinicId]);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('clinic_professionals')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('clinic_id', clinicId);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteProfessional = async () => {
    if (!inviteEmail) {
      toast({
        title: "Email obrigatório",
        description: "Digite o email do profissional",
        variant: "destructive"
      });
      return;
    }

    try {
      // Primeiro, verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', inviteEmail)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!existingUser) {
        toast({
          title: "Usuário não encontrado",
          description: "O profissional precisa primeiro criar uma conta na plataforma. Envie o link de cadastro: " + window.location.origin + "/patient-login",
          variant: "destructive"
        });
        return;
      }

      // Verificar se já existe convite para este usuário
      const { data: existingInvite, error: inviteError } = await supabase
        .from('clinic_professionals')
        .select('id')
        .eq('clinic_id', clinicId)
        .eq('user_id', existingUser.user_id)
        .single();

      if (existingInvite) {
        toast({
          title: "Profissional já convidado",
          description: "Este profissional já foi convidado para sua clínica",
          variant: "destructive"
        });
        return;
      }

      // Criar convite
      const { error: createError } = await supabase
        .from('clinic_professionals')
        .insert({
          clinic_id: clinicId,
          user_id: existingUser.user_id,
          role: inviteRole,
          permissions: permissions,
          invited_at: new Date().toISOString(),
          is_active: true
        });

      if (createError) throw createError;

      toast({
        title: "Convite enviado",
        description: `Profissional ${inviteEmail} foi convidado com sucesso`
      });

      setInviteEmail('');
      fetchProfessionals();
    } catch (error) {
      console.error('Erro ao convidar profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePermissions = async (professionalId: string, newPermissions: any) => {
    try {
      const { error } = await supabase
        .from('clinic_professionals')
        .update({ permissions: newPermissions })
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: "Permissões atualizadas",
        description: "As permissões do profissional foram atualizadas"
      });

      fetchProfessionals();
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões",
        variant: "destructive"
      });
    }
  };

  const handleRemoveProfessional = async (professionalId: string) => {
    try {
      const { error } = await supabase
        .from('clinic_professionals')
        .delete()
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: "Profissional removido",
        description: "O profissional foi removido da clínica"
      });

      fetchProfessionals();
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o profissional",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (professional: any) => {
    if (professional.accepted_at) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    }
    if (!professional.is_active) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Inativo</Badge>;
    }
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  };

  const getRoleDisplay = (role: string) => {
    const roles = {
      dentist: 'Dentista',
      assistant: 'Assistente',
      hygienist: 'Higienista',
      receptionist: 'Recepcionista',
      manager: 'Gerente'
    };
    return roles[role as keyof typeof roles] || role;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Carregando profissionais...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">


      {/* Convite de Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email do Profissional</Label>
            <Input
              id="email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="profissional@email.com"
            />

          </div>
            <div>
              <Label htmlFor="role">Cargo</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dentist">Dentista</SelectItem>
                  <SelectItem value="assistant">Assistente</SelectItem>
                  <SelectItem value="hygienist">Higienista</SelectItem>
                  <SelectItem value="receptionist">Recepcionista</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Permissões</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="access_agenda"
                  checked={permissions.access_agenda}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, access_agenda: checked }))
                  }
                />
                <Label htmlFor="access_agenda" className="text-sm">Agenda</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="access_patients"
                  checked={permissions.access_patients}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, access_patients: checked }))
                  }
                />
                <Label htmlFor="access_patients" className="text-sm">Pacientes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="access_reports"
                  checked={permissions.access_reports}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, access_reports: checked }))
                  }
                />
                <Label htmlFor="access_reports" className="text-sm">Relatórios</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="access_financial"
                  checked={permissions.access_financial}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, access_financial: checked }))
                  }
                />
                <Label htmlFor="access_financial" className="text-sm">Financeiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="access_advanced_services"
                  checked={permissions.access_advanced_services}
                  onCheckedChange={(checked) => 
                    setPermissions(prev => ({ ...prev, access_advanced_services: checked }))
                  }
                />
                <Label htmlFor="access_advanced_services" className="text-sm">Serviços Avançados</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleInviteProfessional} className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Convite
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Profissionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Equipe ({professionals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {professionals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum profissional convidado ainda
            </div>
          ) : (
            <div className="space-y-4">
              {professionals.map((professional) => (
                <div key={professional.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {professional.profiles?.full_name || 'Nome não informado'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {professional.profiles?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{getRoleDisplay(professional.role)}</Badge>
                          {getStatusBadge(professional)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Aqui você pode abrir um modal de edição de permissões
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProfessional(professional.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mostrar permissões */}
                  <Separator className="my-3" />
                  <div>
                    <p className="text-sm font-medium mb-2">Permissões:</p>
                    <div className="flex flex-wrap gap-2">
                      {professional.permissions?.access_agenda && (
                        <Badge variant="secondary" className="text-xs">Agenda</Badge>
                      )}
                      {professional.permissions?.access_patients && (
                        <Badge variant="secondary" className="text-xs">Pacientes</Badge>
                      )}
                      {professional.permissions?.access_reports && (
                        <Badge variant="secondary" className="text-xs">Relatórios</Badge>
                      )}
                      {professional.permissions?.access_financial && (
                        <Badge variant="secondary" className="text-xs">Financeiro</Badge>
                      )}
                      {professional.permissions?.access_advanced_services && (
                        <Badge variant="secondary" className="text-xs">Serviços Avançados</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalsManager;