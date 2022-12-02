import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { Theme } from '@mui/material';
import { Button } from '@terraware/web-components';
import strings from 'src/strings';
import { NurseryWithdrawalPurposes } from 'src/api/types/batch';

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
    const nurseryWithdrawalDetailLocation = {
      pathname: APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(':withdrawalId', row.id.toString()),
    };
    return (
      <Link to={nurseryWithdrawalDetailLocation.pathname} className={classes.link}>
        {iValue}
      </Link>
    );
  };

  if (column.key === 'withdrawnDate') {
    return <CellRenderer index={index} column={column} value={createLinkToNurseryWithdrawalDetail(value)} row={row} />;
  }

  if (column.key === 'hasReassignments') {
    if (row.purpose === OUTPLANT) {
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
                disabled={row.hasReassignments === 'true'}
              />
            }
          />
        </>
      );
    }
    return <CellRenderer index={index} column={column} row={row} value='' />;
  }

  return <CellRenderer {...props} />;
}
