import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { MapService } from 'src/services';
import { MinimalPlantingSite } from 'src/types/Tracking';

type SimplePlantingSiteMapProps = {
  hideAllControls?: boolean;
  plantingSiteId: number;
  style?: CSSProperties;
};

export default function SimplePlantingSiteMap({
  hideAllControls,
  plantingSiteId,
  style,
}: SimplePlantingSiteMapProps): JSX.Element {
  const plantingSiteResponse = useGetPlantingSiteQuery({ id: plantingSiteId, includeZones: false });
  const plantingSite: MinimalPlantingSite | undefined = plantingSiteResponse.currentData?.site;

  const mapData = useMemo(() => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    return MapService.getMapDataFromPlantingSite(plantingSite);
  }, [plantingSite]);

  if (mapData) {
    return (
      <PlantingSiteMap
        mapData={mapData}
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
