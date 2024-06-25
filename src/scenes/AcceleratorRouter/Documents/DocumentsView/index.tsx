import React, { useCallback, useEffect, useState } from 'react';

import { IconName, SortOrder, TableColumnType } from '@terraware/web-components';
import CellRenderer from '@terraware/web-components/components/table/TableCellRenderer';
import { RendererProps } from '@terraware/web-components/components/table/types';

import PageListView from 'src/components/DocumentProducer/PageListView';
import StatusBadge from 'src/components/DocumentProducer/StatusBadge';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { selectDocuments } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestListDocuments } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import useSnackbar from 'src/utils/useSnackbar';

import DocumentsEmptyPage from './DocumentsEmptyPage';
import { getDocumentTemplateName } from './helpers';

const tableColumns: TableColumnType[] = [
  { key: 'name', name: strings.NAME, type: 'string' },
  { key: 'organizationName', name: strings.ORGANIZATION, type: 'string' },
  { key: 'documentTemplateId', name: strings.DOCUMENT_TEMPLATE, type: 'string' },
  { key: 'versions', name: strings.VERSIONS, type: 'number' },
  { key: 'createdTime', name: strings.CREATED, type: 'date' },
  { key: 'modifiedTime', name: strings.LAST_EDITED, type: 'date' },
  { key: 'status', name: strings.STATUS, type: 'string' },
];

export default function DocumentsView(): JSX.Element {
  const dispatch = useAppDispatch();
  const { goToDocumentNew } = useNavigateTo();
  const snackbar = useSnackbar();

  const [tableRows, setTableRows] = useState<Document[]>([]);
  const [tableSelectedRows, tableSetSelectedRows] = useState<Document[]>([]);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [requestId, setRequestId] = useState('');
  const documentsResponse = useAppSelector(selectDocuments(requestId));
  const { documentTemplates, error: documentTemplatesError } = useAppSelector(selectDocumentTemplates);

  const tableCellRenderer = useCallback(
    (props: RendererProps<Document>): JSX.Element => {
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
        default:
          return <CellRenderer {...props} />;
      }
    },
    [documentTemplates]
  );

  useEffect(() => {
    const request = dispatch(requestListDocuments());
    setRequestId(request.requestId);

    dispatch(requestListDocumentTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (!documentsResponse) {
      return;
    }

    if (documentsResponse?.status === 'success' && documentsResponse?.data) {
      setDocuments(documentsResponse.data);
    } else if (documentsResponse?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentsResponse]);

  useEffect(() => {
    if (documentTemplatesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, documentTemplatesError]);

  useEffect(() => {
    if (documents) {
      setTableRows(documents);
    }
  }, [documents]);

  if (!documentsResponse || documentsResponse?.status === 'pending') {
    return <></>;
  }

  if (documents.length === 0) {
    return <DocumentsEmptyPage />;
  }

  const listViewProps = {
    title: strings.DOCUMENTS,
    primaryButton: {
      title: strings.ADD_DOCUMENT,
      onClick: goToDocumentNew,
      icon: 'plus' as IconName,
    },
    tableProps: {
      tableRows,
      tableSelectable: true,
      tableOrderBy: 'modifiedTime',
      tableOrder: 'desc' as SortOrder,
      tableColumns,
      tableCellRenderer,
      tableSelectedRows,
      tableSetSelectedRows,
    },
  };

  return <PageListView<Document> {...listViewProps} />;
}
