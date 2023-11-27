import React, { useRef, useState } from 'react';
import { useTheme, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import BackToLink from 'src/components/common/BackToLink';
import { useOrganization } from 'src/providers';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useQuery from 'src/utils/useQuery';
import InventorySummaryForNursery from 'src/components/InventoryV2/view/InventorySummaryForNursery';
import InventorySeedlingsForNurseryTable from 'src/components/InventoryV2/view/InventorySeedlingsForNurseryTable';
import { getNurseryName } from './FilterUtils';

export default function InventoryViewForNursery(): JSX.Element {
  const query = useQuery();
  const navigate = useNavigate();
  const location = useStateLocation();
  const pathParams = useParams<{ nurseryId: string }>();
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);
  const theme = useTheme();

  const [modified, setModified] = useState<number>(Date.now());

  const nurseryId = Number(pathParams.nurseryId);
  const openBatchNumber = (query.get('batch') || '').toLowerCase();

  const setBatchNumber = (batchNum: string | null) => {
    if (batchNum === null) {
      query.delete('batch');
    } else {
      query.set('batch', batchNum);
    }
    navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
  };

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
            onUpdateOpenBatch={setBatchNumber}
            openBatchNumber={openBatchNumber}
          />
        </Grid>
      </Grid>
    </TfMain>
  );
}
