import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { PlantingSiteMap } from 'src/components/Map';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import TooltipContents from 'src/scenes/ObservationsRouter/map/TooltipContents';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { PlantingSite } from 'src/types/Tracking';

type BiomassMeasurementMapViewProps = {
  hideDate?: boolean;
  selectedPlantingSite: PlantingSite;
};

export default function BiomassMeasurementMapView({
  hideDate,
  selectedPlantingSite,
}: BiomassMeasurementMapViewProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();

  const { adHocObservations, adHocObservationResults, plantingSiteHistories } = usePlantingSiteData();

  const observationsDates = useMemo(() => {
    const uniqueDates: Set<string> = new Set();
    adHocObservationResults?.forEach((obs) => {
      const dateToUse = obs.completedTime || obs.startDate;
      uniqueDates.add(dateToUse);
    });

    return Array.from(uniqueDates)
      ?.filter((time) => time)
      ?.map((time) => time)
      ?.sort((a, b) => (Date.parse(a) > Date.parse(b) ? 1 : -1));
  }, [adHocObservationResults]);

  const [selectedObservationDate, setSelectedObservationDate] = useState<string | undefined>();

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
      adHocObservationResults?.find((obs) => {
        const dateToCheck = obs.completedTime || obs.startDate;
        return dateToCheck === selectedObservationDate;
      }),
    [adHocObservationResults, selectedObservationDate]
  );

  const plantingSiteMapData: MapSourceBaseData | undefined = useMemo(
    () => MapService.getMapDataFromPlantingSite(selectedPlantingSite)?.site,
    [selectedPlantingSite]
  );

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    const adHocObservation = adHocObservations?.find(
      (observation) => observation.id === selectedObservation?.observationId
    );
    const plantingSiteHistory = plantingSiteHistories?.find(
      (history) => history.id === selectedObservation?.plantingSiteHistoryId
    );

    if (!selectedObservationDate || !selectedObservation || !adHocObservation || !plantingSiteHistory) {
      return {
        site: plantingSiteMapData,
        zone: undefined,
        subzone: undefined,
        permanentPlot: undefined,
        temporaryPlot: undefined,
        adHocPlot: undefined,
      };
    }

    return MapService.getMapDataFromObservation(adHocObservation, selectedObservation, plantingSiteHistory);
  }, [adHocObservations, plantingSiteHistories, selectedObservationDate, selectedObservation, plantingSiteMapData]);

  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
    'Project Zones': strings.PROJECT_ZONES,
  };

  const contextRenderer = useCallback(
    (properties: MapSourceProperties): JSX.Element | null => {
      let entity: any;
      if (properties.type === 'site') {
        entity = selectedObservation;
      } else if (properties.type === 'zone') {
        const plantingSiteHistory = plantingSiteHistories?.find(
          (history) => history.id === selectedObservation?.plantingSiteHistoryId
        );
        entity =
          selectedObservation?.plantingZones?.find((z) => z.plantingZoneId === properties.id) ||
          plantingSiteHistory?.plantingZones.find((z) => z.plantingZoneId === properties.id);
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
    [selectedObservation, selectedPlantingSite.id, plantingSiteHistories]
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
            focusEntities={[{ sourceId: 'sites', id: selectedObservation?.plantingSiteId }]}
          />
        )}
      </Box>
    </Box>
  );
}
