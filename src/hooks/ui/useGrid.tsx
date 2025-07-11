import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface GridOptions {
  itemsPerPage?: number;
  initialSortField?: string;
  initialSortDirection?: 'asc' | 'desc';
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface GridState<T> {
  currentPage: number;
  totalPages: number;
  sortConfig: SortConfig;
  searchTerm: string;
  filteredItems: T[];
}

export const useGrid = <T extends Record<string, any>>(
  items: T[],
  options: GridOptions = {}
) => {
  const {
    itemsPerPage = 10,
    initialSortField = '',
    initialSortDirection = 'asc',
  } = options;

  const [state, setState] = useState<GridState<T>>({
    currentPage: 0,
    totalPages: Math.ceil(items.length / itemsPerPage),
    sortConfig: {
      field: initialSortField,
      direction: initialSortDirection,
    },
    searchTerm: '',
    filteredItems: items,
  });

  const debouncedSearchTerm = useDebounce(state.searchTerm, 300);

  const sortedItems = useMemo(() => {
    const { field, direction } = state.sortConfig;
    if (!field) return state.filteredItems;

    return [...state.filteredItems].sort((a, b) => {
      if (a[field] === b[field]) return 0;
      
      const modifier = direction === 'asc' ? 1 : -1;
      
      if (typeof a[field] === 'string') {
        return a[field].localeCompare(b[field]) * modifier;
      }
      
      return ((a[field] < b[field]) ? -1 : 1) * modifier;
    });
  }, [state.filteredItems, state.sortConfig]);

  const currentItems = useMemo(() => {
    const startIndex = state.currentPage * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, state.currentPage, itemsPerPage]);

  const handleSort = useCallback((field: string) => {
    setState(prev => {
      const direction = 
        prev.sortConfig.field === field && prev.sortConfig.direction === 'asc'
          ? 'desc'
          : 'asc';
      
      return {
        ...prev,
        currentPage: 0,
        sortConfig: { field, direction },
      };
    });
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setState(prev => ({
      ...prev,
      searchTerm,
      currentPage: 0,
    }));
  }, []);

  const handlePageChange = useCallback((pageIndex: number) => {
    setState(prev => {
      if (pageIndex < 0 || pageIndex >= prev.totalPages) return prev;
      return { ...prev, currentPage: pageIndex };
    });
  }, []);

  // Atualiza os itens filtrados quando o termo de busca muda
  useMemo(() => {
    const filtered = items.filter(item =>
      Object.values(item).some(value =>
        String(value)
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      )
    );

    setState(prev => ({
      ...prev,
      filteredItems: filtered,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: Math.min(prev.currentPage, Math.ceil(filtered.length / itemsPerPage) - 1),
    }));
  }, [items, debouncedSearchTerm, itemsPerPage]);

  return {
    currentItems,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    sortConfig: state.sortConfig,
    searchTerm: state.searchTerm,
    handleSort,
    handleSearch,
    handlePageChange,
  };
}; 