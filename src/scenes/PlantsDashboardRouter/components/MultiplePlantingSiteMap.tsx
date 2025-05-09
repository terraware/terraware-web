import React, { CSSProperties, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { useLocalization } from 'src/providers';
import { MapService, TrackingService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';

type MultiplePlantingSiteMapProps = {
  projectId: number;
  organizationId: number;
  hideAllControls?: boolean;
  style?: CSSProperties;
};

export default function MultiplePlantingSiteMap({
  projectId,
  organizationId,
  hideAllControls,
  style,
}: MultiplePlantingSiteMapProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await TrackingService.listPlantingSites(organizationId, undefined, activeLocale);
      if (serverResponse.requestSucceeded) {
        const plantingSitesList = projectId ? serverResponse.sites?.filter((ps) => ps.projectId === projectId) : [];

        setPlantingSites(plantingSitesList);
      }
    };

    void populatePlantingSites();
  }, [projectId, organizationId]);

  const mapData = useMemo(() => {
    if (plantingSites) {
      return MapService.getMapDataFromPlantingSites(plantingSites);
    }
  }, [plantingSites]);

  if (plantingSites) {
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
