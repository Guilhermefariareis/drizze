import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import FormularioAgendamento from '@/components/agendamento/FormularioAgendamento';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAgendamentos } from '@/hooks/useAgendamentos';

export default function BookingPage() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { criarAgendamento } = useAgendamentos();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!clinicId) return;
    if (!authLoading && !user) {
      navigate('/patient-login');
      return;
    }
    (async () => {
      if (!clinicId) return;
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, address, city, phone, email')
        .eq('id', clinicId)
        .maybeSingle();
      if (error) {
        console.error(error);
        toast.error('Não foi possível carregar a clínica');
      }
      if (data) {
        setClinic(data);
      }
      setLoading(false);
    })();
  }, [clinicId]);

  const handleSalvarAgendamento = async (dadosAgendamento: any) => {
    try {
      await criarAgendamento(dadosAgendamento);
      toast.success('Agendamento criado com sucesso!');
      navigate('/patient-dashboard');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento. Tente novamente.');
    }
  };

  if (!clinicId) {
    return (
      <div className="min-h-screen bg-background">
        {/* Fixed Top Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
        </div>
        <div className="w-full px-6 py-20 pt-24">
          <Card>
            <CardHeader>
              <CardTitle>Clínica não definida</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/search')}>Voltar à busca</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b">
      </div>
      <div className="w-full px-6 py-8 pt-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agendar consulta</h1>
            {clinic && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" /> {clinic.name} • {clinic.city}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Agende sua consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormularioAgendamento
              clinicaId={clinicId}
              onSalvar={handleSalvarAgendamento}
              onCancelar={() => navigate(-1)}
              hideTypeSelection={true}
            />
          </CardContent>
        </Card>


      </div>
      <Footer />
    </div>
  );
}
