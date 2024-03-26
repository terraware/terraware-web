import { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestListParticipantProjects } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectsListRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getPhaseNumber } from 'src/types/Cohort';
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
          key: 'phase',
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
          key: 'restorableLand',
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
      const request = dispatch(requestListParticipantProjects({ locale, search, sortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const cohorts = useMemo<Record<string, string>>(
    () =>
      (projects || []).reduce(
        (acc, project) => {
          acc[project.cohortId] = project.cohortName;
          return acc;
        },
        {} as Record<string, string>
      ),
    [projects]
  );

  const phases = useMemo<Record<string, string>>(
    () =>
      (projects || []).reduce(
        (acc, project) => {
          acc[project.phase] = getPhaseNumber(project.phase);
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
              field: 'cohortId',
              id: 'cohortId',
              label: strings.COHORT,
              options: (projects || [])?.map((project: ParticipantProjectSearchResult) => `${project.cohortId}`),
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => cohorts[value || ''] || '').join(', '),
              renderOption: (id: string | number) => cohorts[id] || '',
              searchNodeCreator: (values: (number | string | null)[]) => ({
                field: 'cohortId',
                operation: 'field',
                type: 'Exact',
                values: values.map((value: number | string | null): string | null =>
                  value === null ? value : `${value}`
                ),
              }),
            },
            {
              field: 'phase',
              id: 'phase',
              label: strings.PHASE,
              options: (projects || [])?.map((project: ParticipantProjectSearchResult) => `${project.phase}`),
              pillValueRenderer: (values: (string | number | null)[]) =>
                values.map((value) => phases[value || ''] || '').join(', '),
              renderOption: (phase: string | number) => phases[phase] || '',
              searchNodeCreator: (values: (number | string | null)[]) => ({
                field: 'phase',
                operation: 'field',
                type: 'Exact',
                values: values.map((value: number | string | null): string | null =>
                  value === null ? value : `${value}`
                ),
              }),
            },
          ]
        : [],
    [activeLocale, cohorts, phases, projects]
  );

  return (
    <>
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
    </>
  );
}
