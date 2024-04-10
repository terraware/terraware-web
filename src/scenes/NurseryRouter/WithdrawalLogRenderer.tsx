import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { NurseryWithdrawalPurpose, purposeLabel } from 'src/types/Batch';

import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';
import UndoWithdrawalModal from './UndoWithdrawalModal';
import WithdrawalHistoryMenu from './WithdrawalHistoryMenu';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrTxtBrand,
    textDecoration: 'none',
  },
  text: {
    fontSize: '14px',
  },
}));

export default function WithdrawalLogRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();

  const { column, row, value, index, onRowClick } = props;
  const { NURSERY_TRANSFER } = NurseryWithdrawalPurposes;

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
      <Link to={nurseryWithdrawalDetailLocation} className={classes.link}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  const getTruncated = (inputValues: any) => {
    return <TextTruncated stringList={inputValues} />;
  };

  if (column.key === 'speciesScientificNames') {
    return <CellRenderer index={index} column={column} value={getTruncated(value)} row={row} />;
  }

  if (column.key === 'subzoneNames' && value) {
    return <CellRenderer index={index} column={column} value={getTruncated([value])} row={row} />;
  }

  if (column.key === 'withdrawnDate') {
    return <CellRenderer index={index} column={column} value={createLinkToNurseryWithdrawalDetail(value)} row={row} />;
  }

  if (column.key === 'menu') {
    if (row.purpose !== NURSERY_TRANSFER) {
      return (
        <CellRenderer
          index={index}
          column={column}
          row={row}
          value={
            <>
              {undoWithdrawalModalOpened && (
                <UndoWithdrawalModal onClose={() => setUndoWithdrawalModalOpened(false)} row={row} />
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
    }
    return <CellRenderer index={index} column={column} row={row} value='' />;
  }

  if (column.key === 'purpose') {
    return <CellRenderer {...props} value={purposeLabel(value as NurseryWithdrawalPurpose)} />;
  }

  return <CellRenderer {...props} />;
}
