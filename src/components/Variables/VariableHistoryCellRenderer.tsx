import React, { useEffect, useMemo } from 'react';

import { CellRenderer, RendererProps, TableRowType } from '@terraware/web-components';

import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import { VariableHistoryTableRow } from './VariableHistoryTable';

const VariableChangesCellRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { row } = props;

  const tableRow = row as VariableHistoryTableRow;

  const changes = tableRow.changes
    .map(({ field, previous, current }) => {
      if (field === 'image') {
        return `${strings.VALUE}: ${strings.IMAGE_UPDATED}`;
      } else if (field === 'table') {
        return `${strings.VALUE}: ${strings.TABLE_UPDATED}`;
      } else {
        const prefix =
          field === 'feedback'
            ? strings.FEEDBACK
            : field === 'internalComment'
              ? strings.INTERNAL_COMMENTS
              : field === 'status'
                ? strings.STATUS
                : field === 'value'
                  ? strings.VALUE
                  : '';
        return `${prefix}: '${previous}' → '${current}'`;
      }
    })
    .join(', ');

  return <CellRenderer {...props} value={changes} />;
};

const VariableHistoryCellRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { column, row } = props;
  const tableRow = row as VariableHistoryTableRow;
  const dispatch = useAppDispatch();

  const userResult = useAppSelector(selectUser(tableRow.editedBy));

  useEffect(() => {
    if (!userResult && tableRow.editedBy && tableRow.editedBy !== -1) {
      dispatch(requestGetUser(tableRow.editedBy));
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
