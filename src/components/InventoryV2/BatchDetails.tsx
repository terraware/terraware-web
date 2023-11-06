import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Card from 'src/components/common/Card';
import { Batch } from 'src/types/Batch';
import OverviewItemCard from '../common/OverviewItemCard';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useEffect, useState } from 'react';
import { NurseryBatchService } from 'src/services';
import PhotosList from '../common/PhotosList';
import useSnackbar from 'src/utils/useSnackbar';
import { Button } from '@terraware/web-components';
import BatchDetailsModal from './BatchDetailsModal';
import { BATCH_PHOTO_ENDPOINT } from 'src/services/NurseryBatchService';

interface BatchDetailsProps {
  batch: Batch;
  onUpdate: () => void;
}

export default function BatchDetails({ batch, onUpdate }: BatchDetailsProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const snackbar = useSnackbar();

  const overviewCardData = [
    {
      title: strings.GERMINATING_QUANTITY,
      data: batch.germinatingQuantity,
    },
    {
      title: '',
      data: '',
    },
    {
      title: strings.NOT_READY_QUANTITY,
      data: batch.notReadyQuantity,
    },
    {
      title: strings.EST_READY_DATE,
      data: batch.readyByDate || '',
    },
    {
      title: strings.READY_QUANTITY,
      data: batch.readyQuantity,
    },
    {
      title: strings.TOTAL_QUANTITY,
      data: batch.readyQuantity + batch.notReadyQuantity,
    },
    {
      title: strings.SUBSTRATE,
      data: batch.substrate || '',
    },
    {
      title: strings.TREATMENT,
      data: batch.treatment || '',
    },
    {
      title: strings.NOTES,
      data: batch.notes || '',
    },
  ];

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
      <Grid container>
        {overviewCardData.map((item) => (
          <Grid item xs={isMobile ? 12 : 6} key={item.title}>
            <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
          </Grid>
        ))}
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
