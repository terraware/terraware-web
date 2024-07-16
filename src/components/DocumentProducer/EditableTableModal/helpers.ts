import { TableColumnWithValues, TableVariableWithValues, VariableType } from 'src/types/documentProducer/Variable';
import { VariableValueTableValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

export type CellVariableType = Omit<VariableType, 'Section'>;

export type VariableTableCell = {
  type: CellVariableType;
  rowId: number | undefined;
  colId: number;
  values: VariableValueValue[] | undefined;
  changed: boolean;
};

export const getCellValues = (
  row: VariableValueTableValue,
  col: TableColumnWithValues
): VariableValueValue[] | undefined => {
  return col.variable.variableValues.find((val) => val.rowValueId === row.id)?.values;
};

export const newValueFromEntry = (value: string | number, type: CellVariableType): VariableValueValue | undefined => {
  switch (type) {
    case 'Text':
      return {
        id: -1,
        listPosition: 0,
        type: 'Text',
        textValue: value as string,
      };
    case 'Number':
      return {
        id: -1,
        listPosition: 0,
        type: 'Number',
        numberValue: Number(value),
      };
    case 'Date':
      return {
        id: -1,
        listPosition: 0,
        type: 'Date',
        dateValue: value as string,
      };
    case 'Select':
      return {
        id: -1,
        listPosition: 0,
        type: 'Select',
        optionValues: [value as number],
      };
    default:
      return undefined;
  }
};

export const cellValue = (value: VariableValueValue, placeholder?: string): string | number => {
  switch (value.type) {
    case 'Text':
      return value.textValue;
    case 'Number':
      return value.numberValue;
    case 'Link':
      return value.title ?? value.url;
    case 'Date':
      return value.dateValue;
    case 'Select':
      return value.optionValues[0];
    default:
      return placeholder ?? '';
  }
};

export const getInitialCellValues = (variable: TableVariableWithValues): VariableTableCell[][] => {
  return variable.values.map((row) =>
    variable.columns.map((col) => ({
      type: col.variable.type,
      rowId: row.id,
      colId: col.variable.id,
      values: getCellValues(row, col as TableColumnWithValues),
      changed: false,
    }))
  );
};
