import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import PlantingSiteMapV2 from 'src/scenes/PlantingSitesRouter/view/PlantingSiteMapV2';

const PlantingPlanDetailsView = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { plantingSite, isLoading } = usePlantingSite(plantingSiteId);

  const crumbs = useMemo(
    (): Crumb[] => [{ name: strings.PLANTING_PLANS, to: APP_PATHS.PLANTING_PLANS }],
    [strings.PLANTING_PLANS]
  );

  if (isLoading || !plantingSite) {
    return <BusySpinner withSkrim={true} />;
  }

  return (
    <Page title={plantingSite.name} crumbs={crumbs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
        <Card
          flushMobile
          style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', marginTop: theme.spacing(2) }}
        >
          {plantingSite.boundary && plantingSite.strata && <PlantingSiteMapV2 plantingSiteId={plantingSite.id} />}
        </Card>
      </Box>
    </Page>
  );
};

export default PlantingPlanDetailsView;
