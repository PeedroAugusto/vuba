import { useState, useCallback, useRef, useEffect } from 'react';

interface ScrollOptions {
  threshold?: number;
  onScroll?: (position: ScrollPosition) => void;
  onScrollStart?: () => void;
  onScrollEnd?: () => void;
  onScrollToTop?: () => void;
  onScrollToBottom?: () => void;
}

interface ScrollPosition {
  x: number;
  y: number;
  progress: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export const useScroll = (options: ScrollOptions = {}) => {
  const {
    threshold = 50,
    onScroll,
    onScrollStart,
    onScrollEnd,
    onScrollToTop,
    onScrollToBottom,
  } = options;

  const [isScrolling, setIsScrolling] = useState(false);
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    progress: 0,
    direction: null,
    isAtTop: true,
    isAtBottom: false,
  });

  const scrollTimeout = useRef<number>();
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const getScrollPosition = useCallback((element: HTMLElement): ScrollPosition => {
    const { scrollTop, scrollLeft, scrollHeight, clientHeight } = element;
    const maxScrollTop = scrollHeight - clientHeight;

    const x = scrollLeft;
    const y = scrollTop;
    const progress = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * 100 : 0;

    const direction = y > lastPosition.current.y
      ? 'down'
      : y < lastPosition.current.y
      ? 'up'
      : x > lastPosition.current.x
      ? 'right'
      : x < lastPosition.current.x
      ? 'left'
      : null;

    const isAtTop = scrollTop <= threshold;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= threshold;

    lastPosition.current = { x, y };

    return {
      x,
      y,
      progress,
      direction,
      isAtTop,
      isAtBottom,
    };
  }, [threshold]);

  const handleScroll = useCallback(() => {
    if (!elementRef.current) return;

    if (!isScrolling) {
      setIsScrolling(true);
      onScrollStart?.();
    }

    window.clearTimeout(scrollTimeout.current);

    const newPosition = getScrollPosition(elementRef.current);
    setPosition(newPosition);
    onScroll?.(newPosition);

    if (newPosition.isAtTop) {
      onScrollToTop?.();
    }

    if (newPosition.isAtBottom) {
      onScrollToBottom?.();
    }

    scrollTimeout.current = window.setTimeout(() => {
      setIsScrolling(false);
      onScrollEnd?.();
    }, 150);
  }, [
    isScrolling,
    getScrollPosition,
    onScroll,
    onScrollStart,
    onScrollEnd,
    onScrollToTop,
    onScrollToBottom,
  ]);

  const scrollTo = useCallback(
    (options: ScrollToOptions) => {
      if (!elementRef.current) return;

      elementRef.current.scrollTo({
        behavior: 'smooth',
        ...options,
      });
    },
    []
  );

  const scrollToTop = useCallback(() => {
    scrollTo({ top: 0 });
  }, [scrollTo]);

  const scrollToBottom = useCallback(() => {
    if (!elementRef.current) return;

    scrollTo({
      top: elementRef.current.scrollHeight - elementRef.current.clientHeight,
    });
  }, [scrollTo]);

  const scrollIntoView = useCallback(
    (element: HTMLElement, options: ScrollIntoViewOptions = {}) => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    },
    []
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout.current);
    };
  }, [handleScroll]);

  return {
    elementRef,
    position,
    isScrolling,
    scrollTo,
    scrollToTop,
    scrollToBottom,
    scrollIntoView,
  };
}; 