import React, { useCallback, useMemo } from 'react';

import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestCohorts } from 'src/redux/features/cohorts/cohortsAsyncThunks';
import { selectCohorts } from 'src/redux/features/cohorts/cohortsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { CohortPhases } from 'src/types/Cohort';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import CohortCellRenderer from './CohortCellRenderer';

interface CohortTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
}

const fuzzySearchColumns = ['name', 'phase'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.NAME,
          type: 'string',
        },
        {
          key: 'phase',
          name: strings.PHASE,
          type: 'string',
        },
      ]
    : [];

const CohortsTable = ({ filterModifiers, extraTableFilters }: CohortTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();

  const cohorts = useAppSelector(selectCohorts);

  const featuredFilters: FilterConfig[] = useMemo(() => {
    const filters: FilterConfig[] = [
      {
        field: 'phase',
        options: CohortPhases,
        label: strings.PHASE,
      },
    ];

    return activeLocale ? filters : [];
  }, [activeLocale]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      dispatch(requestCohorts({ locale, depth: 'Cohort', search, searchSortOrder }));
    },
    [dispatch]
  );

  return (
    <TableWithSearchFilters
      columns={() => columns(activeLocale)}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      extraTableFilters={extraTableFilters}
      featuredFilters={featuredFilters}
      filterModifiers={filterModifiers}
      fuzzySearchColumns={fuzzySearchColumns}
      id='cohortsTable'
      Renderer={CohortCellRenderer}
      rows={cohorts || []}
    />
  );
};

export default CohortsTable;
