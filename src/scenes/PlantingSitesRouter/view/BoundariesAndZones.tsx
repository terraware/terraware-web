import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import ListMapView from 'src/components/ListMapView';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import { View } from 'src/components/common/ListMapSelector';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { PlotSelectionType } from 'src/scenes/ObservationsRouter/PlantMonitoring';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapSourceProperties } from 'src/types/Map';
import { PlantingSite } from 'src/types/Tracking';
import { regexMatch } from 'src/utils/search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

export type ObservationType = 'plantMonitoring' | 'biomassMeasurements';

type BoundariesAndZonesProps = {
  plantingSite: PlantingSite;
  search?: string;
  setSearch: (query: string) => void;
  setView?: (view: View) => void;
  view?: View;
};

export default function BoundariesAndZones({
  plantingSite,
  search,
  setSearch,
  setView,
  view,
}: BoundariesAndZonesProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');
  const [selectedObservationType, setSelectedObservationType] = useState<ObservationType>('plantMonitoring');

  const searchProps = useMemo<SearchProps>(
    () => ({
      search: search || '',
      onSearch: (value: string) => setSearch(value),
    }),
    [search, setSearch]
  );

  const setViewCallback = useCallback(
    (newView: View) => {
      setView?.(newView);
    },
    [setView]
  );

  return (
    <Box sx={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}>
      <Box display='flex' flexGrow={0} alignItems='center'>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.BOUNDARIES_AND_ZONES}
        </Typography>
        {view === 'list' && (
          <Box display={'flex'} alignItems='center'>
            <Box
              sx={{
                margin: theme.spacing(0, 2),
                width: '1px',
                height: '32px',
                backgroundColor: theme.palette.TwClrBgTertiary,
              }}
            />
            <Box display='flex' alignItems='center'>
              <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>
                {strings.PLOT_SELECTION}
              </Typography>
              <Box width='160px' marginRight={3}>
                <Dropdown
                  placeholder={strings.SELECT}
                  id='plot-selection-selector'
                  onChange={(newValue) => setSelectedPlotSelection(newValue as PlotSelectionType)}
                  options={[
                    { label: strings.ASSIGNED, value: 'assigned' },
                    { label: strings.AD_HOC, value: 'adHoc' },
                  ]}
                  selectedValue={selectedPlotSelection}
                  selectStyles={{ inputContainer: { maxWidth: '160px' }, optionsContainer: { maxWidth: '160px' } }}
                  fullWidth
                />
              </Box>
            </Box>
            <Box display='flex' alignItems='center'>
              <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>
                {strings.OBSERVATION_TYPE}
              </Typography>
              <Dropdown
                placeholder={strings.SELECT}
                id='observation-type-selector'
                onChange={(newValue) => setSelectedObservationType(newValue as ObservationType)}
                options={[
                  { label: strings.PLANT_MONITORING, value: 'plantMonitoring' },
                  { label: strings.BIOMASS_MONITORING, value: 'biomassMeasurements' },
                ]}
                selectedValue={selectedObservationType}
                fullWidth
              />
            </Box>
          </Box>
        )}
      </Box>
      {plantingSite.boundary && (
        <ListMapView
          style={{
            padding: isMobile ? theme.spacing(0, 3, 3) : 0,
            ...(view === 'map' ? { display: 'flex', flexDirection: 'column', flexGrow: 1 } : {}),
          }}
          initialView={'map'}
          onView={setViewCallback}
          search={<Search {...searchProps} />}
          list={
            <PlantingSiteDetailsTable
              plantingSite={plantingSite}
              plotSelection={selectedPlotSelection}
              observationType={selectedObservationType}
            />
          }
          map={<PlantingSiteMapView search={search ? search.trim() : ''} />}
        />
      )}
    </Box>
  );
}

type PlantingSiteMapViewProps = {
  search?: string;
};

function PlantingSiteMapView({ search }: PlantingSiteMapViewProps): JSX.Element | null {
  const { isDesktop } = useDeviceInfo();
  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Monitoring Plots']);
  const defaultTimeZone = useDefaultTimeZone();
  const { plantingSite } = usePlantingSiteData();

  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone.get().id, [plantingSite, defaultTimeZone]);

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
      <PlantingSiteMapLegend options={['site', 'zone', 'subzone', 'permanentPlot', 'temporaryPlot', 'adHocPlot']} />
      {mapData && plantingSite && (
        <PlantingSiteMap
          mapData={mapData}
          style={{ borderRadius: '24px' }}
          layers={includedLayers}
          highlightEntities={searchZoneEntities}
          focusEntities={searchZoneEntities.length ? searchZoneEntities : [{ sourceId: 'sites', id: plantingSite.id }]}
          contextRenderer={{
            render: ContextRenderer(plantingSite, timeZone),
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
  (site: PlantingSite, timeZone: string) =>
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
        {
          key: strings.MONITORING_PLOTS,
          value: zones.reduce((accumulator, zone) => accumulator + zone.numPermanentPlots, 0),
        },
      ];
    } else if (entity.type === 'zone') {
      const zone = zones.find((z) => z.id === entity.id);
      title = zone?.name ?? '';
      properties = [
        { key: strings.AREA_HA, value: zone?.areaHa && zone?.areaHa > 0 ? zone?.areaHa : '' },
        { key: strings.TARGET_PLANTING_DENSITY, value: zone?.targetPlantingDensity ?? 0 },
        {
          key: strings.PLANTING_COMPLETE,
          value: zone?.plantingSubzones?.every((subzone) => subzone.plantingCompleted) ? strings.YES : strings.NO,
        },
        { key: strings.SUBZONES, value: zone?.plantingSubzones.length ?? 0 },
        {
          key: strings.MONITORING_PLOTS,
          value: zone?.numPermanentPlots ?? 0,
        },
        {
          key: strings.LAST_OBSERVED,
          value: zone?.latestObservationCompletedTime
            ? getDateDisplayValue(zone.latestObservationCompletedTime, timeZone)
            : '',
        },
      ];
    } else if (entity.type === 'subzone') {
      const subzone = zones.flatMap((z) => z.plantingSubzones).find((sz) => sz.id === entity.id);
      title = subzone?.fullName ?? '';
      properties = [
        { key: strings.AREA_HA, value: subzone?.areaHa && subzone?.areaHa > 0 ? subzone?.areaHa : '' },
        { key: strings.PLANTING_COMPLETE, value: subzone?.plantingCompleted ? strings.YES : strings.NO },
        { key: strings.MONITORING_PLOTS, value: subzone?.monitoringPlots.length ?? 0 },
      ];
    } else {
      return null;
    }

    return <MapTooltip title={title} properties={properties} />;
  };
