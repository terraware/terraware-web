import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { API_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useListBatchPhotosQuery } from 'src/queries/generated/nurseryBatches';
import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import { batchSubstrateEnumToLocalized } from 'src/types/Accession';
import { Batch } from 'src/types/Batch';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import OverviewItemCard from '../../components/common/OverviewItemCard';
import PhotosList from '../../components/common/PhotosList';
import BatchDetailsModal from './BatchDetailsModal';

interface BatchDetailsProps {
  batch: Batch;
}

export default function BatchDetails({ batch }: BatchDetailsProps): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const numberFormatter = useNumberFormatter();

  const { currentData: batchPhotos, isError: batchPhotosError } = useListBatchPhotosQuery(batch.id);
  const [openEditBatchModal, setOpenEditBatchModal] = useState(false);
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const batchWithRawQtys = {
    ...batch,
    'germinatingQuantity(raw)': batch.germinatingQuantity,
    'hardeningOffQuantity(raw)': batch.hardeningOffQuantity,
    'activeGrowthQuantity(raw)': batch.activeGrowthQuantity,
    'readyQuantity(raw)': batch.readyQuantity,
  };

  const photoUrls = useMemo(
    () =>
      (batchPhotos?.photos ?? []).map(({ id }) =>
        API_PATHS.NURSERY_BATCH_PHOTO.replace('{batchId}', batch.id.toString()).replace('{photoId}', id.toString())
      ),
    [batchPhotos, batch.id]
  );

  useEffect(() => {
    if (batchPhotosError) {
      snackbar.toastError();
    }
  }, [batchPhotosError, snackbar]);

  const openEditModal = useCallback(() => {
    setOpenEditBatchModal(true);
  }, [setOpenEditBatchModal]);

  const closeEditModal = useCallback(() => {
    setOpenEditBatchModal(false);
  }, [setOpenEditBatchModal]);

  const onCloseChangeQuantityModal = useCallback(
    () => setModalValues({ openChangeQuantityModal: false, type: 'germinating' }),
    [setModalValues]
  );

  const handleEditGerminatingQuantity = useCallback(() => {
    setModalValues({ openChangeQuantityModal: true, type: 'germinating' });
  }, [setModalValues]);

  const handleEditActiveGrowthQuantity = useCallback(() => {
    setModalValues({ openChangeQuantityModal: true, type: 'active-growth' });
  }, [setModalValues]);

  const handleEditHardeningOffQuantity = useCallback(() => {
    setModalValues({ openChangeQuantityModal: true, type: 'hardening-off' });
  }, [setModalValues]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {openEditBatchModal && <BatchDetailsModal batch={batch} onClose={closeEditModal} />}

      <Box sx={{ display: 'flex', alignItems: 'center' }} marginBottom={theme.spacing(1)}>
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.DETAILS}
        </Typography>
        <Button
          icon='iconEdit'
          label={isMobile ? undefined : strings.EDIT}
          priority='secondary'
          onClick={openEditModal}
        />
      </Box>
      {modalValues.openChangeQuantityModal && (
        <ChangeQuantityModal modalValues={modalValues} onClose={onCloseChangeQuantityModal} row={batchWithRawQtys} />
      )}
      <Grid container>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.SEEDS_SOWN_DATE}
            contents={batch.seedsSownDate}
            grid={true}
          />
        </Grid>
        {!isMobile && <Grid item xs={6} paddingRight={theme.spacing(3)} />}
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={true}
            title={strings.GERMINATION_ESTABLISHMENT_QUANTITY}
            contents={numberFormatter.format(batch.germinatingQuantity)}
            grid={true}
            handleEdit={handleEditGerminatingQuantity}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.GERMINATION_ESTABLISHMENT_STARTED_DATE}
            contents={batch.germinationStartedDate}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={true}
            title={strings.ACTIVE_GROWTH_QUANTITY}
            contents={numberFormatter.format(batch.activeGrowthQuantity)}
            grid={true}
            handleEdit={handleEditActiveGrowthQuantity}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.EST_READY_DATE}
            contents={batch.readyByDate || ''}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            contents={numberFormatter.format(batch.hardeningOffQuantity)}
            grid
            handleEdit={handleEditHardeningOffQuantity}
            isEditable
            title={strings.HARDENING_OFF_QUANTITY}
          />
        </Grid>
        {!isMobile && <Grid item xs={6} paddingRight={theme.spacing(3)} />}
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.READY_TO_PLANT_QUANTITY}
            contents={numberFormatter.format(batch.readyQuantity)}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.TOTAL_QUANTITY}
            contents={numberFormatter.format(
              batch.readyQuantity + batch.activeGrowthQuantity + batch.hardeningOffQuantity
            )}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.SUBSTRATE}
            contents={batchSubstrateEnumToLocalized(batch.substrate) || ''}
            grid={true}
          />
        </Grid>
        {batch.substrate === 'Other' && (
          <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
            <OverviewItemCard
              isEditable={false}
              title={strings.SUBSTRATE_NOTES}
              contents={batch.substrateNotes || ''}
              grid={true}
            />
          </Grid>
        )}
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard isEditable={false} title={strings.TREATMENT} contents={batch.treatment || ''} grid={true} />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard isEditable={false} title={strings.NOTES} contents={batch.notes || ''} grid={true} />
        </Grid>
      </Grid>
      <Grid>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PHOTOS}
        </Typography>
        <Box display='flex' flexWrap='wrap'>
          <PhotosList photoUrls={photoUrls} />
        </Box>
      </Grid>
    </Card>
  );
}
