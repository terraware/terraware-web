import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { useLocalization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectZonePopulationStats } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite, selectZoneProgress } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapSourceProperties } from 'src/types/Map';
import { ObservationPlantingZoneResults, ObservationResults } from 'src/types/Observations';
import { getRgbaFromHex } from 'src/utils/color';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export const useStyles = makeStyles(() => ({
  popup: {
    '& > .mapboxgl-popup-content': {
      borderRadius: '8px',
      padding: '10px',
      width: 'fit-content',
      maxWidth: '350px',
    },
  },
}));

type ZoneLevelDataMapProps = {
  plantingSiteId: number;
};

export default function ZoneLevelDataMap({ plantingSiteId }: ZoneLevelDataMapProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const classes = useStyles();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const zoneProgress = useAppSelector((state) => selectZoneProgress(state, plantingSiteId));
  const zoneStats = useAppSelector(selectZonePopulationStats);
  const observation: ObservationResults | undefined = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
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

  const getContextRenderer = useCallback(
    () =>
      (entity: MapSourceProperties): JSX.Element => {
        let properties: TooltipProperty[] = [];
        const zoneObservation: ObservationPlantingZoneResults | undefined = observation?.plantingZones?.find(
          (z: ObservationPlantingZoneResults) => z.plantingZoneId === entity.id
        );
        if (!zoneStats[entity.id]?.reportedPlants) {
          properties = [{ key: strings.NO_PLANTS, value: '' }];
        } else if (zoneProgress[entity.id] && zoneStats[entity.id]) {
          if (zoneObservation) {
            properties = [
              {
                key: strings.MORTALITY_RATE,
                value: zoneObservation.hasObservedPermanentPlots
                  ? `${zoneObservation!.mortalityRate}%`
                  : strings.UNKNOWN,
              },
              {
                key: strings.TARGET_PLANTING_DENSITY,
                value: `${zoneProgress[entity.id].targetDensity} ${strings.PLANTS_PER_HECTARE}`,
              },
              { key: strings.PLANTING_PROGRESS, value: `${zoneProgress[entity.id].progress}%` },
              { key: strings.RECORDED_PLANTS, value: `${zoneStats[entity.id].reportedPlants} ${strings.PLANTS}` },
              { key: strings.OBSERVED_PLANTS, value: `${zoneObservation!.totalPlants} ${strings.PLANTS}` },
              { key: strings.RECORDED_SPECIES, value: `${zoneStats[entity.id].reportedSpecies} ${strings.SPECIES}` },
              { key: strings.OBSERVED_SPECIES, value: `${zoneObservation!.totalSpecies} ${strings.SPECIES}` },
            ];
          } else {
            properties = [
              {
                key: strings.TARGET_PLANTING_DENSITY,
                value: `${zoneProgress[entity.id].targetDensity} ${strings.PLANTS_PER_HECTARE}`,
              },
              { key: strings.PLANTING_PROGRESS, value: `${zoneProgress[entity.id].progress}%` },
              { key: strings.RECORDED_PLANTS, value: `${zoneStats[entity.id].reportedPlants} ${strings.PLANTS}` },
              { key: strings.RECORDED_SPECIES, value: `${zoneStats[entity.id].reportedSpecies} ${strings.SPECIES}` },
            ];
          }
        }

        return <MapTooltip title={entity.name} properties={properties} />;
      },
    [observation, zoneProgress, zoneStats]
  );

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
          contextRenderer={{
            render: getContextRenderer(),
            className: classes.popup,
          }}
        />
      ) : (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
