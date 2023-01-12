import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import Link from '../common/Link';
import { useGetTimeZone } from 'src/utils/useTimeZoneUtils';

export default function SeedBanksCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  const tz = useGetTimeZone(value as string);

  const createLinkToSeedBank = (iValue: React.ReactNode | unknown[]) => {
    const seedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_VIEW.replace(':seedBankId', row.id.toString()),
    };
    return <Link to={seedBankLocation.pathname}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createLinkToSeedBank(value)} row={row} />;
  }

  if (column.key === 'timeZone') {
    return <CellRenderer index={index} column={column} value={tz.longName} row={row} />;
  }

  return <CellRenderer {...props} />;
}
