import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import strings from 'src/strings';
import { DeliverableCategories, DeliverableStatuses, ListDeliverablesElement } from 'src/types/Deliverables';
import { Project } from 'src/types/Project';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn } from 'src/utils/searchAndSort';

import TableWithSearchFilters from '../TableWithSearchFilters';
import DeliverableCellRenderer from './DeliverableCellRenderer';

interface DeliverablesTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  isAcceleratorRoute?: boolean;
  organizationId: number;
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  searchAndSort?: SearchAndSortFn<ListDeliverablesElement>;
  tableId: string;
}

const fuzzySearchColumns = ['name', 'projectName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

const DeliverablesTable = ({
  columns,
  extraTableFilters,
  filterModifiers,
  isAcceleratorRoute,
  organizationId,
  searchAndSort,
  tableId,
}: DeliverablesTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { availableProjects: projects, getProjectName } = useProjects();

  const [deliverables, setDeliverables] = useState<ListDeliverablesElement[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  const featuredFilters: FilterConfig[] = useMemo(() => {
    const filters: FilterConfig[] = [
      {
        field: 'status',
        // These options are strings for now, but may end up as enums when the BE types come through, if that is
        // the case we will need to implement the renderOption and pillValueRenderer to render the desired
        // human readable values
        options: DeliverableStatuses,
        label: strings.STATUS,
      },
      {
        field: 'category',
        // Same note as above
        options: DeliverableCategories,
        label: strings.CATEGORY,
      },
    ];

    // show the project filter only in the accelerator route
    // the participant view already has a projects filter above the table
    if (isAcceleratorRoute) {
      filters.unshift({
        field: 'project_id',
        options: (projects || [])?.map((project: Project) => `${project.id}`),
        searchNodeCreator: (values: (number | string | null)[]) => ({
          field: 'projectId',
          operation: 'field',
          type: 'Exact',
          values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
        }),
        label: strings.PROJECTS,
        renderOption: (id: string | number) => getProjectName(Number(id)),
        pillValueRenderer: (values: (string | number | null)[]) =>
          values
            .map((value: string | number | null) => (value === null ? value : getProjectName(Number(value))))
            .filter((value) => value)
            .join(', '),
      });
    }

    return activeLocale ? filters : [];
  }, [activeLocale, getProjectName, isAcceleratorRoute, projects]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      const listRequest: ListDeliverablesRequestParams = {};
      if (organizationId !== -1) {
        listRequest.organizationId = organizationId;
      }

      const request = dispatch(
        requestListDeliverables({
          locale,
          listRequest,
          search,
          searchSortOrder,
          searchAndSort,
        })
      );
      setDeliverablesSearchRequestId(request.requestId);
    },
    [dispatch, organizationId, searchAndSort]
  );

  useEffect(() => {
    // TODO do something if the request has an error
    if (deliverablesSearchRequest && deliverablesSearchRequest.data?.deliverables) {
      setDeliverables(deliverablesSearchRequest.data.deliverables);
    }
  }, [deliverablesSearchRequest]);

  return (
    <TableWithSearchFilters
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      extraTableFilters={extraTableFilters}
      featuredFilters={featuredFilters}
      filterModifiers={filterModifiers}
      fuzzySearchColumns={fuzzySearchColumns}
      id={tableId}
      Renderer={DeliverableCellRenderer}
      rows={deliverables}
    />
  );
};

export default DeliverablesTable;
