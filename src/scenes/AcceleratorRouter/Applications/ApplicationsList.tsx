import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestListApplications } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationList } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  Application,
  ApplicationReviewStatuses,
  ApplicationStatus,
  ApplicationStatusOrder,
} from 'src/types/Application';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { getCountryByCode } from 'src/utils/country';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';
import useSnackbar from 'src/utils/useSnackbar';

import ApplicationCellRenderer from './ApplicationCellRenderer';

type ApplicationRow = {
  countryCode?: string;
  countryName?: string;
  id: number;
  internalName: string;
  organizationName: string;
  status: ApplicationStatus;
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'internalName',
          name: strings.APPLICATION_INTERNAL_NAME,
          type: 'string',
        },
        {
          key: 'status',
          name: strings.STATUS,
          type: 'string',
        },
        {
          key: 'countryName',
          name: strings.COUNTRY,
          type: 'string',
        },
        {
          key: 'organizationName',
          name: strings.ORGANIZATION,
          type: 'string',
        },
        {
          key: 'modifiedTime',
          name: strings.DATE_UPDATED,
          type: 'date',
        },
      ]
    : [];

const fuzzySearchColumns = ['internalName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'internalName',
  direction: 'Ascending',
};

const ApplicationList = () => {
  const dispatch = useAppDispatch();
  const { activeLocale, countries } = useLocalization();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationList(requestId));
  const [applications, setApplications] = useState<ApplicationRow[]>([]);

  const featuredFilters: FilterConfig[] = useMemo(() => {
    if (!activeLocale || !countries) {
      return [];
    }

    const filters: FilterConfig[] = [
      {
        field: 'countryCode',
        options: (countries || []).map((country) => country.code),
        label: strings.COUNTRY,
        renderOption: (id: string | number) => `${getCountryByCode(countries, id as string)?.name}`,
        pillValueRenderer: (values: (string | number | null)[]) =>
          values.map((value) => getCountryByCode(countries, value as string)?.name).join(', '),
      },
      {
        field: 'status',
        options: ApplicationReviewStatuses.sort(
          (left, right) => ApplicationStatusOrder[left] - ApplicationStatusOrder[right]
        ),
        label: strings.STATUS,
      },
    ];

    return filters;
  }, [activeLocale, countries]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
      return;
    }
    if (result?.data) {
      setApplications(
        result.data
          .filter((application) => application.status !== 'Not Submitted')
          .map((application) => ({
            countryCode: application?.countryCode,
            countryName:
              application?.countryCode && countries ? getCountryByCode(countries, application.countryCode)?.name : '',
            id: application.id,
            // TODO: only use internal name once the column becomes mandatory
            internalName: application.internalName ?? application.projectName,
            modifiedTime: application.modifiedTime,
            organizationName: application.organizationName,
            status: application.status,
          }))
      );
    }
  }, [result, setApplications, snackbar]);

  const searchAndSort: SearchAndSortFn<Application> = useCallback(
    (results: Application[], search?: SearchNodePayload, sortOrderConfig?: SearchOrderConfig) => {
      const firstSort = genericSearchAndSort(results, search, sortOrderConfig);
      if (sortOrderConfig?.sortOrder.field === 'status') {
        const direction = sortOrderConfig?.sortOrder.direction;
        return firstSort.sort((a, b) => {
          if (a.status !== b.status) {
            if (direction === 'Descending') {
              return ApplicationStatusOrder[b.status] - ApplicationStatusOrder[a.status];
            } else {
              return ApplicationStatusOrder[a.status] - ApplicationStatusOrder[b.status];
            }
          } else {
            return 0;
          }
        });
      } else {
        return firstSort;
      }
    },
    []
  );

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      if (!locale) {
        return;
      }
      const request = dispatch(requestListApplications({ listAll: true, search, searchSortOrder, searchAndSort }));
      setRequestId(request.requestId);
    },
    [dispatch, searchAndSort]
  );

  return (
    <TableWithSearchFilters
      busy={result?.status === 'pending'}
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      featuredFilters={featuredFilters}
      fuzzySearchColumns={fuzzySearchColumns}
      id='accelerator-applications-table'
      Renderer={ApplicationCellRenderer}
      rows={applications}
      stickyFilters={true}
    />
  );
};

const ApplicationsListView = () => {
  return (
    <Page title={strings.APPLICATIONS} contentStyle={{ display: 'block' }}>
      <ApplicationList />
    </Page>
  );
};

export default ApplicationsListView;
