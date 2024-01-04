import React, { useState, useCallback, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox, ErrorBox } from '@terraware/web-components';
import strings from 'src/strings';
import { NurseryBatchesSearchResponseElement } from 'src/services/NurseryBatchService';
import { OriginPage } from 'src/components/InventoryV2/InventoryBatch';
import BatchDetailsForm from 'src/components/InventoryV2/form/BatchDetailsForm';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { requestSaveBatch, SavableBatch } from '../../../redux/features/batches/batchesAsyncThunks';
import { selectBatchesRequest } from '../../../redux/features/batches/batchesSelectors';
import useSnackbar from '../../../utils/useSnackbar';

const useStyles = makeStyles(() => ({
  error: {
    '& .error-box--container': {
      alignItems: 'center',
      width: 'auto',
    },
    '&.error-box': {
      width: 'auto',
    },
  },
}));

export interface BatchDetailsModalProps {
  onClose: () => void;
  reload: () => void;
  selectedBatch: NurseryBatchesSearchResponseElement | undefined;
  originId?: number;
  origin: OriginPage;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, reload, selectedBatch, originId, origin } = props;

  const classes = useStyles();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [requestId, setRequestId] = useState('');
  const [errorPageMessage, setErrorPageMessage] = useState<string>('');

  const setErrorMessage = useCallback(
    (errorMessage: string) => setErrorPageMessage(errorMessage),
    [setErrorPageMessage]
  );

  const batchesRequest = useAppSelector(selectBatchesRequest(requestId));

  const onBatchValidated = useCallback(
    (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => {
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
        title={!selectedBatch?.id ? strings.ADD_BATCH : strings.BATCH_DETAILS}
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
        {errorPageMessage && (
          <Box display='flex' flexGrow={1} marginBottom={theme.spacing(2)}>
            <ErrorBox text={errorPageMessage} className={classes.error} />
          </Box>
        )}
        <BatchDetailsForm
          doValidateBatch={doValidateBatch}
          errorPageMessage={errorPageMessage}
          onBatchValidated={onBatchValidated}
          originId={originId}
          origin={origin}
          selectedBatch={selectedBatch}
          setErrorPageMessage={setErrorMessage}
        />
      </DialogBox>
    </>
  );
}
