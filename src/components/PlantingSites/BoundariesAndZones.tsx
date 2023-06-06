import { Typography, Box, CircularProgress } from '@mui/material';
import { theme } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { PlantingSiteMap } from '../Map';
import React, { useState } from 'react';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';

type BoundariesAndZonesProps = {
  plantingSite: PlantingSite;
};

export default function BoundariesAndZones(props: BoundariesAndZonesProps): JSX.Element {
  const { plantingSite } = props;

  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  return (
    <Box display='flex' flexGrow={plantingSite?.boundary ? 1 : 0} flexDirection='column' paddingTop={theme.spacing(3)}>
      <Box display='flex' flexGrow={0}>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_ZONES}
        </Typography>
      </Box>
      <Box display='flex' sx={{ flexGrow: 1 }}>
        {plantingSite ? (
          <>
            {plantingSite.boundary ? (
              <PlantingSiteMap
                plantingSite={plantingSite}
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
              />
            ) : null}
          </>
        ) : (
          <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
}
