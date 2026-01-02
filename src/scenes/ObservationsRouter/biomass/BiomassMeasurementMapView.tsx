import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { selectPlantingSiteAdHocObservations } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSiteHistory } from 'src/redux/features/tracking/trackingSelectors';
import { requestGetPlantingSiteHistory } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import TooltipContents from 'src/scenes/ObservationsRouter/map/TooltipContents';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { AdHocObservationResults, Observation } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory } from 'src/types/Tracking';

type BiomassMeasurementMapViewProps = {
  hideDate?: boolean;
  observationsResults?: AdHocObservationResults[];
  selectedPlantingSite: PlantingSite;
};

export default function BiomassMeasurementMapView({
  hideDate,
  observationsResults,
  selectedPlantingSite,
}: BiomassMeasurementMapViewProps): JSX.Element {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const { isDesktop } = useDeviceInfo();

  const observationHistory = useAppSelector((state) => selectPlantingSiteHistory(state, requestId));

  const [plantingSiteHistory, setPlantingSiteHistory] = useState<PlantingSiteHistory>();

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteAdHocObservations(state, selectedPlantingSite.id)
  );

  const observationsDates = useMemo(() => {
    const uniqueDates: Set<string> = new Set();
    observationsResults?.forEach((obs) => {
      const dateToUse = obs.completedTime || obs.startDate;
      uniqueDates.add(dateToUse);
    });

    return Array.from(uniqueDates)
      ?.filter((time) => time)
      ?.map((time) => time)
      ?.sort((a, b) => (Date.parse(a) > Date.parse(b) ? 1 : -1));
  }, [observationsResults]);

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

  const selectedObservation = useMemo(
    () =>
      observationsResults?.find((obs) => {
        const dateToCheck = obs.completedTime || obs.startDate;
        return dateToCheck === selectedObservationDate;
      }),
    [observationsResults, selectedObservationDate]
  );

  const observationData = useMemo(() => {
    return observations.find((obv) => obv.id === selectedObservation?.observationId);
  }, [observations, selectedObservation]);

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
  }, [dispatch, observationData, selectedPlantingSite.id]);

  const plantingSiteMapData: MapSourceBaseData | undefined = useMemo(
    () => MapService.getMapDataFromPlantingSite(selectedPlantingSite)?.site,
    [selectedPlantingSite]
  );

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    if (!selectedObservationDate || !selectedObservation || !plantingSiteHistory) {
      return {
        site: plantingSiteMapData,
        stratum: undefined,
        substratum: undefined,
        permanentPlot: undefined,
        temporaryPlot: undefined,
        adHocPlot: undefined,
      };
    }

    return MapService.getMapDataFromObservation(selectedObservation, plantingSiteHistory);
  }, [selectedObservation, selectedObservationDate, plantingSiteMapData, plantingSiteHistory]);

  const layerOptions: MapLayer[] = ['Planting Site', 'Strata', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Strata: strings.ZONES,
    'Sub-Strata': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
    'Project Zones': strings.PROJECT_ZONES,
  };

  const contextRenderer = useCallback(
    (properties: MapSourceProperties): JSX.Element | null => {
      let entity: any;
      if (properties.type === 'site') {
        entity = selectedObservation;
      } else if (properties.type === 'stratum') {
        entity =
          selectedObservation?.strata?.find((z) => z.stratumId === properties.id) ||
          plantingSiteHistory?.strata.find((z) => z.stratumId === properties.id);
      } else {
        // monitoring plot
        const adHocPlotCopy = {
          ...selectedObservation?.adHocPlot,
          isBiomassMeasurement: true,
          totalSpecies: selectedObservation?.biomassMeasurements?.treeSpeciesCount,
          totalPlants: selectedObservation?.biomassMeasurements?.trees.filter((tree) => tree.treeGrowthForm !== 'Shrub')
            .length,
          totalShrubs: selectedObservation?.biomassMeasurements?.trees.filter((tree) => tree.treeGrowthForm === 'Shrub')
            .length,
        };

        entity = adHocPlotCopy;
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
    [selectedObservation, selectedPlantingSite, plantingSiteHistory]
  );

  return (
    <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'stratum', 'permanentPlot', 'temporaryPlot', 'adHocPlot']} />
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
                  selectedDate={selectedObservationDate ?? observationsDates[0]}
                  onChange={setSelectedObservationDate}
                />
              )
            }
            stratumInteractive={true}
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
            focusEntities={[{ sourceId: 'sites', id: selectedObservation?.plantingSiteId }]}
          />
        )}
      </Box>
    </Box>
  );
}
