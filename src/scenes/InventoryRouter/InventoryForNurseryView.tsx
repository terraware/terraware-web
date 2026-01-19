import React, { type JSX, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import InventorySeedlingsTableForNursery from 'src/scenes/InventoryRouter/view/InventorySeedlingsTableForNursery';
import InventorySummaryForNursery from 'src/scenes/InventoryRouter/view/InventorySummaryForNursery';
import strings from 'src/strings';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import { getNurseryName } from './FilterUtils';

export default function InventoryForNurseryView(): JSX.Element {
  const query = useQuery();
  const navigate = useSyncNavigate();
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
        <BackToLink
          id='back'
          name={strings.INVENTORY}
          to={`${APP_PATHS.INVENTORY}?tab=batches_by_nursery&${query.toString()}`}
        />
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
            {strings.formatString(
              strings.BATCHES_AT,
              selectedOrganization ? getNurseryName(nurseryId, selectedOrganization) : ''
            )}
          </Typography>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          <InventorySummaryForNursery modified={modified} nurseryId={nurseryId} />

          <Card flushMobile style={{ marginTop: theme.spacing(3) }}>
            <InventorySeedlingsTableForNursery
              nurseryId={nurseryId}
              modified={modified}
              setModified={setModified}
              onUpdateOpenBatch={setBatchNumber}
              openBatchNumber={openBatchNumber}
              origin={'Nursery'}
            />
          </Card>
        </Grid>
      </Grid>
    </TfMain>
  );
}
