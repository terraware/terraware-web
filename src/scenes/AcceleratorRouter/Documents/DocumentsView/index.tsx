import React, { useCallback, useEffect, useState } from 'react';

import { IconName, TableColumnType } from '@terraware/web-components';
import CellRenderer, { TableRowType } from '@terraware/web-components/components/table/TableCellRenderer';
import { RendererProps } from '@terraware/web-components/components/table/types';

import PageListView, { PageListViewProps } from 'src/components/DocumentProducer/PageListView';
import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { selectDocuments } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestListDocuments } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { Document } from 'src/types/documentProducer/Document';
import useSnackbar from 'src/utils/useSnackbar';

import { getDocumentTemplateName } from './helpers';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        { key: 'name', name: strings.NAME, type: 'string' },
        { key: 'projectName', name: strings.PROJECT, type: 'string' },
        { key: 'documentTemplateId', name: strings.DOCUMENT_TEMPLATE, type: 'string' },
        { key: 'lastSavedVersionId', name: strings.VERSION, type: 'number' },
        { key: 'createdTime', name: strings.CREATED, type: 'date' },
        { key: 'modifiedTime', name: strings.LAST_EDITED, type: 'date' },
        { key: 'status', name: strings.STATUS, type: 'string' },
      ]
    : [];

const fuzzySearchColumns = ['name', 'projectName'];
const defaultSearchOrder: SearchSortOrder = {
  field: 'name',
  direction: 'Ascending',
};

export default function DocumentsView(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const { goToDocumentNew } = useNavigateTo();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  const [tableRows, setTableRows] = useState<Document[]>([]);
  const [tableSelectedRows, tableSetSelectedRows] = useState<TableRowType[]>([]);
  const [requestId, setRequestId] = useState('');

  const documentsResponse = useAppSelector(selectDocuments(requestId));
  const { documentTemplates, error: documentTemplatesError } = useAppSelector(selectDocumentTemplates);

  const tableCellRenderer = useCallback(
    (props: RendererProps<TableRowType>): JSX.Element => {
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
        case 'documentTemplateId':
          return (
            <CellRenderer {...props} value={getDocumentTemplateName(props.row.documentTemplateId, documentTemplates)} />
          );
        case 'status':
          return <CellRenderer {...props} value={<StatusBadge status={props.row.status} />} />;
        case 'lastSavedVersionId':
          const value = props.value ?? '-';
          return <CellRenderer {...props} value={value} />;
        default:
          return <CellRenderer {...props} />;
      }
    },
    [documentTemplates]
  );

  const dispatchSearchRequest = useCallback(
    (locale: string | null, search: SearchNodePayload, searchSortOrder: SearchSortOrder) => {
      console.log({ locale, search, searchSortOrder });
      const request = dispatch(requestListDocuments());
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (!documentsResponse) {
      return;
    }

    if (documentsResponse?.status === 'success' && documentsResponse?.data) {
      setTableRows(documentsResponse.data);
    } else if (documentsResponse?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentsResponse]);

  useEffect(() => {
    if (documentTemplatesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentTemplatesError]);

  // if (tableRows.length === 0) {
  //   return <DocumentsEmptyPage />;
  // }

  const listViewProps: PageListViewProps = {
    title: strings.DOCUMENTS,
    primaryButton: {
      title: strings.ADD_DOCUMENT,
      onClick: goToDocumentNew,
      icon: 'plus' as IconName,
    },
    tableWithSearchProps: {
      columns: () => columns(activeLocale),
      defaultSearchOrder,
      dispatchSearchRequest,
      fuzzySearchColumns,
      id: 'documents-list',
      Renderer: tableCellRenderer,
      rows: tableRows,
      selectedRows: tableSelectedRows,
      setSelectedRows: tableSetSelectedRows,
    },
  };

  return <PageListView {...listViewProps} />;
}
