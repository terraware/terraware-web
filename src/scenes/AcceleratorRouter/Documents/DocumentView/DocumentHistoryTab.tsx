import React, { useEffect, useState } from 'react';

import { TableColumnType } from '@terraware/web-components';
import { RendererProps } from '@terraware/web-components/components/table/types';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import PageContent from 'src/components/DocumentProducer/PageContent';
import TableContent from 'src/components/DocumentProducer/TableContent';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { searchHistory } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestListHistory } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document, DocumentHistoryEvent } from 'src/types/documentProducer/Document';

import DocumentHistoryRowMenu from './DocumentHistoryRowMenu';

const tableColumns: TableColumnType[] = [
  { key: 'createdTime', name: strings.DATE, type: 'date' },
  { key: 'name', name: strings.VERSION_NAME, type: 'string' },
  { key: 'isSubmitted', name: strings.STATUS, type: 'string' },
  { key: 'type', name: strings.EVENT, type: 'string' },
  { key: 'modifiedByName', name: strings.EDITED_BY, type: 'string' },
  {
    key: 'menu',
    name: '',
    type: 'string',
  },
];

const tableCellRenderer = (props: RendererProps<any>): JSX.Element => {
  const { column, row, index, reloadData } = props;

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
          <DocumentHistoryRowMenu
            documentId={row.documentId}
            versionId={row.versionId}
            isSubmitted={row.isSubmitted}
            reloadData={reloadData}
          />
        }
        row={row}
        index={index}
      />
    );
  }

  if (column.key === 'isSubmitted') {
    return <CellRenderer {...props} value={props.value ? strings.SUBMITTED : strings.NOT_SUBMITTED} />;
  }

  return <CellRenderer {...props} />;
};

export type DocumentHistoryProps = {
  document: Document;
};

const DocumentHistoryTab = ({ document }: DocumentHistoryProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [tableRows, setTableRows] = useState<DocumentHistoryEvent[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const onSearch = (str: string) => setSearchValue(str);

  // select history data
  const history = useAppSelector((state) => searchHistory(state, document.id, searchValue));

  useSelectorProcessor(history, setTableRows);

  useEffect(() => {
    // TODO should these be admin users? TF accelerator users?
    // dispatch(requestListUsers());
    dispatch(requestListHistory(document.id));
  }, [dispatch, document.id]);

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
      tableCellRenderer,
      tableReloadData: () => dispatch(requestListHistory(document.id)),
    },
  };

  return (
    <PageContent styles={{ marginTop: 0 }}>
      <TableContent {...props} />
    </PageContent>
  );
};

export default DocumentHistoryTab;
