import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  treatment: string | null;
  clinic: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    rating: 5,
    comment: "",
    treatment: "",
    clinic: "",
    is_active: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rating: 5,
      comment: "",
      treatment: "",
      clinic: "",
      is_active: true
    });
    setEditingId(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      rating: testimonial.rating,
      comment: testimonial.comment,
      treatment: testimonial.treatment || "",
      clinic: testimonial.clinic || "",
      is_active: testimonial.is_active
    });
    setEditingId(testimonial.id.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const testimonialData = {
        name: formData.name,
        rating: formData.rating,
        comment: formData.comment,
        treatment: formData.treatment || null,
        clinic: formData.clinic || null,
        is_active: formData.is_active
      };

      if (editingId) {
        const { error } = await supabase
          .from('testimonials')
          .update(testimonialData)
          .eq('id', parseInt(editingId));

        if (error) throw error;
        toast.success('Depoimento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(testimonialData);

        if (error) throw error;
        toast.success('Depoimento criado com sucesso!');
      }

      resetForm();
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Erro ao salvar depoimento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;
      
      toast.success('Depoimento excluído com sucesso!');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Erro ao excluir depoimento');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentActive })
        .eq('id', parseInt(id));

      if (error) throw error;
      
      toast.success(`Depoimento ${!currentActive ? 'ativado' : 'desativado'} com sucesso!`);
      fetchTestimonials();
    } catch (error) {
      console.error('Error toggling testimonial:', error);
      toast.error('Erro ao alterar status do depoimento');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? 'Editar Depoimento' : 'Novo Depoimento'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rating">Avaliação *</Label>
                <Select 
                  value={formData.rating.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} estrela{rating > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comentário *</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatment">Tratamento</Label>
                <Input
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Ex: Ortodontia"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinic">Clínica</Label>
                <Input
                  id="clinic"
                  value={formData.clinic}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                  placeholder="Ex: Odonto Center"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Ativo</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingId ? 'Atualizar' : 'Criar'} Depoimento
              </Button>
              
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Depoimentos Cadastrados ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < testimonial.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-muted-foreground"
                            }
                          />
                        ))}
                      </div>
                      {!testimonial.is_active && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-2">"{testimonial.comment}"</p>
                    
                    <div className="text-sm text-muted-foreground">
                      {testimonial.treatment && (
                        <span className="mr-4">Tratamento: {testimonial.treatment}</span>
                      )}
                      {testimonial.clinic && (
                        <span>Clínica: {testimonial.clinic}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(testimonial.id.toString(), testimonial.is_active)}
                    >
                      {testimonial.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id.toString())}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {testimonials.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum depoimento cadastrado ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsManager;