import React, { type JSX } from 'react';

import { useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function WithdrawalRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();

  const { column, row, value, index } = props;

  if (column.key === 'batchNumber' && typeof value === 'string') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link
            fontSize='16px'
            to={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', row.speciesId).replace(
              ':batchId',
              row.batchId
            )}
            style={{
              color: theme.palette.TwClrBaseGreen500,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {value}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}
