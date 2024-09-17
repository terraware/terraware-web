import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TableColumnType } from '@terraware/web-components';

import { FilterConfig, FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import { useParticipants } from 'src/hooks/useParticipants';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import strings from 'src/strings';
import { AcceleratorOrgProject } from 'src/types/Accelerator';
import {
  DeliverableCategories,
  DeliverableStatusesWithOverdue,
  DeliverableTypes,
  ListDeliverablesElementWithOverdue,
} from 'src/types/Deliverables';
import { ParticipantProjectSearchResult } from 'src/types/Participant';
import { Project } from 'src/types/Project';
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
  organizationId: number;
  participantId?: number;
  searchAndSort?: SearchAndSortFn<ListDeliverablesElementWithOverdue>;
  tableId: string;
}

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.DELIVERABLE_NAME,
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
        {
          key: 'projectName',
          name: strings.PROJECT,
          type: 'string',
        },
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
        },
      ]
    : [];

const fuzzySearchColumns = ['name', 'projectName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'status',
  direction: 'Ascending',
};

const DeliverablesTable = ({
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
  const { selectedParticipant } = useParticipants(participantId);

  const [deliverables, setDeliverables] = useState<ListDeliverablesElementWithOverdue[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));
  const query = useQuery();
  const projectParam = query.get('projectId');
  const navigate = useNavigate();
  const location = useStateLocation();

  const projectsFilterOptions = useMemo(
    () =>
      deliverables.map((deliverable) => ({
        id: deliverable.projectId,
        name: deliverable.projectName,
      })),
    [deliverables]
  );

  const isAllowedReadDeliverable = isAllowed('READ_DELIVERABLE', { organization: selectedOrganization });

  const getFilterProjectName = useCallback(
    (projectId: number | string) => {
      return (
        (participantId
          ? selectedParticipant?.projects?.find((p) => p.id === Number(projectId))?.name
          : projectsFilterOptions?.find((p) => p.id === Number(projectId))?.name) || ''
      );
    },
    [participantId, projectsFilterOptions, selectedParticipant?.projects]
  );

  const removeParam = () => {
    if (projectParam) {
      query.delete('projectId');
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  };

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    const filters: FilterConfigWithValues[] = [
      {
        field: 'status',
        // These options are strings for now, but may end up as enums when the BE types come through, if that is
        // the case we will need to implement the renderOption and pillValueRenderer to render the desired
        // human readable values
        options: DeliverableStatusesWithOverdue,
        label: strings.STATUS,
      },
      {
        field: 'category',
        // Same note as above
        options: DeliverableCategories,
        label: strings.CATEGORY,
      },
      {
        field: 'type',
        options: DeliverableTypes,
        label: strings.TYPE,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values.map((value) => (value === 'Questions' ? 'Questionnaire' : value)).join(', '),
        renderOption: (value: string | number) =>
          value.toString() === 'Questions' ? 'Questionnaire' : value.toString(),
      },
    ];

    // show the project filter only in the accelerator route
    // the participant view already has a projects filter above the table
    const availableProjects = selectedParticipant?.projects || projectsFilterOptions || [];
    if (isAcceleratorRoute && availableProjects && availableProjects.length > 0) {
      let projectFromParam: ParticipantProjectSearchResult | undefined;
      if (projectParam) {
        projectFromParam = availableProjects.find((proj) => proj.id.toString() === projectParam);
      }
      filters.unshift({
        field: 'projectName',
        options: availableProjects
          ?.sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
          .map((project: Project | AcceleratorOrgProject) => `${project.name}`),
        label: strings.PROJECTS,
        values: projectFromParam ? [projectFromParam.name] : [],
      });
      removeParam();
    }

    return activeLocale ? filters : [];
  }, [
    activeLocale,
    getFilterProjectName,
    isAcceleratorRoute,
    projectsFilterOptions,
    selectedParticipant?.projects,
    projectParam,
  ]);

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
