import React, { createContext, useContext, useMemo, useState } from 'react';

interface SelectedObservationContextType {
  selectObservation: (observationId: number | undefined) => void;
  selectedObservationId?: number;
}

const SelectedObservationContext = createContext<SelectedObservationContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  selectObservation: () => {},
});

const SelectedObservationProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedObservationId, setSelectedObservationId] = useState<number>();

  const value = useMemo(
    () => ({ selectObservation: setSelectedObservationId, selectedObservationId }),
    [selectedObservationId]
  );

  return <SelectedObservationContext.Provider value={value}>{children}</SelectedObservationContext.Provider>;
};

export const useSelectedObservation = () => useContext(SelectedObservationContext);

export default SelectedObservationProvider;
