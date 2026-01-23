import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';

type SimplePlantingSiteMapProps = {
  plantingSiteId: number;
  hideAllControls?: boolean;
  style?: CSSProperties;
};

export default function SimplePlantingSiteMap({ hideAllControls, style }: SimplePlantingSiteMapProps): JSX.Element {
  const { plantingSite } = usePlantingSiteData();

  const mapData = useMemo(() => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    return MapService.getMapDataFromPlantingSite(plantingSite);
  }, [plantingSite]);

  if (plantingSite?.boundary) {
    return (
      <PlantingSiteMap
        mapData={mapData!}
        style={{ width: '100%', borderRadius: '24px', ...style }}
        layers={['Planting Site']}
        hideAllControls={hideAllControls}
      />
    );
  } else {
    return (
      <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
        <CircularProgress />
      </Box>
    );
  }
}
