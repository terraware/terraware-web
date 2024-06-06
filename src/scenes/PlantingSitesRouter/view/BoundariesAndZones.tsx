import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import getDateDisplayValue from '@terraware/web-components/utils/date';

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
import { ZoneAggregation } from 'src/types/Observations';
import { MinimalPlantingSite, MinimalPlantingZone } from 'src/types/Tracking';
import { regexMatch } from 'src/utils/search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

type BoundariesAndZonesProps = {
  data: ZoneAggregation[];
  plantingSite: MinimalPlantingSite;
  search: string;
  setSearch: (query: string) => void;
  setView?: (view: View) => void;
  view?: View;
  zoneViewUrl: string;
};

export default function BoundariesAndZones({
  data,
  plantingSite,
  search,
  setSearch,
  setView,
  view,
  zoneViewUrl,
}: BoundariesAndZonesProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
    }),
    [search, setSearch]
  );

  return (
    <Box sx={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}>
      <Box display='flex' flexGrow={0}>
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
          list={<PlantingSiteDetailsTable data={data} plantingSite={plantingSite} zoneViewUrl={zoneViewUrl} />}
          map={<PlantingSiteMapView plantingSite={plantingSite} data={data} search={search.trim()} />}
        />
      )}
    </Box>
  );
}

type PlantingSiteMapViewProps = {
  plantingSite: MinimalPlantingSite;
  data: ZoneAggregation[];
  search: string;
};

function PlantingSiteMapView({ plantingSite, data, search }: PlantingSiteMapViewProps): JSX.Element | null {
  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Monitoring Plots']);
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

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
        .filter((zone: MinimalPlantingZone) => regexMatch(zone.name, search))
        .map((zone) => ({ sourceId: 'zones', id: zone.id }));
      setSearchZoneEntities(entities);
    }
  }, [data, search]);

  const mapData = useMemo(() => {
    return MapService.getMapDataFromAggregation({ ...plantingSite, plantingZones: data });
  }, [plantingSite, data]);

  const layerOptions: MapLayer[] = useMemo(() => {
    const result: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones'];
    if (
      (mapData.permanentPlot?.entities && mapData.permanentPlot.entities.length > 0) ||
      (mapData.temporaryPlot?.entities && mapData.temporaryPlot.entities.length > 0)
    ) {
      result.push('Monitoring Plots');
    }
    return result;
  }, [mapData]);

  if (!plantingSite.boundary) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <PlantingSiteMapLegend options={['site', 'zone', 'subzone', 'permanentPlot', 'temporaryPlot']} />
      <PlantingSiteMap
        mapData={mapData}
        style={{ borderRadius: '24px' }}
        layers={includedLayers}
        highlightEntities={searchZoneEntities}
        focusEntities={searchZoneEntities.length ? searchZoneEntities : [{ sourceId: 'sites', id: plantingSite.id }]}
        contextRenderer={{
          render: contextRenderer(plantingSite, data, timeZone),
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
    </Box>
  );
}

const contextRenderer =
  (site: MinimalPlantingSite, data: ZoneAggregation[], timeZone: string) =>
  // eslint-disable-next-line react/display-name
  (entity: MapSourceProperties): JSX.Element => {
    let properties: TooltipProperty[] = [];
    let title: string | undefined;
    if (entity.type === 'site') {
      title = site.name;
      properties = [
        { key: strings.ZONES, value: data.length },
        { key: strings.SUBZONES, value: data.flatMap((z) => z.plantingSubzones).length },
        {
          key: strings.MONITORING_PLOTS,
          value: data.flatMap((z) => z.plantingSubzones).flatMap((sz) => sz.monitoringPlots).length,
        },
      ];
    } else if (entity.type === 'zone') {
      const zone = data.find((z) => z.id === entity.id);
      title = zone?.name;
      properties = [
        { key: strings.TARGET_PLANTING_DENSITY, value: zone?.targetPlantingDensity ?? 0 },
        { key: strings.PLANTING_COMPLETE, value: zone?.plantingCompleted ? strings.YES : strings.NO },
        { key: strings.SUBZONES, value: zone?.plantingSubzones.length ?? 0 },
        {
          key: strings.MONITORING_PLOTS,
          value: zone?.plantingSubzones.flatMap((sz) => sz.monitoringPlots).length ?? 0,
        },
        {
          key: strings.LAST_OBSERVED,
          value: zone?.completedTime ? getDateDisplayValue(zone.completedTime, timeZone) : '',
        },
      ];
    } else if (entity.type === 'subzone') {
      const subzone = data.flatMap((z) => z.plantingSubzones).find((sz) => sz.id === entity.id);
      title = subzone?.fullName;
      properties = [
        { key: strings.PLANTING_COMPLETE, value: subzone?.plantingCompleted ? strings.YES : strings.NO },
        { key: strings.MONITORING_PLOTS, value: subzone?.monitoringPlots.length ?? 0 },
      ];
    } else {
      // monitoring plot
      const plot = data
        .flatMap((z) => z.plantingSubzones)
        .flatMap((sz) => sz.monitoringPlots)
        .find((mp) => mp.monitoringPlotId === entity.id);
      title = plot?.monitoringPlotName;
      properties = [
        { key: strings.PLOT_TYPE, value: plot ? (plot.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : '' },
        {
          key: strings.LAST_OBSERVED,
          value: plot?.completedTime ? getDateDisplayValue(plot.completedTime, timeZone) : '',
        },
      ];
    }

    return <MapTooltip title={title} properties={properties} />;
  };
