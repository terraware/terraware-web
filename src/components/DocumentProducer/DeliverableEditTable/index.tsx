import React, { useCallback, useMemo, useState } from 'react';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Button } from '@terraware/web-components';

import strings from 'src/strings';
import { TableColumn, TableVariableWithValues } from 'src/types/documentProducer/Variable';

import { EditableCell } from '../EditableTableModal';
import { VariableTableCell, cellValue, getInitialCellValues, newValueFromEntry } from '../EditableTableModal/helpers';

type DeliverableEditableTableEditProps = {
  variable: TableVariableWithValues;
  onChange: (newValue: any) => void;
};

const DeliverableEditableTableEdit = ({ variable, onChange }: DeliverableEditableTableEditProps) => {
  const columns = useMemo<TableColumn[]>(() => variable.columns, [variable]);
  const initialCellValues = useMemo<VariableTableCell[][]>(() => getInitialCellValues(variable), [variable]);
  const [cellValues, setCellValues] = useState<VariableTableCell[][]>(initialCellValues);

  const onChangeCellValues = useCallback((nextCellValues: VariableTableCell[][]) => {
    setCellValues(nextCellValues);
    onChange(nextCellValues);
  }, []);

  const setCellValue = (rowNum: number, colNum: number, newValue: string | number) => {
    const newCellValues: VariableTableCell[][] = [];
    cellValues.forEach((row, rowIndex) => {
      const newRow: VariableTableCell[] = [];
      row.forEach((cell, colIndex) => {
        if (rowNum === rowIndex && colNum === colIndex) {
          const values = newValueFromEntry(newValue, cell.type);
          newRow.push({
            type: cell.type,
            rowId: cell.rowId,
            colId: cell.colId,
            values: values ? [values] : [],
            changed: true,
          });
        } else {
          newRow.push(cell);
        }
      });
      newCellValues.push(newRow);
    });
    onChangeCellValues(newCellValues);
  };

  const addRow = () => {
    const newRow: VariableTableCell[] = [];
    columns.forEach((col) => {
      newRow.push({
        type: col.variable.type,
        rowId: undefined,
        colId: col.variable.id,
        values: undefined,
        changed: false,
      });
    });
    onChangeCellValues([...cellValues, newRow]);
  };

  const removeRow = (rowNum: number) => {
    const newCellValues = [...cellValues];
    newCellValues.splice(rowNum, 1);
    onChangeCellValues(newCellValues);
  };

  return (
    <>
      {variable.tableStyle === 'Horizontal' && (
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
                    {column.variable.name}
                  </TableCell>
                ))}

                {cellValues.length > 1 ? (
                  // Empty column for remove button
                  <TableCell colSpan={columns.length + 1} align='left' sx={{ fontSize: '14px', padding: '8px' }} />
                ) : null}
              </TableRow>
            </TableHead>

            <TableBody>
              {cellValues.map((row, rowNum) => (
                <TableRow key={rowNum}>
                  {row.map((cell, colNum) => (
                    <TableCell colSpan={columns.length + 1} align='left' sx={{ padding: '8px' }} key={colNum}>
                      <EditableCell
                        id={`${cell.rowId}-${cell.colId}`}
                        column={columns[colNum]}
                        onChange={(value) => setCellValue(rowNum, colNum, value as string | number)}
                        value={(cell.values?.length ?? 0) > 0 ? cellValue(cell.values![0]) : undefined}
                      />
                    </TableCell>
                  ))}
                  {cellValues.length > 1 ? (
                    <TableCell colSpan={columns.length + 1} align='left' sx={{ padding: '8px' }}>
                      <Button
                        onClick={() => removeRow(rowNum)}
                        icon={'cancel'}
                        type='passive'
                        priority='ghost'
                        size='medium'
                      />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {variable.tableStyle === 'Vertical' && (
        <>
          {cellValues.map((row, index) => (
            <Box key={`table-${index}`}>
              <TableContainer sx={{ overflowX: 'visible' }}>
                <Table aria-labelledby='tableTitle' size='medium' aria-label='variable-table'>
                  <TableBody>
                    {row.map((col, colNum) => {
                      const correspondingColumn = variable.columns.find((varCol) => varCol.variable.id === col.colId);
                      return (
                        <TableRow key={`row-${colNum}`}>
                          <TableCell align='left' sx={{ fontSize: '14px', padding: '8px' }}>
                            {correspondingColumn?.variable.name}
                          </TableCell>

                          <TableCell align='left' sx={{ padding: '8px' }}>
                            {correspondingColumn && (
                              <EditableCell
                                id={`${col.rowId}-${col.colId}`}
                                column={correspondingColumn}
                                onChange={(value) => setCellValue(index, colNum, value as string | number)}
                                value={(col.values?.length ?? 0) > 0 ? cellValue(col.values![0]) : undefined}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                onClick={() => removeRow(index)}
                icon='cancel'
                type='passive'
                priority='ghost'
                size='medium'
                label={strings.EDITABLE_TABLE_REMOVE_TABLE}
              />
            </Box>
          ))}
        </>
      )}

      <Button
        onClick={addRow}
        icon={'iconAdd'}
        type='productive'
        priority='ghost'
        size='medium'
        label={variable.tableStyle === 'Horizontal' ? strings.EDITABLE_TABLE_ADD_ROW : strings.EDITABLE_TABLE_ADD_TABLE}
      />
    </>
  );
};

export default DeliverableEditableTableEdit;
