import { ObservationResults } from 'src/types/Observations';
import { Box, useTheme } from '@mui/material';
import MapLegend from 'src/components/common/MapLegend';
import { PlantingSiteMap } from 'src/components/Map';
import React, { useEffect, useMemo, useState } from 'react';
import { MapObject, MapSourceBaseData } from 'src/types/Map';
import { MapService } from 'src/services';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import strings from 'src/strings';
import MapDateSelect from 'src/components/common/MapDateSelect';
import { getRgbaFromHex } from 'src/utils/color';

type ObservationMapViewProps = {
  observationsResults?: ObservationResults[];
};

export default function ObservationMapView({ observationsResults }: ObservationMapViewProps): JSX.Element {
  const theme = useTheme();

  const observationsDates = useMemo(() => {
    return observationsResults
      ?.map((obs) => obs.completedTime)
      ?.filter((time) => time)
      ?.map((time) => time!)
      ?.sort((a, b) => (Date.parse(a!) > Date.parse(b!) ? 1 : -1));
  }, [observationsResults]);

  const [selectedObservationDate, setSelectedObservationDate] = useState<string | undefined>();
  useEffect(() => {
    if (observationsDates) {
      setSelectedObservationDate(observationsDates[observationsDates.length - 1]);
    } else {
      setSelectedObservationDate('');
    }
  }, [observationsDates]);

  const [plantingSiteMapData, setPlantingSiteMapData] = useState<MapSourceBaseData | undefined>();
  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    const selectedObservation = observationsResults?.find((obs) => obs.completedTime === selectedObservationDate);
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
  }, [selectedObservationDate, observationsResults, plantingSiteMapData]);
  useEffect(() => {
    if (!plantingSiteMapData && mapData.site) {
      setPlantingSiteMapData(mapData.site);
    }
  }, [mapData, plantingSiteMapData]);

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

  return (
    <Box display='flex' flexDirection='column'>
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
                <MapDateSelect dates={observationsDates} onChange={setSelectedObservationDate} />
              )
            }
            contextRenderer={{
              render: (properties) => {
                return <p>{`${properties.type} ${properties.id}: ${properties.name}`}</p>;
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
