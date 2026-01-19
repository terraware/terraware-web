import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import BatchDetailsForm from 'src/scenes/InventoryRouter/form/BatchDetailsForm';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { SavableBatch, requestSaveBatch } from '../../../redux/features/batches/batchesAsyncThunks';
import { selectBatchesRequest } from '../../../redux/features/batches/batchesSelectors';
import { useAppDispatch, useAppSelector } from '../../../redux/store';

export interface BatchDetailsModalProps {
  onClose: () => void;
  reload: () => void;
  originId?: number;
  origin: OriginPage;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, reload, originId, origin } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [requestId, setRequestId] = useState('');
  const [busy, setBusy] = useState<boolean>(false);

  const batchesRequest = useAppSelector(selectBatchesRequest(requestId));

  const onBatchValidated = useCallback(
    (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => {
      setDoValidateBatch(false);
      if (batchDetails) {
        setBusy(true);
        const request = dispatch(requestSaveBatch(batchDetails));
        setRequestId(request.requestId);
      }
    },
    [dispatch]
  );

  const onSaveBatch = useCallback(() => {
    setDoValidateBatch(true);
  }, []);

  useEffect(() => {
    if (batchesRequest?.status === 'success') {
      setBusy(false);
      reload();
      onClose();
    } else if (batchesRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setDoValidateBatch(false);
    }
  }, [batchesRequest, reload, onClose, snackbar]);

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
