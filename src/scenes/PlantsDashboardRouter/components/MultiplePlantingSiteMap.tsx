import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

import PlantDashboardMap from './PlantDashboardMap';

type MultiplePlantingSiteMapProps = {
  projectId: number;
  hideAllControls?: boolean;
  style?: CSSProperties;
};

export default function MultiplePlantingSiteMap({ projectId }: MultiplePlantingSiteMapProps): JSX.Element {
  const { allPlantingSites } = usePlantingSiteData();
  const theme = useTheme();

  const plantingSites = useMemo(
    () => allPlantingSites?.filter((ps) => ps.projectId === projectId),
    [projectId, allPlantingSites]
  );

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
