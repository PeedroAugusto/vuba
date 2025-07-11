import { useState, useCallback, useEffect } from 'react';

interface ModalOptions {
  closeOnEsc?: boolean;
  closeOnClickOutside?: boolean;
  preventScroll?: boolean;
}

export const useModal = (options: ModalOptions = {}) => {
  const {
    closeOnEsc = true,
    closeOnClickOutside = true,
    preventScroll = true,
  } = options;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        close();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (closeOnClickOutside && (event.target as HTMLElement).classList.contains('modal-overlay')) {
        close();
      }
    };

    if (closeOnEsc) {
      document.addEventListener('keydown', handleEsc);
    }

    if (closeOnClickOutside) {
      document.addEventListener('click', handleClickOutside);
    }

    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (closeOnEsc) {
        document.removeEventListener('keydown', handleEsc);
      }

      if (closeOnClickOutside) {
        document.removeEventListener('click', handleClickOutside);
      }

      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, closeOnEsc, closeOnClickOutside, preventScroll, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}; 