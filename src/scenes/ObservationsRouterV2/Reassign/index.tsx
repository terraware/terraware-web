import React, { createContext, useCallback, useContext, useState } from 'react';

import ReplaceObservationPlotModal from './ReplaceObservationPlotModal';

interface ReassignPlotModalContextType {
  open: boolean;
  monitoringPlotId?: number;
  observationId?: number;
  openReassignPlotModal: (observationId: number, monitoringPlotId: number) => void;
  closeReassignPlotModal: () => void;
}

const ReassignPlotModalContext = createContext<ReassignPlotModalContextType>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openReassignPlotModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeReassignPlotModal: () => {},
});

const ReassignPlotModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [monitoringPlotId, setMonitoringPlotId] = useState<number>();
  const [observationId, setObservationId] = useState<number>();

  const openReassignPlotModal = useCallback((nextObservationId: number, nextMonitoringPlotId: number) => {
    setOpen(true);
    setMonitoringPlotId(nextMonitoringPlotId);
    setObservationId(nextObservationId);
  }, []);

  const closeReassignPlotModal = useCallback(() => {
    setOpen(false);
    setMonitoringPlotId(undefined);
    setObservationId(undefined);
  }, [setMonitoringPlotId, setObservationId, setOpen]);

  return (
    <ReassignPlotModalContext.Provider
      value={{ open, monitoringPlotId, observationId, openReassignPlotModal, closeReassignPlotModal }}
    >
      {children}
      <ReplaceObservationPlotModal />
    </ReassignPlotModalContext.Provider>
  );
};

export const useReassignPlotModal = () => useContext(ReassignPlotModalContext);

export default ReassignPlotModalProvider;
