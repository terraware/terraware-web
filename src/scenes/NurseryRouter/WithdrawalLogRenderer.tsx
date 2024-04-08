import React from 'react';
import { Link } from 'react-router-dom';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';

import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { NurseryWithdrawalPurpose, purposeLabel } from 'src/types/Batch';
import { isTrue } from 'src/utils/boolean';

import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';

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
  const { OUTPLANT } = NurseryWithdrawalPurposes;

  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      onRowClick();
    }
  };

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

  if (column.key === 'hasReassignments') {
    if (row.purpose === OUTPLANT && row.plantingSubzoneNames) {
      return (
        <>
          <CellRenderer
            index={index}
            column={column}
            row={row}
            value={
              <Button
                id='reassign'
                label={strings.REASSIGN}
                onClick={rowClick}
                size='small'
                priority='secondary'
                className={classes.text}
                disabled={isTrue(row.hasReassignments)}
              />
            }
          />
        </>
      );
    }
    return <CellRenderer index={index} column={column} row={row} value='' />;
  }

  if (column.key === 'purpose') {
    return <CellRenderer {...props} value={purposeLabel(value as NurseryWithdrawalPurpose)} />;
  }

  return <CellRenderer {...props} />;
}
