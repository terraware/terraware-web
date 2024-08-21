import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType, TableRowType } from '@terraware/web-components';

import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { requestAcceleratorOrgs } from 'src/redux/features/accelerator/acceleratorAsyncThunks';
import { selectAcceleratorOrgsRequest } from 'src/redux/features/accelerator/acceleratorSelectors';
import {
  requestAddAcceleratorOrganization,
  requestRemoveAcceleratorOrganizations,
} from 'src/redux/features/organizations/organizationsAsyncThunks';
import {
  selectAddAcceleratorOrganization,
  selectRemoveAcceleratorOrganizations,
} from 'src/redux/features/organizations/organizationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import AddAcceleratorOrganizationModal from './AddAcceleratorOrganizationModal';
import RemoveOrgsTopBarButton from './RemoveOrgsTopBarButton';

const fuzzySearchColumns = ['name'];

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.NAME,
          type: 'string',
        },
        {
          key: 'id',
          name: strings.ORGANIZATION_ID,
          type: 'string',
        },
      ]
    : [];

const OrganizationsView = () => {
  const dispatch = useAppDispatch();
  const [addOrgModalOpened, setAddOrgModalOpened] = useState(false);
  const [listRequestId, setListRequestId] = useState('');
  const listRequest = useAppSelector(selectAcceleratorOrgsRequest(listRequestId));
  const [addOrgRequestId, setAddOrgRequestId] = useState('');
  const addOrgRequest = useAppSelector(selectAddAcceleratorOrganization(addOrgRequestId));
  const [removeOrgsRequestId, setRemoveOrgsRequestId] = useState('');
  const removeOrgsRequest = useAppSelector(selectRemoveAcceleratorOrganizations(removeOrgsRequestId));
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const [acceleratorOrganizations, setAcceleratorOrganizations] = useState<AcceleratorOrg[]>([]);
  const snackbar = useSnackbar();
  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);

  const defaultSearchOrder: SearchSortOrder = {
    field: 'name',
    direction: 'Ascending',
  };

  const dispatchSearchRequest = useCallback(
    (locale?: string | null, search?: SearchNodePayload, searchSortOrder?: SearchSortOrder) => {
      const request = dispatch(
        requestAcceleratorOrgs({ locale: locale || null, includeParticipants: true, search, searchSortOrder })
      );
      setListRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!removeOrgsRequest) {
      return;
    }
    if (removeOrgsRequest.status !== 'pending') {
      if (removeOrgsRequest.status === 'success') {
        dispatchSearchRequest();
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [removeOrgsRequest]);

  useEffect(() => {
    if (!addOrgRequest) {
      return;
    }
    if (addOrgRequest.status !== 'pending') {
      if (addOrgRequest.status === 'success') {
        snackbar.toastSuccess(strings.ORGANIZATION_ADDED);
        dispatchSearchRequest();
      } else {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [addOrgRequest]);

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success' && listRequest.data) {
      setAcceleratorOrganizations(listRequest.data);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  const onRemoveOrganizations = useCallback(() => {
    if (selectedRows.length > 0) {
      const request = dispatch(
        requestRemoveAcceleratorOrganizations(selectedRows.map((selectedRow) => selectedRow.id))
      );
      setRemoveOrgsRequestId(request.requestId);
    }
  }, [dispatch, selectedRows]);

  const onAddOrganization = (orgId?: string) => {
    if (orgId) {
      const request = dispatch(requestAddAcceleratorOrganization(Number(orgId)));
      setAddOrgRequestId(request.requestId);
    }
    setAddOrgModalOpened(false);
  };

  const rightComponent = useMemo(
    () => (
      <Button
        icon='plus'
        id='new-organization'
        onClick={() => setAddOrgModalOpened(true)}
        priority='primary'
        label={isMobile ? '' : strings.ADD_ORGANIZATION}
        size='small'
      />
    ),
    [isMobile]
  );

  return (
    <>
      {addOrgModalOpened && (
        <AddAcceleratorOrganizationModal
          onSubmit={onAddOrganization}
          onClose={() => setAddOrgModalOpened(false)}
          acceleratorOrgsIds={acceleratorOrganizations.map((org) => org.id)}
        />
      )}
      <TableWithSearchFilters
        columns={() => columns(activeLocale)}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        fuzzySearchColumns={fuzzySearchColumns}
        id='organizationsTable'
        rightComponent={rightComponent}
        rows={acceleratorOrganizations}
        title={strings.ORGANIZATIONS}
        isClickable={() => false}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showCheckbox
        showTopBar
        topBarButtons={[<RemoveOrgsTopBarButton key={1} onConfirm={onRemoveOrganizations} />]}
      />
    </>
  );
};

export default OrganizationsView;
