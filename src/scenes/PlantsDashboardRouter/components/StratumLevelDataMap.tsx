import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import FormattedNumber from 'src/components/common/FormattedNumber';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapData, MapSourceProperties } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type StratumLevelDataMapProps = {
  plantingSiteId: number;
};

export default function StratumLevelDataMap({ plantingSiteId }: StratumLevelDataMapProps): JSX.Element {
  const numberFormatter = useNumberFormatter();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { plantingSite, plantingSiteHistories, plantingSiteReportedPlants, observationSummaries, latestResult } =
    usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;
  const strataProgress = useMemo(() => {
    const stratumProgress: Record<number, { name: string; progress: number; targetDensity: number }> = {};

    plantingSite?.strata?.forEach((stratum) => {
      const percentProgress =
        plantingSiteReportedPlants?.strata?.find((_stratum) => _stratum.id === stratum.id)?.progressPercent ?? 0;
      stratumProgress[stratum.id] = {
        name: stratum.name,
        progress: percentProgress,
        targetDensity: stratum.targetPlantingDensity,
      };
    });

    return stratumProgress;
  }, [plantingSite, plantingSiteReportedPlants]);

  const strataStats = useMemo(() => {
    const stratumStats: Record<number, { name: string; reportedPlants: number; reportedSpecies: number }> = {};
    plantingSite?.strata?.forEach((stratum) => {
      const stratumReportedPlants = plantingSiteReportedPlants?.strata?.find((_stratum) => _stratum.id === stratum.id);
      const reportedPlants = stratumReportedPlants?.totalPlants ?? 0;
      const reportedSpecies = 0; // stratumReportedPlants?.totalSpecies ?? 0;
      stratumStats[stratum.id] = { name: stratum.name, reportedPlants, reportedSpecies };
    });
    return stratumStats;
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
        label: strings.STRATA,
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
            label: strings.SUBSTRATA,
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
      title: strings.SURVIVAL_RATE,
      items: [
        {
          label: strings.LESS_THAN_FIFTY_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/survival-rate-less-50.png',
        },
        {
          label: strings.FIFTY_TO_SEVENTY_FIVE_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/survival-rate-more-50.png',
        },
        {
          label: strings.GREATER_THAN_SEVENTY_FIVE_PERCENT,
          borderColor: theme.palette.TwClrBaseLightGreen300 as string,
          fillColor: 'transparent',
          fillPatternUrl: '/assets/survival-rate-more-75.png',
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

  const findStratumArea = useCallback(
    (stratumId: number) => {
      const selectedStratum = plantingSite?.strata?.find((_stratum) => _stratum.id === stratumId);
      return selectedStratum?.areaHa;
    },
    [plantingSite]
  );

  const contextRenderer = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      (entity: MapSourceProperties): JSX.Element => {
        let properties: TooltipProperty[] = [];

        const stratumHistory = latestResultSiteHistory?.strata.find(
          (_stratumHistory) => _stratumHistory.id === entity.id
        );

        // If stratum history is not found, the id in the base map uses current stratum ID instead.
        const stratumId = stratumHistory?.stratumId ?? entity.id;
        const stratumObservation = latestResult?.strata.find(
          (stratumResult) => stratumResult.stratumId === stratumHistory?.stratumId
        );
        const stratumStat = stratumId !== undefined ? strataStats[stratumId] : undefined;
        const progress = stratumId !== undefined ? strataProgress[stratumId] : undefined;
        const stratumArea = stratumId !== undefined ? findStratumArea(stratumId) : undefined;
        const lastStratumSummary = latestSummary?.strata.find((_stratum) => _stratum.stratumId === stratumId);

        if (!stratumStat) {
          properties = [
            {
              key: strings.AREA_HA,
              value: stratumArea ? numberFormatter.format(stratumArea) : strings.UNKNOWN,
            },
            { key: strings.NO_PLANTS, value: '' },
          ];
        } else if (progress && stratumStat) {
          if (lastStratumSummary) {
            properties = [
              {
                key: strings.AREA_HA,
                value: lastStratumSummary.areaHa ? numberFormatter.format(lastStratumSummary.areaHa) : strings.UNKNOWN,
              },
              {
                key: strings.SURVIVAL_RATE,
                value:
                  lastStratumSummary.survivalRate !== undefined
                    ? `${lastStratumSummary.survivalRate}%`
                    : strings.INSUFFICIENT_DATA,
              },
              {
                key: strings.PLANT_DENSITY,
                value: `${numberFormatter.format(lastStratumSummary.plantingDensity)} ${strings.PLANTS_PER_HECTARE}`,
              },
              {
                key: strings.PLANTED_PLANTS,
                value: numberFormatter.format(stratumStat.reportedPlants ?? 0),
              },
              {
                key: strings.OBSERVED_PLANTS,
                value: numberFormatter.format(lastStratumSummary?.totalPlants ?? 0),
              },
              {
                key: strings.PLANTED_SPECIES,
                value: numberFormatter.format(stratumStat.reportedSpecies ?? 0),
              },
              {
                key: strings.OBSERVED_SPECIES,
                value: numberFormatter.format(lastStratumSummary?.totalSpecies ?? 0),
              },
            ];
          } else {
            properties = [
              {
                key: strings.AREA_HA,
                value: stratumArea ? numberFormatter.format(stratumArea) : strings.UNKNOWN,
              },
              {
                key: strings.PLANTED_PLANTS,
                value: numberFormatter.format(stratumStat.reportedPlants ?? 0),
              },
              {
                key: strings.PLANTED_SPECIES,
                value: numberFormatter.format(stratumStat.reportedSpecies ?? 0),
              },
              { key: strings.NOT_OBSERVED, value: '' },
            ];
          }
        }

        const latestStratumObservationTime = plantingSite?.strata?.find(
          (_stratum) => _stratum.id === stratumId
        )?.latestObservationCompletedTime;

        return (
          <MapTooltip
            title={stratumObservation?.name ?? entity.name}
            subtitle={
              latestStratumObservationTime
                ? strings
                    .formatString(
                      strings.AS_OF_X,
                      strings
                        .formatString(
                          strings.DATE_OBSERVATION,
                          getDateDisplayValue(latestStratumObservationTime || '', timeZone)
                        )
                        .toString()
                    )
                    .toString()
                : ''
            }
            subtitleColor={theme.palette.TwClrTxt}
            properties={properties}
          />
        );
      },
    [
      latestResultSiteHistory?.strata,
      latestResult?.strata,
      strataStats,
      strataProgress,
      findStratumArea,
      latestSummary?.strata,
      plantingSite?.strata,
      timeZone,
      theme.palette.TwClrTxt,
      numberFormatter,
    ]
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
            layers={['Planting Site', 'Strata', 'Sub-Strata']}
            showSurvivalRateFill={!!latestResult && legends.find((l) => l.title === strings.SURVIVAL_RATE)?.checked}
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
            stratumInteractive={true}
            substratumInteractive={false}
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
