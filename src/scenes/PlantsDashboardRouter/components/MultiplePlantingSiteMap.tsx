import React, { CSSProperties, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import FormattedNumber from 'src/components/common/FormattedNumber';
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
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

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
  const legends: MapLegendGroup[] = [
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
    {
      title: strings.OBSERVATION_EVENTS,
      items: [
        {
          label: strings.OBSERVATION_EVENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: theme.palette.TwClrBasePink200 as string,
          opacity: 0.9,
        },
      ],
      switch: true,
      disabled: true,
    },
    {
      title: strings.MORTALITY_RATE,
      items: [
        {
          label: strings.LESS_THAN_TWENTY_FIVE_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-less-25.png',
        },
        {
          label: strings.TWENTY_FIVE_TO_FIFTY_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-less-50.png',
        },
        {
          label: strings.GREATER_THAN_FIFTY_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-more-50.png',
        },
      ],
      switch: true,
      disabled: true,
    },
  ];
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
        <Box display={'flex'} flexDirection={isDesktop ? 'row' : 'column-reverse'}>
          <MapLegend legends={legends} />
          <PlantingSiteMap
            mapData={mapData!}
            style={{ width: '100%', borderRadius: '24px', ...style }}
            layers={['Planting Site']}
            hideAllControls={hideAllControls}
          />
        </Box>
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
