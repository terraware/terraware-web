import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { TableColumnType } from '@terraware/web-components';
import CellRenderer, { TableRowType } from '@terraware/web-components/components/table/TableCellRenderer';
import { RendererProps } from '@terraware/web-components/components/table/types';

import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import TableWithSearchFilters from 'src/components/TableWithSearchFilters';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useListDocumentsQuery } from 'src/queries/generated/documentProducerDocuments';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { searchAndSort } from 'src/utils/searchAndSort';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';

type DocumentsTableProps = {
  projectId?: number;
};

const fuzzySearchColumns = ['name', 'projectDealName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function DocumentsTable({ projectId }: DocumentsTableProps): JSX.Element | null {
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  const [tableSelectedRows, tableSetSelectedRows] = useState<TableRowType[]>([]);
  const [searchRequest, setSearchRequest] = useState<{
    locale: string | null;
    search: SearchNodePayload;
    sortOrder: SearchSortOrder;
  }>();
  const query = useQuery();

  const {
    currentData: documentsData,
    isFetching,
    isError,
  } = useListDocumentsQuery(searchRequest ? undefined : skipToken);

  const tableCellRenderer = useCallback((props: RendererProps<TableRowType>): JSX.Element => {
    switch (props.column.key) {
      case 'name':
        return (
          <CellRenderer
            {...props}
            value={
              <Link
                fontSize='16px'
                to={APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_VIEW.replace(':documentId', `${props.row.id}`)}
              >
                {props.row.name}
              </Link>
            }
          />
        );
      case 'status':
        return <CellRenderer {...props} value={<StatusBadge status={props.row.status} />} />;
      case 'lastSavedVersionId': {
        const value = props.value ?? '-';
        return <CellRenderer {...props} value={value} />;
      }
      default:
        return <CellRenderer {...props} />;
    }
  }, []);

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) =>
      setSearchRequest({ locale, search, sortOrder: searchSortOrder }),
    []
  );

  const tableRows = useMemo(() => {
    if (!documentsData || !searchRequest) {
      return [];
    }
    return searchAndSort(documentsData.documents, searchRequest.search, {
      locale: searchRequest.locale,
      sortOrder: searchRequest.sortOrder,
      numberFields: ['id'],
    });
  }, [documentsData, searchRequest]);

  const extraTableFilters: SearchNodePayload[] = useMemo(() => {
    if (projectId) {
      return [
        {
          operation: 'field',
          field: 'projectId',
          type: 'Exact',
          values: [`${projectId}`],
        },
      ];
    }

    return query.get('dealName')
      ? [
          {
            operation: 'field',
            field: 'projectDealName',
            type: 'Exact',
            values: [`${query.get('dealName')}`],
          },
        ]
      : [];
  }, [projectId, query]);

  const columns = useCallback(
    (): TableColumnType[] =>
      activeLocale
        ? [
            { key: 'name', name: strings.NAME, type: 'string' },
            ...(projectId ? [] : [{ key: 'projectDealName', name: strings.DEAL_NAME, type: 'string' as const }]),
            { key: 'documentTemplateName', name: strings.DOCUMENT_TEMPLATE, type: 'string' },
            { key: 'lastSavedVersionId', name: strings.VERSION, type: 'number' },
            { key: 'createdTime', name: strings.CREATED, type: 'date' },
            { key: 'modifiedTime', name: strings.LAST_EDITED, type: 'date' },
            { key: 'status', name: strings.STATUS, type: 'string' },
          ]
        : [],
    [activeLocale, projectId]
  );

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isError, snackbar]);

  return (
    <Box>
      {projectId && (
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
            padding: '24px',
          }}
          variant='h4'
        >
          {strings.DOCUMENTS}
        </Typography>
      )}

      <TableWithSearchFilters
        busy={isFetching}
        columns={() => columns()}
        defaultSearchOrder={defaultSearchOrder}
        dispatchSearchRequest={dispatchSearchRequest}
        extraTableFilters={extraTableFilters}
        fuzzySearchColumns={fuzzySearchColumns}
        id='documents-list'
        Renderer={tableCellRenderer}
        rows={tableRows}
        selectedRows={tableSelectedRows}
        setSelectedRows={tableSetSelectedRows}
      />
    </Box>
  );
}
