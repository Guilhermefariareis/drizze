import React, { useState, useEffect } from 'react';
import { User, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SeletorProfissionaisProps {
  clinicaId: string;
  profissionalSelecionado: string;
  onProfissionalSelecionado: (profissionalId: string) => void;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  crm?: string;
  foto_url?: string;
  descricao?: string;
  avaliacao_media?: number;
  total_avaliacoes?: number;
  ativo: boolean;
}

const SeletorProfissionais: React.FC<SeletorProfissionaisProps> = ({
  clinicaId,
  profissionalSelecionado,
  onProfissionalSelecionado
}) => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [profissionaisFiltrados, setProfissionaisFiltrados] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clinicaId) {
      carregarProfissionais();
    }
  }, [clinicaId]);

  useEffect(() => {
    filtrarProfissionais();
  }, [busca, profissionais]);

  const carregarProfissionais = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar profissionais da clínica
      const { data, error } = await supabase
        .from('clinic_professionals')
        .select(`
          id,
          user_id,
          role,
          is_active,
          profiles:user_id(id, full_name, email)
        `)
        .eq('clinic_id', clinicaId)
        .eq('is_active', true)
        .order('profiles(full_name)');

      if (error) throw error;

      const profissionaisFormatados: Profissional[] = data?.map(prof => ({
        id: prof.id,
        nome: prof.profiles?.full_name || 'Nome não informado',
        especialidade: prof.role || 'Função não informada',
        crm: '',
        foto_url: '',
        descricao: '',
        avaliacao_media: 0,
        total_avaliacoes: 0,
        ativo: prof.is_active
      })) || [];

      setProfissionais(profissionaisFormatados);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      setError('Erro ao carregar profissionais da clínica.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarProfissionais = () => {
    if (!busca.trim()) {
      setProfissionaisFiltrados(profissionais);
      return;
    }

    const termo = busca.toLowerCase();
    const filtrados = profissionais.filter(prof => 
      prof.nome.toLowerCase().includes(termo) ||
      prof.especialidade.toLowerCase().includes(termo) ||
      (prof.crm && prof.crm.toLowerCase().includes(termo))
    );
    
    setProfissionaisFiltrados(filtrados);
  };

  const handleSelecionarProfissional = (profissionalId: string) => {
    onProfissionalSelecionado(profissionalId);
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAvaliacao = (media?: number, total?: number) => {
    if (!media || !total) return null;
    
    return (
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{media.toFixed(1)}</span>
        <span>({total} avaliações)</span>
      </div>
    );
  };

  return (
    <Card className="card-mobile sm:card-desktop">
      <CardHeader className="spacing-mobile sm:spacing-desktop">
        <CardTitle className="flex items-center gap-2 text-responsive-lg">
          <User className="h-5 w-5" />
          Selecionar Profissional
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, especialidade ou CRM..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="spacing-mobile sm:spacing-desktop">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando profissionais...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={carregarProfissionais}
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        ) : profissionaisFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {busca ? 'Nenhum profissional encontrado para sua busca.' : 'Nenhum profissional disponível.'}
          </div>
        ) : (
          <div className="grid-profissionais">
            {profissionaisFiltrados.map((profissional) => (
              <div
                key={profissional.id}
                className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md touch-target ${
                  profissionalSelecionado === profissional.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleSelecionarProfissional(profissional.id)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={profissional.foto_url} alt={profissional.nome} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(profissional.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-responsive-sm truncate">
                          {profissional.nome}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {profissional.especialidade}
                          </Badge>
                          {profissional.crm && (
                            <span className="text-xs sm:text-sm text-gray-600">
                              CRM: {profissional.crm}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {profissionalSelecionado === profissional.id && (
                        <div className="flex-shrink-0">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {renderAvaliacao(profissional.avaliacao_media, profissional.total_avaliacoes)}
                    
                    {profissional.descricao && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                        {profissional.descricao}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {profissionalSelecionado && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Profissional selecionado: <span className="font-semibold">
                {profissionaisFiltrados.find(p => p.id === profissionalSelecionado)?.nome}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SeletorProfissionais };
export default SeletorProfissionais;