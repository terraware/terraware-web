import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AdHocPlotSelection = {
  monitoringPlotId: number;
  observationId: number;
  plantingSiteId: number;
};

interface SelectedObservationContextType {
  clearAdHocPlot: () => void;
  selectAdHocPlot: (plot: AdHocPlotSelection) => void;
  selectObservation: (observationId: number | undefined) => void;
  // The map opens its drawer for this plot, whether the list or the map itself selected it.
  selectedAdHocPlot?: AdHocPlotSelection;
  selectedObservationId?: number;
}

const SelectedObservationContext = createContext<SelectedObservationContextType>({
  /* eslint-disable @typescript-eslint/no-empty-function */
  clearAdHocPlot: () => {},
  selectAdHocPlot: () => {},
  selectObservation: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
});

const SelectedObservationProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedObservationId, setSelectedObservationId] = useState<number>();
  const [selectedAdHocPlot, setSelectedAdHocPlot] = useState<AdHocPlotSelection>();

  const selectAdHocPlot = useCallback((plot: AdHocPlotSelection) => {
    setSelectedObservationId(plot.observationId);
    setSelectedAdHocPlot(plot);
  }, []);

  const clearAdHocPlot = useCallback(() => {
    // Dropping the plot drops the selection it stood for, so the list stops showing it as selected.
    if (selectedAdHocPlot) {
      setSelectedObservationId((observationId) =>
        observationId === selectedAdHocPlot.observationId ? undefined : observationId
      );
    }
    setSelectedAdHocPlot(undefined);
  }, [selectedAdHocPlot]);

  const selectObservation = useCallback((observationId: number | undefined) => {
    setSelectedObservationId(observationId);
    setSelectedAdHocPlot(undefined);
  }, []);

  const value = useMemo(
    () => ({ clearAdHocPlot, selectAdHocPlot, selectObservation, selectedAdHocPlot, selectedObservationId }),
    [clearAdHocPlot, selectAdHocPlot, selectObservation, selectedAdHocPlot, selectedObservationId]
  );

  return <SelectedObservationContext.Provider value={value}>{children}</SelectedObservationContext.Provider>;
};

export const useSelectedObservation = () => useContext(SelectedObservationContext);

export default SelectedObservationProvider;
