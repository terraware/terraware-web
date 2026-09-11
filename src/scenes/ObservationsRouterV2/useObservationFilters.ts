import { useCallback, useState } from 'react';

export type PlotType = 'assigned' | 'adHoc';
export type ObservationTypeFilter = 'Monitoring' | 'Biomass Measurements';

const PLOT_TYPE_SESSION_KEY = 'plot-selection';
const OBSERVATION_TYPE_SESSION_KEY = 'observation-type';

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

/**
 * Which observations the observations views are showing: assigned or ad-hoc plots, and for ad-hoc
 * plots, plant monitoring or biomass measurements. Biomass measurements only ever come from ad-hoc
 * plots, so `observationType` is meaningless while `plotType` is 'assigned'.
 */
const useObservationFilters = () => {
  const [plotType, setPlotTypeState] = useState<PlotType>(() =>
    readSessionValue(PLOT_TYPE_SESSION_KEY, PLOT_TYPES, 'assigned')
  );
  const [observationType, setObservationTypeState] = useState<ObservationTypeFilter>(() =>
    readSessionValue(OBSERVATION_TYPE_SESSION_KEY, OBSERVATION_TYPES, 'Monitoring')
  );

  const setPlotType = useCallback((nextPlotType: PlotType) => {
    setPlotTypeState(nextPlotType);
    writeSessionValue(PLOT_TYPE_SESSION_KEY, nextPlotType);
  }, []);

  const setObservationType = useCallback((nextObservationType: ObservationTypeFilter) => {
    setObservationTypeState(nextObservationType);
    writeSessionValue(OBSERVATION_TYPE_SESSION_KEY, nextObservationType);
  }, []);

  return {
    observationType: plotType === 'assigned' ? ('Monitoring' as const) : observationType,
    plotType,
    setObservationType,
    setPlotType,
  };
};

export default useObservationFilters;
