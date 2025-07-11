import { useState, useCallback, useRef, useEffect } from 'react';

interface TooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  delay?: number;
  followCursor?: boolean;
}

interface Position {
  top: number;
  left: number;
}

export const useTooltip = (options: TooltipOptions = {}) => {
  const {
    placement = 'top',
    offset = 8,
    delay = 200,
    followCursor = false,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const targetRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  const showTimeoutRef = useRef<number>();

  const calculatePosition = useCallback(
    (event?: MouseEvent) => {
      if (!targetRef.current || !tooltipRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      if (followCursor && event) {
        switch (placement) {
          case 'top':
            top = event.pageY - tooltipRect.height - offset;
            left = event.pageX - tooltipRect.width / 2;
            break;
          case 'bottom':
            top = event.pageY + offset;
            left = event.pageX - tooltipRect.width / 2;
            break;
          case 'left':
            top = event.pageY - tooltipRect.height / 2;
            left = event.pageX - tooltipRect.width - offset;
            break;
          case 'right':
            top = event.pageY - tooltipRect.height / 2;
            left = event.pageX + offset;
            break;
        }
      } else {
        switch (placement) {
          case 'top':
            top = targetRect.top - tooltipRect.height - offset + scrollY;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + scrollX;
            break;
          case 'bottom':
            top = targetRect.bottom + offset + scrollY;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2 + scrollX;
            break;
          case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2 + scrollY;
            left = targetRect.left - tooltipRect.width - offset + scrollX;
            break;
          case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2 + scrollY;
            left = targetRect.right + offset + scrollX;
            break;
        }
      }

      // Ajusta a posição para manter o tooltip dentro da janela
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + tooltipRect.width > windowWidth) {
        left = windowWidth - tooltipRect.width;
      }
      if (top + tooltipRect.height > windowHeight) {
        top = windowHeight - tooltipRect.height;
      }

      setPosition({ top, left });
    },
    [placement, offset, followCursor]
  );

  const show = useCallback(
    (event?: MouseEvent) => {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
        requestAnimationFrame(() => calculatePosition(event));
      }, delay);
    },
    [delay, calculatePosition]
  );

  const hide = useCallback(() => {
    clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!targetRef.current || !followCursor) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (isVisible) {
        calculatePosition(event);
      }
    };

    targetRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      targetRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible, followCursor, calculatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => {
      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, calculatePosition]);

  return {
    isVisible,
    position,
    targetRef,
    tooltipRef,
    show,
    hide,
  };
}; 