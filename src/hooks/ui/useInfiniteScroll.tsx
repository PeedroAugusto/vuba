import { useState, useCallback, useRef, useEffect } from 'react';

interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useInfiniteScroll = <T,>(
  loadMore: () => Promise<T[]>,
  options: InfiniteScrollOptions = {}
) => {
  const {
    threshold = 0.8,
    rootMargin = '20px',
    enabled = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const handleIntersect = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && !isLoading && hasMore && enabled) {
        setIsLoading(true);
        setError(null);

        try {
          const newItems = await loadMore();
          
          if (newItems.length === 0) {
            setHasMore(false);
          } else {
            setItems(prev => [...prev, ...newItems]);
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Erro ao carregar mais itens'));
        } finally {
          setIsLoading(false);
        }
      }
    },
    [isLoading, hasMore, enabled, loadMore]
  );

  const resetItems = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin,
      threshold,
    });

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin, threshold, handleIntersect]);

  useEffect(() => {
    const currentTarget = targetRef.current;
    const currentObserver = observerRef.current;

    if (currentTarget && currentObserver) {
      currentObserver.observe(currentTarget);

      return () => {
        if (currentTarget) {
          currentObserver.unobserve(currentTarget);
        }
      };
    }
  }, []);

  const retry = useCallback(async () => {
    if (!isLoading && error) {
      setError(null);
      setIsLoading(true);

      try {
        const newItems = await loadMore();
        
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setItems(prev => [...prev, ...newItems]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar mais itens'));
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, error, loadMore]);

  return {
    items,
    isLoading,
    hasMore,
    error,
    targetRef,
    resetItems,
    retry,
  };
}; 