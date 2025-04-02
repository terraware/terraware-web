import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TableRowType } from '@terraware/web-components';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Button from 'src/components/common/button/Button';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import { requestDeleteFunders, requestListFunders } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import {
  selectDeleteFundersRequest,
  selectListFundersRequest,
} from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Funder } from 'src/types/FundingEntity';
import { SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

import FunderCellRenderer from './FunderCellRenderer';
import RemoveFunderTopBarButton from './RemoveFunderTopBarButton';

const fuzzySearchColumns = ['email', 'firstName', 'lastName'];
const defaultSortOrder: SearchSortOrder = {
  field: 'email',
  direction: 'Ascending',
};

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.FUNDER_NAME,
          type: 'string',
        },
        {
          key: 'email',
          name: strings.EMAIL,
          type: 'string',
        },
        {
          key: 'dateAdded',
          name: strings.STATUS,
          type: 'string',
        },
      ]
    : [];

type FundersTableProps = {
  fundingEntityId: number;
};

const FundersTable = ({ fundingEntityId }: FundersTableProps) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const navigate = useNavigate();
  const { isAllowed } = useUser();

  const [listFundersRequestId, setListFundersRequestId] = useState<string>('');
  const [deleteFundersRequestId, setDeleteFundersRequestId] = useState<string>('');
  const [funders, setFunders] = useState<Funder[]>([]);

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);

  const listFundersResponse = useAppSelector(selectListFundersRequest(listFundersRequestId));
  const deleteFundersResponse = useAppSelector(selectDeleteFundersRequest(deleteFundersRequestId));

  const reload = useCallback(() => {
    const request = dispatch(requestListFunders(fundingEntityId));
    setListFundersRequestId(request.requestId);
  }, [dispatch, fundingEntityId]);

  const onRemoveConfirm = useCallback(
    (selectedFunders: TableRowType[]) => {
      const request = dispatch(
        requestDeleteFunders({ fundingEntityId, userIds: selectedFunders.map((f) => f.userId) })
      );
      setDeleteFundersRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    reload();
  }, [dispatch, fundingEntityId]);

  useEffect(() => {
    if (deleteFundersResponse) {
      if (deleteFundersResponse?.status === 'success') {
        snackbar.toastError(strings.FUNDERS_DELETED);
        reload();
      } else if (deleteFundersResponse.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [deleteFundersResponse, snackbar]);

  useEffect(() => {
    if (listFundersResponse) {
      if (listFundersResponse.status === 'success') {
        setFunders(listFundersResponse.data ?? []);
      } else if (listFundersResponse.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [listFundersResponse, setFunders, snackbar]);

  const goToInvitePage = useCallback(
    () => navigate(APP_PATHS.ACCELERATOR_FUNDING_ENTITY_INVITE.replace(':fundingEntityId', fundingEntityId.toString())),
    [fundingEntityId]
  );

  const rightComponent = useMemo(
    () =>
      isAllowed('INVITE_FUNDER') ? (
        <Button
          label={strings.INVITE_FUNDER}
          icon='plus'
          onClick={goToInvitePage}
          size='medium'
          priority={'secondary'}
          id='editFundingEntity'
        />
      ) : (
        ''
      ),
    [goToInvitePage]
  );

  return (
    <ClientSideFilterTable
      columns={columns}
      defaultSortOrder={defaultSortOrder}
      fuzzySearchColumns={fuzzySearchColumns}
      id={'fundersTable'}
      isClickable={() => false}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      showCheckbox={isAllowed('MANAGE_FUNDING_ENTITIES')}
      showTopBar
      Renderer={FunderCellRenderer}
      rows={funders}
      title={strings.FUNDERS}
      rightComponent={rightComponent}
      topBarButtons={[<RemoveFunderTopBarButton key={0} onConfirm={onRemoveConfirm} selectedRows={selectedRows} />]}
    />
  );
};

export default FundersTable;
