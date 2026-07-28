import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { SavableBatch, useSaveBatch } from 'src/hooks/batches/useSaveBatch';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useUser } from 'src/providers';
import { InventoryListType, InventoryListTypes } from 'src/scenes/InventoryRouter/InventoryV2View';
import BatchDetailsForm from 'src/scenes/InventoryRouter/form/BatchDetailsForm';
import useSnackbar from 'src/utils/useSnackbar';

export default function InventoryCreateView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const saveBatch = useSaveBatch();
  const { userPreferences } = useUser();
  const originInventoryViewType: InventoryListType =
    (userPreferences.inventoryListType as InventoryListType) || InventoryListTypes.BATCHES_BY_SPECIES;

  const [doValidateBatch, setDoValidateBatch] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const trackEvent = useTrackEvent();

  const inventoryLocation = useMemo(
    () => ({
      pathname: APP_PATHS.INVENTORY,
    }),
    []
  );

  const goToInventory = useCallback(() => {
    navigate(inventoryLocation);
  }, [navigate, inventoryLocation]);

  const onBatchValidated = useCallback(
    (batchDetails: { batch: SavableBatch; organizationId: number; timezone: string } | false) => {
      setDoValidateBatch(false);
      if (!batchDetails) {
        return;
      }

      const fromAccession = batchDetails.batch.accessionId !== undefined;

      const save = async () => {
        setBusy(true);
        const savedBatch = await saveBatch(batchDetails);
        setBusy(false);

        if (!savedBatch) {
          snackbar.toastError(strings.GENERIC_ERROR);
          setDoValidateBatch(false);
          return;
        }

        trackEvent(MIXPANEL_EVENTS.BATCH_CREATED, {
          species_id: savedBatch.speciesId,
          from_accession: fromAccession,
        });
        navigate(inventoryLocation, { replace: true });

        if (originInventoryViewType === InventoryListTypes.BATCHES_BY_NURSERY) {
          navigate({
            pathname: APP_PATHS.INVENTORY_BATCH_FOR_NURSERY.replace(':nurseryId', `${savedBatch.facilityId}`).replace(
              ':batchId',
              `${savedBatch.id}`
            ),
          });
        } else if (originInventoryViewType === InventoryListTypes.BATCHES_BY_BATCH) {
          navigate({
            pathname: APP_PATHS.INVENTORY_BATCH.replace(':batchId', `${savedBatch.id}`),
          });
        } else {
          navigate({
            pathname: APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', `${savedBatch.speciesId}`).replace(
              ':batchId',
              `${savedBatch.id}`
            ),
          });
        }
      };

      void save();
    },
    [inventoryLocation, navigate, originInventoryViewType, saveBatch, snackbar, strings, trackEvent]
  );

  const onSaveBatch = useCallback(() => {
    setDoValidateBatch(true);
  }, []);

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
