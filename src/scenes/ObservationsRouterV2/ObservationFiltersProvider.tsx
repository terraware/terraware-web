import React, { Dispatch, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { ObservationState } from 'src/types/Observations';

import useStickyObservationsViewMode from './useStickyObservationsViewMode';

export type PlotType = 'assigned' | 'adHoc';
export type ObservationTypeFilter = 'All' | 'Monitoring' | 'Biomass Measurements';
export type ViewMode = 'map' | 'split' | 'list';

export type ObservationDateFilter = {
  from?: string;
  to?: string;
};

export type PlotNumberFilter = {
  max?: number;
  min?: number;
};

export type PlotFilters = {
  dateFilter: ObservationDateFilter;
  plotNumberFilter: PlotNumberFilter;
  statusFilter: ObservationState[];
  stratumFilter: number[];
};

interface ObservationFiltersContextType {
  activeFilterCount: number;
  clearFilters: () => void;
  dateFilter: ObservationDateFilter;
  filtersByPlotType: Record<PlotType, PlotFilters>;
  filtersExpanded: boolean;
  observationType: ObservationTypeFilter;
  plotNumberFilter: PlotNumberFilter;
  plotType: PlotType;
  setDateFilter: Dispatch<SetStateAction<ObservationDateFilter>>;
  setPlotNumberFilter: Dispatch<SetStateAction<PlotNumberFilter>>;
  setFiltersExpanded: (filtersExpanded: boolean) => void;
  setObservationType: (observationType: ObservationTypeFilter) => void;
  setPlotType: (plotType: PlotType) => void;
  setStatusFilter: (statuses: ObservationState[]) => void;
  setStratumFilter: (stratumIds: number[]) => void;
  setViewMode: (viewMode: ViewMode) => void;
  statusFilter: ObservationState[];
  stratumFilter: number[];
  viewMode: ViewMode;
}

const PLOT_TYPE_SESSION_KEY = 'plot-selection';
const OBSERVATION_TYPE_SESSION_KEY = 'observation-type';
const FILTERS_EXPANDED_SESSION_KEY = 'observation-filters-expanded';

const PLOT_TYPES: PlotType[] = ['assigned', 'adHoc'];

const EMPTY_PLOT_FILTERS: PlotFilters = {
  dateFilter: {},
  plotNumberFilter: {},
  statusFilter: [],
  stratumFilter: [],
};

const EMPTY_FILTERS: Record<PlotType, PlotFilters> = {
  adHoc: EMPTY_PLOT_FILTERS,
  assigned: EMPTY_PLOT_FILTERS,
};
const OBSERVATION_TYPES: ObservationTypeFilter[] = ['All', 'Monitoring', 'Biomass Measurements'];

const readSessionValue = <T extends string>(key: string, allowed: T[], fallback: T): T => {
  try {
    const stored = sessionStorage.getItem(key);
    return allowed.includes(stored as T) ? (stored as T) : fallback;
  } catch (e) {
    return fallback;
  }
};

const writeSessionValue = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    /* empty */
  }
};

const ObservationFiltersContext = createContext<ObservationFiltersContextType>({
  activeFilterCount: 0,
  dateFilter: {},
  filtersByPlotType: EMPTY_FILTERS,
  filtersExpanded: false,
  observationType: 'All',
  plotNumberFilter: {},
  plotType: 'assigned',
  /* eslint-disable @typescript-eslint/no-empty-function */
  clearFilters: () => {},
  setDateFilter: () => {},
  setFiltersExpanded: () => {},
  setPlotNumberFilter: () => {},
  setObservationType: () => {},
  setPlotType: () => {},
  setStatusFilter: () => {},
  setStratumFilter: () => {},
  setViewMode: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
  statusFilter: [],
  stratumFilter: [],
  viewMode: 'split',
});

const ObservationFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [plotType, setPlotTypeState] = useState<PlotType>(() =>
    readSessionValue(PLOT_TYPE_SESSION_KEY, PLOT_TYPES, 'assigned')
  );
  const [observationType, setObservationTypeState] = useState<ObservationTypeFilter>(() =>
    readSessionValue(OBSERVATION_TYPE_SESSION_KEY, OBSERVATION_TYPES, 'All')
  );
  const { setViewMode, viewMode } = useStickyObservationsViewMode();
  const [filtersExpanded, setFiltersExpandedState] = useState(
    () => readSessionValue(FILTERS_EXPANDED_SESSION_KEY, ['true', 'false'], 'false') === 'true'
  );
  // Assigned and ad-hoc plots are filtered on different fields, so each keeps its own filters.
  const [filtersByPlotType, setFiltersByPlotType] = useState<Record<PlotType, PlotFilters>>(EMPTY_FILTERS);

  const { dateFilter, plotNumberFilter, statusFilter, stratumFilter } = filtersByPlotType[plotType];

  const updateFilters = useCallback(
    (update: (filters: PlotFilters) => PlotFilters) =>
      setFiltersByPlotType((current) => ({ ...current, [plotType]: update(current[plotType]) })),
    [plotType]
  );

  const setDateFilter = useCallback(
    (update: SetStateAction<ObservationDateFilter>) =>
      updateFilters((filters) => ({
        ...filters,
        dateFilter: typeof update === 'function' ? update(filters.dateFilter) : update,
      })),
    [updateFilters]
  );

  const setPlotNumberFilter = useCallback(
    (update: SetStateAction<PlotNumberFilter>) =>
      updateFilters((filters) => ({
        ...filters,
        plotNumberFilter: typeof update === 'function' ? update(filters.plotNumberFilter) : update,
      })),
    [updateFilters]
  );

  const setStatusFilter = useCallback(
    (statuses: ObservationState[]) => updateFilters((filters) => ({ ...filters, statusFilter: statuses })),
    [updateFilters]
  );

  const setStratumFilter = useCallback(
    (stratumIds: number[]) => updateFilters((filters) => ({ ...filters, stratumFilter: stratumIds })),
    [updateFilters]
  );

  const setPlotType = useCallback((nextPlotType: PlotType) => {
    setPlotTypeState(nextPlotType);
    writeSessionValue(PLOT_TYPE_SESSION_KEY, nextPlotType);
  }, []);

  const setObservationType = useCallback((nextObservationType: ObservationTypeFilter) => {
    setObservationTypeState(nextObservationType);
    writeSessionValue(OBSERVATION_TYPE_SESSION_KEY, nextObservationType);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersByPlotType((current) => ({ ...current, [plotType]: EMPTY_PLOT_FILTERS }));
    if (plotType === 'adHoc') {
      setObservationType('All');
    }
  }, [plotType, setObservationType]);

  // Counts the filters in use, not the values within them, so a date range counts once.
  const activeFilterCount = [
    dateFilter.from !== undefined || dateFilter.to !== undefined,
    plotType === 'adHoc' && observationType !== 'All',
    plotType === 'adHoc' && (plotNumberFilter.min !== undefined || plotNumberFilter.max !== undefined),
    plotType === 'assigned' && statusFilter.length > 0,
    plotType === 'assigned' && stratumFilter.length > 0,
  ].filter(Boolean).length;

  const setFiltersExpanded = useCallback((nextFiltersExpanded: boolean) => {
    setFiltersExpandedState(nextFiltersExpanded);
    writeSessionValue(FILTERS_EXPANDED_SESSION_KEY, `${nextFiltersExpanded}`);
  }, []);

  const value = useMemo(
    () => ({
      activeFilterCount,
      clearFilters,
      dateFilter,
      filtersByPlotType,
      filtersExpanded,
      observationType: plotType === 'assigned' ? ('Monitoring' as const) : observationType,
      plotNumberFilter,
      plotType,
      setDateFilter,
      setPlotNumberFilter,
      setFiltersExpanded,
      setObservationType,
      setPlotType,
      setStatusFilter,
      setStratumFilter,
      setViewMode,
      statusFilter,
      stratumFilter,
      viewMode,
    }),
    [
      activeFilterCount,
      clearFilters,
      dateFilter,
      filtersByPlotType,
      filtersExpanded,
      observationType,
      plotNumberFilter,
      plotType,
      setDateFilter,
      setFiltersExpanded,
      setObservationType,
      setPlotNumberFilter,
      setPlotType,
      setStatusFilter,
      setStratumFilter,
      setViewMode,
      statusFilter,
      stratumFilter,
      viewMode,
    ]
  );

  return <ObservationFiltersContext.Provider value={value}>{children}</ObservationFiltersContext.Provider>;
};

export const useObservationFilters = () => useContext(ObservationFiltersContext);

export default ObservationFiltersProvider;
