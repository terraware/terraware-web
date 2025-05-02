import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectZonePopulationStats } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectZoneProgress } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapSourceProperties } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';

type ZoneLevelDataMapProps = {
  plantingSiteId: number;
};

export default function ZoneLevelDataMap({ plantingSiteId }: ZoneLevelDataMapProps): JSX.Element {
  const theme = useTheme();

  const { plantingSite, plantingSiteHistories, observationSummaries, latestObservation } = usePlantingSiteData();
  const zoneProgress = useAppSelector((state) => selectZoneProgress(state, plantingSiteId));
  const zoneStats = useAppSelector(selectZonePopulationStats);

  const lastSummary = useMemo(() => {
    if (observationSummaries?.length) {
      return observationSummaries[0];
    }
  }, [observationSummaries]);

  const [legends, setLegends] = useState<MapLegendGroup[]>([]);

  useEffect(() => {
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

    result.push({
      title: strings.MORTALITY_RATE,
      items: [
        {
          label: strings.LESS_THAN_TWENTY_FIVE_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-less-25.png',
          height: '16px',
        },
        {
          label: strings.TWENTY_FIVE_TO_FIFTY_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-less-50.png',
          height: '16px',
        },
        {
          label: strings.GREATER_THAN_FIFTY_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/mortality-rate-more-50.png',
          height: '16px',
        },
      ],
      switch: true,
      disabled: !latestObservation,
      checked: true,
    });

    result.push({
      title: strings.OBSERVATION_RECENCY,
      items: [
        {
          label: strings.LATEST_OBSERVATION,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: theme.palette.TwClrBasePink200 as string,
          opacity: 0.9,
          height: '16px',
        },
      ],
      switch: true,
      disabled: !latestObservation,
      checked: true,
    });

    setLegends(result);
  }, [latestObservation, theme.palette.TwClrBaseGreen300, theme.palette.TwClrBaseLightGreen300]);

  const mapData = useMemo((): MapData | undefined => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    const baseMap = MapService.getMapDataFromPlantingSite(plantingSite);
    if (!latestObservation?.plantingSiteHistoryId || !plantingSiteHistories) {
      return baseMap;
    }

    const plantingSiteHistory = plantingSiteHistories.find(
      (history) => history.id === latestObservation.plantingSiteHistoryId
    );
    if (!plantingSiteHistory) {
      return baseMap;
    }

    return MapService.getMapDataFromPlantingSiteFromHistory(plantingSite, plantingSiteHistory);
  }, [plantingSite, plantingSiteHistories]);

  const focusEntities = useMemo(() => {
    return [{ sourceId: 'sites', id: plantingSiteId }];
  }, [plantingSiteId]);

  const findZoneArea = useCallback(
    (zoneId: number) => {
      const selectedZone = plantingSite?.plantingZones?.find((pZone) => pZone.id === zoneId);
      return selectedZone?.areaHa;
    },
    [plantingSite]
  );

  const contextRenderer = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      (entity: MapSourceProperties): JSX.Element | null => {
        if (!latestObservation) {
          return null;
        }

        const entityZoneId = Number(entity.id);

        let properties: TooltipProperty[] = [];
        const zoneObservation = latestObservation?.plantingZones.find(
          (zoneResult) => zoneResult.plantingZoneId === entityZoneId
        );

        if (!zoneStats[entityZoneId]?.reportedPlants) {
          properties = [
            {
              key: strings.AREA_HA,
              value: findZoneArea(entity.id as number) || 0,
            },
            { key: strings.NO_PLANTS, value: '' },
          ];
        } else if (zoneProgress[entityZoneId] && zoneStats[entityZoneId]) {
          const lastZoneSummary = lastSummary?.plantingZones.find((pz) => pz.plantingZoneId === entity.id);
          properties = [
            {
              key: strings.AREA_HA,
              value: lastZoneSummary?.areaHa ?? findZoneArea(entityZoneId) ?? strings.UNKNOWN,
            },
            {
              key: strings.MORTALITY_RATE,
              value: lastZoneSummary?.mortalityRate ? `${lastZoneSummary.mortalityRate}%` : strings.UNKNOWN,
            },
            {
              key: strings.PLANTING_DENSITY,
              value: lastZoneSummary?.plantingDensity
                ? `${lastZoneSummary?.plantingDensity} ${strings.PLANTS_PER_HECTARE}`
                : strings.UNKNOWN,
            },
            {
              key: strings.PLANTED_PLANTS,
              value: zoneStats[entityZoneId]?.reportedPlants
                ? `${zoneStats[entityZoneId]?.reportedPlants}`
                : strings.UNKNOWN,
            },
            {
              key: strings.OBSERVED_PLANTS,
              value: lastZoneSummary?.totalPlants ? `${lastZoneSummary?.totalPlants}` : strings.UNKNOWN,
            },
            {
              key: strings.PLANTED_SPECIES,
              value: zoneStats[entityZoneId]?.reportedSpecies
                ? `${zoneStats[entityZoneId].reportedSpecies}`
                : strings.UNKNOWN,
            },
            {
              key: strings.OBSERVED_SPECIES,
              value: lastZoneSummary?.totalSpecies ? `${lastZoneSummary?.totalSpecies}` : strings.UNKNOWN,
            },
          ];
        }

        return (
          <MapTooltip
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            title={zoneObservation?.name ?? entity.name}
            subtitle={''} // TODO calculate latest observation per zone
            properties={properties}
          />
        );
      },
    [latestObservation, zoneProgress, zoneStats, lastSummary]
  );

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
      <Typography fontSize='20px' fontWeight={600}>
        {strings.formatString(strings.X_HA_IN_TOTAL_PLANTING_AREA, plantingSite?.areaHa?.toString() || '')}{' '}
      </Typography>
      <MapLegend legends={legends} setLegends={setLegends} />
      {plantingSite?.boundary && mapData ? (
        <PlantingSiteMap
          mapData={mapData}
          style={{ borderRadius: '8px' }}
          layers={['Planting Site', 'Zones', 'Sub-Zones']}
          showMortalityRateFill={
            !!latestObservation && legends.find((l) => l.title === strings.MORTALITY_RATE)?.checked
          }
          showRecencyFill={legends.find((l) => l.title === strings.OBSERVATION_RECENCY)?.checked}
          focusEntities={focusEntities}
          contextRenderer={{
            render: contextRenderer,
            sx: {
              '.mapboxgl-popup .mapboxgl-popup-content': {
                borderRadius: '8px',
                padding: '0',
                width: 'fit-content',
                maxWidth: '350px',
              },
              '.mapboxgl-popup .mapboxgl-popup-content .mapboxgl-popup-close-button': {
                display: 'none',
              },
              '.mapboxgl-popup-anchor-top .mapboxgl-popup-tip': {
                borderBottomColor: theme.palette.TwClrBgSecondary,
              },
            },
          }}
          zoneInteractive={true}
          subzoneInteractive={false}
        />
      ) : (
        <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
