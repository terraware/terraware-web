import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import ListMapView from 'src/components/ListMapView';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import { View } from 'src/components/common/ListMapSelector';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { PlotSelectionType } from 'src/scenes/ObservationsRouter/PlantMonitoring';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapSourceProperties } from 'src/types/Map';
import { ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';
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
  zoneViewUrl: string;
};

export default function BoundariesAndZones({
  plantingSite,
  search,
  setSearch,
  setView,
  view,
  zoneViewUrl,
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
          onView={(newView) => setView?.(newView)}
          search={<Search {...searchProps} />}
          list={
            <PlantingSiteDetailsTable
              plantingSite={plantingSite}
              zoneViewUrl={zoneViewUrl}
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
  const [selectedObservationDate, setSelectedObservationDate] = useState<string | undefined>();
  const defaultTimeZone = useDefaultTimeZone();
  const {
    plantingSite,
    plantingSiteHistories,
    observations,
    adHocObservations,
    observationResults,
    adHocObservationResults,
  } = usePlantingSiteData();
  const [selectedObservation, setSelectedObservation] = useState<ObservationResultsPayload>();
  const [selectedAdHocObservation, setSelectedAdHocObservation] = useState<ObservationResultsPayload>();

  const nonUpcomingResult = useMemo(
    () => observationResults?.filter((result) => result.state !== 'Upcoming'),
    [observationResults]
  );

  const timeZone = useMemo(() => {
    return plantingSite?.timeZone ?? defaultTimeZone.get().id;
  }, [defaultTimeZone, plantingSite]);

  const getObservationDate = useCallback(
    (obseration: ObservationResultsPayload) => {
      return obseration.completedTime ? getDateDisplayValue(obseration.completedTime, timeZone) : obseration.startDate;
    },
    [timeZone]
  );

  const observationsDates = useMemo(() => {
    const uniqueDates = new Set<string>();
    nonUpcomingResult?.forEach((result) => uniqueDates.add(getObservationDate(result)));
    adHocObservationResults?.forEach((result) => uniqueDates.add(getObservationDate(result)));

    return Array.from(uniqueDates)
      ?.filter((time) => time.length > 0)
      ?.sort((a, b) => (Date.parse(a) > Date.parse(b) ? 1 : -1));
  }, [nonUpcomingResult, adHocObservationResults, getObservationDate]);

  useEffect(() => {
    if (observationsDates) {
      setSelectedObservationDate((currentDate) => {
        if ((!currentDate || !observationsDates.includes(currentDate)) && observationsDates.length > 0) {
          return observationsDates[observationsDates.length - 1];
        } else {
          return currentDate;
        }
      });
    } else {
      setSelectedObservationDate('');
    }
  }, [observationsDates]);

  useEffect(() => {
    const _selectedObservation = nonUpcomingResult?.find((results) => {
      return getObservationDate(results) === selectedObservationDate;
    });

    setSelectedObservation(_selectedObservation);

    const selAdHocObservation = adHocObservationResults?.find((results) => {
      return getObservationDate(results) === selectedObservationDate;
    });

    setSelectedAdHocObservation(selAdHocObservation);
  }, [nonUpcomingResult, adHocObservationResults, getObservationDate, selectedObservationDate]);

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

  const observationData = useMemo(() => {
    let observationToUse = selectedObservation || selectedAdHocObservation;
    if (selectedObservation && selectedAdHocObservation) {
      if (isAfter(selectedAdHocObservation.completedTime, selectedObservation.completedTime)) {
        observationToUse = selectedAdHocObservation;
      }
    }

    return (
      observations?.find((obv) => obv.id === observationToUse?.observationId) ||
      adHocObservations?.find((obv) => obv.id === observationToUse?.observationId)
    );
  }, [observations, adHocObservations, selectedObservation, selectedAdHocObservation]);

  const plantingSiteHistory = useMemo(() => {
    if (observationData) {
      return plantingSiteHistories?.find((history) => history.id === observationData.plantingSiteHistoryId);
    }
  }, [observationData, plantingSiteHistories]);

  const mapData = useMemo(() => {
    if (plantingSite && plantingSiteHistory) {
      return MapService.getMapDataFromPlantingSiteHistory(plantingSite, plantingSiteHistory);
    }
  }, [plantingSite, plantingSiteHistory]);

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
          bottomLeftMapControl={
            observationsDates &&
            observationsDates.length > 0 && (
              <MapDateSelect
                dates={observationsDates}
                selectedDate={selectedObservationDate ?? observationsDates[0]}
                onChange={setSelectedObservationDate}
              />
            )
          }
        />
      )}
    </Box>
  );
}

const ContextRenderer =
  (
    site: PlantingSite,
    timeZone: string,
  ) =>
  // eslint-disable-next-line react/display-name
  (entity: MapSourceProperties): JSX.Element => {
    const zones = site.plantingZones ?? [];
    let properties: TooltipProperty[] = [];
    let title: string | undefined;
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
      title = zone?.name;
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
      title = subzone?.fullName;
      properties = [
        { key: strings.AREA_HA, value: subzone?.areaHa && subzone?.areaHa > 0 ? subzone?.areaHa : '' },
        { key: strings.PLANTING_COMPLETE, value: subzone?.plantingCompleted ? strings.YES : strings.NO },
        // { key: strings.MONITORING_PLOTS, value: subzone?.monitoringPlots.length ?? 0 },
      ];
    } else {
      // monitoring plot
      // const plot =
      //   selectedAdHocObservation?.adHocPlot ||
      //   data
      //     .flatMap((z) => z.plantingSubzones)
      //     .flatMap((sz) => sz.monitoringPlots)
      //     .find((mp) => mp.monitoringPlotId === entity.id);
      // title = plot?.monitoringPlotNumber.toString();
      // properties = [
      //   {
      //     key: strings.PLOT_TYPE,
      //     value: plot ? (plot.isAdHoc ? strings.AD_HOC : plot.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : '',
      //   },
      //   {
      //     key: strings.LAST_OBSERVED,
      //     value: plot?.completedTime ? getDateDisplayValue(plot.completedTime, timeZone) : '',
      //   },
      // ];
    }

    return <MapTooltip title={title} properties={properties} />;
  };
