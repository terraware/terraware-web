import {
  VariableTableCell,
  cellValue,
  getInitialCellValues,
} from 'src/components/DocumentProducer/EditableTableModal/helpers';
import { TableVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import {
  AppendVariableValueOperation,
  DeletedVariableValue,
  ImageVariableValue,
  NewDateValuePayload,
  NewEmailValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  Operation,
  SectionTextVariableValue,
  SectionVariableVariableValue,
  TableVariableValue,
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';
import { isValueEmpty } from 'src/utils/documentProducer/variables';

export type NonSelectTableCellValue = Exclude<
  VariableValueValue,
  | DeletedVariableValue
  | VariableValueSelectValue
  | ImageVariableValue
  | SectionTextVariableValue
  | SectionVariableVariableValue
  | TableVariableValue
>;

// TODO this was taken from the pdd-web code, but there is no test, it definitely seems test-worthy
export const makeVariableValueOperations = ({
  pendingCellValues = [],
  pendingValues,
  removedValue,
  variable,
}: {
  pendingCellValues?: VariableTableCell[][];
  pendingValues: VariableValueValue[];
  removedValue?: VariableValueValue;
  variable: VariableWithValues;
}) => {
  const operations: Operation[] = [];

  let newValue:
    | NewDateValuePayload
    | NewEmailValuePayload
    | NewNumberValuePayload
    | NewSelectValuePayload
    | NewLinkValuePayload
    | undefined;

  let newTextValues: NewTextValuePayload[] = [];
  let valueIdToUpdate = -1;

  if (variable.type === 'Text') {
    const firstValue = pendingValues[0] as VariableValueTextValue;
    valueIdToUpdate = firstValue.id;

    newTextValues = pendingValues.reduce((acc: NewTextValuePayload[], nV: VariableValueValue) => {
      if (nV.type === 'Text') {
        acc.push({ type: 'Text', textValue: nV.textValue });
      }
      return acc;
    }, []);
  }

  if (variable.type === 'Number') {
    const firstValue = pendingValues[0] as VariableValueNumberValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Number', numberValue: firstValue.numberValue, citation: firstValue.citation };
  }

  if (variable.type === 'Select') {
    const firstValue = pendingValues[0] as VariableValueSelectValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Select', optionIds: firstValue.optionValues, citation: firstValue.citation };
  }

  if (variable.type === 'Date') {
    const firstValue = pendingValues[0] as VariableValueDateValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Date', dateValue: firstValue.dateValue, citation: firstValue.citation };
  }

  if (variable.type === 'Email') {
    const firstValue = pendingValues[0] as VariableValueEmailValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Email', emailValue: firstValue.emailValue, citation: firstValue.citation };
  }

  if (variable.type === 'Link') {
    const firstValue = pendingValues[0] as VariableValueLinkValue;
    valueIdToUpdate = firstValue.id;
    newValue = { type: 'Link', url: firstValue.url, citation: firstValue.citation, title: firstValue.title };
  }

  if (variable.type === 'Table') {
    const columns = variable.columns;
    const initialCellValues: VariableTableCell[][] = getInitialCellValues(variable as TableVariableWithValues);
    const cellValues = [...initialCellValues, ...pendingCellValues];

    if (columns.length === 0) {
      return operations;
    }

    // delete/replace existing operations
    initialCellValues.forEach((row) => {
      const rowId = row[0].rowId;
      if (rowId !== undefined) {
        const foundRow = pendingCellValues.find((r) => r[0].rowId === rowId);
        if (foundRow === undefined) {
          // delete operations
          operations.push({
            operation: 'Delete',
            valueId: rowId,
            existingValueId: rowId,
          });
        } else if (
          foundRow.every((cell) => {
            const foundCell = foundRow.find((c) => c.colId === cell.colId);
            if (foundCell !== undefined && foundCell.changed) {
              return (
                foundCell.values === undefined ||
                foundCell.values.length === 0 ||
                cellValue(foundCell.values[0]).toString() === ''
              );
            } else {
              return (
                cell.values === undefined || cell.values.length === 0 || cellValue(cell.values[0]).toString() === ''
              );
            }
          })
        ) {
          // delete entirely empty row
          operations.push({
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
                        ...foundCell.values[0],
                        optionIds: (foundCell.values[0] as VariableValueSelectValue).optionValues,
                      } as NewSelectValuePayload,
                    ]
                  : foundCell.values?.filter((v): v is NonSelectTableCellValue => v.type !== 'Deleted');

              if (foundCell.values && foundCell.values.length > 0 && cellValue(foundCell.values[0]).toString() !== '') {
                operations.push({
                  operation: 'Replace',
                  rowValueId: rowId,
                  variableId: cell.colId,
                  values: newValues ?? [],
                });
              } else if (cell.values && cell.values.length > 0) {
                operations.push({
                  existingValueId: cell.values[0].id,
                  operation: 'Delete',
                  valueId: cell.values[0].id,
                });
              }
            }
          });
        }
      }
    });

    // add row operations
    const newRows = cellValues.filter((row) => row[0].rowId === undefined);
    newRows.forEach((newRow) => {
      // append row
      operations.push({
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
          operations.push(newOp);
        }
      });
    });

    return operations;
  }

  if (newValue) {
    if (pendingValues[0].id !== -1) {
      if (!isValueEmpty(newValue)) {
        operations.push({
          operation: 'Update',
          valueId: valueIdToUpdate,
          value: newValue,
          existingValueId: valueIdToUpdate,
        });
      } else {
        operations.push({
          existingValueId: pendingValues[0].id,
          operation: 'Delete',
          valueId: pendingValues[0].id,
        });
      }
    } else if (!isValueEmpty(newValue)) {
      operations.push({ operation: 'Append', variableId: variable.id, value: newValue });
    }
  }

  if (newTextValues) {
    newTextValues.forEach((nV, index) => {
      if (pendingValues[index].id !== -1) {
        if (!isValueEmpty(nV)) {
          operations.push({
            existingValueId: pendingValues[index].id,
            operation: 'Update',
            valueId: pendingValues[index].id,
            value: nV,
          });
        } else {
          operations.push({
            existingValueId: pendingValues[index].id,
            operation: 'Delete',
            valueId: pendingValues[index].id,
          });
        }
      } else if (!isValueEmpty(nV)) {
        operations.push({ operation: 'Append', variableId: variable.id, value: nV });
      }
    });

    // Delete list of values removed
    if (removedValue) {
      operations.push({
        existingValueId: removedValue.id,
        operation: 'Delete',
        valueId: removedValue.id,
      });
    }
  }

  return operations;
};
