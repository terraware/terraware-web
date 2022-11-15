import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { Container, Grid, Typography, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FormBottomBar from 'src/components/common/FormBottomBar';
import TfMain from 'src/components/common/TfMain';
import { Batch } from 'src/api/types/batch';
import { getBatch } from 'src/api/batch/batch';
import useSnackbar from 'src/utils/useSnackbar';

export default function WithdrawBatch(): JSX.Element {
  const [batch, setBatch] = useState<Batch>();
  const [snackbar] = useState(useSnackbar());
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const theme = useTheme();
  const { batchId } = useParams<{ batchId: string }>();

  const goToInventory = () => {
    const pathname = batch
      ? APP_PATHS.INVENTORY_ITEM.replace(':speciesId', batch.speciesId.toString())
      : APP_PATHS.INVENTORY;

    history.push({ pathname });
  };

  useEffect(() => {
    const fetchBatch = async () => {
      const response = await getBatch(Number(batchId));
      if (response.requestSucceeded && response.batch) {
        setBatch(response.batch);
      } else {
        snackbar.toastError(response.error);
      }
    };

    if (batchId) {
      fetchBatch();
    }
  }, [batchId, snackbar]);

  return (
    <TfMain>
      <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold' }}>
        {strings.WITHDRAW_FROM_BATCHES}
      </Typography>
      <Container
        maxWidth={false}
        sx={{
          margin: '0 auto',
          width: isMobile ? '100%' : '640px',
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(5),
          paddingBottom: theme.spacing(5),
        }}
      >
        <Grid container minWidth={isMobile ? 0 : 700}>
          <Grid item xs={12}>
            <Typography variant='h2' sx={{ fontSize: '18px', fontWeight: 'bold', marginBottom: theme.spacing(2) }}>
              {strings.WITHDRAWAL_DETAILS}
            </Typography>
            <Typography>{strings.WITHDRAW_INSTRUCTIONS}</Typography>
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar
        onCancel={goToInventory}
        onSave={() => {
          return;
        }}
        saveButtonText={strings.NEXT}
      />
    </TfMain>
  );
}
