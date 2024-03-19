import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';
import { TableRowType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Button from 'src/components/common/button/Button';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import {
  requestDeleteGlobalRolesForUsers,
  requestListGlobalRolesUsers,
} from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import {
  selectGlobalRolesUsersRemoveRequest,
  selectGlobalRolesUsersSearchRequest,
} from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { User } from 'src/types/User';
import useSnackbar from 'src/utils/useSnackbar';

import PersonCellRenderer from './PersonCellRenderer';
import RemoveRolesTopBarButton from './RemoveRolesTopBarButton';

const fuzzySearchColumns = ['email', 'firstName', 'lastName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'email',
  direction: 'Ascending',
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'email',
          name: strings.EMAIL,
          type: 'string',
        },
        {
          key: 'firstName',
          name: strings.FIRST_NAME,
          type: 'string',
        },
        {
          key: 'lastName',
          name: strings.LAST_NAME,
          type: 'string',
        },
        {
          key: 'globalRoles',
          name: strings.ROLE,
          type: 'string',
        },
        {
          key: 'createdTime',
          name: strings.DATE_ADDED,
          type: 'date',
        },
      ]
    : [];

const PeopleView = () => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const history = useHistory();

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [globalRoleUsers, setGlobalRoleUsers] = useState<UserWithGlobalRoles[]>([]);
  const [listRequestId, setListRequestId] = useState('');
  const [deleteRolesRequestId, setDeleteRolesRequestId] = useState('');
  const [lastSearchRequest, setLastSearchRequest] = useState<
    Partial<{ locale: string | null; search: SearchNodePayload; searchSortOrder: SearchSortOrder }>
  >({});

  const listRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listRequestId));
  const deleteRolesRequest = useAppSelector(selectGlobalRolesUsersRemoveRequest(deleteRolesRequestId));

  const goToAddPerson = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_PERSON_NEW });
  }, [history]);

  const dispatchSearchRequest = useCallback(
    (locale?: string | null, search?: SearchNodePayload, searchSortOrder?: SearchSortOrder) => {
      const request = dispatch(requestListGlobalRolesUsers({ locale: locale || null, search, searchSortOrder }));
      setLastSearchRequest({ locale, search, searchSortOrder });
      setListRequestId(request.requestId);
    },
    [dispatch]
  );

  const onConfirmSelectionRemoveRoles = useCallback(() => {
    const request = dispatch(requestDeleteGlobalRolesForUsers({ users: selectedRows as User[] }));
    setDeleteRolesRequestId(request.requestId);
  }, [dispatch, selectedRows]);

  const rightComponent = useMemo(
    () =>
      activeLocale && (
        <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
          <Button
            id='addPerson'
            icon='plus'
            label={strings.ADD_PERSON}
            priority='primary'
            onClick={goToAddPerson}
            size='medium'
            type='productive'
          />
        </Box>
      ),
    [activeLocale, goToAddPerson, theme]
  );

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success' && listRequest.data?.users) {
      setGlobalRoleUsers(listRequest.data.users);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  useEffect(() => {
    if (!deleteRolesRequest) {
      return;
    }

    if (deleteRolesRequest.status === 'success') {
      const { locale, search, searchSortOrder } = lastSearchRequest;
      dispatchSearchRequest(locale || null, search, searchSortOrder);
      setDeleteRolesRequestId('');
    } else if (deleteRolesRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
      setDeleteRolesRequestId('');
    }
  }, [dispatchSearchRequest, lastSearchRequest, snackbar, deleteRolesRequest]);

  return (
    <Page title={strings.PEOPLE} rightComponent={rightComponent}>
      <TableWithSearchFilters
        columns={columns}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        fuzzySearchColumns={fuzzySearchColumns}
        id={'acceleratorPeopleTable'}
        isClickable={() => false}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showCheckbox
        showTopBar
        Renderer={PersonCellRenderer}
        rows={globalRoleUsers}
        topBarButtons={[<RemoveRolesTopBarButton key={1} onConfirm={onConfirmSelectionRemoveRoles} />]}
      />
    </Page>
  );
};

export default PeopleView;
