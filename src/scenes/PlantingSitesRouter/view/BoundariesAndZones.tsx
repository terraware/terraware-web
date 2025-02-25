import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import getDateDisplayValue, { getTodaysDateFormatted } from '@terraware/web-components/utils/date';

import ListMapView from 'src/components/ListMapView';
import { PlantingSiteMap } from 'src/components/Map';
import { MapTooltip, TooltipProperty } from 'src/components/Map/MapRenderUtils';
import { View } from 'src/components/common/ListMapSelector';
import MapDateSelect from 'src/components/common/MapDateSelect';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import PlantingSiteMapLegend from 'src/components/common/PlantingSiteMapLegend';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import {
  searchAdHocObservations,
  searchObservations,
  selectPlantingSiteAdHocObservations,
  selectPlantingSiteObservations,
} from 'src/redux/features/observations/observationsSelectors';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSiteHistory } from 'src/redux/features/tracking/trackingSelectors';
import { requestGetPlantingSiteHistory } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PlotSelectionType } from 'src/scenes/ObservationsRouter/PlantMonitoring';
import { MapService } from 'src/services';
import strings from 'src/strings';
import { MapEntityId, MapObject, MapSourceBaseData, MapSourceProperties } from 'src/types/Map';
import { AdHocObservationResults, Observation, ObservationResults, ZoneAggregation } from 'src/types/Observations';
import { MinimalPlantingSite, MinimalPlantingZone, PlantingSiteHistory } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';
import { regexMatch } from 'src/utils/search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSiteDetailsTable from './PlantingSiteDetailsTable';

export type ObservationType = 'plantMonitoring' | 'biomassMeasurements';

type BoundariesAndZonesProps = {
  data: ZoneAggregation[];
  plantingSite: MinimalPlantingSite;
  search?: string;
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
  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');
  const [selectedObservationType, setSelectedObservationType] = useState<ObservationType>('plantMonitoring');
  const adHocObservationSupportEnabled = isEnabled('Ad Hoc Observation Support');

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
        {adHocObservationSupportEnabled && view === 'list' && (
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
                  { label: strings.BIOMASS_MEASUREMENTS, value: 'biomassMeasurements' },
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
              data={data}
              plantingSite={plantingSite}
              zoneViewUrl={zoneViewUrl}
              plotSelection={selectedPlotSelection}
              observationType={selectedObservationType}
            />
          }
          map={<PlantingSiteMapView plantingSite={plantingSite} data={data} search={search ? search.trim() : ''} />}
        />
      )}
    </Box>
  );
}

type PlantingSiteMapViewProps = {
  plantingSite: MinimalPlantingSite;
  data: ZoneAggregation[];
  search?: string;
};

function PlantingSiteMapView({ plantingSite, data, search }: PlantingSiteMapViewProps): JSX.Element | null {
  const [searchZoneEntities, setSearchZoneEntities] = useState<MapEntityId[]>([]);
  const [includedLayers, setIncludedLayers] = useState<MapLayer[]>(['Planting Site', 'Zones', 'Monitoring Plots']);
  const [selectedObservationDate, setSelectedObservationDate] = useState<string | undefined>();
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;
  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();
  const adHocObservationSupportEnabled = isEnabled('Ad Hoc Observation Support');
  const [selectedObservation, setSelectedObservation] = useState<ObservationResults>();
  const [selectedAdHocObservation, setSelectedAdHocObservation] = useState<AdHocObservationResults>();

  const [requestId, setRequestId] = useState<string>('');

  const observationHistory = useAppSelector((state) => selectPlantingSiteHistory(state, requestId));

  const [plantingSiteHistory, setPlantingSiteHistory] = useState<PlantingSiteHistory>();

  const observations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteObservations(state, plantingSite.id)
  );

  const adHocObservations: Observation[] | undefined = useAppSelector((state) =>
    selectPlantingSiteAdHocObservations(state, plantingSite.id)
  );

  const status = useMemo(() => {
    return ['Completed', 'InProgress', 'Overdue', 'Abandoned'];
  }, []);

  useEffect(() => {
    dispatch(requestObservationsResults(selectedOrganization.id));
    dispatch(requestObservations(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (observationHistory?.status === 'success') {
      setPlantingSiteHistory(observationHistory.data);
    }
  }, [observationHistory]);

  const observationsResults = useAppSelector((state) =>
    searchObservations(state, plantingSite.id, defaultTimeZone.get().id, '', [], status)
  );

  const adHocObservationsResults = useAppSelector((state) =>
    searchAdHocObservations(state, plantingSite.id, defaultTimeZone.get().id, '')
  );

  const observationsDates = useMemo(() => {
    const uniqueDates = new Set(observationsResults?.map((obs) => obs.completedDate || obs.startDate));
    uniqueDates.add(getTodaysDateFormatted());

    adHocObservationsResults?.forEach((obs) => {
      const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;
      const dateToUse = obs.completedTime ? getDateDisplayValue(obs.completedTime, timeZone) : obs.startDate;
      uniqueDates.add(dateToUse);
    });

    return Array.from(uniqueDates)
      ?.filter((time) => time)
      ?.map((time) => time)
      ?.sort((a, b) => (Date.parse(a) > Date.parse(b) ? 1 : -1));
  }, [observationsResults, adHocObservationsResults]);

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
    const selObservation = observationsResults?.find((obs) => {
      const dateToCheck = obs.state === 'Completed' || obs.state === 'Abandoned' ? obs.completedDate : obs.startDate;
      return dateToCheck === selectedObservationDate;
    });

    setSelectedObservation(selObservation);

    const selAdHocObservation = adHocObservationsResults?.find((obs) => {
      const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;
      const dateToCheck = obs.completedTime ? getDateDisplayValue(obs.completedTime, timeZone) : obs.startDate;
      return dateToCheck === selectedObservationDate;
    });

    setSelectedAdHocObservation(selAdHocObservation);
  }, [observationsResults, adHocObservationsResults, plantingSite, selectedObservationDate]);

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
      observations.find((obv) => obv.id === observationToUse?.observationId) ||
      adHocObservations.find((obv) => obv.id === observationToUse?.observationId)
    );
  }, [observations, selectedObservation, selectedAdHocObservation]);

  useEffect(() => {
    if (observationData) {
      const historyId = observationData.plantingSiteHistoryId;
      if (historyId) {
        const requestObservationHistory = dispatch(
          requestGetPlantingSiteHistory({
            plantingSiteId: plantingSite.id,
            historyId: historyId,
          })
        );
        setRequestId(requestObservationHistory.requestId);
      }
    } else {
      setRequestId('');
    }
  }, [observationData]);

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

  const mapDataFromAggregation = useMemo(() => {
    return MapService.getMapDataFromAggregation({ ...plantingSite, plantingZones: data });
  }, [plantingSite, data]);

  const mapData: Record<MapObject, MapSourceBaseData | undefined> = useMemo(() => {
    let observationToUse = selectedObservation || selectedAdHocObservation;
    if (selectedObservation && selectedAdHocObservation) {
      if (isAfter(selectedAdHocObservation.completedTime, selectedObservation.completedTime)) {
        observationToUse = selectedAdHocObservation;
      }
    }

    if (!selectedObservationDate || !observationToUse) {
      return {
        site: mapDataFromAggregation.site,
        zone: mapDataFromAggregation.zone,
        subzone: mapDataFromAggregation.subzone,
        permanentPlot: undefined,
        temporaryPlot: undefined,
        adHocPlot: undefined,
      };
    }
    const newMapData = MapService.getMapDataFromObservation(observationToUse, plantingSiteHistory);
    return newMapData;
  }, [
    selectedObservation,
    selectedObservationDate,
    mapDataFromAggregation,
    plantingSiteHistory,
    selectedAdHocObservation,
  ]);

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
      <PlantingSiteMapLegend
        options={
          adHocObservationSupportEnabled
            ? ['site', 'zone', 'subzone', 'permanentPlot', 'temporaryPlot', 'adHocPlot']
            : ['site', 'zone', 'subzone', 'permanentPlot', 'temporaryPlot']
        }
      />
      <PlantingSiteMap
        mapData={mapData}
        style={{ borderRadius: '24px' }}
        layers={includedLayers}
        highlightEntities={searchZoneEntities}
        focusEntities={searchZoneEntities.length ? searchZoneEntities : [{ sourceId: 'sites', id: plantingSite.id }]}
        contextRenderer={{
          render: contextRenderer(plantingSite, data, timeZone, selectedAdHocObservation),
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
    </Box>
  );
}

const contextRenderer =
  (
    site: MinimalPlantingSite,
    data: ZoneAggregation[],
    timeZone: string,
    selectedAdHocObservation?: AdHocObservationResults
  ) =>
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
      const plot =
        selectedAdHocObservation?.adHocPlot ||
        data
          .flatMap((z) => z.plantingSubzones)
          .flatMap((sz) => sz.monitoringPlots)
          .find((mp) => mp.monitoringPlotId === entity.id);
      title = plot?.monitoringPlotNumber.toString();
      properties = [
        {
          key: strings.PLOT_TYPE,
          value: plot ? (plot.isAdHoc ? strings.AD_HOC : plot.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : '',
        },
        {
          key: strings.LAST_OBSERVED,
          value: plot?.completedTime ? getDateDisplayValue(plot.completedTime, timeZone) : '',
        },
      ];
    }

    return <MapTooltip title={title} properties={properties} />;
  };
