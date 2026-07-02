import React, { type JSX } from 'react';

import { Grid, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useProjects } from 'src/hooks/useProjects';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export type PlantingSiteDetailsCardProps = {
  plantingSite: MinimalPlantingSite;
};

export default function PlantingSiteDetailsCard({ plantingSite }: PlantingSiteDetailsCardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const tz = useLocationTimeZone().get(plantingSite);
  const { selectedProject } = useProjects(plantingSite);

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <Grid container>
      <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
        <TextField label={strings.NAME} id='name' type='text' value={plantingSite.name} display={true} />
      </Grid>
      <Grid item xs={gridSize()}>
        <TextField
          label={strings.DESCRIPTION}
          id='description'
          type='text'
          value={plantingSite.description}
          display={true}
        />
      </Grid>
      <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
        <TextField
          label={strings.TIME_ZONE}
          id='timezone'
          type='text'
          value={tz.longName}
          tooltipTitle={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
          display={true}
        />
      </Grid>
      <Grid item xs={gridSize()} display='flex'>
        <TextField display={true} id='project' label={strings.PROJECT} type='text' value={selectedProject?.name} />
      </Grid>
      {isEnabled('Planting Seasons') && (
        <Grid item xs={gridSize()} display='flex' alignItems='center' marginTop={isMobile ? 2 : 0}>
          <Link fontSize='16px' to={`${APP_PATHS.PLANTING_SEASONS}?plantingSiteId=${plantingSite.id}`}>
            {strings.MANAGE_PLANTING_SEASONS}
          </Link>
        </Grid>
      )}
    </Grid>
  );
}
