import React, { useCallback, useEffect, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { requestListApplications } from 'src/redux/features/application/applicationAsyncThunks';
import { selectApplicationList } from 'src/redux/features/application/applicationSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ApplicationStatus } from 'src/types/Application';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

import ApplicationCellRenderer from './ApplicationCellRenderer';

type ApplicationRow = {
  id: number;
  internalName: string;
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
      ]
    : [];

const fuzzySearchColumns = ['internalName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'internalName',
  direction: 'Ascending',
};

const ApplicationList = () => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectApplicationList(requestId));
  const [applications, setApplications] = useState<ApplicationRow[]>([]);

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
            id: application.id,
            // TODO: only use internal name once the column becomes mandatory
            internalName: application.internalName ?? application.projectName,
            status: application.status,
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
