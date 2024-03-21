import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useParticipants } from 'src/hooks/useParticipants';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import strings from 'src/strings';
import { DeliverableCategories, DeliverableStatuses, ListDeliverablesElement } from 'src/types/Deliverables';
import { ParticipantProject } from 'src/types/Participant';
import { Project } from 'src/types/Project';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn } from 'src/utils/searchAndSort';

import TableWithSearchFilters from '../TableWithSearchFilters';
import DeliverableCellRenderer from './DeliverableCellRenderer';

interface DeliverablesTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  isAcceleratorRoute?: boolean;
  organizationId: number;
  participantId?: number;
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
  participantId,
  searchAndSort,
  tableId,
}: DeliverablesTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const { availableProjects: projects, getProjectName } = useProjects();
  const { selectedParticipant } = useParticipants(participantId);

  const [deliverables, setDeliverables] = useState<ListDeliverablesElement[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  const isAllowedReadDeliverable = isAllowed('READ_DELIVERABLE', selectedOrganization);

  const getFilterProjectName = useCallback(
    (projectId: number | string) => {
      return participantId
        ? selectedParticipant?.projects?.find((p) => p.id === Number(projectId))?.name || ''
        : getProjectName(Number(projectId));
    },
    [getProjectName, participantId, selectedParticipant?.projects]
  );

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
        options: (selectedParticipant?.projects || projects || [])?.map(
          (project: Project | ParticipantProject) => `${project.id}`
        ),
        searchNodeCreator: (values: (number | string | null)[]) => ({
          field: 'projectId',
          operation: 'field',
          type: 'Exact',
          values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
        }),
        label: strings.PROJECTS,
        renderOption: (id: string | number) => getFilterProjectName(id),
        pillValueRenderer: (values: (string | number | null)[]) =>
          values
            .map((value: string | number | null) => (value === null ? value : getFilterProjectName(value)))
            .filter((value) => value)
            .join(', '),
      });
    }

    return activeLocale ? filters : [];
  }, [activeLocale, getFilterProjectName, isAcceleratorRoute, projects, selectedParticipant?.projects]);

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

  const _deliverables = useMemo(
    () =>
      deliverables.map((deliverable) => ({
        ...deliverable,
        isAllowedRead: isAllowedReadDeliverable,
      })),
    [deliverables, isAllowedReadDeliverable]
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
      rows={_deliverables}
    />
  );
};

export default DeliverablesTable;
