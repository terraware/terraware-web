import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';

export default function PlantsDashboardEmptyMessage(): JSX.Element {
  const { goToPlantingSitesView } = useNavigateTo();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();

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
          {isAdmin(selectedOrganization)
            ? strings.DASHBOARD_NO_PLANTING_SITES_TITLE_ADMIN
            : strings.DASHBOARD_NO_PLANTING_SITES_TITLE_NON_ADMIN}
        </Typography>
        <Typography paddingTop={1}>
          {isAdmin(selectedOrganization)
            ? strings.DASHBOARD_NO_PLANTING_SITES_DESCRIPTION_ADMIN
            : strings.DASHBOARD_NO_PLANTING_SITES_DESCRIPTION_NON_ADMIN}
        </Typography>
        <Box marginTop={2}>
          <Button onClick={() => goToPlantingSitesView(true)} label={strings.ADD_A_PLANTING_SITE} />
        </Box>
      </Box>
    </Box>
  );
}
