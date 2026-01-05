import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import ListMapView from 'src/components/ListMapView';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import { View } from 'src/components/common/ListMapSelector';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useLocalization } from 'src/providers';
import { useGetPlantingSiteQuery, useLazyGetPlantingSiteHistoryQuery } from 'src/queries/generated/plantingSites';
import { useListPlantingSiteHistoryIdsQuery } from 'src/queries/search/plantingSiteHistories';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapSourceProperties } from 'src/types/Map';
import { regexMatch } from 'src/utils/search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

type BoundariesAndStrataProps = {
  search?: string;
  setSearch: (query: string) => void;
  setView?: (view: View) => void;
  view?: View;
};

export default function BoundariesAndStrata({
  search,
  setSearch,
  setView,
  view,
}: BoundariesAndStrataProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter(activeLocale);

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { data: plantingSiteData } = useGetPlantingSiteQuery(plantingSiteId);

  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData]);

  const searchProps = useMemo<SearchProps>(
    () => ({
      search: search || '',
      onSearch: (value: string) => setSearch(value),
    }),
    [search, setSearch]
  );

  const setViewCallback = useCallback(
    (newView: View) => {
      setView?.(newView);
    },
    [setView]
  );

  const plantingCompleteArea = useMemo(() => {
    let total = 0;
    if (plantingSite) {
      plantingSite.strata?.forEach((stratum) => {
        stratum.substrata.forEach((substratum) => {
          if (substratum.plantingCompleted) {
            total += substratum.areaHa;
          }
        });
      });
    }
    return total;
  }, [plantingSite]);

  return (
    <Box sx={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}>
      <Box display='flex' flexGrow={0} alignItems='center'>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_ZONES}
        </Typography>
      </Box>
      {plantingSite?.boundary && (
        <ListMapView
          style={{
            padding: isMobile ? theme.spacing(0, 3, 3) : 0,
            ...(view === 'map' ? { display: 'flex', flexDirection: 'column', flexGrow: 1 } : {}),
          }}
          initialView={'map'}
          onView={setViewCallback}
          search={
            <Box display={'flex'} alignItems={'center'}>
              <Search {...searchProps} width={'auto'} />
              {(plantingSite.areaHa || 0) > 0 && view === 'map' && (
                <Box display='flex' flexDirection='row' flex={1}>
                  <Typography fontSize={'16px'} fontWeight={'600'} marginRight={theme.spacing(3)}>
                    {strings.PLANTING_SITE_AREA}:{' '}
                    {strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa || 0))?.toString()}
                  </Typography>
                  <Typography fontSize={'16px'} fontWeight={'600'} marginRight={theme.spacing(3)}>
                    {strings.PLANTING_COMPLETE_AREA}:{' '}
                    {strings.formatString(strings.X_HA, numberFormatter.format(plantingCompleteArea))?.toString()}
                  </Typography>
                </Box>
              )}
            </Box>
          }
          list={<PlantingSiteDetailsTable plantingSite={plantingSite} />}
          map={<PlantingSiteMapView search={search ? search.trim() : ''} />}
        />
      )}
    </Box>
  );
}

type PlantingSiteMapViewProps = {
  search?: string;
};

function PlantingSiteMapView({ search }: PlantingSiteMapViewProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const [searchStratumEntities, setSearchStratumEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Strata', 'Monitoring Plots']);
  const defaultTimeZone = useDefaultTimeZone();

  const [selectedHistoryId, setSelectedHistoryId] = useState<number>();

  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { data: plantingSiteData } = useGetPlantingSiteQuery(plantingSiteId);
  const { data: plantingSiteHistoryIds } = useListPlantingSiteHistoryIdsQuery(plantingSiteId);

  const [getPlantingSiteHistory, { data: plantingSiteHistoryData }] = useLazyGetPlantingSiteHistoryQuery();

  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData]);

  const selectedHistory = useMemo(() => plantingSiteHistoryData?.site, [plantingSiteHistoryData]);

  useEffect(() => {
    if (plantingSiteId && selectedHistoryId) {
      const siteId = Number(plantingSiteId);
      void getPlantingSiteHistory(
        {
          id: siteId,
          historyId: selectedHistoryId,
        },
        true
      );
    }
  }, [getPlantingSiteHistory, plantingSiteId, selectedHistoryId]);

  const dates = useMemo(() => {
    return plantingSiteHistoryIds?.map((history) => history.createdTime);
  }, [plantingSiteHistoryIds]);

  useEffect(() => {
    if (!plantingSiteHistoryIds?.length) {
      setSelectedHistoryId(undefined);
    } else if (
      plantingSiteHistoryIds.find((history) => history.plantingSiteHistoryId === selectedHistoryId) === undefined
    ) {
      setSelectedHistoryId(plantingSiteHistoryIds[0].plantingSiteHistoryId);
    }
  }, [plantingSiteHistoryIds, selectedHistoryId]);

  const selectDate = useCallback(
    (date?: string) => {
      setSelectedHistoryId(
        plantingSiteHistoryIds?.find((history) => history.createdTime === date)?.plantingSiteHistoryId
      );
    },
    [plantingSiteHistoryIds]
  );

  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone.get().id, [plantingSite, defaultTimeZone]);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Strata: strings.ZONES,
    'Sub-Strata': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
    'Project Zones': strings.PROJECT_ZONES,
  };

  const mapData = useMemo(() => {
    if (plantingSite) {
      if (selectedHistory) {
        return MapService.getMapDataFromPlantingSiteHistory(plantingSite, selectedHistory);
      } else {
        return MapService.getMapDataFromPlantingSite(plantingSite);
      }
    }
  }, [plantingSite, selectedHistory]);

  useEffect(() => {
    if (!search) {
      setSearchStratumEntities([]);
    } else {
      const entities = plantingSite?.strata
        ?.filter((stratum) => regexMatch(stratum.name, search))
        .map((stratum) => ({ sourceId: 'strata', id: stratum.id }));
      setSearchStratumEntities(entities ?? []);
    }
  }, [plantingSite, search]);

  const layerOptions: MapLayer[] = useMemo(() => {
    const result: MapLayer[] = ['Planting Site', 'Strata', 'Sub-Strata'];
    if (
      mapData &&
      ((mapData.permanentPlot?.entities && mapData.permanentPlot.entities.length > 0) ||
        (mapData.temporaryPlot?.entities && mapData.temporaryPlot.entities.length > 0))
    ) {
      result.push('Monitoring Plots');
    }
    return result;
  }, [mapData]);

  const contextRenderer = useCallback(
    (entity: MapSourceProperties): JSX.Element | null => {
      if (plantingSite && selectedHistory) {
        let properties: TooltipProperty[] = [];
        let title: string;
        if (entity.type === 'site') {
          title = plantingSite.name;
          properties = [
            { key: strings.ZONES, value: selectedHistory.strata.length },
            { key: strings.SUBZONES, value: selectedHistory.strata.flatMap((z) => z.substrata).length },
          ];
        } else if (entity.type === 'stratum') {
          const stratumHistory = selectedHistory.strata.find((_stratumHistory) => _stratumHistory.id === entity.id);
          const stratum = plantingSite.strata?.find((_stratum) => _stratum.id === stratumHistory?.stratumId);
          title = stratumHistory?.name ?? stratum?.name ?? '';

          properties = [
            {
              key: strings.AREA_HA,
              value: stratumHistory?.areaHa && stratumHistory?.areaHa > 0 ? stratumHistory?.areaHa : '',
            },
            { key: strings.TARGET_PLANTING_DENSITY, value: stratum?.targetPlantingDensity ?? 0 },
            {
              key: strings.PLANTING_COMPLETE,
              value: stratum?.substrata?.every((substratum) => substratum.plantingCompleted) ? strings.YES : strings.NO,
            },
            { key: strings.SUBZONES, value: stratum?.substrata.length ?? 0 },
            {
              key: strings.LAST_OBSERVED,
              value: stratum?.latestObservationCompletedTime
                ? getDateDisplayValue(stratum.latestObservationCompletedTime, timeZone)
                : '',
            },
          ];
        } else if (entity.type === 'substratum') {
          const substratumHistory = selectedHistory.strata
            .flatMap((_stratumHistory) => _stratumHistory.substrata)
            .find((_substratumHistory) => _substratumHistory.id === entity.id);
          const substratum = plantingSite.strata
            ?.flatMap((_stratum) => _stratum.substrata)
            .find((_substratum) => _substratum.id === substratumHistory?.substratumId);
          title = substratumHistory?.name ?? substratum?.name ?? '';
          properties = [
            {
              key: strings.AREA_HA,
              value: substratumHistory?.areaHa && substratumHistory?.areaHa > 0 ? substratumHistory?.areaHa : '',
            },
            { key: strings.PLANTING_COMPLETE, value: substratum?.plantingCompleted ? strings.YES : strings.NO },
          ];
        } else {
          return null;
        }

        return <MapTooltip title={title} properties={properties} />;
      } else {
        return null;
      }
    },
    [plantingSite, selectedHistory, timeZone]
  );

  if (!plantingSite?.boundary) {
    return null;
  }

  return (
    <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'stratum', 'substratum']} />
      {mapData && plantingSite && (
        <PlantingSiteMap
          mapData={mapData}
          style={{ borderRadius: '24px' }}
          layers={includedLayers}
          highlightEntities={searchStratumEntities}
          focusEntities={
            searchStratumEntities.length ? searchStratumEntities : [{ sourceId: 'sites', id: plantingSite.id }]
          }
          contextRenderer={{
            render: contextRenderer,
            sx: {
              '.mapboxgl-popup .mapboxgl-popup-content': {
                borderRadius: '8px',
                padding: '10px',
                width: 'fit-content',
                maxWidth: '350px',
              },
            },
          }}
          topRightMapControl={
            <MapLayerSelect
              initialSelection={includedLayers}
              onUpdateSelection={setIncludedLayers}
              menuSections={[
                layerOptions.map((opt) => ({
                  label: layerOptionLabels[opt],
                  value: opt,
                })),
              ]}
            />
          }
          bottomLeftMapControl={
            dates?.length && (
              <MapDateSelect dates={dates} selectedDate={selectedHistory?.createdTime ?? ''} onChange={selectDate} />
            )
          }
        />
      )}
    </Box>
  );
}
