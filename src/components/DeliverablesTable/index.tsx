import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';

import { FilterConfig } from 'src/components/common/SearchFiltersWrapperV2';
import { useLocalization } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesRequestParams } from 'src/services/DeliverablesService';
import strings from 'src/strings';
import { DeliverableCategories, DeliverableStatuses, ListDeliverablesElement } from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn } from 'src/utils/searchAndSort';

import TableWithSearchFilters from '../TableWithSearchFilters';
import DeliverableCellRenderer from './DeliverableCellRenderer';

interface DeliverablesTableProps {
  columns: (activeLocale: string | null) => TableColumnType[];
  extraTableFilters?: SearchNodePayload[];
  organizationId: number;
  filterModifiers?: (filters: FilterConfig[]) => FilterConfig[];
  searchAndSort?: SearchAndSortFn<ListDeliverablesElement>;
  tableId: string;
}

const fuzzySearchColumns = ['name', 'projectName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

const DeliverablesTable = ({
  columns,
  extraTableFilters,
  filterModifiers,
  organizationId,
  searchAndSort,
  tableId,
}: DeliverablesTableProps) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();

  const [deliverables, setDeliverables] = useState<ListDeliverablesElement[]>([]);
  const [deliverablesSearchRequestId, setDeliverablesSearchRequestId] = useState('');
  const deliverablesSearchRequest = useAppSelector(selectDeliverablesSearchRequest(deliverablesSearchRequestId));

  const featuredFilters: FilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'status',
              // These options are strings for now, but may end up as enums when the BE types come through, if that is
              // the case we will need to implement the renderOption and pillValueRenderer to render the desired
              // human readable values
              options: DeliverableStatuses,
              label: strings.STATUS,
            },
            {
              field: 'category',
              // Same note as above
              options: DeliverableCategories,
              label: strings.CATEGORY,
            },
          ]
        : [],
    [activeLocale]
  );

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      const listRequest: ListDeliverablesRequestParams = {};
      if (organizationId !== -1) {
        listRequest.organizationId = organizationId;
      }

      const request = dispatch(
        requestListDeliverables({
          locale,
          listRequest,
          search,
          searchSortOrder,
          searchAndSort,
        })
      );
      setDeliverablesSearchRequestId(request.requestId);
    },
    [dispatch, organizationId, searchAndSort]
  );

  useEffect(() => {
    // TODO do something if the request has an error
    if (deliverablesSearchRequest && deliverablesSearchRequest.data?.deliverables) {
      setDeliverables(deliverablesSearchRequest.data.deliverables);
    }
  }, [deliverablesSearchRequest]);

  return (
    <TableWithSearchFilters
      columns={columns}
      defaultSearchOrder={defaultSearchOrder}
      dispatchSearchRequest={dispatchSearchRequest}
      extraTableFilters={extraTableFilters}
      featuredFilters={featuredFilters}
      filterModifiers={filterModifiers}
      fuzzySearchColumns={fuzzySearchColumns}
      id={tableId}
      Renderer={DeliverableCellRenderer}
      rows={deliverables}
    />
  );
};

export default DeliverablesTable;
