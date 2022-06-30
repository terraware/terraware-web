import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

const useStyles = makeStyles((theme) =>
  createStyles({
    link: {
      color: '#0067C8',
    },
  })
);

export default function SeedBanksCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;

  const createLinkToSeedBank = (iValue: React.ReactNode | unknown[]) => {
    const seedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_VIEW.replace(':seedBankId', row.id.toString()),
    };
    return (
      <Link to={seedBankLocation.pathname} className={classes.link}>
        {iValue}
      </Link>
    );
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createLinkToSeedBank(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}
