import React from 'react';

import { FiberManualRecord } from '@mui/icons-material';
import { Box, TableCell, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { SearchResponseElement } from 'src/types/Search';

export default function SearchCellRenderer(props: RendererProps<SearchResponseElement>): JSX.Element {
  const { column, value, index, row } = props;
  const theme = useTheme();

  const id = `row${index}-${column.key}`;
  if (column.key === 'active' && typeof value === 'string' && value) {
    const active = value === 'Active';

    return (
      <TableCell id={id} align='left'>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FiberManualRecord
            color={active ? 'primary' : 'disabled'}
            sx={{ fontSize: theme.typography.overline.fontSize }}
          />
          <Typography
            sx={
              active
                ? undefined
                : {
                    '&.MuiTypography-root': {
                      display: 'flex',
                      alignItems: 'center',
                      color: theme.palette.neutral[600],
                    },
                  }
            }
          >
            {value}
          </Typography>
        </Box>
      </TableCell>
    );
  }

  if (column.key === 'accessionNumber') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${row.id}`)}>{`${value}`}</Link>
        }
        row={row}
      />
    );
  }

  const numberCell = (units: unknown) => (
    <CellRenderer index={index} column={column} value={`${value} ${units}`} row={row} />
  );

  if (column.key === 'remainingQuantity' && value) {
    return numberCell(row.remainingUnits);
  }

  if (column.key === 'totalQuantity' && value) {
    return numberCell(row.totalUnits);
  }

  if (column.key === 'withdrawalQuantity' && value) {
    return numberCell(row.withdrawalUnits);
  }

  if (
    (column.key === 'species_endangered' || column.key === 'species_rare') &&
    (value === 'false' || value === 'true')
  ) {
    return <CellRenderer index={index} column={column} value={`${value === 'true' ? 'Yes' : 'No'}`} row={row} />;
  }

  if (column.key === 'totalViabilityPercent' && value !== undefined) {
    return <CellRenderer index={index} column={column} value={`${value}%`} row={row} />;
  }

  return <CellRenderer {...props} />;
}
