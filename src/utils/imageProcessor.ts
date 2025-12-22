export interface ImageValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxSizeBytes?: number;
  allowedFormats?: string[];
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
}

export interface ProcessedImage {
  file: File;
  thumbnail?: File;
  preview: string;
  dimensions: { width: number; height: number };
}

/**
 * Valida uma imagem com base nas opções fornecidas
 */
export const validateImage = async (
  file: File,
  options: ImageValidationOptions = {}
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    minWidth = 100,
    minHeight = 100,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp']
  } = options;

  // Validar tipo de arquivo
  if (!allowedFormats.includes(file.type)) {
    return {
      valid: false,
      error: `Formato não suportado. Use: ${allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
    };
  }

  // Validar tamanho do arquivo
  if (file.size > maxSizeBytes) {
    const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    };
  }

  // Validar dimensões da imagem
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < minWidth || dimensions.height < minHeight) {
      return {
        valid: false,
        error: `Imagem muito pequena. Dimensões mínimas: ${minWidth}x${minHeight}px`,
        dimensions
      };
    }

    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      return {
        valid: false,
        error: `Imagem muito grande. Dimensões máximas: ${maxWidth}x${maxHeight}px`,
        dimensions
      };
    }

    return { valid: true, dimensions };
  } catch (error) {
    return {
      valid: false,
      error: 'Erro ao processar a imagem. Verifique se o arquivo não está corrompido.'
    };
  }
};

/**
 * Obtém as dimensões de uma imagem
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Redimensiona e comprime uma imagem usando Canvas API
 */
export const processImage = async (
  file: File,
  options: ImageProcessingOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Erro ao criar contexto do canvas'));
          return;
        }

        // Calcular novas dimensões mantendo proporção
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          maxWidth,
          maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao processar imagem'));
              return;
            }

            const processedFile = new File(
              [blob],
              `processed_${file.name}`,
              { type: `image/${format}` }
            );
            resolve(processedFile);
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Gera um thumbnail da imagem
 */
export const generateThumbnail = async (
  file: File,
  options: ThumbnailOptions
): Promise<File> => {
  const { width, height, quality = 0.7 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Erro ao criar contexto do canvas'));
          return;
        }

        canvas.width = width;
        canvas.height = height;

        // Calcular posição para crop centralizado
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
        const scaledWidth = img.naturalWidth * scale;
        const scaledHeight = img.naturalHeight * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        // Desenhar imagem com crop centralizado
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erro ao gerar thumbnail'));
              return;
            }

            const thumbnailFile = new File(
              [blob],
              `thumb_${file.name}`,
              { type: 'image/jpeg' }
            );
            resolve(thumbnailFile);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Processa uma imagem completa: validação, redimensionamento e thumbnail
 */
export const processImageComplete = async (
  file: File,
  validationOptions?: ImageValidationOptions,
  processingOptions?: ImageProcessingOptions,
  thumbnailOptions?: ThumbnailOptions
): Promise<ProcessedImage> => {
  // Validar imagem
  const validation = await validateImage(file, validationOptions);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Processar imagem principal
  const processedFile = await processImage(file, processingOptions);
  
  // Gerar thumbnail se solicitado
  let thumbnail: File | undefined;
  if (thumbnailOptions) {
    thumbnail = await generateThumbnail(processedFile, thumbnailOptions);
  }

  // Gerar preview
  const preview = URL.createObjectURL(processedFile);

  return {
    file: processedFile,
    thumbnail,
    preview,
    dimensions: validation.dimensions!
  };
};

/**
 * Calcula novas dimensões mantendo proporção
 */
const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
};

/**
 * Limpa URLs de objeto criadas para preview
 */
export const cleanupPreviewUrl = (url: string) => {
  URL.revokeObjectURL(url);
};