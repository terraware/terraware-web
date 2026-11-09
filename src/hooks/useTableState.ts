import { useEffect, useState } from 'react';

import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_ColumnPinningState,
  MRT_DensityState,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_VisibilityState,
} from 'material-react-table';

import { TableSettings } from 'src/components/common/CurrentView/tableSettings';
import { TableDefinition } from 'src/types/Tables';
import normalizePersistedColumnFilters from 'src/utils/tableColumnFilters';

type UseTableStateOptions = {
  defaultColumnOrder?: MRT_ColumnOrderState;
  defaultColumnPinning?: MRT_ColumnPinningState;
  defaultColumnVisibility?: MRT_VisibilityState;
  defaultSorting?: MRT_SortingState;
  persistedMultiSelectColumnIds?: string[];
  persistColumnPinning?: boolean;
  persistFilters?: boolean;
  persistGlobalFilter?: boolean;
  persistSorting?: boolean;
  persistPageIndex?: {
    isLoading?: boolean;
    scope?: string;
  };
};

const mergeColumnOrder = (
  saved: MRT_ColumnOrderState,
  defaultColumnOrder: MRT_ColumnOrderState
): MRT_ColumnOrderState => {
  const merged = [...saved];

  defaultColumnOrder.forEach((id, index) => {
    if (merged.includes(id)) {
      return;
    }
    const precedingId = defaultColumnOrder
      .slice(0, index)
      .reverse()
      .find((candidate) => merged.includes(candidate));
    merged.splice(precedingId === undefined ? 0 : merged.indexOf(precedingId) + 1, 0, id);
  });

  return merged;
};

const useTableState = ({ storageKey }: TableDefinition, options?: UseTableStateOptions) => {
  const {
    defaultColumnOrder = [],
    defaultColumnPinning = {},
    defaultColumnVisibility = {},
    defaultSorting = [],
    persistedMultiSelectColumnIds = [],
    persistColumnPinning = false,
    persistFilters = false,
    persistGlobalFilter = false,
    persistSorting = false,
    persistPageIndex,
  } = options ?? {};

  const pageIndexStorageKey = persistPageIndex
    ? `${storageKey}-pageIndex${persistPageIndex.scope ? `-${persistPageIndex.scope}` : ''}`
    : undefined;

  const readPageIndex = () => {
    try {
      const savedIndex = pageIndexStorageKey ? Number(sessionStorage.getItem(pageIndexStorageKey)) : 0;
      return Number.isSafeInteger(savedIndex) && savedIndex > 0 ? savedIndex : 0;
    } catch {
      return 0;
    }
  };

  const persistedMultiSelectIds = new Set(persistedMultiSelectColumnIds);

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-columnOrder`);
      return saved
        ? mergeColumnOrder(JSON.parse(saved) as MRT_ColumnOrderState, defaultColumnOrder)
        : defaultColumnOrder;
    } catch {
      return defaultColumnOrder;
    }
  });

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-columnVisibility`);
      if (!saved) {
        return defaultColumnVisibility;
      }
      return { ...defaultColumnVisibility, ...(JSON.parse(saved) as MRT_VisibilityState) };
    } catch {
      return defaultColumnVisibility;
    }
  });

  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(() => {
    if (!persistColumnPinning) {
      return defaultColumnPinning;
    }
    try {
      const saved = localStorage.getItem(`${storageKey}-columnPinning`);
      return saved ? (JSON.parse(saved) as MRT_ColumnPinningState) : defaultColumnPinning;
    } catch {
      return defaultColumnPinning;
    }
  });

  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    if (!persistGlobalFilter) {
      return '';
    }
    try {
      return localStorage.getItem(`${storageKey}-globalFilter`) ?? '';
    } catch {
      return '';
    }
  });

  const [density, setDensity] = useState<MRT_DensityState>(() => {
    try {
      return (localStorage.getItem(`${storageKey}-density`) as MRT_DensityState) || 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(() => {
    if (!persistFilters) {
      return [];
    }
    try {
      const saved = localStorage.getItem(`${storageKey}_columnFilters`);
      if (!saved) {
        return [];
      }
      return normalizePersistedColumnFilters(JSON.parse(saved) as MRT_ColumnFiltersState, persistedMultiSelectIds);
    } catch {
      return [];
    }
  });

  const [showColumnFilters, setShowColumnFilters] = useState<boolean>(() => {
    if (!persistFilters) {
      return false;
    }
    try {
      const saved = localStorage.getItem(`${storageKey}_columnFilters`);
      if (saved) {
        const parsed = JSON.parse(saved) as MRT_ColumnFiltersState;
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [showGlobalFilter, setShowGlobalFilter] = useState(() => !!globalFilter);

  const [pagination, setPagination] = useState<MRT_PaginationState>(() => {
    try {
      const savedPageSize = localStorage.getItem(`${storageKey}-pageSize`);
      const parsedSize = savedPageSize ? Number(savedPageSize) : null;
      return {
        pageIndex: readPageIndex(),
        pageSize: parsedSize && !isNaN(parsedSize) && parsedSize > 0 ? parsedSize : 10,
      };
    } catch {
      return { pageIndex: readPageIndex(), pageSize: 10 };
    }
  });

  const [paginationStorageKey, setPaginationStorageKey] = useState(pageIndexStorageKey);
  const [isRestoringPageIndex, setIsRestoringPageIndex] = useState(!!pageIndexStorageKey);
  if (paginationStorageKey !== pageIndexStorageKey) {
    setPaginationStorageKey(pageIndexStorageKey);
    setIsRestoringPageIndex(!!pageIndexStorageKey);
    setPagination((prev) => ({ ...prev, pageIndex: readPageIndex() }));
  }

  const isLoadingPage = persistPageIndex?.isLoading ?? false;
  useEffect(() => {
    if (!isLoadingPage) {
      setIsRestoringPageIndex(false);
    }
  }, [pageIndexStorageKey, isLoadingPage]);

  useEffect(() => {
    if (!pageIndexStorageKey || isLoadingPage) {
      return;
    }
    try {
      sessionStorage.setItem(pageIndexStorageKey, String(pagination.pageIndex));
    } catch {
      // ignore
    }
  }, [pageIndexStorageKey, pagination.pageIndex, isLoadingPage]);

  const onPaginationChange = (updater: MRT_PaginationState | ((prev: MRT_PaginationState) => MRT_PaginationState)) => {
    setPagination((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(`${storageKey}-pageSize`, String(next.pageSize));
      } catch {
        // ignore
      }
      return isLoadingPage ? { ...next, pageIndex: prev.pageIndex } : next;
    });
  };

  const [sorting, setSorting] = useState<MRT_SortingState>(() => {
    if (persistSorting) {
      try {
        const saved = localStorage.getItem(`${storageKey}-sorting`);
        return saved ? (JSON.parse(saved) as MRT_SortingState) : defaultSorting;
      } catch {
        return defaultSorting;
      }
    }
    return defaultSorting;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}-columnOrder`, JSON.stringify(columnOrder));
    } catch {
      // ignore
    }
  }, [columnOrder, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}-columnVisibility`, JSON.stringify(columnVisibility));
    } catch {
      // ignore
    }
  }, [columnVisibility, storageKey]);

  useEffect(() => {
    if (!persistFilters) {
      return;
    }
    try {
      localStorage.setItem(`${storageKey}_columnFilters`, JSON.stringify(columnFilters));
    } catch {
      // ignore
    }
  }, [columnFilters, persistFilters, storageKey]);

  useEffect(() => {
    if (!persistColumnPinning) {
      return;
    }
    try {
      localStorage.setItem(`${storageKey}-columnPinning`, JSON.stringify(columnPinning));
    } catch {
      // ignore
    }
  }, [columnPinning, persistColumnPinning, storageKey]);

  useEffect(() => {
    if (!persistGlobalFilter) {
      return;
    }
    try {
      localStorage.setItem(`${storageKey}-globalFilter`, globalFilter ?? '');
    } catch {
      // ignore
    }
  }, [globalFilter, persistGlobalFilter, storageKey]);

  useEffect(() => {
    if (!persistSorting) {
      return;
    }
    try {
      localStorage.setItem(`${storageKey}-sorting`, JSON.stringify(sorting));
    } catch {
      // ignore
    }
  }, [persistSorting, sorting, storageKey]);

  const [defaultViewSettings] = useState<Partial<TableSettings>>(() => ({
    ...(options?.defaultColumnOrder && { columnOrder: options.defaultColumnOrder }),
    ...(options?.defaultColumnPinning && { columnPinning: options.defaultColumnPinning }),
    ...(options?.defaultColumnVisibility && { columnVisibility: options.defaultColumnVisibility }),
    ...(options?.defaultSorting && { sorting: options.defaultSorting }),
  }));

  const onDensityChange = (updater: MRT_DensityState | ((prev: MRT_DensityState) => MRT_DensityState)) => {
    setDensity((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(`${storageKey}-density`, next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  return {
    autoResetPageIndex: pageIndexStorageKey ? !isRestoringPageIndex : undefined,
    columnFilters,
    columnOrder,
    columnPinning,
    columnVisibility,
    defaultViewSettings,
    density,
    globalFilter,
    isLoadingPage,
    onDensityChange,
    onPaginationChange,
    pagination,
    setColumnFilters,
    setColumnOrder,
    setColumnPinning,
    setColumnVisibility,
    setGlobalFilter,
    setShowColumnFilters,
    setShowGlobalFilter,
    setSorting,
    showColumnFilters,
    showGlobalFilter,
    sorting,
  };
};

export default useTableState;
