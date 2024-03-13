import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Button from 'src/components/common/button/Button';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestListGlobalRolesUsers } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUsersSearchRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UserWithGlobalRoles } from 'src/types/GlobalRoles';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

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
          key: 'role',
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
  const pageHeaderRef = useRef(null);

  const [globalRoleUsers, setGlobalRoleUsers] = useState<UserWithGlobalRoles[]>();
  const [requestId, setRequestId] = useState('');

  const listRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(requestId));

  const goToAddPerson = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_PEOPLE_NEW });
  }, [history]);

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success') {
      setGlobalRoleUsers(listRequest.data?.users);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      // TODO implement search and sort order into redux and service
      const request = dispatch(requestListGlobalRolesUsers({ locale }));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  // tslint:disable:no-console
  console.log('globalRoleUsers', globalRoleUsers);

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

  return (
    <Page title={strings.PEOPLE} rightComponent={rightComponent} pageHeaderRef={pageHeaderRef}>
      <TableWithSearchFilters
        // cellRenderer={PersonCellRenderer}
        columns={columns}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        fuzzySearchColumns={fuzzySearchColumns}
        pageHeaderRef={pageHeaderRef}
        rows={globalRoleUsers || []}
      />
    </Page>
  );
};

export default PeopleView;
