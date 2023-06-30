import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import React, { useEffect, useMemo, useState } from 'react';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { getRgbaFromHex } from 'src/utils/color';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { PlantingSiteMap } from 'src/components/Map';
import { MapService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';
import { ObservationResults } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';

type ZoneLevelDataMapProps = {
  plantingSiteId?: number;
  observation?: ObservationResults;
};

export default function ZoneLevelDataMap({ plantingSiteId, observation }: ZoneLevelDataMapProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const plantingSite: PlantingSite | undefined = useAppSelector((state) =>
    selectPlantingSite(state, plantingSiteId ?? -1)
  );

  const [legends, setLegends] = useState<MapLegendGroup[]>([]);
  useEffect(() => {
    const result: MapLegendGroup[] = [
      {
        title: strings.BOUNDARIES,
        items: [
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
        ],
      },
    ];
    if (observation) {
      result.push({
        title: strings.MORTALITY_RATE,
        items: [
          {
            label: strings.LESS_THAN_TWENTY_FIVE_PERCENT,
            borderColor: theme.palette.TwClrBaseLightGreen300 as string,
            fillColor: 'transparent',
            fillPatternUrl: '/assets/mortality-rate-indicator-legend.png',
            opacity: 0.3,
            height: '16px',
          },
          {
            label: strings.TWENTY_FIVE_TO_FIFTY_PERCENT,
            borderColor: theme.palette.TwClrBaseLightGreen300 as string,
            fillColor: 'transparent',
            fillPatternUrl: '/assets/mortality-rate-indicator-legend.png',
            opacity: 0.5,
            height: '16px',
          },
          {
            label: strings.GREATER_THAN_FIFTY_PERCENT,
            borderColor: theme.palette.TwClrBaseLightGreen300 as string,
            fillColor: 'transparent',
            fillPatternUrl: '/assets/mortality-rate-indicator-legend.png',
            opacity: 0.7,
            height: '16px',
          },
        ],
      });
    }
    setLegends(result);
  }, [observation, theme.palette.TwClrBaseGreen300, theme.palette.TwClrBaseLightGreen300]);

  const mapData = useMemo(() => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    const baseMap = MapService.getMapDataFromPlantingSite(plantingSite);
    if (!observation) {
      return baseMap;
    }

    const observationMapData = MapService.getMapDataFromObservation(observation);
    observationMapData.zone?.entities?.forEach((zoneEntity) => {
      const zoneReplaceIndex = baseMap.zone?.entities?.findIndex((e) => e.id === zoneEntity.id) ?? -1;
      if (baseMap.zone && zoneReplaceIndex >= 0) {
        baseMap.zone.entities[zoneReplaceIndex] = zoneEntity;
      } else {
        if (!baseMap.zone) {
          baseMap.zone = {
            id: 'zones',
            entities: [],
          };
        }
        baseMap.zone.entities.push(zoneEntity);
      }
    });

    return baseMap;
  }, [plantingSite, observation]);

  const focusEntities = useMemo(() => {
    return [{ sourceId: 'sites', id: plantingSiteId }];
  }, [plantingSiteId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.TwClrBg,
        borderRadius: '24px',
        padding: theme.spacing(3),
        gap: theme.spacing(3),
      }}
    >
      <Typography fontSize='16px' fontWeight={600}>
        {observation?.completedTime
          ? strings.formatString(
              strings.ZONE_LEVEL_DATA_MAP_TITLE_WITH_OBSERVATION,
              getShortDate(observation.completedTime, locale.activeLocale)
            )
          : strings.ZONE_LEVEL_DATA_MAP_TITLE}
      </Typography>
      <MapLegend legends={legends} />
      {plantingSite?.boundary ? (
        <PlantingSiteMap
          mapData={mapData!}
          style={{ borderRadius: '24px' }}
          layers={['Planting Site', 'Zones']}
          showMortalityRateFill={!!observation}
          focusEntities={focusEntities}
        />
      ) : (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
