import React, { type JSX, useEffect, useMemo } from 'react';

import { CellRenderer, RendererProps, TableRowType } from '@terraware/web-components';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import { VariableHistoryTableRow } from './VariableHistoryTable';

const VariableChangesCellRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { row } = props;

  const tableRow = row as VariableHistoryTableRow;

  const { field, previous, current } = tableRow.change;

  const prefix =
    field === 'feedback'
      ? strings.FEEDBACK
      : field === 'internalComment'
        ? strings.INTERNAL_COMMENTS
        : field === 'status'
          ? strings.STATUS
          : strings.VALUE;

  const value =
    field === 'image'
      ? strings.IMAGE_UPDATED
      : field === 'table'
        ? strings.TABLE_UPDATED
        : `'${previous}' → '${current}'`;

  const result = `${prefix}: ${value}`;

  return <CellRenderer {...props} value={result} />;
};

const VariableHistoryCellRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { column, row } = props;
  const tableRow = row as VariableHistoryTableRow;
  const dispatch = useAppDispatch();

  const userResult = useAppSelector(selectUser(tableRow.editedBy));

  useEffect(() => {
    if (!userResult && tableRow.editedBy && tableRow.editedBy !== -1) {
      void dispatch(requestGetUser(tableRow.editedBy));
    }
  }, [dispatch, tableRow, userResult]);

  const editedByName = useMemo(() => {
    if (!userResult) {
      return '';
    }

    // defaults to first name last name, fallback to email
    return `${userResult?.firstName ?? ''} ${userResult?.lastName ?? ''}`.trim() || userResult.email;
  }, [userResult]);

  if (column.key === 'date') {
    return <CellRenderer {...props} value={tableRow.date} />;
  }

  if (column.key === 'changes') {
    return <VariableChangesCellRenderer {...props} />;
  }

  if (column.key === 'editedBy') {
    return <CellRenderer {...props} value={editedByName} />;
  }

  return <CellRenderer {...props} />;
};

export default VariableHistoryCellRenderer;
