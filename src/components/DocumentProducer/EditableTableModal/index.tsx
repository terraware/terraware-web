import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Button, DatePicker, Dropdown, DropdownItem, Textfield } from '@terraware/web-components';

import PageDialog from 'src/components/DocumentProducer/PageDialog';
import VariableWorkflowDetails from 'src/components/DocumentProducer/VariableWorkflowDetails';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { NonSelectTableCellValue } from 'src/hooks/useProjectVariablesUpdate/util';
import { useLocalization, useUser } from 'src/providers';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestUpdateVariableWorkflowDetails } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  TableColumn,
  TableVariableWithValues,
  UpdateVariableWorkflowDetailsPayload,
} from 'src/types/documentProducer/Variable';
import {
  AppendVariableValueOperation,
  NewSelectValuePayload,
  UpdateVariableValuesRequestWithProjectId,
  VariableValue,
  VariableValueSelectValue,
} from 'src/types/documentProducer/VariableValue';

import { VariableTableCell, cellValue, getInitialCellValues, newValueFromEntry } from './helpers';

type EditableTableEditProps = {
  display?: boolean;
  variable: TableVariableWithValues;
  projectId: number;
  onFinish: (edited: boolean) => void;
  onCancel: () => void;
  setUpdateWorkflowRequestId?: (requestId: string) => void;
  showVariableHistory: () => void;
};

const EditableTableEdit = ({
  display: displayProp = false,
  variable,
  projectId,
  onCancel,
  onFinish,
  setUpdateWorkflowRequestId,
  showVariableHistory,
}: EditableTableEditProps) => {
  const activeLocale = useLocalization();
  const columns = useMemo<TableColumn[]>(() => variable.columns, [variable]);
  const initialCellValues = useMemo<VariableTableCell[][]>(() => getInitialCellValues(variable), [variable]);
  const [cellValues, setCellValues] = useState<VariableTableCell[][]>(initialCellValues);
  const { isAllowed } = useUser();
  const [display, setDisplay] = useState<boolean>(displayProp);

  const dispatch = useAppDispatch();
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));

  const [updateVariableWorkflowDetailsRequestId, setUpdateVariableWorkflowDetailsRequestId] = useState<string>('');
  const updateVariableWorkflowDetailsRequest = useAppSelector(
    selectUpdateVariableWorkflowDetails(updateVariableWorkflowDetailsRequestId)
  );

  const variableValue: VariableValue | undefined = (variable?.variableValues || []).find(
    (value) => value.variableId === variable.id
  );

  const [variableWorkflowDetails, setVariableWorkflowDetails] = useState<UpdateVariableWorkflowDetailsPayload>({
    feedback: variableValue?.feedback,
    internalComment: variableValue?.internalComment,
    status: variableValue?.status || 'Not Submitted',
  });

  useEffect(() => {
    if (updateVariableValuesRequest?.status === 'success' && !updateVariableWorkflowDetailsRequestId) {
      const request = dispatch(
        requestUpdateVariableWorkflowDetails({
          feedback: variableWorkflowDetails?.feedback,
          internalComment: variableWorkflowDetails?.internalComment,
          projectId,
          status: variableWorkflowDetails.status,
          variableId: variable.id,
        })
      );
      setUpdateVariableWorkflowDetailsRequestId(request.requestId);
      setUpdateWorkflowRequestId?.(request.requestId);
    }
  }, [
    dispatch,
    projectId,
    setUpdateWorkflowRequestId,
    updateVariableValuesRequest,
    updateVariableWorkflowDetailsRequestId,
    variable.id,
    variableWorkflowDetails,
  ]);

  const addRow = useCallback(() => {
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
    setCellValues([...cellValues, newRow]);
  }, [cellValues, columns]);

  useEffect(() => {
    if (initialCellValues.length === 0 && cellValues.length === 0) {
      // if there are no initial values, add a row
      addRow();
    }
  }, [addRow, cellValues, initialCellValues]);

  const handleSave = useCallback(() => {
    if (columns.length === 0) {
      return;
    }
    const update: UpdateVariableValuesRequestWithProjectId = {
      operations: [],
      projectId,
    };

    initialCellValues.forEach((row) => {
      const rowId = row[0].rowId;
      if (rowId !== undefined) {
        const foundRow = cellValues.find((r) => r[0].rowId === rowId);
        if (foundRow === undefined) {
          // delete operations
          update.operations.push({
            operation: 'Delete',
            valueId: rowId,
            existingValueId: rowId,
          });
        } else {
          // replace operations
          row.forEach((cell) => {
            const foundCell = foundRow.find((c) => c.colId === cell.colId);
            if (foundCell !== undefined && foundCell.changed) {
              const newValues =
                foundCell.values && foundCell.type === 'Select'
                  ? [
                      {
                        ...(foundCell.values[0] as VariableValueSelectValue),
                        optionIds: (foundCell.values[0] as VariableValueSelectValue).optionValues,
                      } as NewSelectValuePayload,
                    ]
                  : foundCell.values?.filter((v): v is NonSelectTableCellValue => v.type !== 'Deleted');
              update.operations.push({
                operation: 'Replace',
                rowValueId: rowId,
                variableId: cell.colId,
                values: newValues ?? [],
              });
            }
          });
        }
      }
    });

    // add row operations
    const newRows = cellValues.filter((row) => row[0].rowId === undefined);
    newRows.forEach((newRow) => {
      // append row
      update.operations.push({
        operation: 'Append',
        variableId: variable.id,
        value: {
          type: 'Table',
        },
      });

      // create values (will automatically assign to the last created row)
      newRow.forEach((newCell) => {
        if (newCell.values !== undefined) {
          const newOp: AppendVariableValueOperation =
            newCell.type === 'Select'
              ? {
                  operation: 'Append',
                  variableId: newCell.colId,
                  value: {
                    ...newCell.values[0],
                    optionIds: (newCell.values[0] as VariableValueSelectValue).optionValues,
                  } as NewSelectValuePayload,
                }
              : {
                  operation: 'Append',
                  variableId: newCell.colId,
                  value: newCell.values[0] as NonSelectTableCellValue,
                };
          update.operations.push(newOp);
        }
      });
    });

    // dispatch
    const request = dispatch(requestUpdateVariableValues(update));
    setUpdateVariableValuesRequestId(request.requestId);
  }, [initialCellValues, cellValues, columns.length, dispatch, projectId, variable.id]);

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
    setCellValues(newCellValues);
  };

  const removeRow = (rowNum: number) => {
    const newCellValues = [...cellValues];
    newCellValues.splice(rowNum, 1);
    setCellValues(newCellValues);
  };

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.VIEW_HISTORY,
              value: 'view_history',
            },
          ]
        : [],
    [activeLocale]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'view_history': {
          showVariableHistory();
          break;
        }
      }
    },
    [showVariableHistory]
  );

  return (
    <PageDialog
      workflowState={
        updateVariableValuesRequest?.status === 'success'
          ? updateVariableWorkflowDetailsRequest
          : updateVariableValuesRequest
      }
      onSuccess={onFinish}
      onClose={onCancel}
      open={true}
      title={strings.VARIABLE_DETAILS}
      size='x-large'
      scrolled={true}
      middleButtons={
        display
          ? undefined
          : [
              <Button
                id='edit-table-cancel'
                label={strings.CANCEL}
                priority='secondary'
                type='passive'
                onClick={onCancel}
                key='button-1'
              />,
              <Button id='edit-table-save' label={strings.SAVE} onClick={handleSave} key='button-2' />,
            ]
      }
    >
      <>
        <OptionsMenu
          onOptionItemClick={onOptionItemClick}
          optionItems={optionItems}
          priority='secondary'
          size='small'
          sx={{ float: 'right' }}
          type='passive'
        />
        {display && isAllowed('UPDATE_DELIVERABLE') && (
          <Button
            icon='iconEdit'
            id='edit-variable'
            label={strings.EDIT}
            onClick={() => {
              setDisplay(false);
            }}
            priority='secondary'
            sx={{ float: 'right' }}
            type='passive'
          />
        )}
      </>
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
                        display={display}
                        id={`${cell.rowId}-${cell.colId}`}
                        column={columns[colNum]}
                        onChange={(value) => setCellValue(rowNum, colNum, value as string | number)}
                        value={(cell.values?.length ?? 0) > 0 ? cellValue(cell.values![0]) : undefined}
                      />
                    </TableCell>
                  ))}
                  {cellValues.length > 1 && !display ? (
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
                                display={display}
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

              {!display && (
                <Button
                  onClick={() => removeRow(index)}
                  icon='cancel'
                  type='passive'
                  priority='ghost'
                  size='medium'
                  label={strings.EDITABLE_TABLE_REMOVE_TABLE}
                />
              )}
            </Box>
          ))}
        </>
      )}

      {!display && (
        <Button
          onClick={addRow}
          icon={'iconAdd'}
          type='productive'
          priority='ghost'
          size='medium'
          label={
            variable.tableStyle === 'Horizontal' ? strings.EDITABLE_TABLE_ADD_ROW : strings.EDITABLE_TABLE_ADD_TABLE
          }
        />
      )}

      <VariableWorkflowDetails
        display={display}
        setVariableWorkflowDetails={setVariableWorkflowDetails}
        variableWorkflowDetails={variableWorkflowDetails}
      />
    </PageDialog>
  );
};

export type EditableCellProps = {
  display?: boolean;
  id: string;
  column: TableColumn;
  onChange: (value: unknown) => void;
  value?: string | number;
};

export const EditableCell = ({ display, id, column, onChange, value }: EditableCellProps) => {
  switch (column.variable.type) {
    case 'Text':
      return <Textfield display={display} label='' id={id} type='text' onChange={onChange} value={value} />;
    case 'Number':
      return (
        <Textfield
          display={display}
          label=''
          id={id}
          type='number'
          min={column.variable.minValue}
          max={column.variable.maxValue}
          onChange={onChange}
          value={value}
        />
      );
    case 'Date':
      return (
        <DatePicker id={id} label='' onChange={onChange} value={value as string} aria-label={`${id}-datepicker`} />
      );
    case 'Select': {
      const options = column.variable.options;
      return (
        <Dropdown
          onChange={onChange}
          options={options.map((opt) => ({
            label: opt.name,
            value: opt.id,
          }))}
          selectedValue={value}
          fullWidth={true}
          selectStyles={{ optionsContainer: { width: 'auto' } }}
        />
      );
    }
    default:
      return null;
  }
};

export default EditableTableEdit;
