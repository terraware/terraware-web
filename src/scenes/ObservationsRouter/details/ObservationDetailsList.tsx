import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TableColumnType } from '@terraware/web-components';

import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import {
  searchObservationDetails,
  selectDetailsZoneNames,
} from 'src/redux/features/observations/observationDetailsSelectors';
import { has25mPlots } from 'src/redux/features/observations/utils';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationDetailsRenderer from './ObservationDetailsRenderer';

const columns = (): TableColumnType[] => [
  { key: 'plantingZoneName', name: strings.ZONE, type: 'string' },
  { key: 'completedDate', name: strings.DATE, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

const ObservationDetailsList = (props: SearchProps): JSX.Element => {
  const { ...searchProps }: SearchProps = props;

  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useNavigate();
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId || -1);
  const observationId = Number(params.observationId || -1);

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId,
        observationId,
        search: searchProps.search,
        zoneNames: searchProps.filtersProps?.filters.zone?.values ?? [],
      },
      defaultTimeZone.get().id
    )
  );

  const zoneNames = useAppSelector((state) => selectDetailsZoneNames(state, plantingSiteId, observationId));

  useEffect(() => {
    if (!details) {
      navigate(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', `${plantingSiteId}`));
    }
  }, [details, navigate, plantingSiteId]);

  useEffect(() => {
    const initialZones = searchProps.filtersProps?.filters?.zone?.values ?? [];
    const availableZones = initialZones.filter((name: string) => zoneNames.includes(name));

    if (availableZones.length < initialZones.length) {
      searchProps.filtersProps?.setFilters((previous: Record<string, any>) => ({
        ...previous,
        zone: { ...previous.zone, values: availableZones },
      }));
    }
  }, [zoneNames, searchProps.filtersProps]);

  const has25mPlotsZones = () => {
    const allSubzones = details?.plantingZones.flatMap((zone) => zone.plantingSubzones.flatMap((subzone) => subzone));
    if (allSubzones) {
      return has25mPlots(allSubzones);
    }
  };

  return (
    <Table
      id='observation-details-table'
      columns={columns}
      rows={details?.plantingZones ?? []}
      orderBy='plantingZoneName'
      Renderer={ObservationDetailsRenderer(plantingSiteId, observationId)}
      tableComments={has25mPlotsZones() ? strings.PLOTS_SIZE_NOTE : undefined}
    />
  );
};

export default ObservationDetailsList;
