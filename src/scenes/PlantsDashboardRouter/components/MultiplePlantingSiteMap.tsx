import React, { type JSX, useMemo } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import useProjectPlantingSites from 'src/hooks/useProjectPlantingSites';
import strings from 'src/strings';

import PlantDashboardMap from './PlantDashboardMap';

type MultiplePlantingSiteMapProps = {
  projectId: number;
};

export default function MultiplePlantingSiteMap({ projectId }: MultiplePlantingSiteMapProps): JSX.Element {
  const { plantingSites } = useProjectPlantingSites({ projectId, full: true });
  const theme = useTheme();

  const projectPlantingSites = useMemo(
    () => plantingSites?.filter((ps) => ps.projectId === projectId),
    [projectId, plantingSites]
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
          plantingSites={projectPlantingSites}
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
