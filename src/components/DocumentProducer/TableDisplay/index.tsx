import React, { useMemo } from 'react';

import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import { VariableTableCell, getCellValues } from 'src/components/DocumentProducer/EditableTableModal/helpers';
import {
  SelectVariable,
  TableColumn,
  TableColumnWithValues,
  TableVariableWithValues,
} from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

export type TableDisplayProps = {
  projectId?: number;
  variable: TableVariableWithValues;
};

const TableDisplay = ({ projectId, variable }: TableDisplayProps) => {
  const theme = useTheme();
  const columns = useMemo<TableColumn[]>(() => variable.columns, [variable]);
  const cellValues = useMemo<VariableTableCell[][]>(
    () =>
      variable.values.map((row) =>
        variable.columns.map((col) => ({
          type: col.variable.type,
          rowId: row.id,
          colId: col.variable.id,
          values: getCellValues(row, col as TableColumnWithValues),
          changed: false,
        }))
      ),
    [variable]
  );

  return (
    <>
      {variable.tableStyle === 'Horizontal' ? (
        <TableContainer sx={{ overflowX: 'visible' }}>
          <Table aria-labelledby='tableTitle' size='medium' aria-label='variable-table'>
            <TableHead sx={{ borderBottom: 'groove' }}>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    colSpan={columns.length + 1}
                    align='left'
                    sx={{ fontSize: '14px', padding: '8px' }}
                    key={index}
                  >
                    <Typography variant={'body1'} fontWeight={600}>
                      {column.variable.name}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {cellValues.map((row, rowNum) => (
                <TableRow key={rowNum}>
                  {row.map((cell, colNum) => (
                    <TableCell colSpan={columns.length + 1} align='left' sx={{ padding: '8px' }} key={colNum}>
                      <Typography variant={'body2'}>
                        {(cell.values?.length ?? 0) > 0
                          ? cellContents(cell.values![0], columns[colNum], projectId, variable)
                          : ''}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        cellValues.map((row, index) => (
          <Box
            key={`table-${index}`}
            borderTop={`2px solid ${theme.palette.TwClrBrdrSecondary}`}
            marginTop={theme.spacing(1)}
            padding={theme.spacing(1, 0)}
            width='100%'
          >
            <TableContainer sx={{ overflowX: 'visible' }}>
              <Table aria-labelledby='tableTitle' size='medium' aria-label='variable-table'>
                <TableBody>
                  {row.map((col, colNum) => {
                    const correspondingColumn = variable.columns.find((varCol) => varCol.variable.id === col.colId);
                    return (
                      <TableRow key={`row-${colNum}`}>
                        {correspondingColumn && (
                          <TableCell
                            align='left'
                            sx={{
                              fontSize: '14px',
                              padding: '8px',
                              borderRight: `2px solid ${theme.palette.TwClrBrdrSecondary}`,
                            }}
                          >
                            <Typography variant={'body1'} fontWeight={600}>
                              {correspondingColumn.variable.name}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align='left' sx={{ padding: '8px' }} width='80%'>
                          <Typography variant={'body2'}>
                            {(col.values?.length ?? 0) > 0
                              ? cellContents(col.values![0], columns[colNum], projectId, variable)
                              : ''}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))
      )}
    </>
  );
};

export default TableDisplay;

const cellContents = (
  value: VariableValueValue,
  col: TableColumn,
  projectId: number | undefined,
  variable: TableVariableWithValues
) => {
  switch (value.type) {
    case 'Number':
      return value.numberValue;
    case 'Text':
      return value.textValue;
    case 'Date':
      return value.dateValue;
    case 'Link':
      return value.title ?? value.url;
    case 'Select':
      const options = (col.variable as SelectVariable).options;
      const selectedOption = options.find((opt) => opt.id === value.optionValues[0]);
      return selectedOption?.renderedText ?? selectedOption?.name ?? '';
    case 'Image':
      return !projectId ? null : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <img src={getImagePath(projectId, value.id, 500, 500)} alt={value.caption ?? `${variable.name}`} />
          <p style={{ fontSize: '16px' }}>{value.caption}</p>
        </Box>
      );
  }
};
