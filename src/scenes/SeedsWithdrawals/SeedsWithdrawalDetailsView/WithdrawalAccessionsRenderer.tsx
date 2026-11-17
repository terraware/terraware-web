import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

const WithdrawalAccessionsRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { column, row, value, index } = props;

  const linkTo =
    column.key === 'accessionNumber'
      ? APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(row.accessionId))
      : undefined;

  if (linkTo && typeof value === 'string') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' to={linkTo}>
            {value}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
};

export default WithdrawalAccessionsRenderer;
