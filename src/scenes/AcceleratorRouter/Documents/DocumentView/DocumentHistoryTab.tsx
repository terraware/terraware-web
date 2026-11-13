import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';
import { RendererProps } from '@terraware/web-components/components/table/types';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import PageContent from 'src/components/DocumentProducer/PageContent';
import TableContent from 'src/components/DocumentProducer/TableContent';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { useLocalization } from 'src/providers';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { useGetDocumentHistoryQuery } from 'src/queries/generated/documentProducerDocuments';
import { useGetUserQuery } from 'src/queries/generated/users';
import { DocumentHistoryEvent } from 'src/types/documentProducer/Document';
import useSnackbar from 'src/utils/useSnackbar';
import { getUserDisplayName } from 'src/utils/user';

import DocumentHistoryRowMenu from './DocumentHistoryRowMenu';

const EditedByName = ({ userId }: { userId?: number }): JSX.Element => {
  const { currentData } = useGetUserQuery(userId ?? -1, { skip: !userId });
  return <>{getUserDisplayName(currentData?.user)}</>;
};

const TableCellRenderer = (props: RendererProps<any>): JSX.Element => {
  const { strings } = useLocalization();
  const { column, row, index } = props;

  if (column.key === 'type') {
    const labels: Record<DocumentHistoryEvent['type'], string> = {
      Created: strings.CREATED,
      Edited: strings.EDITED,
      Saved: strings.SAVED,
    };
    return <CellRenderer {...props} value={labels[row.type as DocumentHistoryEvent['type']]} />;
  }

  if (column.key === 'date') {
    if (props.value) {
      return <CellRenderer {...props} value={getDateDisplayValue(props.value as string)} />;
    }
  }

  if (column.key === 'menu' && row.type === 'Saved') {
    return (
      <CellRenderer
        column={column}
        value={
          <DocumentHistoryRowMenu documentId={row.documentId} versionId={row.versionId} isSubmitted={row.isSubmitted} />
        }
        row={row}
        index={index}
      />
    );
  }

  if (column.key === 'isSubmitted') {
    return <CellRenderer {...props} value={props.value ? strings.SUBMITTED : strings.NOT_SUBMITTED} />;
  }

  if (column.key === 'modifiedByName') {
    return <CellRenderer {...props} value={<EditedByName userId={row.createdBy} />} />;
  }

  return <CellRenderer {...props} />;
};

const DocumentHistoryTab = (): JSX.Element => {
  const { strings } = useLocalization();
  const { documentId } = useDocumentProducerData();
  const snackbar = useSnackbar();

  const [searchValue, setSearchValue] = useState<string>('');
  const onSearch = (str: string) => setSearchValue(str);

  const { currentData: historyData, isError } = useGetDocumentHistoryQuery(documentId);

  useEffect(() => {
    if (isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isError, snackbar, strings]);

  const tableColumns = useMemo<TableColumnType[]>(
    () => [
      { key: 'createdTime', name: strings.DATE, type: 'date' },
      { key: 'name', name: strings.VERSION_NAME, type: 'string' },
      { key: 'isSubmitted', name: strings.STATUS, type: 'string' },
      { key: 'type', name: strings.EVENT, type: 'string' },
      { key: 'modifiedByName', name: strings.EDITED_BY, type: 'string' },
      { key: 'menu', name: '', type: 'string' },
    ],
    [strings]
  );

  const tableRows = useMemo<DocumentHistoryEvent[]>(
    () => (historyData?.history ?? []).map((event) => ({ ...event, docId: documentId, documentId })),
    [historyData, documentId]
  );

  const props = {
    searchProps: {
      onSearch,
      searchValue,
    },
    tableProps: {
      tableRows,
      tableSelectable: false,
      tableOrderBy: 'date',
      tableColumns,
      tableCellRenderer: TableCellRenderer,
    },
  };

  return (
    <PageContent styles={{ marginTop: 0 }}>
      <TableContent {...props} />
    </PageContent>
  );
};

export default DocumentHistoryTab;
