import React, { useCallback, useEffect, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import Page from 'src/components/Page';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import { requestFundingEntities } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectFundingEntitiesRequest } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import useSnackbar from 'src/utils/useSnackbar';

import FundingEntitiesCellRenderer from './FundingEntitiesCellRenderer';

const fuzzySearchColumns = ['name', 'projects'];

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.FUNDING_ENTITY_NAME, type: 'string' },
        { key: 'projects', name: strings.PROJECT_OR_PROJECTS, type: 'string' },
      ]
    : [];

const FundingEntitiesView = () => {
  const dispatch = useAppDispatch();
  const [listRequestId, setListRequestId] = useState('');
  const listRequest = useAppSelector(selectFundingEntitiesRequest(listRequestId));
  const [fundingEntities, setFundingEntities] = useState<FundingEntity[]>([]);
  const snackbar = useSnackbar();

  const defaultSearchOrder: SearchSortOrder = {
    field: 'name',
    direction: 'Ascending',
  };

  const dispatchSearchRequest = useCallback(
    (locale?: string | null, search?: SearchNodePayload, searchSortOrder?: SearchSortOrder) => {
      const request = dispatch(requestFundingEntities({ locale: locale || null, search, searchSortOrder }));
      setListRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!listRequest) {
      return;
    }

    if (listRequest.status === 'success' && listRequest.data?.fundingEntities) {
      setFundingEntities(listRequest.data.fundingEntities);
    } else if (listRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listRequest, snackbar]);

  return (
    <Page title={strings.FUNDING_ENTITIES}>
      <TableWithSearchFilters
        columns={columns}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        fuzzySearchColumns={fuzzySearchColumns}
        id='fundingEntitiesTable'
        rows={fundingEntities}
        isClickable={() => false}
        showTopBar
        Renderer={FundingEntitiesCellRenderer}
      />
    </Page>
  );
};

export default FundingEntitiesView;
