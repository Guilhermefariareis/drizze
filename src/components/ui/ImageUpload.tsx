import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Progress } from './progress';
import { Card, CardContent } from './card';
import { Upload, X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  onImageSelect: (file: File) => Promise<void>;
  currentImageUrl?: string;
  uploading?: boolean;
  uploadProgress?: number;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32'
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImageUrl,
  uploading = false,
  uploadProgress = 0,
  className,
  accept = 'image/*',
  maxSizeMB = 5,
  disabled = false,
  showPreview = true,
  previewSize = 'md',
  label = 'Upload de Imagem',
  description = `Selecione uma imagem (PNG, JPG até ${maxSizeMB}MB)`
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;

    // Validação básica de tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadStatus('error');
      return;
    }

    // Criar preview
    if (showPreview) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    try {
      setUploadStatus('idle');
      await onImageSelect(file);
      setUploadStatus('success');
      
      // Limpar preview após sucesso
      setTimeout(() => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setUploadStatus('idle');
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      // Limpar preview em caso de erro
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadStatus('idle');
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preview da Imagem */}
      {showPreview && displayImageUrl && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden',
                sizeClasses[previewSize]
              )}>
                <img 
                  src={displayImageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {previewUrl ? 'Nova imagem selecionada' : 'Imagem atual'}
                  </span>
                  {uploadStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {uploadStatus === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Enviando... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
              
              {previewUrl && !uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPreview}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Área de Upload */}
      <Card 
        className={cn(
          'transition-colors cursor-pointer',
          dragOver && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className={cn(
              'rounded-full p-4 transition-colors',
              dragOver ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current" />
              ) : (
                <Upload className="h-6 w-6" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{label}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              
              {!uploading && (
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              )}
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2 w-full max-w-xs" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress < 100 ? `Enviando... ${Math.round(uploadProgress)}%` : 'Processando...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};