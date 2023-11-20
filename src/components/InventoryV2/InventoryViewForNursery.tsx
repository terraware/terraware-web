import React, { useRef, useState } from 'react';
import { useTheme, Grid, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import BackToLink from 'src/components/common/BackToLink';
import { useOrganization } from 'src/providers';
import InventorySummaryForNursery from './view/InventorySummaryForNursery';
import InventorySeedlingsForNurseryTable from './view/InventorySeedlingsForNurseryTable';
import { getNurseryName } from './FilterUtils';

export default function InventoryViewForNursery(): JSX.Element {
  const pathParams = useParams<{ nurseryId: string }>();
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);
  const theme = useTheme();

  const [modified, setModified] = useState<number>(Date.now());

  const nurseryId = Number(pathParams.nurseryId);

  // TODO in SW-4392
  // tslint:disable-next-line:no-empty
  const onUpdateOpenBatch = () => {};

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BackToLink id='back' name={strings.INVENTORY} to={`${APP_PATHS.INVENTORY}?tab=batches_by_nursery`} />
        <Grid container>
          <Typography
            sx={{
              marginTop: theme.spacing(3),
              marginBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
              fontSize: '20px',
              fontWeight: 600,
              fontStyle: 'bold',
            }}
          >
            {strings.formatString(strings.BATCHES_AT, getNurseryName(nurseryId, selectedOrganization))}
          </Typography>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          <InventorySummaryForNursery modified={modified} nurseryId={nurseryId} />
          <InventorySeedlingsForNurseryTable
            nurseryId={nurseryId}
            modified={modified}
            setModified={setModified}
            // TODO in SW-4392
            onUpdateOpenBatch={onUpdateOpenBatch}
            openBatchNumber={null}
            //////////////////
          />
        </Grid>
      </Grid>
    </TfMain>
  );
}
