import React, { CSSProperties, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import PlantDashboardMap from './PlantDashboardMap';

type MultiplePlantingSiteMapProps = {
  projectId: number;
  organizationId: number;
  hideAllControls?: boolean;
  style?: CSSProperties;
};

export default function MultiplePlantingSiteMap({
  projectId,
  organizationId,
}: MultiplePlantingSiteMapProps): JSX.Element {
  const { allPlantingSites } = usePlantingSiteData();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const theme = useTheme();

  useEffect(() => {
    if (allPlantingSites) {
      const plantingSitesList = allPlantingSites.filter((ps) => ps.projectId === projectId);

      setPlantingSites(plantingSitesList);
    }
  }, [projectId, organizationId, allPlantingSites]);

  const totalArea = useMemo(() => {
    return plantingSites?.reduce((sum, site) => sum + (site?.areaHa ?? 0), 0) || 0;
  }, [plantingSites]);

  if (plantingSites) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          padding: theme.spacing(1),
          gap: theme.spacing(3),
        }}
      >
        <Typography fontSize='20px' fontWeight={600}>
          {strings.formatString(
            strings.X_HA_IN_TOTAL_PLANTING_AREA,
            <FormattedNumber value={Math.round(totalArea * 100) / 100} />
          )}
        </Typography>
        <PlantDashboardMap
          disableObserationEvents
          disablePhotoMarkers
          disablePlantMarkers
          disableSurvivalRate
          plantingSites={plantingSites}
          observationResults={[]}
        />
      </Box>
    );
  } else {
    return (
      <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
        <CircularProgress />
      </Box>
    );
  }
}
