import React, { createContext, useCallback, useContext, useState } from 'react';

import AbandonObservationModal from './AbandonObservationModal';

interface AbandonObservationModalContextType {
  open: boolean;
  observationId?: number;
  openAbandonObservationModal: (observationId: number) => void;
  closeAbandonObservationModal: () => void;
}

const AbandonObservationModalContext = createContext<AbandonObservationModalContextType>({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openAbandonObservationModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeAbandonObservationModal: () => {},
});

const AbandonObservationModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [observationId, setObservationId] = useState<number>();

  const openAbandonObservationModal = useCallback((nextObservationId: number) => {
    setOpen(true);
    setObservationId(nextObservationId);
  }, []);

  const closeAbandonObservationModal = useCallback(() => {
    setOpen(false);
    setObservationId(undefined);
  }, [setObservationId, setOpen]);

  return (
    <AbandonObservationModalContext.Provider
      value={{ open, observationId, openAbandonObservationModal, closeAbandonObservationModal }}
    >
      {children}
      <AbandonObservationModal />
    </AbandonObservationModalContext.Provider>
  );
};

export const useAbandonObservationModal = () => useContext(AbandonObservationModalContext);

export default AbandonObservationModalProvider;
