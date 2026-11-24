import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import { Grid, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
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
  const theme = useTheme();

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

  const crumbs = useMemo(
    () => [
      {
        name: strings.INVENTORY,
        to: `${APP_PATHS.INVENTORY}?tab=batches_by_nursery&${query.toString()}`,
      },
    ],
    [query]
  );

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={strings
        .formatString(strings.BATCHES_AT, selectedOrganization ? getNurseryName(nurseryId, selectedOrganization) : '')
        .toString()}
      titleStyle={{ fontSize: '20px', marginTop: theme.spacing(3), paddingLeft: theme.spacing(1) }}
    >
      <Grid sx={{ display: 'flex', flexDirection: 'column' }} size={12}>
        <InventorySummaryForNursery nurseryId={nurseryId} />

        <Card flushMobile style={{ marginTop: theme.spacing(3) }}>
          <InventorySeedlingsTableForNursery
            nurseryId={nurseryId}
            onUpdateOpenBatch={setBatchNumber}
            openBatchNumber={openBatchNumber}
            origin={'Nursery'}
          />
        </Card>
      </Grid>
    </Page>
  );
}
