import React, { CSSProperties, type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { MapService } from 'src/services';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { toDraft } from 'src/utils/draftPlantingSiteUtils';

type SimplePlantingSiteMapProps = {
  hideAllControls?: boolean;
  isDraft?: boolean;
  plantingSiteId: number;
  style?: CSSProperties;
};

export default function SimplePlantingSiteMap({
  hideAllControls,
  isDraft,
  plantingSiteId,
  style,
}: SimplePlantingSiteMapProps): JSX.Element {
  const plantingSiteResponse = useGetPlantingSiteQuery(
    { id: plantingSiteId, includeZones: false },
    { skip: isDraft === true }
  );
  const draftPlantingSiteResponse = useGetDraftPlantingSiteQuery(plantingSiteId, { skip: isDraft !== true });

  const plantingSite = useMemo<MinimalPlantingSite | undefined>(() => {
    if (isDraft) {
      return draftPlantingSiteResponse.currentData ? toDraft(draftPlantingSiteResponse.currentData.site) : undefined;
    }

    return plantingSiteResponse.currentData?.site;
  }, [draftPlantingSiteResponse.currentData, isDraft, plantingSiteResponse.currentData]);

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
