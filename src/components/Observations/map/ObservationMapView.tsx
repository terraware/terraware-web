import { ObservationResults } from 'src/types/Observations';
import { Box, Theme, useTheme } from '@mui/material';
import MapLegend from 'src/components/common/MapLegend';
import { PlantingSiteMap } from 'src/components/Map';
import React, { useEffect, useMemo, useState } from 'react';
import { MapEntityId, MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { MapService } from 'src/services';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import strings from 'src/strings';
import MapDateSelect from 'src/components/common/MapDateSelect';
import { getRgbaFromHex } from 'src/utils/color';
import { SearchInputProps } from 'src/components/Observations/search';
import { regexMatch } from 'src/utils/search';
import TooltipContents from 'src/components/Observations/map/TooltipContents';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  popover: {
    '&.mapboxgl-popup': {
      maxWidth: '324px !important', // !important to override a default mapbox style
      width: '324px',
    },
  },
}));

type ObservationMapViewProps = SearchInputProps & {
  observationsResults?: ObservationResults[];
};

export default function ObservationMapView({ observationsResults, search }: ObservationMapViewProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();

  const observationsDates = useMemo(() => {
    return observationsResults
      ?.map((obs) => obs.completedDate)
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
    () => observationsResults?.find((obs) => obs.completedDate === selectedObservationDate),
    [observationsResults, selectedObservationDate]
  );

  const [plantingSiteMapData, setPlantingSiteMapData] = useState<MapSourceBaseData | undefined>();
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
  useEffect(() => {
    if (!plantingSiteMapData && mapData.site) {
      setPlantingSiteMapData(mapData.site);
    }
  }, [mapData, plantingSiteMapData]);

  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  useEffect(() => {
    const entities = (observationsResults ?? [])
      .flatMap((obs) => obs.plantingZones)
      .filter((zone) => regexMatch(zone.plantingZoneName, search))
      .map((zone) => ({ sourceId: 'zones', id: zone.plantingZoneId }));
    setSearchZoneEntities(entities);
  }, [observationsResults, search, selectedObservation]);

  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  const legends = useMemo(
    () => [
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
          {
            label: strings.PLOTS_PERMANENT,
            borderColor: theme.palette.TwClrBasePink300 as string,
            fillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.2),
          },
          {
            label: strings.PLOTS_TEMPORARY,
            borderColor: theme.palette.TwClrBaseYellow300 as string,
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.2),
          },
        ],
      },
    ],
    [
      theme.palette.TwClrBaseGreen300,
      theme.palette.TwClrBaseLightGreen300,
      theme.palette.TwClrBasePink300,
      theme.palette.TwClrBaseYellow300,
    ]
  );

  const contextRenderer = (properties: MapSourceProperties): JSX.Element => {
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

    return (
      <TooltipContents
        observationInProgress={selectedObservation?.completedTime === undefined}
        title={`${properties.name}${properties.type === 'temporaryPlot' ? ` (${strings.TEMPORARY})` : ''}`}
        numPlants={entity?.totalPlants}
        numSpecies={entity?.totalSpecies}
        plantingDensity={entity?.plantingDensity}
        percentMortality={entity?.mortalityRate}
      />
    );
  };

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <Box marginBottom={theme.spacing(2)}>
        <MapLegend legends={legends} />
      </Box>
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
            highlightEntities={search === '' ? [] : searchZoneEntities}
            focusEntities={
              search === '' && searchZoneEntities.length === 0
                ? [{ sourceId: 'sites', id: selectedObservation?.plantingSiteId }]
                : search !== ''
                ? searchZoneEntities
                : []
            }
          />
        )}
      </Box>
    </Box>
  );
}
