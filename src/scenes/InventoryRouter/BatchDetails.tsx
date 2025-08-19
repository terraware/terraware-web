import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';
import { NurseryBatchService } from 'src/services';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';
import { batchSubstrateEnumToLocalized } from 'src/types/Accession';
import { Batch } from 'src/types/Batch';
import useSnackbar from 'src/utils/useSnackbar';

import OverviewItemCard from '../../components/common/OverviewItemCard';
import PhotosList from '../../components/common/PhotosList';
import BatchDetailsModal from './BatchDetailsModal';
import ChangeQuantityModalPrev from './view/ChangeQuantityModalPrev';

interface BatchDetailsProps {
  batch: Batch;
  onUpdate: () => void;
}

export default function BatchDetails({ batch, onUpdate }: BatchDetailsProps): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const isUpdatedNurseryGrowthPhasesEnabled = isEnabled('Updated Nursery Growth Phases');

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [openEditBatchModal, setOpenEditBatchModal] = useState(false);
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const batchWithRawQtys = {
    ...batch,
    'germinatingQuantity(raw)': batch.germinatingQuantity,
    'hardeningOffQuantity(raw)': batch.hardeningOffQuantity,
    'activeGrowthQuantity(raw)': batch.activeGrowthQuantity,
    'readyQuantity(raw)': batch.readyQuantity,
  };

  useEffect(() => {
    const getPhotos = async () => {
      const photoListResponse = await NurseryBatchService.getBatchPhotosList(batch.id);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotoUrls([]);
        snackbar.toastError();
      } else {
        const photoUrlArray: string[] = [];
        photoListResponse.photoIds?.forEach(({ id }: { id: number }) => {
          photoUrlArray.push(
            BATCH_PHOTO_ENDPOINT.replace('{batchId}', batch.id.toString()).replace('{photoId}', id.toString())
          );
        });
        setPhotoUrls(photoUrlArray);
      }
    };

    if (batch) {
      void getPhotos();
    }
  }, [batch, snackbar]);

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
    setModalValues({ openChangeQuantityModal: true, type: 'not-ready' });
  }, [setModalValues]);

  const handleEditHardeningOffQuantity = useCallback(() => {
    setModalValues({ openChangeQuantityModal: true, type: 'hardening-off' });
  }, [setModalValues]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {openEditBatchModal && <BatchDetailsModal batch={batch} onClose={closeEditModal} reload={onUpdate} />}

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
      {modalValues.openChangeQuantityModal &&
        (isUpdatedNurseryGrowthPhasesEnabled ? (
          <ChangeQuantityModal
            modalValues={modalValues}
            onClose={onCloseChangeQuantityModal}
            reload={onUpdate}
            row={batchWithRawQtys}
          />
        ) : (
          <ChangeQuantityModalPrev
            modalValues={modalValues}
            onClose={onCloseChangeQuantityModal}
            reload={onUpdate}
            row={batchWithRawQtys}
          />
        ))}
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
            title={
              isUpdatedNurseryGrowthPhasesEnabled ? strings.GERMINATION_ESTABLISHMENT : strings.GERMINATING_QUANTITY
            }
            contents={batch.germinatingQuantity}
            grid={true}
            handleEdit={handleEditGerminatingQuantity}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={
              isUpdatedNurseryGrowthPhasesEnabled
                ? strings.GERMINATION_ESTABLISHMENT_STARTED_DATE
                : strings.GERMINATION_STARTED_DATE
            }
            contents={batch.germinationStartedDate}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={true}
            title={isUpdatedNurseryGrowthPhasesEnabled ? strings.ACTIVE_GROWTH_QUANTITY : strings.NOT_READY_QUANTITY}
            contents={batch.activeGrowthQuantity}
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
        {isUpdatedNurseryGrowthPhasesEnabled && (
          <>
            <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
              <OverviewItemCard
                contents={batch.hardeningOffQuantity}
                grid
                handleEdit={handleEditHardeningOffQuantity}
                isEditable
                title={strings.HARDENING_OFF_QUANTITY}
              />
            </Grid>
            {!isMobile && <Grid item xs={6} paddingRight={theme.spacing(3)} />}
          </>
        )}
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={isUpdatedNurseryGrowthPhasesEnabled ? strings.READY_TO_PLANT_QUANTITY : strings.READY_QUANTITY}
            contents={batch.readyQuantity}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.TOTAL_QUANTITY}
            contents={batch.readyQuantity + batch.activeGrowthQuantity}
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
