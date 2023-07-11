import React, { useMemo, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { theme } from '@terraware/web-components';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { ZoneAggregation } from 'src/types/Observations';
import { getRgbaFromHex } from 'src/utils/color';
import { useAppSelector } from 'src/redux/store';
import { PlantingSiteMap } from '../Map';
import { searchPlantingSiteZones } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import { MapService } from 'src/services';
import isEnabled from 'src/features';
import MapLegend from 'src/components/common/MapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import ListMapView from 'src/components/ListMapView';
import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

type BoundariesAndZonesProps = {
  plantingSite: PlantingSite;
};

export default function BoundariesAndZones({ plantingSite }: BoundariesAndZonesProps): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const trackingV2 = isEnabled('TrackingV2');
  const { isMobile } = useDeviceInfo();

  const data = useAppSelector((state) => searchPlantingSiteZones(state, plantingSite.id, search));

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
          list={<PlantingSiteDetailsTable data={data} plantingSite={plantingSite} />}
          map={<PlantingSiteMapView plantingSite={plantingSite} data={data} />}
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
};

function PlantingSiteMapView({ plantingSite, data }: PlantingSiteMapViewProps): JSX.Element | null {
  const layerOptions: MapLayer[] = ['Planting Site', 'Zones', 'Sub-Zones', 'Monitoring Plots'];
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Monitoring Plots']);

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
            label: strings.SUBZONES,
            borderColor: theme.palette.TwClrBaseBlue300 as string,
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
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
    []
  );

  if (!plantingSite.boundary) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <Box marginBottom={theme.spacing(2)} display='flex' flexDirection='column'>
        <MapLegend legends={legends} />
      </Box>
      <PlantingSiteMap
        mapData={MapService.getMapDataFromAggregation({ ...plantingSite, plantingZones: data })}
        style={{ borderRadius: '24px' }}
        layers={includedLayers}
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
