import React, { Dispatch, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from 'react';

export type PlotType = 'assigned' | 'adHoc';
export type ObservationTypeFilter = 'Monitoring' | 'Biomass Measurements';

export type ObservationDateFilter = {
  from?: string;
  to?: string;
};

interface ObservationFiltersContextType {
  dateFilter: ObservationDateFilter;
  filtersExpanded: boolean;
  observationType: ObservationTypeFilter;
  plotType: PlotType;
  setDateFilter: Dispatch<SetStateAction<ObservationDateFilter>>;
  setFiltersExpanded: (filtersExpanded: boolean) => void;
  setObservationType: (observationType: ObservationTypeFilter) => void;
  setPlotType: (plotType: PlotType) => void;
}

const PLOT_TYPE_SESSION_KEY = 'plot-selection';
const OBSERVATION_TYPE_SESSION_KEY = 'observation-type';
const FILTERS_EXPANDED_SESSION_KEY = 'observation-filters-expanded';

const PLOT_TYPES: PlotType[] = ['assigned', 'adHoc'];
const OBSERVATION_TYPES: ObservationTypeFilter[] = ['Monitoring', 'Biomass Measurements'];

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
  observationType: 'Monitoring',
  plotType: 'assigned',
  /* eslint-disable @typescript-eslint/no-empty-function */
  setDateFilter: () => {},
  setFiltersExpanded: () => {},
  setObservationType: () => {},
  setPlotType: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
});

const ObservationFiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [plotType, setPlotTypeState] = useState<PlotType>(() =>
    readSessionValue(PLOT_TYPE_SESSION_KEY, PLOT_TYPES, 'assigned')
  );
  const [observationType, setObservationTypeState] = useState<ObservationTypeFilter>(() =>
    readSessionValue(OBSERVATION_TYPE_SESSION_KEY, OBSERVATION_TYPES, 'Monitoring')
  );
  const [filtersExpanded, setFiltersExpandedState] = useState(
    () => readSessionValue(FILTERS_EXPANDED_SESSION_KEY, ['true', 'false'], 'false') === 'true'
  );
  const [dateFilter, setDateFilter] = useState<ObservationDateFilter>({});

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
      plotType,
      setDateFilter,
      setFiltersExpanded,
      setObservationType,
      setPlotType,
    }),
    [dateFilter, filtersExpanded, observationType, plotType, setFiltersExpanded, setObservationType, setPlotType]
  );

  return <ObservationFiltersContext.Provider value={value}>{children}</ObservationFiltersContext.Provider>;
};

export const useObservationFilters = () => useContext(ObservationFiltersContext);

export default ObservationFiltersProvider;
