import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
          {strings.BOUNDARIES_AND_STRATA}
        </Typography>
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
  const [searchStratumEntities, setSearchStratumEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Strata', 'Sub-Strata']);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Strata: strings.STRATA,
    'Sub-Strata': strings.SUBSTRATA,
    'Monitoring Plots': strings.MONITORING_PLOTS,
    'Project Zones': strings.PROJECT_ZONES,
  };

  const mapData = useMemo(() => {
    if (plantingSite) {
      return MapService.getMapDataFromPlantingSite(plantingSite);
    }
  }, [plantingSite]);

  useEffect(() => {
    if (!search) {
      setSearchStratumEntities([]);
    } else {
      const entities = plantingSite?.strata
        ?.filter((stratum) => regexMatch(stratum.name, search))
        .map((stratum) => ({ sourceId: 'strata', id: stratum.id }));
      setSearchStratumEntities(entities ?? []);
    }
  }, [plantingSite, search]);

  const layerOptions: MapLayer[] = useMemo(() => {
    const result: MapLayer[] = ['Planting Site', 'Strata', 'Sub-Strata'];
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
      <PlantingSiteMapLegend options={['site', 'stratum', 'substratum']} />
      {mapData && plantingSite && (
        <PlantingSiteMap
          mapData={mapData}
          style={{ borderRadius: '24px' }}
          layers={includedLayers}
          highlightEntities={searchStratumEntities}
          focusEntities={
            searchStratumEntities.length ? searchStratumEntities : [{ sourceId: 'sites', id: plantingSite.id }]
          }
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
              onUpdateSelection={setIncludedLayers}
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
    const strata = site.strata ?? [];
    let properties: TooltipProperty[] = [];
    let title: string;
    if (entity.type === 'site') {
      title = site.name;
      properties = [
        { key: strings.STRATA, value: strata.length },
        { key: strings.SUBSTRATA, value: strata.flatMap((z) => z.substrata).length },
      ];
    } else if (entity.type === 'stratum') {
      const stratum = strata.find((z) => z.id === entity.id);
      title = stratum?.name ?? '';
      properties = [
        { key: strings.TARGET_PLANTING_DENSITY, value: stratum?.targetPlantingDensity ?? 0 },
        { key: strings.SUBSTRATA, value: stratum?.substrata.length ?? 0 },
      ];
    } else {
      return null;
    }

    return <MapTooltip title={title} properties={properties} />;
  };
