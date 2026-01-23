import React, { type JSX } from 'react';

import { APP_PATHS } from 'src/constants';

import Link from '../../components/common/Link';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';

export default function SeedBanksCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToSeedBank = (iValue: React.ReactNode | unknown[]) => {
    const seedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_VIEW.replace(':seedBankId', row.id.toString()),
    };
    return (
      <Link fontSize='16px' to={seedBankLocation.pathname}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToSeedBank(value)}
        row={row}
        title={value as string}
      />
    );
  }

  return <CellRenderer {...props} />;
}
