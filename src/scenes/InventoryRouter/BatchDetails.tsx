import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from '../../components/common/OverviewItemCard';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useEffect, useState } from 'react';
import { NurseryBatchService } from 'src/services';
import PhotosList from '../../components/common/PhotosList';
import useSnackbar from 'src/utils/useSnackbar';
import { Button } from '@terraware/web-components';
import BatchDetailsModal from './BatchDetailsModal';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';
import { batchSubstrateEnumToLocalized } from 'src/types/Accession';
import ChangeQuantityModal from 'src/scenes/InventoryRouter/view/ChangeQuantityModal';

interface BatchDetailsProps {
  batch: Batch;
  onUpdate: () => void;
}

export default function BatchDetails({ batch, onUpdate }: BatchDetailsProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();
  const [modalValues, setModalValues] = useState({ type: 'germinating', openChangeQuantityModal: false });

  const batchWithRawQtys = {
    ...batch,
    'germinatingQuantity(raw)': batch.germinatingQuantity,
    'readyQuantity(raw)': batch.readyQuantity,
    'notReadyQuantity(raw)': batch.notReadyQuantity,
  };

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [openEditBatchModal, setOpenEditBatchModal] = useState(false);

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
      getPhotos();
    }
  }, [batch, snackbar]);

  const openEditModal = () => {
    setOpenEditBatchModal(true);
  };

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {openEditBatchModal && (
        <BatchDetailsModal
          reload={onUpdate}
          onClose={() => {
            setOpenEditBatchModal(false);
          }}
          batch={batch}
        />
      )}

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
        <ChangeQuantityModal
          reload={onUpdate}
          onClose={() => setModalValues({ openChangeQuantityModal: false, type: 'germinating' })}
          modalValues={modalValues}
          row={batchWithRawQtys}
        />
      )}
      <Grid container>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={true}
            title={strings.GERMINATING_QUANTITY}
            contents={batch.germinatingQuantity}
            grid={true}
            handleEdit={() => setModalValues({ openChangeQuantityModal: true, type: 'germinating' })}
          />
        </Grid>
        {!isMobile && <Grid item xs={6} paddingRight={theme.spacing(3)} />}
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={true}
            title={strings.NOT_READY_QUANTITY}
            contents={batch.notReadyQuantity}
            grid={true}
            handleEdit={() => setModalValues({ openChangeQuantityModal: true, type: 'not-ready' })}
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
            isEditable={false}
            title={strings.READY_QUANTITY}
            contents={batch.readyQuantity}
            grid={true}
          />
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} paddingRight={theme.spacing(3)}>
          <OverviewItemCard
            isEditable={false}
            title={strings.TOTAL_QUANTITY}
            contents={batch.readyQuantity + batch.notReadyQuantity}
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
