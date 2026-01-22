import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrganization, useUser } from 'src/providers';
import strings from 'src/strings';

export default function PlantsDashboardEmptyMessage(): JSX.Element {
  const { goToPlantingSitesView } = useNavigateTo();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isAllowed } = useUser();

  const isAllowedCreatePlantingSite = useMemo(
    () => isAllowed('CREATE_PLANTING_SITE', { organization: selectedOrganization }),
    [isAllowed, selectedOrganization]
  );

  const goToCreatePlantingSite = useCallback(() => goToPlantingSitesView(true), [goToPlantingSitesView]);

  return (
    <Box
      sx={{
        background: theme.palette.TwClrBaseWhite,
        borderRadius: '8px',
        display: 'flex',
        padding: theme.spacing(3),
        justifyContent: 'center',
        marginBottom: theme.spacing(4),
      }}
    >
      <Box paddingRight={2} display={'flex'} alignItems={'center'}>
        <img src='/assets/planting-site-map.svg' alt={strings.PLANTS_DASHBOARD_ICON} />
      </Box>
      <Box>
        <Typography fontSize={'20px'} fontWeight={600}>
          {isAllowedCreatePlantingSite
            ? strings.DASHBOARD_NO_PLANTING_SITES_TITLE_ADMIN
            : strings.DASHBOARD_NO_PLANTING_SITES_TITLE_NON_ADMIN}
        </Typography>
        <Typography paddingTop={1}>
          {isAllowedCreatePlantingSite
            ? strings.DASHBOARD_NO_PLANTING_SITES_DESCRIPTION_ADMIN
            : strings.DASHBOARD_NO_PLANTING_SITES_DESCRIPTION_NON_ADMIN}
        </Typography>
        {isAllowedCreatePlantingSite && (
          <Box marginTop={2}>
            <Button onClick={goToCreatePlantingSite} label={strings.ADD_A_PLANTING_SITE} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
