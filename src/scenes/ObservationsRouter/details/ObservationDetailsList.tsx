import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { TableColumnType } from '@terraware/web-components';

import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import {
  searchObservationDetails,
  selectDetailsStratumNames,
} from 'src/redux/features/observations/observationDetailsSelectors';
import { has25mPlots } from 'src/redux/features/observations/utils';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationDetailsRenderer from './ObservationDetailsRenderer';

const ObservationDetailsList = (props: SearchProps): JSX.Element => {
  const { ...searchProps }: SearchProps = props;

  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useSyncNavigate();
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId || -1);
  const observationId = Number(params.observationId || -1);

  const columns = useCallback(
    () =>
      [
        { key: 'stratumName', name: strings.STRATUM, type: 'string' },
        { key: 'completedDate', name: strings.DATE, type: 'string' },
        { key: 'status', name: strings.STATUS, type: 'string' },
        { key: 'totalLive', name: strings.LIVE_PLANTS, tooltipTitle: strings.TOOLTIP_LIVE_PLANTS, type: 'number' },
        { key: 'totalPlants', name: strings.TOTAL_PLANTS, tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS, type: 'number' },
        { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
        { key: 'plantingDensity', name: strings.PLANT_DENSITY, type: 'number' },
        {
          key: 'survivalRate',
          name: strings.SURVIVAL_RATE,
          type: 'number',
          tooltipTitle: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
        },
      ] as TableColumnType[],
    []
  );

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId,
        observationId,
        orgId: selectedOrganization?.id || -1,
        search: searchProps.search,
        stratumNames: searchProps.filtersProps?.filters.stratum?.values ?? [],
      },
      defaultTimeZone.get().id
    )
  );

  const stratumNames = useAppSelector((state) =>
    selectDetailsStratumNames(state, plantingSiteId, observationId, selectedOrganization?.id || -1)
  );

  const rows = useMemo(() => {
    return (
      details?.strata.map((stratum) => {
        const totalLive = getObservationSpeciesLivePlantsCount(stratum.species);
        return { ...stratum, totalLive };
      }) ?? []
    );
  }, [details?.strata]);

  useEffect(() => {
    if (!details) {
      navigate(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', `${plantingSiteId}`));
    }
  }, [details, navigate, plantingSiteId]);

  useEffect(() => {
    const initialStrata = searchProps.filtersProps?.filters?.stratum?.values ?? [];
    const availableStrata = initialStrata.filter((name: string) => stratumNames.includes(name));

    if (availableStrata.length < initialStrata.length) {
      searchProps.filtersProps?.setFilters((previous: Record<string, any>) => ({
        ...previous,
        stratum: { ...previous.stratum, values: availableStrata },
      }));
    }
  }, [stratumNames, searchProps.filtersProps]);

  const has25mPlotsStrata = () => {
    const allSubstrata = details?.strata.flatMap((stratum) => stratum.substrata.flatMap((substratum) => substratum));
    if (allSubstrata) {
      return has25mPlots(allSubstrata);
    }
  };

  return (
    <Table
      id='observation-details-table'
      columns={columns}
      rows={rows}
      orderBy='stratumName'
      Renderer={ObservationDetailsRenderer(plantingSiteId, observationId)}
      tableComments={has25mPlotsStrata() ? strings.PLOTS_SIZE_NOTE : undefined}
    />
  );
};

export default ObservationDetailsList;
