import { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantProjectSearchResult } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

import CellRenderer from './CellRenderer';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'participantName',
          name: strings.PARTICIPANT,
          type: 'string',
        },
        {
          key: 'cohortName',
          name: strings.COHORT,
          type: 'string',
        },
        {
          key: 'participant_cohort_phase',
          name: strings.PHASE,
          type: 'string',
        },
        {
          key: 'country',
          name: strings.COUNTRY,
          type: 'string',
        },
        {
          key: 'region',
          name: strings.REGION,
          type: 'string',
        },
        {
          key: 'restorableLandRaw',
          name: strings.RESTORABLE_LAND,
          type: 'string',
        },
        {
          key: 'landUseModelType',
          name: strings.LAND_USE_MODEL_TYPE,
          type: 'string',
        },
      ]
    : [];

const fuzzySearchColumns = ['name'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function ListView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [projects, setProjects] = useState<ParticipantProjectSearchResult[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectsListRequest(requestId));

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    }
    if (result?.data) {
      setProjects(result.data);
    }
  }, [result, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, sortOrder: SearchSortOrder) => {
      if (locale) {
        const request = dispatch(requestListParticipantProjects({ search, sortOrder }));
        setRequestId(request.requestId);
      }
    },
    [dispatch]
  );

  const cohorts = useMemo<Record<string, string>>(
    () =>
      (projects || []).reduce(
        (acc, project) => {
          acc[project.participant_cohort_id] = project.cohortName;
          return acc;
        },
        {} as Record<string, string>
      ),
    [projects]
  );

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'participant_cohort_id',
              id: 'participant_cohort_id',
              label: strings.COHORT,
              options: (projects || [])?.map(
                (project: ParticipantProjectSearchResult) => `${project.participant_cohort_id}`
              ),
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => cohorts[value || ''] || '').join(', '),
              renderOption: (id: string | number) => cohorts[id] || '',
            },
            {
              field: 'participant_cohort_phase',
              id: 'participant_cohort_phase',
              label: strings.PHASE,
              options: (projects || [])?.map(
                (project: ParticipantProjectSearchResult) => `${project.participant_cohort_phase}`
              ),
            },
          ]
        : [],
    [activeLocale, cohorts, projects]
  );

  return (
    <TableWithSearchFilters
      busy={result?.status === 'pending'}
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      featuredFilters={featuredFilters}
      fuzzySearchColumns={fuzzySearchColumns}
      id='accelerator-participan-projects-table'
      Renderer={CellRenderer}
      rows={projects}
      title={strings.PROJECTS}
    />
  );
}
