import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { TableRowType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Button from 'src/components/common/button/Button';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useDeleteGlobalRolesMutation, useListGlobalRolesQuery } from 'src/queries/generated/globalRoles';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { User } from 'src/types/User';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';
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
          key: 'internalInterests',
          name: strings.INTERNAL_INTERESTS,
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
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);
  const [searchRequest, setSearchRequest] = useState<
    Partial<{ locale: string | null; search: SearchNodePayload; searchSortOrder: SearchSortOrder }>
  >({});

  const { data: globalRolesUsersData, isError: isListError } = useListGlobalRolesQuery();
  const [deleteGlobalRoles, deleteGlobalRolesResponse] = useDeleteGlobalRolesMutation();

  const globalRoleUsers = useMemo(() => {
    const users = globalRolesUsersData?.users ?? [];
    const { locale, search, searchSortOrder } = searchRequest;
    const searchOrderConfig: SearchOrderConfig | undefined = searchSortOrder
      ? { locale: locale ?? null, sortOrder: searchSortOrder, numberFields: ['id'] }
      : undefined;
    return searchAndSort(users, search, searchOrderConfig);
  }, [globalRolesUsersData, searchRequest]);

  const goToAddPerson = useCallback(() => {
    navigate({ pathname: APP_PATHS.ACCELERATOR_PERSON_NEW });
  }, [navigate]);

  const dispatchSearchRequest = useCallback(
    (locale?: string | null, search?: SearchNodePayload, searchSortOrder?: SearchSortOrder) => {
      setSearchRequest({ locale, search, searchSortOrder });
    },
    []
  );

  const onConfirmSelectionRemoveRoles = useCallback(() => {
    void deleteGlobalRoles({ userIds: (selectedRows as User[]).map((user) => user.id) });
  }, [deleteGlobalRoles, selectedRows]);

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
    if (isListError || deleteGlobalRolesResponse.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isListError, deleteGlobalRolesResponse.isError, snackbar]);

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
        stickyFilters
      />
    </Page>
  );
};

export default PeopleView;
