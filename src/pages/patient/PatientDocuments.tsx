import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Upload,
  FileText,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface CreditRequest {
  id: string;
  status: string;
  requested_amount: number;
  installments: number;
  treatment_description: string;
  created_at: string;
  clinics: {
    name: string;
  };
}

interface CreditDocument {
  id: string;
  credit_request_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface UploadingFile {
  id: string;
  file: File;
  document_type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const PatientDocuments: React.FC = () => {
  const { user } = useAuth();
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [documents, setDocuments] = useState<CreditDocument[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const documentTypes = [
    { value: 'identity', label: 'Documento de Identidade (RG/CNH)' },
    { value: 'cpf', label: 'CPF' },
    { value: 'income_proof', label: 'Comprovante de Renda' },
    { value: 'address_proof', label: 'Comprovante de Endereço' },
    { value: 'medical_report', label: 'Relatório Médico' },
    { value: 'treatment_plan', label: 'Plano de Tratamento' },
    { value: 'other', label: 'Outros' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/patient-login');
      return;
    }
    fetchCreditRequests();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedRequestId) {
      fetchDocuments();
    }
  }, [selectedRequestId]);

  const fetchCreditRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Primeiro buscar o profile do usuário logado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Buscar solicitações de crédito do paciente logado usando profile.id
      const { data, error } = await supabase
        .from('credit_requests')
        .select(`
          id,
          status,
          requested_amount,
          installments,
          treatment_description,
          created_at,
          clinics (
            name
          )
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCreditRequests(data || []);

      // Auto-selecionar a primeira solicitação se houver
      if (data && data.length > 0) {
        setSelectedRequestId(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações de crédito:', error);
      toast.error('Erro ao carregar solicitações de crédito');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_documents')
        .select('*')
        .eq('credit_request_id', selectedRequestId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedRequestId) return;

    Array.from(files).forEach((file) => {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo não suportado: ${file.name}. Use apenas JPG, PNG ou PDF.`);
        return;
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Arquivo muito grande: ${file.name}. Tamanho máximo: 10MB.`);
        return;
      }

      const uploadingFile: UploadingFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        document_type: '',
        progress: 0,
        status: 'uploading'
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);
    });

    // Limpar input
    event.target.value = '';
  };

  const updateUploadingFileType = (fileId: string, documentType: string) => {
    setUploadingFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, document_type: documentType }
          : file
      )
    );
  };

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFile = async (uploadingFile: UploadingFile) => {
    if (!uploadingFile.document_type) {
      toast.error('Por favor, selecione o tipo do documento antes de enviar.');
      return;
    }

    try {
      // Upload para Supabase Storage
      const fileName = `${Date.now()}_${uploadingFile.file.name}`;
      const filePath = `credit-documents/${selectedRequestId}/${fileName}`;

      // Simular progresso de upload
      setUploadingFiles(prev =>
        prev.map(file =>
          file.id === uploadingFile.id
            ? { ...file, progress: 10 }
            : file
        )
      );

      // Upload real para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadingFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Atualizar progresso
      setUploadingFiles(prev =>
        prev.map(file =>
          file.id === uploadingFile.id
            ? { ...file, progress: 80 }
            : file
        )
      );

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Buscar o profile do usuário para usar o profile.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Salvar informações do documento no banco
      const { error: dbError } = await supabase
        .from('credit_documents')
        .insert({
          credit_request_id: selectedRequestId,
          document_type: uploadingFile.document_type,
          file_name: uploadingFile.file.name,
          file_url: fileUrl,
          patient_id: profile.id
        });

      if (dbError) {
        throw dbError;
      }

      // Marcar como concluído
      setUploadingFiles(prev =>
        prev.map(file =>
          file.id === uploadingFile.id
            ? { ...file, status: 'completed', progress: 100 }
            : file
        )
      );

      toast.success(`Documento "${uploadingFile.file.name}" enviado com sucesso!`);

      // Remover da lista após 2 segundos
      setTimeout(() => {
        removeUploadingFile(uploadingFile.id);
        fetchDocuments();
      }, 2000);

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadingFiles(prev =>
        prev.map(file =>
          file.id === uploadingFile.id
            ? { ...file, status: 'error' }
            : file
        )
      );
      toast.error(`Erro ao enviar documento: ${uploadingFile.file.name}`);
    }
  };

  const deleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o documento "${fileName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('credit_documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      toast.success('Documento excluído com sucesso!');
      fetchDocuments();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      clinic_approved: { label: 'Aprovado pela Clínica', color: 'bg-blue-100 text-blue-800' },
      clinic_rejected: { label: 'Rejeitado pela Clínica', color: 'bg-red-100 text-red-800' },
      admin_analyzing: { label: 'Em Análise', color: 'bg-purple-100 text-purple-800' },
      admin_approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      admin_rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => navigate('/patient-login')}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Documentos do Crédito</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Envie os documentos necessários para finalizar sua solicitação de crédito.
        </p>
      </div>

      {creditRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma solicitação de crédito encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você precisa fazer uma solicitação de crédito antes de enviar documentos.
            </p>
            <Button onClick={() => navigate('/patient/credit-request')}>
              <Plus className="w-4 h-4 mr-2" />
              Solicitar Crédito
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Seleção de Solicitação */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selecionar Solicitação de Crédito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="request-select">Solicitação de Crédito</Label>
                  <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma solicitação" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditRequests.map((request) => (
                        <SelectItem key={request.id} value={request.id}>
                          {request.clinics.name} - R$ {request.requested_amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} ({request.installments}x)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRequestId && (
                  <div>
                    <Label>Status da Solicitação</Label>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${creditRequests.find(r => r.id === selectedRequestId)?.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : creditRequests.find(r => r.id === selectedRequestId)?.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {creditRequests.find(r => r.id === selectedRequestId)?.status === 'approved' && 'Aprovado'}
                        {creditRequests.find(r => r.id === selectedRequestId)?.status === 'rejected' && 'Rejeitado'}
                        {creditRequests.find(r => r.id === selectedRequestId)?.status === 'pending' && 'Pendente'}
                        {creditRequests.find(r => r.id === selectedRequestId)?.status === 'awaiting_documents' && 'Aguardando Documentos'}
                        {!['approved', 'rejected', 'pending', 'awaiting_documents'].includes(creditRequests.find(r => r.id === selectedRequestId)?.status || '') && 'Em Análise'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload de Documentos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Enviar Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Input de arquivo */}
                <div>
                  <Label htmlFor="file-upload">Selecionar Arquivos</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos aceitos: JPG, PNG, PDF. Tamanho máximo: 10MB por arquivo.
                  </p>
                </div>

                {/* Lista de arquivos sendo enviados */}
                {uploadingFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Arquivos para envio:</h4>
                    {uploadingFiles.map((uploadingFile) => (
                      <div key={uploadingFile.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{uploadingFile.file.name}</span>
                            <span className="text-sm text-gray-500">
                              ({(uploadingFile.file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadingFile(uploadingFile.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-400">Tipo do Documento</Label>
                            <Select
                              value={uploadingFile.document_type}
                              onValueChange={(value) => updateUploadingFileType(uploadingFile.id, value)}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {documentTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            onClick={() => uploadFile(uploadingFile)}
                            disabled={!uploadingFile.document_type || uploadingFile.status !== 'uploading'}
                            size="sm"
                            className="w-full sm:flex-1 h-10 rounded-xl"
                          >
                            {uploadingFile.status === 'uploading' && uploadingFile.progress === 0 && 'Enviar'}
                            {uploadingFile.status === 'uploading' && uploadingFile.progress > 0 && uploadingFile.progress < 100 && `${uploadingFile.progress}%`}
                            {uploadingFile.status === 'completed' && (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Enviado
                              </>
                            )}
                            {uploadingFile.status === 'error' && (
                              <>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Erro
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Barra de progresso */}
                        {uploadingFile.status === 'uploading' && uploadingFile.progress > 0 && uploadingFile.progress < 100 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadingFile.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Documentos Enviados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos Enviados ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento enviado</h3>
                  <p className="text-gray-500">Envie seus documentos usando o formulário acima.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl hover:bg-gray-50 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{getDocumentTypeLabel(doc.document_type)}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{doc.file_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                            {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')} às {new Date(doc.uploaded_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                          className="flex-1 sm:flex-none rounded-xl h-10"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id, doc.file_name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-10 w-10 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PatientDocuments;