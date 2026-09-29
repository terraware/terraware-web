import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';
import { TableColumnType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { FilterConfigWithValues } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { useListApplicationsQuery } from 'src/queries/generated/applications';
import strings from 'src/strings';
import { Application, ApplicationStatus, ApplicationStatusOrder } from 'src/types/Application';
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
          name: strings.DEAL_NAME,
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

type ApplicationListTabProps = {
  isPrescreen: boolean;
};

const ApplicationListTab = ({ isPrescreen }: ApplicationListTabProps) => {
  const { activeLocale, countries } = useLocalization();
  const snackbar = useSnackbar();

  const [searchRequest, setSearchRequest] = useState<{
    locale: string;
    search: SearchNodePayload;
    sortOrder: SearchSortOrder;
  }>();
  const {
    currentData: applicationsData,
    isFetching,
    isError,
  } = useListApplicationsQuery(searchRequest ? { listAll: true } : skipToken);

  const allFilterValues = useMemo((): ApplicationStatus[] => {
    if (isPrescreen) {
      return ['Failed Pre-screen', 'Passed Pre-screen'];
    } else {
      return [
        'Submitted',
        'Sourcing Team Review',
        'GIS Assessment',
        'Carbon Assessment',
        'Expert Review',
        'P0 Eligible',
        'Issue Active',
        'Issue Reassessment',
        'Not Eligible',
        'Accepted',
      ];
    }
  }, [isPrescreen]);

  const featuredFilters: FilterConfigWithValues[] = useMemo(() => {
    if (!activeLocale || !countries) {
      return [];
    }

    const filters: FilterConfigWithValues[] = [
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
        options: allFilterValues,
        label: strings.STATUS,
      },
    ];

    return filters;
  }, [activeLocale, countries, allFilterValues]);

  useEffect(() => {
    if (isError) {
      snackbar.toastError();
    }
  }, [isError, snackbar]);

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

  const applications = useMemo<ApplicationRow[]>(() => {
    if (!applicationsData || !searchRequest) {
      return [];
    }
    const sortOrderConfig = {
      locale: 'en',
      sortOrder: searchRequest.sortOrder,
      numberFields: ['id', 'participantIds'],
    };
    return searchAndSort(applicationsData.applications, searchRequest.search, sortOrderConfig)
      .filter((application) => allFilterValues.includes(application.status))
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
      }));
  }, [allFilterValues, applicationsData, countries, searchAndSort, searchRequest]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      if (!locale) {
        return;
      }
      setSearchRequest({ locale, search, sortOrder: searchSortOrder });
    },
    []
  );

  return (
    <TableWithSearchFilters
      busy={isFetching}
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      featuredFilters={featuredFilters}
      fuzzySearchColumns={fuzzySearchColumns}
      id={isPrescreen ? 'accelerator-prescreen-table' : 'accelerator-applications-table'}
      Renderer={ApplicationCellRenderer}
      rows={applications}
      stickyFilters
    />
  );
};

export default ApplicationListTab;
