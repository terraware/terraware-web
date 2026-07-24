import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization } from 'src/providers';

import PlantingPlanBox from './PlantingPlanBox';

const PlantingPlansView = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const { isLoading, plantingSites } = useOrganizationPlantingSites({ full: true });

  return (
    <Page title={strings.PLANTING_PLANS} description={strings.MANAGE_PLANTING_PLANS_DESCRIPTION}>
      {isLoading ? (
        <BusySpinner withSkrim={true} />
      ) : plantingSites.length === 0 ? (
        <Card style={{ width: '100%' }} radius={theme.spacing(1)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing(6),
            }}
          >
            <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary}>
              {strings.THERE_ARE_NO_PLANTING_PLANS}
            </Typography>
          </Box>
        </Card>
      ) : (
        <Box sx={{ width: '100%' }}>
          {plantingSites.map((plantingSite) => (
            <PlantingPlanBox key={plantingSite.id} plantingSite={plantingSite} />
          ))}
        </Box>
      )}
    </Page>
  );
};

export default PlantingPlansView;
