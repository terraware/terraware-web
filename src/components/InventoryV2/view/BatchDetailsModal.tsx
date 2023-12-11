import React, { useState, useCallback, useEffect } from 'react';
import { Button, DialogBox } from '@terraware/web-components';
import strings from 'src/strings';
import { NurseryBatchesSearchResponseElement } from 'src/services/NurseryBatchService';
import { OriginPage } from 'src/components/InventoryV2/InventoryBatch';
import BatchDetailsForm from 'src/components/InventoryV2/form/BatchDetailsForm';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { requestSaveBatch, SavableBatch } from '../../../redux/features/batches/batchesAsyncThunks';
import { selectBatchesRequest } from '../../../redux/features/batches/batchesSelectors';
import useSnackbar from '../../../utils/useSnackbar';

export interface BatchDetailsModalProps {
  onClose: () => void;
  reload: () => void;
  selectedBatch: NurseryBatchesSearchResponseElement | undefined;
  originId?: number;
  origin: OriginPage;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, reload, selectedBatch, originId, origin } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [requestId, setRequestId] = useState('');

  const batchesRequest = useAppSelector(selectBatchesRequest(requestId));

  const onBatchValidated = useCallback(
    (batchDetails: { batch: SavableBatch; timezone: string } | false) => {
      setDoValidateBatch(false);
      if (batchDetails) {
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
      reload();
      onClose();
    } else if (batchesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setDoValidateBatch(false);
    }
  }, [batchesRequest, reload, onClose, snackbar]);

  return (
    <>
      <DialogBox
        onClose={onClose}
        open={true}
        title={selectedBatch?.id ? strings.ADD_BATCH : strings.BATCH_DETAILS}
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
          onBatchValidated={onBatchValidated}
          doValidateBatch={doValidateBatch}
          selectedBatch={selectedBatch}
          originId={originId}
          origin={origin}
        />
      </DialogBox>
    </>
  );
}
