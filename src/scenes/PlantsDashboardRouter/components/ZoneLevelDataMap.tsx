import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import MapLegend, { MapLegendGroup } from 'src/components/common/MapLegend';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { useOrganization } from 'src/providers';
import {
  selectLatestObservation,
  selectObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectZonePopulationStats } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite, selectZoneProgress } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapGeometry, MapSourceProperties } from 'src/types/Map';
import {
  ObservationPlantingZoneResults,
  ObservationPlantingZoneResultsWithLastObv,
  ObservationResults,
  ObservationResultsPayload,
  ObservationResultsWithLastObv,
  ObservationSummary,
} from 'src/types/Observations';
import { getRgbaFromHex } from 'src/utils/color';
import { isAfter } from 'src/utils/dateUtils';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type ZoneLevelDataMapProps = {
  plantingSiteId: number;
};

export default function ZoneLevelDataMap({ plantingSiteId }: ZoneLevelDataMapProps): JSX.Element {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const zoneProgress = useAppSelector((state) => selectZoneProgress(state, plantingSiteId));
  const zoneStats = useAppSelector(selectZonePopulationStats);
  const observation: ObservationResults | undefined = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
  const summaries = useObservationSummaries(plantingSiteId);
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const plantingSiteObservations = allObservationsResults?.filter(
    (observation) => observation.plantingSiteId === plantingSiteId && observation.completedTime
  );

  const zoneObservations = useMemo(() => {
    const iZoneObservations: ObservationResultsPayload[][] = [];
    plantingSiteObservations?.forEach((observation) => {
      observation.plantingZones.forEach((pz) => {
        iZoneObservations[pz.plantingZoneId]
          ? iZoneObservations[pz.plantingZoneId].push(observation)
          : (iZoneObservations[pz.plantingZoneId] = [observation]);
      });
    });
    return iZoneObservations;
  }, [plantingSiteObservations]);
  const [lastSummary, setLastSummary] = useState<ObservationSummary>();

  useEffect(() => {
    if (summaries?.[0]) {
      setLastSummary(summaries[0]);
    }
  }, [summaries]);

  const lastZoneObservation = useCallback((observationsList: ObservationResultsPayload[]) => {
    const observationsToProcess = observationsList;
    if (observationsToProcess && observationsToProcess.length > 0) {
      let lastObs = observationsToProcess[0];
      observationsToProcess.forEach((obs) => {
        if (isAfter(obs.startDate, lastObs.startDate)) {
          lastObs = obs;
        }
      });
      return lastObs;
    }
  }, []);

  const lastSubZoneObservation = useCallback(
    (observationsList: ObservationResultsPayload[], zoneId: number, subzoneId: number) => {
      const orderedObservations = observationsList?.sort((a, b) => (isAfter(b.startDate, a.startDate) ? 1 : -1));
      if (orderedObservations) {
        for (const observation of orderedObservations) {
          const zone = observation.plantingZones.find((pz) => pz.plantingZoneId === zoneId);
          if (zone && zone.plantingSubzones.find((sz) => sz.plantingSubzoneId === subzoneId)) {
            return observation;
          }
        }
      }
    },
    []
  );

  const [legends, setLegends] = useState<MapLegendGroup[]>([]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) dispatch(requestObservationsResults(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

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
      disabled: !observation,
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
      disabled: !observation,
      checked: true,
    });

    setLegends(result);
  }, [observation, theme.palette.TwClrBaseGreen300, theme.palette.TwClrBaseLightGreen300]);

  const mapData = useMemo(() => {
    const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;
    if (!plantingSite?.boundary) {
      return undefined;
    }

    const baseMap = MapService.getMapDataFromPlantingSite(plantingSite);
    if (!observation) {
      return baseMap;
    }

    const oldPlantingZones: ObservationPlantingZoneResults[] = observation.plantingZones;

    const plantingZonesWithLastObservation: ObservationPlantingZoneResultsWithLastObv[] = oldPlantingZones.map(
      (pz: ObservationPlantingZoneResultsWithLastObv) => {
        return {
          ...pz,
          lastObv:
            lastZoneObservation(zoneObservations?.[pz.plantingZoneId])?.completedTime ||
            lastZoneObservation(zoneObservations?.[pz.plantingZoneId])?.startDate,
          plantingSubzones: pz.plantingSubzones.map((oldSubzone) => {
            const lastSubZoneOb = lastSubZoneObservation(
              zoneObservations?.[pz.plantingZoneId],
              pz.plantingZoneId,
              oldSubzone.plantingSubzoneId
            );
            return {
              ...oldSubzone,
              lastObv: lastSubZoneOb?.completedTime
                ? getDateDisplayValue(lastSubZoneOb?.completedTime || '', timeZone)
                : lastSubZoneOb?.startDate || '',
            };
          }),
        };
      }
    );
    const observationWithLastObv: ObservationResultsWithLastObv = {
      ...observation,
      plantingZones: plantingZonesWithLastObservation,
    };

    const observationMapData = MapService.getMapDataFromObservation(observationWithLastObv);
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

    if (baseMap.subzone?.entities) {
      baseMap.subzone.entities = baseMap.subzone.entities.map((entity) => {
        const lastSubZoneOb = lastSubZoneObservation(
          zoneObservations?.[entity.properties.zoneId],
          entity.properties.zoneId,
          entity.properties.id
        );
        return {
          ...entity,
          properties: {
            ...entity.properties,
            lastObv: lastSubZoneOb?.completedTime
              ? getDateDisplayValue(lastSubZoneOb.completedTime || '', timeZone)
              : lastSubZoneOb?.startDate || '',
          },
        };
      });

      const orderedSubzoneEntities = baseMap.subzone.entities.sort((a, b) => {
        if (a.properties.lastObv && b.properties.lastObv) {
          return isAfter(b.properties.lastObv, a.properties.lastObv) ? 1 : -1;
        }
        return 0;
      });

      const entitiesToReturn: {
        properties: { recency: number; id: number; name: string; type: string };
        id: number;
        boundary: MapGeometry;
      }[] = [];
      let lastProcecedDate = orderedSubzoneEntities[0].properties.lastObv;
      let recencyToSet = 1;

      orderedSubzoneEntities.forEach((entity) => {
        if (entity.properties.lastObv && entity.properties.lastObv !== lastProcecedDate) {
          recencyToSet = recencyToSet + 1;
          lastProcecedDate = entity.properties.lastObv;
        }

        entitiesToReturn.push({
          ...entity,
          properties: {
            ...entity.properties,
            recency: entity.properties.lastObv ? recencyToSet : 0,
            id: entity.properties.id,
            name: entity.properties.name,
            type: entity.properties.type,
          },
        });
      });

      baseMap.subzone.entities = entitiesToReturn;
    }
    observationMapData.subzone?.entities?.forEach((subzoneEntity) => {
      const subzoneReplaceIndex = baseMap.subzone?.entities?.findIndex((e) => e.id === subzoneEntity.id) ?? -1;
      if (baseMap.subzone && subzoneReplaceIndex >= 0) {
        const oldEntity = baseMap.subzone.entities[subzoneReplaceIndex];
        baseMap.subzone.entities[subzoneReplaceIndex] = {
          ...subzoneEntity,
          properties: { ...subzoneEntity.properties, recency: oldEntity.properties.recency },
        };
      } else {
        if (!baseMap.subzone) {
          baseMap.subzone = {
            id: 'subzones',
            entities: [],
          };
        }
        baseMap.subzone.entities.push(subzoneEntity);
      }
    });

    return baseMap;
  }, [plantingSite, observation]);

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

  const getContextRenderer = useCallback(
    () =>
      // eslint-disable-next-line react/display-name
      (entity: MapSourceProperties): JSX.Element => {
        let properties: TooltipProperty[] = [];
        const zoneObservation: ObservationPlantingZoneResults | undefined = observation?.plantingZones?.find(
          (z: ObservationPlantingZoneResults) => z.plantingZoneId === entity.id
        );
        const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;
        if (!zoneStats[entity.id]?.reportedPlants) {
          properties = [
            {
              key: strings.AREA_HA,
              value: findZoneArea(entity.id) || 0,
            },
            { key: strings.NO_PLANTS, value: '' },
          ];
        } else if (zoneProgress[entity.id] && zoneStats[entity.id]) {
          const lastZoneOb = lastZoneObservation(zoneObservations?.[entity.id]);
          const lastZoneSummary = lastSummary?.plantingZones.find((pz) => pz.plantingZoneId === entity.id);
          properties = [
            {
              key: strings.AREA_HA,
              value: zoneObservation?.areaHa ?? (findZoneArea(entity.id) || 0),
            },
            {
              key: strings.MORTALITY_RATE,
              value:
                zoneObservation && zoneObservation.hasObservedPermanentPlots
                  ? `${zoneObservation.mortalityRate}%`
                  : lastZoneOb?.mortalityRate
                    ? `${lastZoneOb.mortalityRate}%`
                    : strings.UNKNOWN,
            },
            {
              key: strings.PLANTING_DENSITY,
              value: zoneObservation?.plantingDensity
                ? `${zoneObservation?.plantingDensity} ${strings.PLANTS_PER_HECTARE}`
                : lastZoneOb
                  ? `${lastZoneOb.plantingZones.find((pz) => pz.plantingZoneId === entity.id)?.plantingDensity} ${strings.PLANTS_PER_HECTARE}`
                  : strings.UNKNOWN,
            },
            { key: strings.PLANTED_PLANTS, value: `${zoneStats[entity.id].reportedPlants}` },
            {
              key: strings.OBSERVED_PLANTS,
              value: `${zoneObservation?.totalPlants ?? lastZoneSummary?.totalPlants ?? 0}`,
            },
            { key: strings.PLANTED_SPECIES, value: `${zoneStats[entity.id].reportedSpecies}` },
            {
              key: strings.OBSERVED_SPECIES,
              value: `${zoneObservation?.totalSpecies ?? lastZoneOb?.totalSpecies ?? 0}`,
            },
          ];
        }

        const lastZoneOb = lastZoneObservation(zoneObservations?.[entity.id]);
        return (
          <MapTooltip
            title={entity.name}
            subtitle={
              zoneObservations?.[entity.id]
                ? strings
                    .formatString(
                      strings.DATE_OBSERVATION,
                      lastZoneOb?.completedTime
                        ? getDateDisplayValue(lastZoneOb?.completedTime || '', timeZone)
                        : lastZoneOb?.startDate || ''
                    )

                    .toString()
                : ''
            }
            properties={properties}
          />
        );
      },
    [observation, zoneProgress, zoneStats, lastSummary]
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
      {plantingSite?.boundary ? (
        <PlantingSiteMap
          mapData={mapData!}
          style={{ borderRadius: '8px' }}
          layers={['Planting Site', 'Zones', 'Sub-Zones']}
          showMortalityRateFill={!!observation && legends.find((l) => l.title === strings.MORTALITY_RATE)?.checked}
          showRecencyFill={legends.find((l) => l.title === strings.OBSERVATION_RECENCY)?.checked}
          focusEntities={focusEntities}
          contextRenderer={{
            render: getContextRenderer(),
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
