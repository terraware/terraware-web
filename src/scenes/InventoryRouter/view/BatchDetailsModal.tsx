import React, { type JSX, useCallback, useState } from 'react';

import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { SavableBatch, useSaveBatch } from 'src/hooks/batches/useSaveBatch';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import BatchDetailsForm from 'src/scenes/InventoryRouter/form/BatchDetailsForm';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

export interface BatchDetailsModalProps {
  onClose: () => void;
  originId?: number;
  origin: OriginPage;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, originId, origin } = props;

  const snackbar = useSnackbar();
  const saveBatch = useSaveBatch();
  const markSubmitted = useTrackModalAbandonment('batch_details_view', true);

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);

  const onBatchValidated = useCallback(
    (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => {
      setDoValidateBatch(false);
      if (!batchDetails) {
        return;
      }

      const save = async () => {
        setBusy(true);
        const savedBatch = await saveBatch(batchDetails);
        setBusy(false);

        if (savedBatch) {
          markSubmitted();
          onClose();
        } else {
          snackbar.toastError(strings.GENERIC_ERROR);
          setDoValidateBatch(false);
        }
      };

      void save();
    },
    [markSubmitted, onClose, saveBatch, snackbar]
  );

  const onSaveBatch = useCallback(() => {
    setDoValidateBatch(true);
  }, []);

  return (
    <>
      {busy && <BusySpinner withSkrim={true} />}
      <DialogBox
        onClose={onClose}
        open={true}
        title={strings.ADD_BATCH}
        size='large'
        middleButtons={[
          <Button
            id='cancelBatchDetails'
            label={strings.CANCEL}
            type='passive'
            onClick={onClose}
            priority='secondary'
            key='button-1'
          />,
          <Button id='saveBatchDetails' onClick={onSaveBatch} label={strings.SAVE} key='button-2' />,
        ]}
        scrolled={true}
      >
        <BatchDetailsForm
          doValidateBatch={doValidateBatch}
          onBatchValidated={onBatchValidated}
          originId={originId}
          origin={origin}
        />
      </DialogBox>
    </>
  );
}
