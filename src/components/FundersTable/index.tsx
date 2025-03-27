import React, { useCallback, useEffect, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Button, TableRowType } from '@terraware/web-components';

import { TableColumnType } from 'src/components/common/table/types';
import { requestListFunders } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectListFundersRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Funder } from 'src/types/FundingEntity';
import { SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

import ClientSideFilterTable from '../Tables/ClientSideFilterTable';
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
          name: strings.DATE_ADDED,
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
  const theme = useTheme();

  const [listFundersRequestId, setListFundersRequestId] = useState<string>('');
  const [funders, setFunders] = useState<Funder[]>([]);

  const [selectedRows, setSelectedRows] = useState<TableRowType[]>([]);

  const listFundersResponse = useAppSelector(selectListFundersRequest(listFundersRequestId));

  const onRemoveConfirm = useCallback(() => {
    snackbar.toastInfo('Remove deletion functionality not yet implemented.');
  }, [dispatch]);

  useEffect(() => {
    const request = dispatch(requestListFunders(fundingEntityId));
    setListFundersRequestId(request.requestId);
  }, [dispatch, fundingEntityId]);

  useEffect(() => {
    if (listFundersResponse) {
      if (listFundersResponse.status === 'success') {
        setFunders(listFundersResponse.data ?? []);
      } else if (listFundersResponse.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
    }
  }, [listFundersResponse, setFunders, snackbar]);

  return (
    <>
      <Grid container paddingTop={theme.spacing(4)} paddingBottom={theme.spacing(4)}>
        <Grid item xs={8}>
          <Typography fontWeight={600} fontSize={'20px'} lineHeight={'28px'}>
            {strings.PEOPLE}
          </Typography>
        </Grid>
        <Grid
          item
          xs={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          <Button
            id={'invite-funder'}
            icon={'plus'}
            priority={'secondary'}
            onClick={() => snackbar.toastInfo('Invite funder functionality not yet implemented')}
            label={strings.INVITE_FUNDER}
            size='medium'
          />
        </Grid>
      </Grid>

      <ClientSideFilterTable
        columns={columns}
        defaultSortOrder={defaultSortOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        id={'acceleratorPeopleTable'}
        isClickable={() => false}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showCheckbox
        showTopBar
        Renderer={FunderCellRenderer}
        rows={funders}
        topBarButtons={[<RemoveFunderTopBarButton key={0} onConfirm={onRemoveConfirm} selectedRows={selectedRows} />]}
      />
    </>
  );
};

export default FundersTable;
