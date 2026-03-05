import { useEffect, useState } from 'react';

import {
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_DensityState,
  MRT_SortingState,
  MRT_VisibilityState,
} from 'material-react-table';

type UseTableStateOptions = {
  defaultSorting?: MRT_SortingState;
  persistFilters?: boolean;
  persistSorting?: boolean;
};

const useTableState = (storageKey: string, options?: UseTableStateOptions) => {
  const { defaultSorting = [], persistFilters = false, persistSorting = false } = options ?? {};

  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-columnOrder`);
      return saved ? (JSON.parse(saved) as MRT_ColumnOrderState) : [];
    } catch {
      return [];
    }
  });

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}-columnVisibility`);
      return saved ? (JSON.parse(saved) as MRT_VisibilityState) : {};
    } catch {
      return {};
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
      return saved ? (JSON.parse(saved) as MRT_ColumnFiltersState) : [];
    } catch {
      return [];
    }
  });

  const [showColumnFilters, setShowColumnFilters] = useState<boolean>(() => {
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

  const [showGlobalFilter, setShowGlobalFilter] = useState(false);

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
    if (!persistSorting) {
      return;
    }
    try {
      localStorage.setItem(`${storageKey}-sorting`, JSON.stringify(sorting));
    } catch {
      // ignore
    }
  }, [persistSorting, sorting, storageKey]);

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
    columnFilters,
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    setColumnFilters,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    setSorting,
    showColumnFilters,
    showGlobalFilter,
    sorting,
  };
};

export default useTableState;
