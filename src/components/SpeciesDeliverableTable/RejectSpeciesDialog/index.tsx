import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import RejectDialog from 'src/components/AcceleratorDeliverableView/RejectDialog';
import useUpdateAcceleratorProjectSpecies from 'src/hooks/useUpdateAcceleratorProjectSpecies';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';
import useSnackbar from 'src/utils/useSnackbar';

import { RejectSpeciesDialogContext } from './Context';

type Props = {
  children: ReactNode;
};

const RejectSpeciesDialogProvider = ({ children }: Props) => {
  const snackbar = useSnackbar();
  const { update } = useUpdateAcceleratorProjectSpecies();
  const [speciesToReject, setSpeciesToReject] = useState<AcceleratorProjectSpecies>();

  const closeRejectDialog = useCallback(() => setSpeciesToReject(undefined), []);

  const rejectSpecies = useCallback(
    (feedback: string) => {
      if (speciesToReject) {
        void update({ ...speciesToReject, feedback, submissionStatus: 'Rejected' }).catch(() => snackbar.toastError());
      }
      closeRejectDialog();
    },
    [closeRejectDialog, snackbar, speciesToReject, update]
  );

  const value = useMemo(() => ({ openRejectDialog: setSpeciesToReject }), []);

  return (
    <RejectSpeciesDialogContext.Provider value={value}>
      {speciesToReject && <RejectDialog onClose={closeRejectDialog} onSubmit={rejectSpecies} />}
      {children}
    </RejectSpeciesDialogContext.Provider>
  );
};

export default RejectSpeciesDialogProvider;
