import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import { View } from 'src/components/common/ListMapSelector';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapSourceProperties } from 'src/types/Map';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { regexMatch } from 'src/utils/search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import DraftPlantingSiteDetailsTable from './DraftPlantingSiteDetailsTable';

export type ObservationType = 'plantMonitoring' | 'biomassMeasurements';

type DraftPlantingSiteListMapViewProps = {
  plantingSite: DraftPlantingSite;
  search?: string;
  setSearch: (query: string) => void;
  setView?: (view: View) => void;
  view?: View;
};

export default function DraftPlantingSiteListMapView({
  plantingSite,
  search,
  setSearch,
  setView,
  view,
}: DraftPlantingSiteListMapViewProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const searchProps = useMemo<SearchProps>(
    () => ({
      search: search || '',
      onSearch: (value: string) => setSearch(value),
    }),
    [search, setSearch]
  );

  return (
    <Box sx={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}>
      <Box display='flex' flexGrow={0} alignItems='center'>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_ZONES}
        </Typography>
      </Box>
      {plantingSite.boundary && (
        <ListMapView
          style={{
            padding: isMobile ? theme.spacing(0, 3, 3) : 0,
            ...(view === 'map' ? { display: 'flex', flexDirection: 'column', flexGrow: 1 } : {}),
          }}
          initialView={'map'}
          onView={(newView) => setView?.(newView)}
          search={<Search {...searchProps} />}
          list={<DraftPlantingSiteDetailsTable plantingSite={plantingSite} />}
          map={<DraftPlantingSiteMapView plantingSite={plantingSite} search={search ? search.trim() : ''} />}
        />
      )}
    </Box>
  );
}

type PlantingSiteMapViewProps = {
  plantingSite: MinimalPlantingSite;
  search?: string;
};

function DraftPlantingSiteMapView({ plantingSite, search }: PlantingSiteMapViewProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Sub-Zones']);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  const mapData = useMemo(() => {
    if (plantingSite) {
      return MapService.getMapDataFromPlantingSite(plantingSite);
    }
  }, [plantingSite]);

  useEffect(() => {
    if (!search) {
      setSearchZoneEntities([]);
    } else {
      const entities = plantingSite?.plantingZones
        ?.filter((zone) => regexMatch(zone.name, search))
        .map((zone) => ({ sourceId: 'zones', id: zone.id }));
      setSearchZoneEntities(entities ?? []);
    }
  }, [plantingSite, search]);

  const layerOptions: MapLayer[] = useMemo(() => {
    const result: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones'];
    if (
      mapData &&
      ((mapData.permanentPlot?.entities && mapData.permanentPlot.entities.length > 0) ||
        (mapData.temporaryPlot?.entities && mapData.temporaryPlot.entities.length > 0))
    ) {
      result.push('Monitoring Plots');
    }
    return result;
  }, [mapData]);

  if (!plantingSite?.boundary) {
    return null;
  }

  return (
    <Box display='flex' flexDirection={isDesktop ? 'row' : 'column-reverse'} flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'zone', 'subzone']} />
      {mapData && plantingSite && (
        <PlantingSiteMap
          mapData={mapData}
          style={{ borderRadius: '24px' }}
          layers={includedLayers}
          highlightEntities={searchZoneEntities}
          focusEntities={searchZoneEntities.length ? searchZoneEntities : [{ sourceId: 'sites', id: plantingSite.id }]}
          contextRenderer={{
            render: ContextRenderer(plantingSite),
            sx: {
              '.mapboxgl-popup .mapboxgl-popup-content': {
                borderRadius: '8px',
                padding: '10px',
                width: 'fit-content',
                maxWidth: '350px',
              },
            },
          }}
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
      )}
    </Box>
  );
}

const ContextRenderer =
  (site: MinimalPlantingSite) =>
  // eslint-disable-next-line react/display-name
  (entity: MapSourceProperties): JSX.Element | null => {
    const zones = site.plantingZones ?? [];
    let properties: TooltipProperty[] = [];
    let title: string;
    if (entity.type === 'site') {
      title = site.name;
      properties = [
        { key: strings.ZONES, value: zones.length },
        { key: strings.SUBZONES, value: zones.flatMap((z) => z.plantingSubzones).length },
      ];
    } else if (entity.type === 'zone') {
      const zone = zones.find((z) => z.id === entity.id);
      title = zone?.name ?? '';
      properties = [
        { key: strings.TARGET_PLANTING_DENSITY, value: zone?.targetPlantingDensity ?? 0 },
        { key: strings.SUBZONES, value: zone?.plantingSubzones.length ?? 0 },
      ];
    } else {
      return null;
    }

    return <MapTooltip title={title} properties={properties} />;
  };
