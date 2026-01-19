import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import { SavableBatch, requestSaveBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import { selectBatchesRequest } from 'src/redux/features/batches/batchesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { InventoryListType, InventoryListTypes } from 'src/scenes/InventoryRouter/InventoryV2View';
import BatchDetailsForm from 'src/scenes/InventoryRouter/form/BatchDetailsForm';
import useSnackbar from 'src/utils/useSnackbar';

export default function InventoryCreateView(): JSX.Element {
  const { strings } = useLocalization();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { userPreferences } = useUser();
  const originInventoryViewType: InventoryListType =
    (userPreferences.inventoryListType as InventoryListType) || InventoryListTypes.BATCHES_BY_SPECIES;

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

  const inventoryLocation = useMemo(
    () => ({
      pathname: APP_PATHS.INVENTORY,
    }),
    []
  );

  const goToInventory = useCallback(() => {
    navigate(inventoryLocation);
  }, [navigate, inventoryLocation]);

  useEffect(() => {
    if (batchesRequest?.status === 'success') {
      setBusy(false);
      navigate(inventoryLocation, { replace: true });

      const batchId = batchesRequest?.data?.batch?.id;
      const facilityId = batchesRequest?.data?.batch?.facilityId;
      const speciesId = batchesRequest?.data?.batch?.speciesId;

      // we can assume the batchId, facilityId and speciesId will be valid upon a successful create

      if (originInventoryViewType === InventoryListTypes.BATCHES_BY_NURSERY) {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${facilityId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      } else if (originInventoryViewType === InventoryListTypes.BATCHES_BY_BATCH) {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH.replace(':batchId', `${batchId}`),
        });
      } else {
        navigate({
          pathname: APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${speciesId}`).replace(
            ':batchId',
            `${batchId}`
          ),
        });
      }
    } else if (batchesRequest?.status === 'error') {
      setBusy(false);
      snackbar.toastError(strings.GENERIC_ERROR);
      setDoValidateBatch(false);
    }
  }, [batchesRequest, navigate, inventoryLocation, originInventoryViewType, snackbar, strings]);

  return (
    <TfMain>
      <PageForm
        busy={busy}
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
