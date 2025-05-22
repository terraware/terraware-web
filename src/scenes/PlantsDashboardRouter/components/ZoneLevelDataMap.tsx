import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import FormattedNumber from 'src/components/common/FormattedNumber';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapSourceProperties } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';

type ZoneLevelDataMapProps = {
  plantingSiteId: number;
};

export default function ZoneLevelDataMap({ plantingSiteId }: ZoneLevelDataMapProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { plantingSite, plantingSiteHistories, plantingSiteReportedPlants, observationSummaries, latestResult } =
    usePlantingSiteData();

  const zonesProgress = useMemo(() => {
    const zoneProgress: Record<number, { name: string; progress: number; targetDensity: number }> = {};

    plantingSite?.plantingZones?.forEach((zone) => {
      const percentProgress =
        plantingSiteReportedPlants?.plantingZones?.find((z) => z.id === zone.id)?.progressPercent ?? 0;
      zoneProgress[zone.id] = { name: zone.name, progress: percentProgress, targetDensity: zone.targetPlantingDensity };
    });

    return zoneProgress;
  }, [plantingSite, plantingSiteReportedPlants]);

  const zonesStats = useMemo(() => {
    const zoneStats: Record<number, { name: string; reportedPlants: number; reportedSpecies: number }> = {};
    plantingSite?.plantingZones?.forEach((zone) => {
      const zoneReportedPlants = plantingSiteReportedPlants?.plantingZones?.find((z) => z.id === zone.id);
      const reportedPlants = zoneReportedPlants?.totalPlants ?? 0;
      const reportedSpecies = 0; // zoneReportedPlants?.totalSpecies ?? 0;
      zoneStats[zone.id] = { name: zone.name, reportedPlants, reportedSpecies };
    });
    return zoneStats;
  }, [plantingSite, plantingSiteReportedPlants]);

  const latestSummary = useMemo(() => {
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
      title: strings.OBSERVATION_EVENTS,
      tooltip: strings.OBSERVATION_EVENTS_TOOLTIP,
      items: [
        {
          label: strings.LATEST_OBSERVATION,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: theme.palette.TwClrBasePink200 as string,
          opacity: 0.9,
        },
      ],
      switch: true,
      disabled: !latestResult,
      checked: true,
    });

    result.push({
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
      disabled: !latestResult,
      checked: true,
    });

    setLegends(result);
  }, [latestResult, theme]);

  const latestResultSiteHistory = useMemo(() => {
    return plantingSiteHistories?.find((history) => history.id === latestResult?.plantingSiteHistoryId);
  }, [plantingSiteHistories, latestResult]);

  const mapData = useMemo((): MapData | undefined => {
    if (!plantingSite?.boundary) {
      return undefined;
    }

    const baseMap = MapService.getMapDataFromPlantingSite(plantingSite);

    if (!latestResultSiteHistory) {
      return baseMap;
    }

    if (!latestSummary) {
      return MapService.getMapDataFromPlantingSiteHistory(plantingSite, latestResultSiteHistory);
    } else {
      return MapService.getMapDataFromPlantingSiteFromHistoryAndResults(
        plantingSite,
        latestResultSiteHistory,
        latestSummary
      );
    }
  }, [latestResultSiteHistory, latestSummary, plantingSite]);

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
      (entity: MapSourceProperties): JSX.Element => {
        let properties: TooltipProperty[] = [];

        const zoneHistory = latestResultSiteHistory?.plantingZones.find(
          (_zoneHistory) => _zoneHistory.id === entity.id
        );
        const zoneId = zoneHistory?.plantingZoneId;
        const zoneObservation = latestResult?.plantingZones.find(
          (zoneResult) => zoneResult.plantingZoneId === zoneHistory?.plantingZoneId
        );
        const zoneStat = zoneId !== undefined ? zonesStats[zoneId] : undefined;
        const progress = zoneId !== undefined ? zonesProgress[zoneId] : undefined;
        const zoneArea = zoneId !== undefined ? findZoneArea(zoneId) : undefined;
        const lastZoneSummary = latestSummary?.plantingZones.find((pz) => pz.plantingZoneId === zoneId);

        if (!zoneStat) {
          properties = [
            {
              key: strings.AREA_HA,
              value: zoneArea ?? strings.UNKNOWN,
            },
            { key: strings.NO_PLANTS, value: '' },
          ];
        } else if (progress && zoneStat) {
          if (lastZoneSummary) {
            properties = [
              {
                key: strings.AREA_HA,
                value: lastZoneSummary.areaHa,
              },
              {
                key: strings.MORTALITY_RATE,
                value:
                  lastZoneSummary.mortalityRate !== undefined
                    ? `${lastZoneSummary.mortalityRate}%`
                    : strings.INSUFFICIENT_DATA,
              },
              {
                key: strings.PLANTING_DENSITY,
                value: `${lastZoneSummary.plantingDensity} ${strings.PLANTS_PER_HECTARE}`,
              },
              {
                key: strings.PLANTED_PLANTS,
                value: `${zoneStat.reportedPlants}`,
              },
              {
                key: strings.OBSERVED_PLANTS,
                value: `${lastZoneSummary?.totalPlants}`,
              },
              {
                key: strings.PLANTED_SPECIES,
                value: `${zoneStat.reportedSpecies}`,
              },
              {
                key: strings.OBSERVED_SPECIES,
                value: `${lastZoneSummary?.totalSpecies}`,
              },
            ];
          } else {
            properties = [
              {
                key: strings.AREA_HA,
                value: zoneArea || strings.UNKNOWN,
              },
              {
                key: strings.PLANTED_PLANTS,
                value: `${zoneStat.reportedPlants}`,
              },
              {
                key: strings.PLANTED_SPECIES,
                value: `${zoneStat.reportedSpecies}`,
              },
              { key: strings.NOT_OBSERVED, value: '' },
            ];
          }
        }

        return (
          <MapTooltip
            title={zoneObservation?.name ?? entity.name}
            subtitle={''} // TODO calculate latest observation per zone
            properties={properties}
          />
        );
      },
    [latestResultSiteHistory, latestResult, zonesStats, zonesProgress, findZoneArea, latestSummary]
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
        {strings.formatString(
          strings.X_HA_IN_TOTAL_PLANTING_AREA,
          <FormattedNumber value={plantingSite?.areaHa || 0} />
        )}{' '}
      </Typography>
      <Box display={'flex'} flexDirection={isDesktop ? 'row' : 'column-reverse'}>
        <MapLegend legends={legends} setLegends={setLegends} />
        {plantingSite?.boundary && mapData ? (
          <PlantingSiteMap
            mapData={mapData}
            style={{ borderRadius: '8px' }}
            layers={['Planting Site', 'Zones', 'Sub-Zones']}
            showMortalityRateFill={!!latestResult && legends.find((l) => l.title === strings.MORTALITY_RATE)?.checked}
            showRecencyFill={legends.find((l) => l.title === strings.OBSERVATION_EVENTS)?.checked}
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
    </Box>
  );
}
