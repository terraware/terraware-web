import React, { Dispatch, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { ObservationState } from 'src/types/Observations';

export type PlotType = 'assigned' | 'adHoc';
export type ObservationTypeFilter = 'All' | 'Monitoring' | 'Biomass Measurements';

export type ObservationDateFilter = {
  from?: string;
  to?: string;
};

export type PlotNumberFilter = {
  max?: number;
  min?: number;
};

interface ObservationFiltersContextType {
  dateFilter: ObservationDateFilter;
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
  statusFilter: ObservationState[];
  stratumFilter: number[];
}

const PLOT_TYPE_SESSION_KEY = 'plot-selection';
const OBSERVATION_TYPE_SESSION_KEY = 'observation-type';
const FILTERS_EXPANDED_SESSION_KEY = 'observation-filters-expanded';

const PLOT_TYPES: PlotType[] = ['assigned', 'adHoc'];
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
  dateFilter: {},
  filtersExpanded: false,
  observationType: 'All',
  plotNumberFilter: {},
  plotType: 'assigned',
  /* eslint-disable @typescript-eslint/no-empty-function */
  setDateFilter: () => {},
  setFiltersExpanded: () => {},
  setPlotNumberFilter: () => {},
  setObservationType: () => {},
  setPlotType: () => {},
  setStatusFilter: () => {},
  setStratumFilter: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
  statusFilter: [],
  stratumFilter: [],
});

const ObservationFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [plotType, setPlotTypeState] = useState<PlotType>(() =>
    readSessionValue(PLOT_TYPE_SESSION_KEY, PLOT_TYPES, 'assigned')
  );
  const [observationType, setObservationTypeState] = useState<ObservationTypeFilter>(() =>
    readSessionValue(OBSERVATION_TYPE_SESSION_KEY, OBSERVATION_TYPES, 'All')
  );
  const [filtersExpanded, setFiltersExpandedState] = useState(
    () => readSessionValue(FILTERS_EXPANDED_SESSION_KEY, ['true', 'false'], 'false') === 'true'
  );
  const [dateFilter, setDateFilter] = useState<ObservationDateFilter>({});
  const [plotNumberFilter, setPlotNumberFilter] = useState<PlotNumberFilter>({});
  const [statusFilter, setStatusFilter] = useState<ObservationState[]>([]);
  const [stratumFilter, setStratumFilter] = useState<number[]>([]);

  const setPlotType = useCallback((nextPlotType: PlotType) => {
    setPlotTypeState(nextPlotType);
    writeSessionValue(PLOT_TYPE_SESSION_KEY, nextPlotType);
  }, []);

  const setObservationType = useCallback((nextObservationType: ObservationTypeFilter) => {
    setObservationTypeState(nextObservationType);
    writeSessionValue(OBSERVATION_TYPE_SESSION_KEY, nextObservationType);
  }, []);

  const setFiltersExpanded = useCallback((nextFiltersExpanded: boolean) => {
    setFiltersExpandedState(nextFiltersExpanded);
    writeSessionValue(FILTERS_EXPANDED_SESSION_KEY, `${nextFiltersExpanded}`);
  }, []);

  const value = useMemo(
    () => ({
      dateFilter,
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
      statusFilter,
      stratumFilter,
    }),
    [
      dateFilter,
      filtersExpanded,
      observationType,
      plotNumberFilter,
      plotType,
      setFiltersExpanded,
      setObservationType,
      setPlotType,
      statusFilter,
      stratumFilter,
    ]
  );

  return <ObservationFiltersContext.Provider value={value}>{children}</ObservationFiltersContext.Provider>;
};

export const useObservationFilters = () => useContext(ObservationFiltersContext);

export default ObservationFiltersProvider;
