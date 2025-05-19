import React, { CSSProperties, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, useTheme } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { getRgbaFromHex } from 'src/utils/color';

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
  const { allPlantingSites } = usePlantingSiteData();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [legends, setLegends] = useState<MapLegendGroup[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (allPlantingSites) {
      const plantingSitesList = allPlantingSites.filter((ps) => ps.projectId === projectId);

      setPlantingSites(plantingSitesList);
    }
  }, [projectId, organizationId, allPlantingSites]);

  const mapData = useMemo(() => {
    if (plantingSites) {
      return MapService.getMapDataFromPlantingSites(plantingSites);
    }
  }, [plantingSites]);

  const boundariesLegendItems = [
    {
      label: strings.PLANTING_SITE,
      borderColor: theme.palette.TwClrBaseGreen300 as string,
      fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
    },
    {
      label: strings.ZONES,
      borderColor: theme.palette.TwClrBaseLightGreen300 as string,
      fillColor: 'transparent',
    },
  ];
  const result: MapLegendGroup[] = [
    {
      title: strings.BOUNDARIES,
      items: [
        ...boundariesLegendItems,
        {
          label: strings.SUBZONES,
          borderColor: theme.palette.TwClrBaseBlue300 as string,
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
        },
      ],
    },
  ];

  useEffect(() => {
    setLegends(result);
  }, [plantingSites]);

  if (plantingSites) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.TwClrBg,
          borderRadius: '8px',
          padding: theme.spacing(3),
          gap: theme.spacing(3),
        }}
      >
        <MapLegend legends={legends} setLegends={setLegends} />
        <PlantingSiteMap
          mapData={mapData!}
          style={{ width: '100%', borderRadius: '24px', ...style }}
          layers={['Planting Site']}
          hideAllControls={hideAllControls}
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
