import React, { type JSX, useEffect, useState } from 'react';

import { Grid, List, ListItem, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import { useProjects } from 'src/hooks/useProjects';
import strings from 'src/strings';
import { MinimalPlantingSite, PlantingSeason } from 'src/types/Tracking';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export type PlantingSiteDetailsCardProps = {
  plantingSite: MinimalPlantingSite;
};

export default function PlantingSiteDetailsCard({ plantingSite }: PlantingSiteDetailsCardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const tz = useLocationTimeZone().get(plantingSite);
  const [plantingSeasons, setPlantingSeasons] = useState<PlantingSeason[]>([]);
  const { selectedProject } = useProjects(plantingSite);

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    if (plantingSite.plantingSeasons) {
      // Only show upcoming planting seasons.
      const today = DateTime.fromJSDate(new Date(), { zone: tz.id }).toISODate();
      if (today) {
        const upcomingSeasons = plantingSite.plantingSeasons.filter(
          (plantingSeason) => plantingSeason.endDate >= today
        );
        setPlantingSeasons(upcomingSeasons);
      }
    }
  }, [plantingSite, tz.id]);

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
      {plantingSite.strata && (
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.UPCOMING_PLANTING_SEASONS}
            id='upcomingPlantingSeasons'
            type='text'
            display={true}
          />
          <List dense={true}>
            {plantingSeasons.map((plantingSeason) => (
              <ListItem disableGutters={true} key={plantingSeason.id}>
                {strings.formatString(strings.DATE_RANGE, plantingSeason.startDate, plantingSeason.endDate)}
              </ListItem>
            ))}
          </List>
        </Grid>
      )}
      <Grid item xs={gridSize()} display='flex'>
        <TextField display={true} id='project' label={strings.PROJECT} type='text' value={selectedProject?.name} />
      </Grid>
    </Grid>
  );
}
