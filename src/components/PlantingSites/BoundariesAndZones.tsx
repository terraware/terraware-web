import React, { useMemo, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { theme } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { PlantingSite } from 'src/types/Tracking';
import { PlantingSiteMap } from '../Map';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import { MapService } from 'src/services';
import isEnabled from 'src/features';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import ListMapView from 'src/components/ListMapView';

type BoundariesAndZonesProps = {
  plantingSite: PlantingSite;
};

export default function BoundariesAndZones({ plantingSite }: BoundariesAndZonesProps): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const trackingV2 = isEnabled('TrackingV2');
  const { isMobile } = useDeviceInfo();

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
    }),
    [search]
  );

  return (
    <Box display='flex' flexGrow={plantingSite?.boundary ? 1 : 0} flexDirection='column' paddingTop={theme.spacing(3)}>
      <Box display='flex' flexGrow={0}>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_ZONES}
        </Typography>
      </Box>
      {plantingSite.boundary && trackingV2 && (
        <ListMapView
          style={{ padding: isMobile ? 3 : 0 }}
          initialView='map'
          search={<Search {...searchProps} />}
          list={<PlantingSiteListView />}
          map={<PlantingSiteMapView plantingSite={plantingSite} />}
        />
      )}
      {plantingSite.boundary && !trackingV2 && <PlantingSiteMapView plantingSite={plantingSite} />}
    </Box>
  );
}

/**
 * Map view for planting site
 */
function PlantingSiteMapView({ plantingSite }: BoundariesAndZonesProps): JSX.Element {
  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(layerOptions);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  return (
    <Box display='flex' sx={{ flexGrow: 1 }}>
      {plantingSite.boundary ? (
        <PlantingSiteMap
          mapData={MapService.getMapDataFromPlantingSite(plantingSite)}
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
    </Box>
  );
}

/**
 * Planting site list view
 */
function PlantingSiteListView(): JSX.Element {
  return <span>placeholder</span>;
}
