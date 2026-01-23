import React, { type JSX } from 'react';

import { FiberManualRecord } from '@mui/icons-material';
import { Box, TableCell, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
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
          <Link
            fontSize='16px'
            to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${row.id as string | number}`)}
          >{`${value as string}`}</Link>
        }
        row={row}
      />
    );
  }

  const numberCell = (units: unknown) => (
    <CellRenderer index={index} column={column} value={`${value as number} ${units as string}`} row={row} />
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
    return <CellRenderer index={index} column={column} value={`${value as number}%`} row={row} />;
  }

  if (column.key === 'geolocations.coordinates') {
    const coordinatesValues = ((row.geolocations || []) as any[]).map((gl) => gl.coordinates);
    return (
      <CellRenderer
        index={index}
        column={column}
        row={row}
        value={
          <TextTruncated
            stringList={coordinatesValues}
            listSeparator={strings.LIST_SEPARATOR_SECONDARY}
            moreText={strings.TRUNCATED_TEXT_MORE_LINK}
          />
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}
