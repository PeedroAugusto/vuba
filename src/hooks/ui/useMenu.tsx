import { useState, useCallback, useEffect, useRef } from 'react';

interface MenuOptions {
  closeOnSelect?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface Position {
  top: number;
  left: number;
}

export const useMenu = (options: MenuOptions = {}) => {
  const {
    closeOnSelect = true,
    closeOnClickOutside = true,
    closeOnEsc = true,
    placement = 'bottom',
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);

  const calculatePosition = useCallback(() => {
    if (!anchorRef.current || !menuRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = anchorRect.top - menuRect.height + scrollY;
        left = anchorRect.left + (anchorRect.width - menuRect.width) / 2 + scrollX;
        break;
      case 'bottom':
        top = anchorRect.bottom + scrollY;
        left = anchorRect.left + (anchorRect.width - menuRect.width) / 2 + scrollX;
        break;
      case 'left':
        top = anchorRect.top + (anchorRect.height - menuRect.height) / 2 + scrollY;
        left = anchorRect.left - menuRect.width + scrollX;
        break;
      case 'right':
        top = anchorRect.top + (anchorRect.height - menuRect.height) / 2 + scrollY;
        left = anchorRect.right + scrollX;
        break;
    }

    // Ajusta a posição para manter o menu dentro da janela
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + menuRect.width > windowWidth) {
      left = windowWidth - menuRect.width;
    }
    if (top + menuRect.height > windowHeight) {
      top = windowHeight - menuRect.height;
    }

    setPosition({ top, left });
  }, [placement]);

  const open = useCallback(() => {
    setIsOpen(true);
    // Calcula a posição no próximo frame para garantir que o menu está renderizado
    requestAnimationFrame(calculatePosition);
  }, [calculatePosition]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  const handleSelect = useCallback(() => {
    if (closeOnSelect) {
      close();
    }
  }, [closeOnSelect, close]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        close();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnClickOutside &&
        menuRef.current &&
        anchorRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (closeOnEsc) {
      document.addEventListener('keydown', handleEsc);
    }

    if (closeOnClickOutside) {
      document.addEventListener('click', handleClickOutside);
    }

    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      if (closeOnEsc) {
        document.removeEventListener('keydown', handleEsc);
      }
      if (closeOnClickOutside) {
        document.removeEventListener('click', handleClickOutside);
      }
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOpen, closeOnEsc, closeOnClickOutside, close, calculatePosition]);

  return {
    isOpen,
    position,
    anchorRef,
    menuRef,
    open,
    close,
    toggle,
    handleSelect,
  };
}; 