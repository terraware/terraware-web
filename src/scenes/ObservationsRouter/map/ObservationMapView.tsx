import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import {
  selectPlantingSiteAdHocObservations,
  selectPlantingSiteObservations,
} from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSiteHistory } from 'src/redux/features/tracking/trackingSelectors';
import { requestGetPlantingSiteHistory } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import TooltipContents from 'src/scenes/ObservationsRouter/map/TooltipContents';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { AdHocObservationResults, Observation, ObservationResults } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';
import { regexMatch } from 'src/utils/search';

type ObservationMapViewProps = SearchProps & {
  hideDate?: boolean;
  observationsResults?: ObservationResults[];
  adHocObservationResults?: AdHocObservationResults[];
  selectedPlantingSite: PlantingSite;
};

export default function ObservationMapView({
  hideDate,
  observationsResults,
  adHocObservationResults,
  search,
  filtersProps,
  selectedPlantingSite,
}: ObservationMapViewProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');

  const observationHistory = useAppSelector((state) => selectPlantingSiteHistory(state, requestId));

  const [plantingSiteHistory, setPlantingSiteHistory] = useState<PlantingSiteHistory>();
  const [selectedObservation, setSelectedObservation] = useState<ObservationResults>();
  const [selectedAdHocObservation, setSelectedAdHocObservation] = useState<AdHocObservationResults>();
  const { isDesktop } = useDeviceInfo();

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteObservations(state, selectedPlantingSite.id)
  );

  const adHocObservations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteAdHocObservations(state, selectedPlantingSite.id)
  );

  const observationsDates = useMemo(() => {
    const uniqueDates = new Set(observationsResults?.map((obs) => obs.completedTime || obs.startDate));
    adHocObservationResults?.forEach((obs) => {
      const dateToUse = obs.completedTime ? obs.completedTime : obs.startDate;
      uniqueDates.add(dateToUse);
    });

    return Array.from(uniqueDates)
      ?.filter((time) => time)
      ?.map((time) => time)
      ?.sort((a, b) => (Date.parse(a) > Date.parse(b) ? 1 : -1));
  }, [observationsResults, adHocObservationResults]);

  const [selectedObservationDate, setSelectedObservationDate] = useState<string | undefined>();

  useEffect(() => {
    if (observationHistory?.status === 'success') {
      setPlantingSiteHistory(observationHistory.data);
    }
  }, [observationHistory]);

  useEffect(() => {
    if (observationsDates) {
      setSelectedObservationDate((currentDate) => {
        if ((!currentDate || !observationsDates.includes(currentDate)) && observationsDates.length > 0) {
          return observationsDates[observationsDates.length - 1];
        } else {
          return currentDate;
        }
      });
    } else {
      setSelectedObservationDate('');
    }
  }, [observationsDates]);

  useEffect(() => {
    const selObservation = observationsResults?.find((obs) => {
      const dateToCheck = obs.state === 'Completed' || obs.state === 'Abandoned' ? obs.completedTime : obs.startDate;
      return dateToCheck === selectedObservationDate;
    });

    setSelectedObservation(selObservation);

    const selAdHocObservation = adHocObservationResults?.find((obs) => {
      const dateToCheck = obs.completedTime ? obs.completedTime : obs.startDate;
      return dateToCheck === selectedObservationDate;
    });

    setSelectedAdHocObservation(selAdHocObservation);
  }, [observationsResults, adHocObservationResults, selectedPlantingSite, selectedObservationDate]);

  const observationData = useMemo(() => {
    let observationToUse = selectedObservation || selectedAdHocObservation;
    if (selectedObservation && selectedAdHocObservation) {
      if (isAfter(selectedAdHocObservation.completedTime, selectedObservation.completedTime)) {
        observationToUse = selectedAdHocObservation;
      }
    }

    return (
      observations.find((obv) => obv.id === observationToUse?.observationId) ||
      adHocObservations.find((obv) => obv.id === observationToUse?.observationId)
    );
  }, [adHocObservations, observations, selectedObservation, selectedAdHocObservation]);

  useEffect(() => {
    if (observationData) {
      const historyId = observationData.plantingSiteHistoryId;
      if (historyId) {
        const requestObservationHistory = dispatch(
          requestGetPlantingSiteHistory({
            plantingSiteId: selectedPlantingSite.id,
            historyId,
          })
        );
        setRequestId(requestObservationHistory.requestId);
      }
    } else {
      setRequestId('');
    }
  }, [dispatch, observationData, selectedPlantingSite]);

  const plantingSiteMapData: MapSourceBaseData | undefined = useMemo(
    () => MapService.getMapDataFromPlantingSite(selectedPlantingSite)?.site,
    [selectedPlantingSite]
  );

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    let observationToUse = selectedObservation || selectedAdHocObservation;
    if (selectedObservation && selectedAdHocObservation) {
      if (isAfter(selectedAdHocObservation.completedTime, selectedObservation.completedTime)) {
        observationToUse = selectedAdHocObservation;
      }
    }

    if (!selectedObservationDate || !observationToUse || !plantingSiteHistory) {
      return {
        site: plantingSiteMapData,
        zone: undefined,
        subzone: undefined,
        permanentPlot: undefined,
        temporaryPlot: undefined,
        adHocPlot: undefined,
      };
    }

    return MapService.getMapDataFromObservation(observationToUse, plantingSiteHistory);
  }, [
    selectedObservation,
    selectedObservationDate,
    plantingSiteMapData,
    plantingSiteHistory,
    selectedAdHocObservation,
  ]);

  const filterZoneNames = useMemo(() => filtersProps?.filters.zone?.values ?? [], [filtersProps?.filters.zone?.values]);

  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  useEffect(() => {
    const entities = (observationsResults ?? [])
      .flatMap((obs) => obs.plantingZones)
      .filter(
        (zone) =>
          (!filterZoneNames.length || filterZoneNames.includes(zone.plantingZoneName)) &&
          regexMatch(zone.plantingZoneName, search)
      )
      .map((zone) => ({ sourceId: 'zones', id: zone.plantingZoneId }));
    setSearchZoneEntities(entities);
  }, [observationsResults, search, selectedObservation, filterZoneNames]);

  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  const hasSearchCriteria = search.trim() || filterZoneNames.length;

  const contextRenderer = useCallback(
    (properties: MapSourceProperties): JSX.Element | null => {
      let entity: any;
      if (properties.type === 'site') {
        entity = selectedObservation;
      } else if (properties.type === 'zone') {
        entity =
          selectedObservation?.plantingZones?.find((z) => z.plantingZoneId === properties.id) ||
          plantingSiteHistory?.plantingZones.find((z) => z.plantingZoneId === properties.id);
      } else {
        // monitoring plot
        entity =
          selectedAdHocObservation?.adHocPlot ||
          selectedObservation?.plantingZones
            ?.flatMap((z) => z.plantingSubzones)
            ?.flatMap((sz) => sz.monitoringPlots)
            ?.find((p) => p.monitoringPlotId === properties.id);
      }

      if (!entity) {
        return null;
      }

      return (
        <TooltipContents
          monitoringPlot={entity}
          observationId={selectedObservation?.observationId}
          observationState={selectedObservation?.state}
          plantingSiteId={selectedPlantingSite.id}
          title={`${properties.name}${properties.type === 'temporaryPlot' ? ` (${strings.TEMPORARY})` : properties.type === 'adHocPlot' ? ` (${strings.AD_HOC})` : properties.type === 'permanentPlot' ? ` (${strings.PERMANENT})` : ''}`}
        />
      );
    },
    [selectedAdHocObservation, selectedObservation, selectedPlantingSite, plantingSiteHistory]
  );

  return (
    <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'zone', 'permanentPlot', 'temporaryPlot', 'adHocPlot']} />
      <Box display='flex' sx={{ flexGrow: 1 }}>
        {mapData.site && (
          <PlantingSiteMap
            mapData={mapData}
            style={{ borderRadius: '24px' }}
            layers={includedLayers}
            topRightMapControl={
              <MapLayerSelect
                initialSelection={layerOptions}
                onUpdateSelection={(selection) => setIncludedLayers(selection)}
                menuSections={[
                  layerOptions.map((opt) => ({
                    label: layerOptionLabels[opt],
                    value: opt,
                  })),
                ]}
              />
            }
            bottomLeftMapControl={
              hideDate !== true &&
              observationsDates &&
              observationsDates.length > 0 && (
                <MapDateSelect
                  dates={observationsDates}
                  selectedDate={selectedObservationDate ?? ''}
                  onChange={setSelectedObservationDate}
                />
              )
            }
            zoneInteractive={true}
            contextRenderer={{
              render: contextRenderer,
              sx: {
                '.mapboxgl-popup': {
                  maxWidth: '324px !important', // !important to override a default mapbox style
                },
                '.mapboxgl-popup .mapboxgl-popup-content': {
                  padding: '0px !important',
                },
              },
            }}
            highlightEntities={hasSearchCriteria ? searchZoneEntities : []}
            focusEntities={
              !hasSearchCriteria || searchZoneEntities.length === 0
                ? [
                    {
                      sourceId: 'sites',
                      id: selectedObservation?.plantingSiteId || selectedAdHocObservation?.plantingSiteId,
                    },
                  ]
                : searchZoneEntities
            }
          />
        )}
      </Box>
    </Box>
  );
}
