import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import PageForm from 'src/components/common/PageForm';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import BatchDetailsForm from 'src/components/InventoryV2/form/BatchDetailsForm';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectBatchesRequest } from 'src/redux/features/batches/batchesSelectors';
import { requestSaveBatch, SavableBatch } from 'src/redux/features/batches/batchesAsyncThunks';

export default function InventoryCreateView(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const history = useHistory();
  const snackbar = useSnackbar();

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [requestId, setRequestId] = useState('');

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

  const inventoryLocation = useMemo(
    () => ({
      pathname: APP_PATHS.INVENTORY,
    }),
    []
  );

  const goToInventory = useCallback(() => {
    history.push(inventoryLocation);
  }, [history, inventoryLocation]);

  useEffect(() => {
    if (batchesRequest?.status === 'success') {
      history.replace(inventoryLocation);

      const speciesId = batchesRequest?.data?.speciesId;
      if (speciesId) {
        history.push({
          pathname: APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', `${speciesId}`),
        });
      } else {
        goToInventory();
      }
    } else if (batchesRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setDoValidateBatch(false);
    }
  }, [batchesRequest, goToInventory, history, inventoryLocation, snackbar]);

  return (
    <TfMain>
      <PageForm
        cancelID='cancelAddInventory'
        saveID='saveAddInventory'
        onCancel={goToInventory}
        onSave={onSaveBatch}
        saveButtonText={strings.SAVE}
      >
        <Typography sx={{ paddingLeft: theme.spacing(3), fontWeight: 600, fontSize: '24px' }}>
          {strings.ADD_INVENTORY}
        </Typography>
        <Box
          display='flex'
          flexDirection='column'
          margin='0 auto'
          maxWidth='584px'
          marginTop={5}
          marginBottom={5}
          padding={theme.spacing(3)}
          borderRadius='16px'
          sx={{ backgroundColor: theme.palette.TwClrBg }}
        >
          <Typography variant='h2' sx={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: 1 }}>
            {strings.ADD_INVENTORY}
          </Typography>
          <Typography sx={{ fontSize: '14px' }}>{strings.ADD_INVENTORY_DESCRIPTION}</Typography>
          <Box marginTop={theme.spacing(3)}>
            <BatchDetailsForm
              onBatchValidated={onBatchValidated}
              doValidateBatch={doValidateBatch}
              origin={'InventoryAdd'}
            />
          </Box>
        </Box>
      </PageForm>
    </TfMain>
  );
}
