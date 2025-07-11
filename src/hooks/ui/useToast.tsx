import { useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

const DEFAULT_DURATION = 3000;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const {
        type = 'info',
        duration = DEFAULT_DURATION,
      } = options;

      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = {
        id,
        message,
        type,
        duration,
      };

      setToasts(prev => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return addToast(message, { ...options, type: 'success' });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return addToast(message, { ...options, type: 'error' });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return addToast(message, { ...options, type: 'warning' });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return addToast(message, { ...options, type: 'info' });
    },
    [addToast]
  );

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  // Limita o número máximo de toasts visíveis
  useEffect(() => {
    const MAX_TOASTS = 3;
    if (toasts.length > MAX_TOASTS) {
      const toastsToRemove = toasts.slice(0, toasts.length - MAX_TOASTS);
      toastsToRemove.forEach(toast => removeToast(toast.id));
    }
  }, [toasts, removeToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  };
}; 