import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { MapService } from 'src/services';
import { MapData } from 'src/types/Map';
import { useEffect, useState } from 'react';
import { PlantingSiteMap } from 'src/components/Map';
import strings from 'src/strings';
import { Typography, useTheme } from '@mui/material';

type PlantingProgressMapProps = {
  plantingSiteId: number;
};

export default function PlantingProgressMap({ plantingSiteId }: PlantingProgressMapProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [mapData, setMapData] = useState<MapData | undefined>();
  useEffect(() => {
    if (plantingSite && plantingSite.boundary) {
      setMapData(MapService.getMapDataFromPlantingSite(plantingSite));
    } else {
      setMapData(undefined);
    }
  }, [plantingSite]);

  return mapData ? (
    <PlantingSiteMap mapData={mapData} focusEntities={[{ sourceId: 'sites', id: plantingSite!.id }]} />
  ) : (
    <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
      {strings.NO_MAP_DATA}
    </Typography>
  );
}
