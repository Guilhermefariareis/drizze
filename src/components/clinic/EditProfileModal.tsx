import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ClinicProfile {
  id?: string;
  clinic_id: string;
  description?: string;
  specialties?: string[];
  logo_url?: string;
  cover_image_url?: string;
  team_size?: number;
  founded_year?: number;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ClinicProfile | null;
  clinicId: string;
  onSave: (data: any) => Promise<void>;
}

export function EditProfileModal({ isOpen, onClose, profile, clinicId, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    team_size: '',
    founded_year: '',
    specialties: [] as string[],
  });
  const [newSpecialty, setNewSpecialty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        description: profile.description || '',
        team_size: profile.team_size?.toString() || '',
        founded_year: profile.founded_year?.toString() || '',
        specialties: profile.specialties || [],
      });
    } else {
      setFormData({
        description: '',
        team_size: '',
        founded_year: '',
        specialties: [],
      });
    }
  }, [profile]);

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const dataToSave = {
        clinic_id: clinicId,
        description: formData.description || null,
        team_size: formData.team_size ? parseInt(formData.team_size) : null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        specialties: formData.specialties,
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil da Clínica</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description">Descrição da Clínica</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua clínica, serviços e diferenciais..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team_size">Tamanho da Equipe</Label>
              <Input
                id="team_size"
                type="number"
                value={formData.team_size}
                onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                placeholder="Ex: 5"
                min="1"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="founded_year">Ano de Fundação</Label>
              <Input
                id="founded_year"
                type="number"
                value={formData.founded_year}
                onChange={(e) => setFormData(prev => ({ ...prev, founded_year: e.target.value }))}
                placeholder="Ex: 2020"
                min="1900"
                max={new Date().getFullYear()}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Especialidades</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Digite uma especialidade"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddSpecialty} disabled={!newSpecialty.trim()}>
                  Adicionar
                </Button>
              </div>
              
              {formData.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Exemplos: Ortodontia, Implantodontia, Estética Dental, Endodontia
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}