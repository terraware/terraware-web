import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { PlantingSite, PlantingZone } from 'src/types/Tracking';
import { MapEntityId } from 'src/types/Map';
import { ZoneAggregation } from 'src/types/Observations';
import { useAppSelector } from 'src/redux/store';
import { regexMatch } from 'src/utils/search';
import { PlantingSiteMap } from '../Map';
import { searchPlantingSiteZones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import { MapService } from 'src/services';
import isEnabled from 'src/features';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { View } from 'src/components/common/ListMapSelector';
import ListMapView from 'src/components/ListMapView';
import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

type BoundariesAndZonesProps = {
  plantingSite: PlantingSite;
};

export default function BoundariesAndZones({ plantingSite }: BoundariesAndZonesProps): JSX.Element {
  const [view, setView] = useState<View>('map');
  const [search, setSearch] = useState<string>('');
  const trackingV2 = isEnabled('TrackingV2');
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const data = useAppSelector((state) =>
    searchPlantingSiteZones(state, plantingSite.id, view === 'map' ? '' : search.trim())
  );

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
          style={{ padding: isMobile ? theme.spacing(0, 3, 3) : 0 }}
          initialView='map'
          onView={(newView) => setView(newView)}
          search={<Search {...searchProps} />}
          list={<PlantingSiteDetailsTable data={data} plantingSite={plantingSite} />}
          map={<PlantingSiteMapView plantingSite={plantingSite} data={data} search={search.trim()} />}
        />
      )}
      {plantingSite.boundary && !trackingV2 && <PlantingSiteMapViewV1 plantingSite={plantingSite} />}
    </Box>
  );
}

/**
 * Map view for planting site (tracking v1)
 */
function PlantingSiteMapViewV1({ plantingSite }: BoundariesAndZonesProps): JSX.Element {
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
 * Map view for planting site (tracking v2)
 */

type PlantingSiteMapViewProps = {
  plantingSite: PlantingSite;
  data: ZoneAggregation[];
  search: string;
};

function PlantingSiteMapView({ plantingSite, data, search }: PlantingSiteMapViewProps): JSX.Element | null {
  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Monitoring Plots']);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  useEffect(() => {
    if (!search) {
      setSearchZoneEntities([]);
    } else {
      const entities = data
        .filter((zone: PlantingZone) => regexMatch(zone.name, search))
        .map((zone) => ({ sourceId: 'zones', id: zone.id }));
      setSearchZoneEntities(entities);
    }
  }, [data, search]);

  if (!plantingSite.boundary) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'zone', 'subzone', 'permanentPlot', 'temporaryPlot']} />
      <PlantingSiteMap
        mapData={MapService.getMapDataFromAggregation({ ...plantingSite, plantingZones: data })}
        style={{ borderRadius: '24px' }}
        layers={includedLayers}
        highlightEntities={searchZoneEntities}
        focusEntities={searchZoneEntities.length ? searchZoneEntities : [{ sourceId: 'sites', id: plantingSite.id }]}
        topRightMapControl={
          <MapLayerSelect
            initialSelection={includedLayers}
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
    </Box>
  );
}
