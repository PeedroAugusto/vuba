import { useState, useCallback, useRef } from 'react';

interface DragAndDropOptions {
  onDrop?: (files: File[]) => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
}

interface DragAndDropState {
  isDragging: boolean;
  files: File[];
  errors: string[];
}

export const useDragAndDrop = (options: DragAndDropOptions = {}) => {
  const {
    onDrop,
    onDragEnter,
    onDragLeave,
    accept = [],
    multiple = true,
    maxSize,
  } = options;

  const [state, setState] = useState<DragAndDropState>({
    isDragging: false,
    files: [],
    errors: [],
  });

  const dragCounter = useRef(0);

  const validateFile = useCallback(
    (file: File): string[] => {
      const errors: string[] = [];

      if (accept.length > 0) {
        const fileType = file.type.toLowerCase();
        const isAccepted = accept.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return fileType.startsWith(type.toLowerCase());
        });

        if (!isAccepted) {
          errors.push(`Tipo de arquivo não suportado: ${file.type}`);
        }
      }

      if (maxSize && file.size > maxSize) {
        errors.push(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
      }

      return errors;
    },
    [accept, maxSize]
  );

  const handleDragEnter = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      dragCounter.current += 1;

      if (dragCounter.current === 1) {
        setState(prev => ({ ...prev, isDragging: true }));
        onDragEnter?.();
      }
    },
    [onDragEnter]
  );

  const handleDragLeave = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      dragCounter.current -= 1;

      if (dragCounter.current === 0) {
        setState(prev => ({ ...prev, isDragging: false }));
        onDragLeave?.();
      }
    },
    [onDragLeave]
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      dragCounter.current = 0;
      setState(prev => ({ ...prev, isDragging: false }));

      const droppedFiles = Array.from(event.dataTransfer?.files || []);
      
      if (!multiple && droppedFiles.length > 1) {
        setState(prev => ({
          ...prev,
          errors: ['Apenas um arquivo pode ser enviado'],
        }));
        return;
      }

      const validationErrors: string[] = [];
      const validFiles: File[] = [];

      droppedFiles.forEach(file => {
        const errors = validateFile(file);
        if (errors.length > 0) {
          validationErrors.push(...errors);
        } else {
          validFiles.push(file);
        }
      });

      setState(prev => ({
        ...prev,
        files: multiple ? [...prev.files, ...validFiles] : validFiles,
        errors: validationErrors,
      }));

      if (validFiles.length > 0) {
        onDrop?.(validFiles);
      }
    },
    [multiple, validateFile, onDrop]
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const removeFile = useCallback((fileToRemove: File) => {
    setState(prev => ({
      ...prev,
      files: prev.files.filter(file => file !== fileToRemove),
    }));
  }, []);

  const clearFiles = useCallback(() => {
    setState(prev => ({
      ...prev,
      files: [],
      errors: [],
    }));
  }, []);

  const getInputProps = useCallback(
    () => ({
      accept: accept.join(','),
      multiple,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        handleDrop({ dataTransfer: { files } } as unknown as DragEvent);
      },
    }),
    [accept, multiple, handleDrop]
  );

  const getRootProps = useCallback(
    () => ({
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    }),
    [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]
  );

  return {
    isDragging: state.isDragging,
    files: state.files,
    errors: state.errors,
    removeFile,
    clearFiles,
    getInputProps,
    getRootProps,
  };
}; 