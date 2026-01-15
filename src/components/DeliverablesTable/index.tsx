import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { TableColumnType } from '@terraware/web-components';

import { FilterConfig, FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import strings from 'src/strings';
import {
  DeliverableCategories,
  DeliverableStatusesWithOverdue,
  DeliverableTypes,
  ListDeliverablesElementWithOverdue,
} from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn } from 'src/utils/searchAndSort';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import TableWithSearchFilters from '../TableWithSearchFilters';
import DeliverableCellRenderer from './DeliverableCellRenderer';

interface DeliverablesTableProps {
  extraTableFilters?: SearchNodePayload[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  isAcceleratorRoute?: boolean;
  organizationId?: number;
  searchAndSort?: SearchAndSortFn<ListDeliverablesElementWithOverdue>;
  tableId: string;
  iconFilters?: FilterConfig[];
  projectId?: number;
  maxItemsPerPage?: number;
}

const columns =
  (isAcceleratorRoute: boolean, projectId?: number) =>
  (activeLocale: string | null): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    const baseColumns: TableColumnType[] = [
      {
        key: 'name',
        name: projectId ? strings.NAME : strings.DELIVERABLE_NAME,
        type: 'string',
      },
      {
        key: 'dueDate',
        name: strings.DUE_DATE,
        type: 'date',
      },
      {
        key: 'status',
        name: strings.STATUS,
        type: 'string',
      },
    ];

    // add project column when projectId is not provided
    if (!projectId) {
      baseColumns.push(
        isAcceleratorRoute
          ? {
              key: 'projectDealName',
              name: strings.DEAL_NAME,
              type: 'string',
            }
          : {
              key: 'projectName',
              name: strings.PROJECT,
              type: 'string',
            }
      );
    }

    // add remaining columns
    baseColumns.push(
      {
        key: 'module',
        name: strings.MODULE,
        type: 'string',
      },
      {
        key: 'category',
        name: strings.CATEGORY,
        type: 'string',
      },
      {
        key: 'type',
        name: strings.TYPE,
        type: 'string',
      }
    );

    return baseColumns;
  };

const defaultSearchOrder: SearchSortOrder = {
  field: 'status',
  direction: 'Ascending',
};

const DeliverablesTable = ({
  extraTableFilters,
  filterModifiers,
  isAcceleratorRoute,
  organizationId,
  searchAndSort,
  tableId,
  iconFilters,
  projectId,
  maxItemsPerPage,
}: DeliverablesTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();

  const [deliverables, setDeliverables] = useState<ListDeliverablesElementWithOverdue[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));
  const query = useQuery();
  const projectParam = query.get('projectId');
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const mixpanel = useMixpanel();

  const fuzzySearchColumns = useMemo(
    () => (isAcceleratorRoute ? ['name', 'projectDealName'] : ['name', 'projectName']),
    [isAcceleratorRoute]
  );

  const projectsFilterOptions = useMemo(
    () =>
      deliverables.map((deliverable) => ({
        id: deliverable.projectId,
        name: deliverable.projectName,
        dealName: deliverable.projectDealName,
      })),
    [deliverables]
  );

  const isAllowedReadDeliverable = isAllowed('READ_DELIVERABLE', { organization: selectedOrganization });

  const removeParam = useCallback(() => {
    if (projectParam) {
      query.delete('projectId');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  }, [location, navigate, projectParam, query]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const rejectedStatus = activeLocale ? (isAcceleratorRoute ? strings.UPDATE_REQUESTED : strings.UPDATE_NEEDED) : '';
    const filters: FilterConfigWithValues[] = [
      {
        field: 'status',
        // These options are strings for now, but may end up as enums when the BE types come through, if that is
        // the case we will need to implement the renderOption and pillValueRenderer to render the desired
        // human readable values
        options: DeliverableStatusesWithOverdue,
        label: strings.STATUS,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values.map((value) => (value === 'Rejected' ? rejectedStatus : value)).join(', '),
        renderOption: (value: string | number) => (value.toString() === 'Rejected' ? rejectedStatus : value.toString()),
      },
      {
        field: 'category',
        // Same note as above
        options: DeliverableCategories,
        label: strings.CATEGORY,
      },
    ];

    if (!iconFilters) {
      filters.push({
        field: 'type',
        options: DeliverableTypes,
        label: strings.TYPE,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values.map((value) => (value === 'Questions' ? 'Questionnaire' : value)).join(', '),
        renderOption: (value: string | number) =>
          value.toString() === 'Questions' ? 'Questionnaire' : value.toString(),
      });
    }

    // show the project filter only in the accelerator route
    // the participant view already has a projects filter above the table
    const availableProjects = projectsFilterOptions || [];
    if (isAcceleratorRoute && availableProjects && availableProjects.length > 0 && !projectId) {
      const paramValue = projectParam
        ? availableProjects.find((project) => project.id.toString() === projectParam)
        : undefined;
      filters.unshift({
        field: 'projectDealName',
        options: availableProjects
          .map((project) => project.dealName)
          .filter((dealName): dealName is string => dealName !== undefined)
          .sort((a, b) => a.localeCompare(b, activeLocale || undefined)),
        label: strings.DEAL_NAME,
        values: paramValue && paramValue.dealName ? [paramValue.dealName] : [],
      });
      removeParam();
    }

    return activeLocale ? filters : [];
  }, [activeLocale, isAcceleratorRoute, iconFilters, projectsFilterOptions, projectId, projectParam, removeParam]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      const listRequest: ListDeliverablesRequestParams = {};
      if (projectId) {
        listRequest.projectId = projectId;
      } else if (organizationId !== -1) {
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
    [dispatch, organizationId, projectId, searchAndSort]
  );

  const _deliverables = useMemo(
    () =>
      deliverables.map((deliverable) => ({
        ...deliverable,
        type: deliverable.type === 'Questions' ? 'Questionnaire' : deliverable.type,
        isAllowedRead: isAllowedReadDeliverable,
      })),
    [deliverables, isAllowedReadDeliverable]
  );

  useEffect(() => {
    // TODO do something if the request has an error
    if (deliverablesSearchRequest && deliverablesSearchRequest.status === 'success') {
      setDeliverables(deliverablesSearchRequest.data ?? []);
    }
  }, [deliverablesSearchRequest]);

  const ofFilterAppliedHandler = (filter?: string, values?: (string | number | null)[]) => {
    if (values && values.length) {
      if ((filter === 'status' || filter === 'category') && isAcceleratorRoute) {
        mixpanel?.track(MIXPANEL_EVENTS.CONSOLE_DELIVERABLES_LIST_FILTER, {
          filter,
          values,
        });
        return;
      }
      if (!isAcceleratorRoute) {
        mixpanel?.track(MIXPANEL_EVENTS.PART_EX_DELIVERABLES_LIST_FILTER, {
          filter,
          values,
        });
      }
    }
  };

  return (
    <TableWithSearchFilters
      columns={columns(isAcceleratorRoute ?? false, projectId)}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      extraTableFilters={extraTableFilters}
      featuredFilters={featuredFilters}
      filterModifiers={filterModifiers}
      fuzzySearchColumns={fuzzySearchColumns}
      id={tableId}
      Renderer={DeliverableCellRenderer}
      rows={_deliverables}
      onFilterApplied={ofFilterAppliedHandler}
      stickyFilters
      iconFilters={iconFilters}
      maxItemsPerPage={maxItemsPerPage}
    />
  );
};

export default DeliverablesTable;
