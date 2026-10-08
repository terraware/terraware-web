import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useProjects } from 'src/hooks/useProjects';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import DetailField from './DetailField';

type DraftPlantingSiteDetailsCardProps = {
  plantingSite: DraftPlantingSite;
};

export default function DraftPlantingSiteDetailsCard({ plantingSite }: DraftPlantingSiteDetailsCardProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const tz = useLocationTimeZone().get(plantingSite);
  const { selectedProject } = useProjects(plantingSite);

  return (
    <Card flushMobile radius={theme.spacing(1)} title={strings.DETAILS}>
      <Box
        display='grid'
        gridTemplateColumns={isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))'}
        columnGap={theme.spacing(4)}
        rowGap={theme.spacing(3)}
        marginTop={theme.spacing(2)}
      >
        <DetailField label={strings.NAME} value={plantingSite.name} />
        <DetailField label={strings.DESCRIPTION} value={plantingSite.description} />
        <DetailField
          label={strings.TIME_ZONE}
          tooltipTitle={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
          value={tz.longName}
        />
        <DetailField label={strings.PROJECT} value={selectedProject?.name} />
      </Box>
    </Card>
  );
}
