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

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    if (!selectedObservationDate) {
      return {
        site: undefined,
        zone: undefined,
        subzone: undefined,
        permanentPlot: undefined,
        temporaryPlot: undefined,
      };
    }

    const selectedObservation = observationsResults?.find((obs) => obs.completedTime === selectedObservationDate)!;

    return MapService.getMapDataFromObservation(selectedObservation);
  }, [selectedObservationDate, observationsResults]);

  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  return (
    <Box display='flex' flexDirection='column'>
      <Box marginBottom={theme.spacing(2)}>
        <MapLegend legends={[]} />
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
              observationsDates && <MapDateSelect dates={observationsDates} onChange={setSelectedObservationDate} />
            }
          />
        )}
      </Box>
    </Box>
  );
}
