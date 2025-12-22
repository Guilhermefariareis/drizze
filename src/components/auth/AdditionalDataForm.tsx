import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, User, Building2, Phone, MapPin, FileText, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdditionalDataFormProps {
  userType: 'patient' | 'clinic';
  onDataChange: (data: any) => void;
}

export function AdditionalDataForm({ userType, onDataChange }: AdditionalDataFormProps) {
  const [formData, setFormData] = useState({
    // Dados comuns
    cpf: '',
    rg: '',
    birthDate: undefined as Date | undefined,
    address: '',
    phone: '',
    emergencyContact: '',
    
    // Dados específicos de clínica
    cnpj: '',
    licenseNumber: '',
    specialty: '',
    clinicDescription: '',
    bankInfo: '',
    clinicName: '',
    clinicPhone: '',
    clinicCity: '',
    clinicState: '',
    clinicZipCode: '',
    
    // Dados específicos de paciente
    medicalHistory: '',
    allergies: '',
    medications: '',
    healthInsurance: ''
  });

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const specialties = [
    'Dentista',
    'Cardiologista',
    'Dermatologista',
    'Ginecologista',
    'Pediatra',
    'Ortopedista',
    'Oftalmologista',
    'Neurologista',
    'Psiquiatra',
    'Clínico Geral',
    'Outro'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {userType === 'patient' ? (
            <User className="w-5 h-5 mr-2 text-primary" />
          ) : (
            <Building2 className="w-5 h-5 mr-2 text-primary" />
          )}
          Dados Adicionais {userType === 'patient' ? 'do Paciente' : 'da Clínica'}
        </CardTitle>
        <CardDescription>
          Complete seu perfil com informações adicionais para uma melhor experiência.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados básicos comuns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                className="pl-10"
                maxLength={14}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="rg"
                placeholder="00.000.000-0"
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.birthDate ? (
                  format(formData.birthDate, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.birthDate}
                onSelect={(date) => handleInputChange('birthDate', date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço Completo</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="address"
              placeholder="Rua, número, bairro, cidade, estado, CEP"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Contato de Emergência</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="emergencyContact"
              placeholder="Nome e telefone de emergência"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dados específicos para clínicas */}
        {userType === 'clinic' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="clinicName">Nome da Clínica *</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinicName"
                  placeholder="Nome da sua clínica"
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  maxLength={18}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Número da Licença/CRM</Label>
                <Input
                  id="licenseNumber"
                  placeholder="Número do registro profissional"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">Telefone da Clínica *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinicPhone"
                    placeholder="(00) 00000-0000"
                    value={formData.clinicPhone}
                    onChange={(e) => handleInputChange('clinicPhone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicCity">Cidade *</Label>
                <Input
                  id="clinicCity"
                  placeholder="Cidade"
                  value={formData.clinicCity}
                  onChange={(e) => handleInputChange('clinicCity', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicState">Estado *</Label>
                <Input
                  id="clinicState"
                  placeholder="UF"
                  value={formData.clinicState}
                  onChange={(e) => handleInputChange('clinicState', e.target.value)}
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicZipCode">CEP *</Label>
              <Input
                id="clinicZipCode"
                placeholder="00000-000"
                value={formData.clinicZipCode}
                onChange={(e) => handleInputChange('clinicZipCode', e.target.value)}
                maxLength={9}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade Principal</Label>
              <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicDescription">Descrição da Clínica</Label>
              <Textarea
                id="clinicDescription"
                placeholder="Descreva os serviços oferecidos, experiência, diferencial..."
                value={formData.clinicDescription}
                onChange={(e) => handleInputChange('clinicDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankInfo">Dados Bancários (para recebimento)</Label>
              <Textarea
                id="bankInfo"
                placeholder="Banco, agência, conta..."
                value={formData.bankInfo}
                onChange={(e) => handleInputChange('bankInfo', e.target.value)}
                rows={2}
              />
            </div>
          </>
        )}

        {/* Dados específicos para pacientes */}
        {userType === 'patient' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Histórico Médico</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="medicalHistory"
                  placeholder="Principais problemas de saúde, cirurgias anteriores..."
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  className="pl-10"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Input
                  id="allergies"
                  placeholder="Medicamentos, alimentos..."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos em Uso</Label>
                <Input
                  id="medications"
                  placeholder="Lista de medicamentos atuais"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthInsurance">Plano de Saúde</Label>
              <Input
                id="healthInsurance"
                placeholder="Nome do plano e número da carteira"
                value={formData.healthInsurance}
                onChange={(e) => handleInputChange('healthInsurance', e.target.value)}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}