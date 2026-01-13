import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ResumoAgendamentoProps {
  clinicaId: string;
  profissionalId: string;
  dataSelecionada: string;
  horarioSelecionado: string;
  onConfirmar: () => void;
  onVoltar: () => void;
  loading?: boolean;
  perfilPaciente?: {
    nome: string;
    email: string;
    telefone: string;
  } | null;
}

interface DadosClinica {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

interface DadosProfissional {
  id: string;
  nome: string;
  especialidade: string;
  crm?: string;
  foto_url?: string;
  avaliacao_media?: number;
  total_avaliacoes?: number;
}

const ResumoAgendamento: React.FC<ResumoAgendamentoProps> = ({
  clinicaId,
  profissionalId,
  dataSelecionada,
  horarioSelecionado,
  onConfirmar,
  onVoltar,
  loading = false,
  perfilPaciente = null
}) => {
  const [dadosClinica, setDadosClinica] = useState<DadosClinica | null>(null);
  const [dadosProfissional, setDadosProfissional] = useState<DadosProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [clinicaId, profissionalId]);

  const carregarDados = async () => {
    setCarregando(true);
    setError(null);

    try {
      // Carregar dados da clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinics')
        .select('id, name, address, phone, email')
        .eq('id', clinicaId)
        .single();

      if (clinicaError) throw clinicaError;

      // Carregar dados do profissional
      const { data: profissional, error: profissionalError } = await supabase
        .from('clinic_credentials')
        .select(`
          id,
          name,
          specialty,
          crm,
          photo_url,
          rating_average,
          total_ratings
        `)
        .eq('id', profissionalId)
        .single();

      if (profissionalError) throw profissionalError;

      setDadosClinica({
        id: clinica.id,
        nome: clinica.name || 'Nome não informado',
        endereco: clinica.address,
        telefone: clinica.phone,
        email: clinica.email
      });

      setDadosProfissional({
        id: profissional.id,
        nome: profissional.name || 'Nome não informado',
        especialidade: profissional.specialty || 'Especialidade não informada',
        crm: profissional.crm,
        foto_url: profissional.photo_url,
        avaliacao_media: profissional.rating_average,
        total_avaliacoes: profissional.total_ratings
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar informações do agendamento.');
    } finally {
      setCarregando(false);
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatarData = (data: string) => {
    try {
      const dataObj = new Date(data + 'T00:00:00');
      return format(dataObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return data;
    }
  };

  const renderAvaliacao = (media?: number, total?: number) => {
    if (!media || !total) return null;

    return (
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 ${i < Math.round(media) ? 'text-yellow-400' : 'text-gray-300'
                }`}
            >
              ★
            </div>
          ))}
        </div>
        <span className="font-medium">{media.toFixed(1)}</span>
        <span>({total} avaliações)</span>
      </div>
    );
  };

  if (carregando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando informações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={carregarDados}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-mobile sm:card-desktop">
      <CardHeader className="spacing-mobile sm:spacing-desktop">
        <CardTitle className="flex items-center gap-2 text-responsive-lg">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          Resumo do Agendamento
        </CardTitle>
        <p className="text-responsive-sm text-gray-600 mt-1">
          Revise as informações antes de confirmar
        </p>
      </CardHeader>
      <CardContent className="spacing-mobile sm:spacing-desktop space-y-4 sm:space-y-6">
        {/* Data e Horário */}
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-responsive-sm">Data e Horário</h3>
          </div>
          <div className="space-y-1">
            <p className="text-blue-800 font-medium text-responsive-sm">
              {formatarData(dataSelecionada)}
            </p>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <span className="text-blue-800 font-medium text-responsive-sm">{horarioSelecionado}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações do Paciente */}
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900 text-responsive-sm">Seus Dados</h3>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <p className="text-gray-900 text-responsive-sm font-medium">
                {perfilPaciente?.nome || 'Carregando...'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {perfilPaciente?.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <p className="text-gray-600 text-responsive-xs sm:text-responsive-sm">
                    {perfilPaciente.telefone}
                  </p>
                </div>
              )}
              {perfilPaciente?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <p className="text-gray-600 text-responsive-xs sm:text-responsive-sm">
                    {perfilPaciente.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Profissional */}
        {dadosProfissional && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-responsive-sm">Profissional</h3>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <AvatarImage src={dadosProfissional.foto_url} alt={dadosProfissional.nome} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getInitials(dadosProfissional.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-responsive-sm truncate">{dadosProfissional.nome}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {dadosProfissional.especialidade}
                  </Badge>
                  {dadosProfissional.crm && (
                    <span className="text-xs sm:text-sm text-gray-600">
                      CRM: {dadosProfissional.crm}
                    </span>
                  )}
                </div>
                {renderAvaliacao(dadosProfissional.avaliacao_media, dadosProfissional.total_avaliacoes)}
              </div>
            </div>
          </div>
        )}

        {/* Clínica */}
        {dadosClinica && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900 text-responsive-sm">Local</h3>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 text-responsive-sm">{dadosClinica.nome}</h4>
              {dadosClinica.endereco && (
                <p className="text-xs sm:text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                  {dadosClinica.endereco}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                {dadosClinica.telefone && (
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    {dadosClinica.telefone}
                  </p>
                )}
                {dadosClinica.email && (
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                    {dadosClinica.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Observações */}
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2 text-responsive-sm">Observações Importantes</h3>
          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1">
            <li>• Chegue com 15 minutos de antecedência</li>
            <li>• Traga um documento de identidade com foto</li>
            <li>• Em caso de cancelamento, avise com pelo menos 24h de antecedência</li>
            <li>• Você receberá um código de confirmação após finalizar o agendamento</li>
          </ul>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onVoltar}
            disabled={loading}
            className="btn-mobile sm:btn-desktop touch-target flex-1"
          >
            <span className="sm:hidden">Voltar</span>
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <Button
            onClick={onConfirmar}
            disabled={loading}
            className="btn-mobile sm:btn-desktop touch-target flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="sm:hidden">Confirmando...</span>
                <span className="hidden sm:inline">Confirmando...</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">Confirmar</span>
                <span className="hidden sm:inline">Confirmar Agendamento</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { ResumoAgendamento };
export default ResumoAgendamento;