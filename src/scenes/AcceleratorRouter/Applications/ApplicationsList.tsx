import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestListApplications } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationList } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { LocationService } from 'src/services';
import strings from 'src/strings';
import { ApplicationReviewStatuses, ApplicationStatus } from 'src/types/Application';
import { Country } from 'src/types/Country';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { getCountryByCode } from 'src/utils/country';
import useSnackbar from 'src/utils/useSnackbar';

import ApplicationCellRenderer from './ApplicationCellRenderer';

type ApplicationRow = {
  countryCode?: string;
  id: number;
  internalName: string;
  organizationName: string;
  status: ApplicationStatus;
  type: string;
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
          key: 'countryCode',
          name: strings.COUNTRY,
          type: 'string',
        },
        {
          key: 'organizationName',
          name: strings.ORGANIZATION,
          type: 'string',
        },
        {
          key: 'type',
          name: strings.TYPE,
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
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationList(requestId));
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [countries, setCountries] = useState<Country[]>();

  const featuredFilters: FilterConfig[] = useMemo(() => {
    if (!activeLocale || !countries) {
      return [];
    }

    const filters: FilterConfig[] = [
      {
        field: 'countryCode',
        options: (countries || []).map((country) => country.code),
        label: strings.COUNTRY,
        renderOption: (id: string | number) => `${getCountryByCode(countries, id as string)}`,
      },
      {
        field: 'status',
        options: ApplicationReviewStatuses,
        label: strings.STATUS,
      },
      {
        field: 'type',
        options: [strings.PRESCREEN, strings.APPLICATION],
        label: strings.TYPE,
      },
    ];

    return filters;
  }, [activeLocale, countries]);

  useEffect(() => {
    if (activeLocale) {
      const populateCountries = async () => {
        const response = await LocationService.getCountries();
        if (response) {
          setCountries(response);
        }
      };

      populateCountries();
    }
  }, [activeLocale]);

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
            id: application.id,
            // TODO: only use internal name once the column becomes mandatory
            internalName: application.internalName ?? application.projectName,
            modifiedTime: application.modifiedTime,
            organizationName: application.organizationName,
            status: application.status,
            type: application.status === 'Failed Pre-screen' ? strings.PRESCREEN : strings.APPLICATION,
          }))
      );
    }
  }, [result, setApplications, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      if (!locale) {
        return;
      }
      const request = dispatch(requestListApplications({ listAll: true, search, searchSortOrder }));
      setRequestId(request.requestId);
    },
    [dispatch]
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
