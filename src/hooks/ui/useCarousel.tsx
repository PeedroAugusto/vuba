import { useState, useCallback, useEffect, useMemo } from 'react';

interface CarouselOptions {
  itemsPerPage?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  loop?: boolean;
}

interface CarouselState {
  currentIndex: number;
  totalPages: number;
  isPlaying: boolean;
}

export const useCarousel = <T,>(items: T[], options: CarouselOptions = {}) => {
  const {
    itemsPerPage = 1,
    autoPlay = false,
    autoPlayInterval = 5000,
    loop = true,
  } = options;

  const [state, setState] = useState<CarouselState>({
    currentIndex: 0,
    totalPages: Math.ceil(items.length / itemsPerPage),
    isPlaying: autoPlay,
  });

  const currentItems = useMemo(() => {
    const startIndex = state.currentIndex * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, state.currentIndex, itemsPerPage]);

  const goToNext = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.totalPages) {
        return loop ? { ...prev, currentIndex: 0 } : prev;
      }
      return { ...prev, currentIndex: nextIndex };
    });
  }, [loop]);

  const goToPrevious = useCallback(() => {
    setState(prev => {
      const previousIndex = prev.currentIndex - 1;
      if (previousIndex < 0) {
        return loop ? { ...prev, currentIndex: prev.totalPages - 1 } : prev;
      }
      return { ...prev, currentIndex: previousIndex };
    });
  }, [loop]);

  const goToPage = useCallback((pageIndex: number) => {
    setState(prev => {
      if (pageIndex < 0 || pageIndex >= prev.totalPages) return prev;
      return { ...prev, currentIndex: pageIndex };
    });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      totalPages: Math.ceil(items.length / itemsPerPage),
    }));
  }, [items.length, itemsPerPage]);

  useEffect(() => {
    let intervalId: number;

    if (state.isPlaying) {
      intervalId = window.setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [state.isPlaying, autoPlayInterval, goToNext]);

  return {
    currentItems,
    currentIndex: state.currentIndex,
    totalPages: state.totalPages,
    isPlaying: state.isPlaying,
    goToNext,
    goToPrevious,
    goToPage,
    toggleAutoPlay,
  };
}; 