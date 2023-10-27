import React, { useEffect, useMemo, useState } from 'react';
import { ObservationResults } from 'src/types/Observations';
import { Box, Theme } from '@mui/material';
import { PlantingSite } from 'src/types/Tracking';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import { PlantingSiteMap } from 'src/components/Map';
import { MapEntityId, MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { MapService } from 'src/services';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import strings from 'src/strings';
import MapDateSelect from 'src/components/common/MapDateSelect';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { regexMatch } from 'src/utils/search';
import TooltipContents from 'src/components/Observations/map/TooltipContents';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  popover: {
    '&.mapboxgl-popup': {
      maxWidth: '324px !important', // !important to override a default mapbox style
    },
    '& .mapboxgl-popup-content': {
      padding: '0px !important',
    },
  },
}));

type ObservationMapViewProps = SearchProps & {
  observationsResults?: ObservationResults[];
  selectedPlantingSite: PlantingSite;
};

export default function ObservationMapView({
  observationsResults,
  search,
  filtersProps,
  selectedPlantingSite,
}: ObservationMapViewProps): JSX.Element {
  const classes = useStyles();

  const observationsDates = useMemo(() => {
    const uniqueDates = new Set(observationsResults?.map((obs) => obs.completedDate || obs.startDate));

    return Array.from(uniqueDates)
      ?.filter((time) => time)
      ?.map((time) => time!)
      ?.sort((a, b) => (Date.parse(a!) > Date.parse(b!) ? 1 : -1));
  }, [observationsResults]);

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
      observationsResults?.find((obs) => {
        const dateToCheck = obs.state === 'Completed' ? obs.completedDate : obs.startDate;
        return dateToCheck === selectedObservationDate;
      }),
    [observationsResults, selectedObservationDate]
  );

  const plantingSiteMapData: MapSourceBaseData | undefined = useMemo(
    () => MapService.getMapDataFromPlantingSite(selectedPlantingSite)?.site,
    [selectedPlantingSite]
  );

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    if (!selectedObservationDate || !selectedObservation) {
      return {
        site: plantingSiteMapData,
        zone: undefined,
        subzone: undefined,
        permanentPlot: undefined,
        temporaryPlot: undefined,
      };
    }

    return MapService.getMapDataFromObservation(selectedObservation);
  }, [selectedObservation, selectedObservationDate, plantingSiteMapData]);

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

  const contextRenderer = (properties: MapSourceProperties): JSX.Element | null => {
    let entity: any;
    if (properties.type === 'site') {
      entity = selectedObservation;
    } else if (properties.type === 'zone') {
      entity = selectedObservation?.plantingZones?.find((z) => z.plantingZoneId === properties.id);
    } else {
      // monitoring plot
      entity = selectedObservation?.plantingZones
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
        title={`${properties.name}${properties.type === 'temporaryPlot' ? ` (${strings.TEMPORARY})` : ''}`}
      />
    );
  };

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'zone', 'permanentPlot', 'temporaryPlot']} />
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
              observationsDates &&
              observationsDates.length > 0 && (
                <MapDateSelect
                  dates={observationsDates}
                  selectedDate={selectedObservationDate ?? ''}
                  onChange={setSelectedObservationDate}
                />
              )
            }
            contextRenderer={{
              render: contextRenderer,
              className: classes.popover,
            }}
            highlightEntities={hasSearchCriteria ? searchZoneEntities : []}
            focusEntities={
              !hasSearchCriteria || searchZoneEntities.length === 0
                ? [{ sourceId: 'sites', id: selectedObservation?.plantingSiteId }]
                : searchZoneEntities
            }
          />
        )}
      </Box>
    </Box>
  );
}
