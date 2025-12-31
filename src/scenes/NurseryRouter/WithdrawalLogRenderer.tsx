import React, { useState } from 'react';
import { Link } from 'react-router';

import { useTheme } from '@mui/material';

import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { NurseryWithdrawalPurpose, purposeLabel } from 'src/types/Batch';

import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import UndoWithdrawalModal from './UndoWithdrawalModal';
import WithdrawalHistoryMenu from './WithdrawalHistoryMenu';

export default function WithdrawalLogRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();

  const { column, row, value, index, onRowClick, reloadData } = props;
  const { NURSERY_TRANSFER } = NurseryWithdrawalPurposes;

  const linkStyles = {
    fontSize: '16px',
    color: theme.palette.TwClrTxtBrand,
    textDecoration: 'none',
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      onRowClick();
    }
  };

  const [undoWithdrawalModalOpened, setUndoWithdrawalModalOpened] = useState(false);

  const createLinkToNurseryWithdrawalDetail = (iValue: React.ReactNode | unknown[]) => {
    const nurseryWithdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(
      ':withdrawalId',
      row.id.toString()
    );
    return (
      <Link
        to={nurseryWithdrawalDetailLocation}
        style={{
          ...linkStyles,
          ...(row.undoneByWithdrawalId ? { textDecoration: 'line-through' } : {}),
        }}
      >
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const createLinkToUndoneNurseryWithdrawalDetail = (date: string, id: string) => {
    const nurseryWithdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', id);
    return (
      <p>
        {`${strings.UNDO} `}
        <Link to={nurseryWithdrawalDetailLocation} style={linkStyles}>
          {date as React.ReactNode}
        </Link>
      </p>
    );
  };

  const getTruncated = (inputValues: any) => {
    return <TextTruncated stringList={inputValues} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
  };

  if (column.key === 'speciesScientificNames') {
    return <CellRenderer index={index} column={column} value={getTruncated(value)} row={row} />;
  }

  if (column.key === 'substratumNames' && value) {
    return <CellRenderer index={index} column={column} value={getTruncated([value])} row={row} />;
  }

  if (column.key === 'withdrawnDate') {
    return <CellRenderer index={index} column={column} value={createLinkToNurseryWithdrawalDetail(value)} row={row} />;
  }

  if (column.key === 'menu') {
    if (row.purpose !== NURSERY_TRANSFER && !row.undoesWithdrawalId && !row.undoneByWithdrawalId) {
      return (
        <CellRenderer
          index={index}
          column={column}
          row={row}
          value={
            <>
              {undoWithdrawalModalOpened && (
                <UndoWithdrawalModal
                  onClose={() => setUndoWithdrawalModalOpened(false)}
                  row={row}
                  reload={reloadData}
                />
              )}
              <WithdrawalHistoryMenu
                reassign={rowClick}
                withdrawal={row}
                undo={() => setUndoWithdrawalModalOpened(true)}
              />
            </>
          }
        />
      );
    } else {
      return <CellRenderer index={index} column={column} row={row} value='' />;
    }
  }

  if (column.key === 'purpose') {
    if (!row.undoesWithdrawalId) {
      return <CellRenderer {...props} value={purposeLabel(value as NurseryWithdrawalPurpose)} />;
    } else {
      return (
        <CellRenderer
          {...props}
          value={createLinkToUndoneNurseryWithdrawalDetail(row.undoesWithdrawalDate, row.undoesWithdrawalId)}
        />
      );
    }
  }

  return <CellRenderer {...props} />;
}
