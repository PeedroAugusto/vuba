import { useState, useCallback, useRef, useEffect } from 'react';

interface ResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
  onResize?: (width: number, height: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export const useResize = (options: ResizeOptions = {}) => {
  const {
    minWidth = 0,
    maxWidth = Infinity,
    minHeight = 0,
    maxHeight = Infinity,
    aspectRatio,
    onResize,
    onResizeStart,
    onResizeEnd,
  } = options;

  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const elementRef = useRef<HTMLElement | null>(null);
  const startPosition = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>({ width: 0, height: 0 });

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!elementRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();

      startPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      startSize.current = {
        width: rect.width,
        height: rect.height,
      };

      setIsResizing(true);
      onResizeStart?.();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onResizeStart]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isResizing || !elementRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.clientX - startPosition.current.x;
      const deltaY = event.clientY - startPosition.current.y;

      let newWidth = startSize.current.width + deltaX;
      let newHeight = startSize.current.height + deltaY;

      // Aplica restrições de tamanho mínimo e máximo
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      // Mantém a proporção de aspecto se especificada
      if (aspectRatio) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      onResize?.(newWidth, newHeight);
    },
    [isResizing, minWidth, maxWidth, minHeight, maxHeight, aspectRatio, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    onResizeEnd?.();

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [onResizeEnd, handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const initResize = useCallback(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();

    setSize({
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    if (elementRef.current) {
      initResize();
    }
  }, [initResize]);

  const getHandleProps = useCallback(
    () => ({
      onMouseDown: handleMouseDown,
      style: {
        cursor: 'se-resize',
        userSelect: 'none',
      },
    }),
    [handleMouseDown]
  );

  return {
    elementRef,
    size,
    isResizing,
    getHandleProps,
  };
}; 