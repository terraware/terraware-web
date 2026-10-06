import { createContext, useContext } from 'react';

import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';

type RejectSpeciesDialogData = {
  openRejectDialog: (acceleratorProjectSpecies: AcceleratorProjectSpecies) => void;
};

export const RejectSpeciesDialogContext = createContext<RejectSpeciesDialogData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openRejectDialog: () => {},
});

export const useRejectSpeciesDialog = () => useContext(RejectSpeciesDialogContext);
