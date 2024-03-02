import { useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';

type SimplePlantingSiteMapProps = {
  plantingSiteId: number;
};

export default function SimplePlantingSiteMap({ plantingSiteId }: SimplePlantingSiteMapProps): JSX.Element {
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  const mapData = useMemo(() => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    return MapService.getMapDataFromPlantingSite(plantingSite);
  }, [plantingSite]);

  if (plantingSite?.boundary) {
    return (
      <PlantingSiteMap mapData={mapData!} style={{ width: '100%', borderRadius: '24px' }} layers={['Planting Site']} />
    );
  } else {
    return (
      <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
        <CircularProgress />
      </Box>
    );
  }
}
