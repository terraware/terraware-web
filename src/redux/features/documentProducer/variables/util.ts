import {
  TableColumn,
  TableColumnWithValues,
  TableVariable,
  TableVariableWithValues,
  Variable,
  VariableUnion,
  VariableWithValues,
  isTableVariable,
} from 'src/types/documentProducer/Variable';
import { VariableValue, VariableValueTableValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

type StableId = string;
type VariableId = number;

const findOutdatedVariable = (variableList: VariableUnion[], variable: Variable): VariableUnion | undefined =>
  variableList.find((_variable) => _variable.id === variable.replacesVariableId);

const findOutdatedVariableValues = (
  variable: Variable,
  values: VariableValue[],
  variableList: VariableUnion[],
  tableVariable?: TableVariable
): VariableValue[] => {
  if (!variable.replacesVariableId) {
    return [];
  }

  let outdatedVariable: VariableUnion | undefined;

  if (tableVariable) {
    const outdatedTableVariable = findOutdatedVariable(variableList, tableVariable);
    if (isTableVariable(outdatedTableVariable)) {
      outdatedVariable = findOutdatedVariable(
        outdatedTableVariable?.columns.map((column) => column.variable as Variable),
        variable
      );
    }
  } else {
    outdatedVariable = findOutdatedVariable(variableList, variable);
  }

  if (!outdatedVariable) {
    return [];
  }

  const outdatedVariableValues: VariableValue[] = values.filter(
    (val: VariableValue) => val.variableId === outdatedVariable.id
  );

  return [
    ...outdatedVariableValues,
    ...findOutdatedVariableValues(outdatedVariable, values, variableList, tableVariable),
  ];
};

export const associateNonSectionVariableValues = (
  variable: Variable,
  values: VariableValue[],
  variableList: VariableUnion[],
  stableIdToCurrentVariableId: Map<StableId, VariableId>,
  tableVariable?: TableVariable
): VariableWithValues => {
  const currentValue: VariableValue | undefined = values.find((val: VariableValue) => val.variableId === variable.id);

  // If this variable replaces another one, we should see if there are "old" values
  // associated to the previous versions of variables
  let outdatedVariableValues = findOutdatedVariableValues(variable, values, variableList, tableVariable);
  if (outdatedVariableValues.length) {
    // console.log({ outdatedVariableValues, values: outdatedVariableValues.flatMap((v) => v.values) });
  }

  const currentValues = currentValue?.values ?? [];
  const outdatedValues = outdatedVariableValues.flatMap((v) => v.values);
  let returnValues: VariableValueValue[] = [];

  // If this is a table, and there are outdated values and no current values, we only want to return the outdated values.
  // The "values" of a table are actually the rows, and the columns will have values for those rows. We do not want to show
  // the "empty" rows (rows without values)
  if (isTableVariable(variable) && outdatedValues.length) {
    returnValues = outdatedValues;
  } else {
    returnValues = [...currentValues, ...outdatedValues];
  }

  const variablesInVariable: number[] = returnValues
    .map((value: VariableValueValue) => ('variableId' in value ? value.variableId : false))
    .filter((variableId: number | false): variableId is number => variableId === 0 || !!variableId);

  const relevantOutdatedVariableValues = outdatedVariableValues.filter((_variableValue) =>
    returnValues.find((returnValue) => _variableValue.values.find((_value) => _value.id === returnValue.id))
  );

  // Link up the variable values that are referenced within this variable
  let variableValues = [];
  if (isTableVariable(variable) && relevantOutdatedVariableValues.length) {
    variableValues = relevantOutdatedVariableValues;
  } else {
    variableValues = [
      ...values.filter((val) => val.variableId === variable.id || variablesInVariable.includes(val.variableId)),
      ...relevantOutdatedVariableValues,
    ];
  }

  if (isTableVariable(variable)) {
    let columns: TableColumnWithValues[] = [];
    if (variable.columns) {
      columns = variable.columns.map((col) => {
        const _variable = associateNonSectionVariableValues(
          col.variable as Variable,
          values,
          variableList,
          stableIdToCurrentVariableId,
          variable
        );
        return {
          ...col,
          variable: _variable,
        };
      });
    }

    return {
      ...variable,
      columns,
      values: returnValues,
      variableValues,
    };
  }

  return {
    ...variable,
    values: returnValues,
    variableValues,
  };
};

///////////////////////////////////////////////////////////////////////////

// For each current version of a variable, we need to determine if there are values
// If there are values, we can return the variable and its values
// If there are not values, we should see if we have information about outdated versions of this variable, and see if those have values
// If an outdated variable value is found, we need to embed the ID of the current version of the variable into that value, so we can use the current version to modify it if needed

const findVariable = (variables: VariableUnion[], variableId: VariableId | undefined): VariableUnion | undefined =>
  variables.find((variable: VariableUnion) => variable.id === variableId);

const findVariableValue = (
  variableValues: VariableValue[],
  variableId: VariableId | undefined
): VariableValue | undefined =>
  variableValues.find((variableValue: VariableValue) => variableValue.variableId === variableId);

const findVariableValues = (variableValues: VariableValue[], variableId: VariableId | undefined): VariableValue[] =>
  variableValues.filter((variableValue: VariableValue) => variableValue.variableId === variableId);

const findOutdatedVariableValue = (variables: VariableUnion[], variableValues: VariableValue[], variable: Variable) => {
  const nextOutdatedVariable = findVariable(variables, variable.replacesVariableId);
  if (!nextOutdatedVariable) {
    return undefined;
  }

  const outdatedVariableValue = findVariableValue(variableValues, nextOutdatedVariable.id);
  // Keep searching to see if there is an even older variable version with values
  if (!outdatedVariableValue) {
    return findOutdatedVariableValue(variables, variableValues, nextOutdatedVariable);
  }

  return outdatedVariableValue;
};

// Find the closest outdated table variable that has cell values
const findOutdatedTableVariableValue = (
  variables: VariableUnion[],
  variableValues: VariableValue[],
  variable: TableVariable
) => {
  const nextOutdatedVariable = findVariable(variables, variable.replacesVariableId) as TableVariable;
  const nextOutdatedVariableValue = findVariableValue(variableValues, nextOutdatedVariable.id);
  if (!nextOutdatedVariable || !nextOutdatedVariableValue) {
    return undefined;
  }

  // If this table doesn't have any cell values, keep looking for another outdated one with values
  if (!tableHasCellValues(variableValues, nextOutdatedVariable, nextOutdatedVariableValue)) {
    return findOutdatedTableVariableValue(variables, variableValues, nextOutdatedVariable);
  }

  return nextOutdatedVariableValue;
};

const getTableColumnVariables = (tableVariable: TableVariable): VariableUnion[] =>
  tableVariable.columns.map((column) => column.variable as VariableUnion);

const associateTableColumnVariableValues = (
  variables: VariableUnion[],
  variableValues: VariableValue[],
  replacementVariableIds: Map<VariableId, ReplacementVariableId | undefined>,
  column: TableColumn,
  parentTableVariable: TableVariable
): TableColumnWithValues => {
  const returnVariable = findVariable(getTableColumnVariables(parentTableVariable), column.variable.id);
  if (!returnVariable) {
    return {
      ...column,
      variable: {
        ...(column.variable as VariableUnion),
        values: [],
        variableValues: [],
      },
    };
  }

  const returnVariableValues = findVariableValues(variableValues, returnVariable.id);

  const returnValues = returnVariableValues.flatMap((returnVariableValue) => returnVariableValue.values);

  return {
    ...column,
    variable: {
      ...returnVariable,
      values: returnValues,
      variableValues: returnVariableValues,
    },
  };
};

const associateOutdatedTableColumnVariableValues = (
  variables: VariableUnion[],
  variableValues: VariableValue[],
  replacementVariableIds: Map<VariableId, ReplacementVariableId | undefined>,
  currentColumn: TableColumn,
  outdatedParentTableVariable: TableVariable,
  outdatedParentTableVariableValue: VariableValue
): TableColumnWithValues => {
  const outdatedColumn = findVariable(
    getTableColumnVariables(outdatedParentTableVariable),
    currentColumn.variable.replacesVariableId
  );

  // Since the columns are attached directly to the table version, if we can't find an outdated column, there is nothing to do
  if (!outdatedColumn) {
    return {
      ...currentColumn,
      variable: {
        ...(currentColumn.variable as VariableUnion),
        values: [],
        variableValues: [],
      },
    };
  }

  // These are the column variable values
  const returnVariableValues = findVariableValues(variableValues, outdatedColumn.id);

  // These are the cells
  const returnValues = returnVariableValues.flatMap((returnVariableValue) => returnVariableValue.values);

  return {
    ...currentColumn,
    variable: {
      ...currentColumn.variable,
      replacementColumnVariableId: replacementVariableIds.get(returnVariableValues[0]?.variableId),
      values: returnValues,
      variableValues: returnVariableValues,
    },
  };
};

const findCellVariableValue = (
  variableValues: VariableValue[],
  rowId: number,
  columnId: number
): VariableValue | undefined =>
  variableValues.find(
    (variableValue: VariableValue) => variableValue.rowValueId === rowId && variableValue.variableId === columnId
  );

const tableHasCellValues = (
  variableValues: VariableValue[],
  tableVariable: TableVariable,
  tableVariableValue: VariableValue
): boolean => {
  const rowIds = tableVariableValue.values.map((rowVariableValue) => rowVariableValue.id);
  const columnIds = tableVariable.columns.map((column) => column.variable.id);

  let cellWithValues: VariableValue | undefined;

  for (const rowId of rowIds) {
    for (const columnId of columnIds) {
      cellWithValues = findCellVariableValue(variableValues, rowId, columnId);
      if (cellWithValues) {
        return true;
      }
    }
  }

  return false;
};

const associateTableVariableValues = (
  variables: VariableUnion[],
  variableValues: VariableValue[],
  replacementVariableIds: Map<VariableId, ReplacementVariableId | undefined>,
  variable: TableVariable
): TableVariableWithValues => {
  let columns: TableColumnWithValues[] = [];
  let returnValues: VariableValueTableValue[] = [];
  let returnVariableValues: VariableValue[] = [];

  const currentVariableValue = findVariableValue(variableValues, variable.id);

  if (currentVariableValue && tableHasCellValues(variableValues, variable, currentVariableValue)) {
    returnVariableValues = [currentVariableValue];
    returnValues = currentVariableValue.values as VariableValueTableValue[];
    columns = variable.columns.map((column: TableColumn) => {
      return associateTableColumnVariableValues(variables, variableValues, replacementVariableIds, column, variable);
    });
  } else {
    // If there are no current values, we need to look for outdated ones
    const outdatedParentTableVariable = findOutdatedVariable(variables, variable);
    const outdatedParentTableVariableValue = findOutdatedTableVariableValue(variables, variableValues, variable);

    if (outdatedParentTableVariable && outdatedParentTableVariableValue) {
      returnVariableValues = [
        {
          ...outdatedParentTableVariableValue,
          replacementVariableId: variable.id,
        },
      ];
      returnValues = outdatedParentTableVariableValue.values as VariableValueTableValue[];
      columns = variable.columns.map((column: TableColumn) => {
        return associateOutdatedTableColumnVariableValues(
          variables,
          variableValues,
          replacementVariableIds,
          column,
          outdatedParentTableVariable as TableVariable,
          outdatedParentTableVariableValue
        );
      });
    }
  }

  if (!variable.columns || variable.columns.length === 0) {
    // This is a table with no columns, is that possible?
    return {
      ...variable,
      values: returnValues,
      variableValues: returnVariableValues,
    };
  }

  return {
    ...variable,
    columns,
    values: returnValues,
    variableValues: returnVariableValues,
  };
};

export const associateNonSectionVariableValuesV2 = (
  variables: VariableUnion[],
  variableValues: VariableValue[],
  replacementVariableIds: Map<VariableId, ReplacementVariableId | undefined>,
  variable: Variable
): VariableWithValues => {
  if (isTableVariable(variable)) {
    return associateTableVariableValues(variables, variableValues, replacementVariableIds, variable);
  }
};

const getCurrentVariableIds = (variables: Variable[]): Map<StableId, VariableId> => {
  const stableIdToCurrentVariableId = new Map<StableId, VariableId>();

  variables.forEach((variable: Variable) => {
    const { stableId, id: variableId } = variable;
    const current = stableIdToCurrentVariableId.get(stableId) || 0;
    if (current < variableId) {
      stableIdToCurrentVariableId.set(stableId, variableId);
    }
  });

  return stableIdToCurrentVariableId;
};

type ReplacementVariableId = VariableId;
const getReplacementVariableIds = (variables: Variable[]) => {
  const variableReplacements: [VariableId, ReplacementVariableId | undefined][] = variables.map(
    (variable): [VariableId, ReplacementVariableId | undefined] => [
      variable.id,
      variables.find((_variable) => _variable.replacesVariableId === variable.id)?.id,
    ]
  );

  // Table columns are inside of the table, so to find the replacement for the column, we must find the replacement for the table
  const columnReplacements: [VariableId, ReplacementVariableId | undefined][] = variables
    .filter(isTableVariable)
    .flatMap((tableVariable): [VariableId, ReplacementVariableId | undefined][] => {
      const replacementTableVariable = variables.find(
        (_variable) => _variable.replacesVariableId === tableVariable.id
      ) as TableVariable;

      return tableVariable.columns.map((column): [VariableId, ReplacementVariableId | undefined] => [
        column.variable.id,
        replacementTableVariable?.columns.find((_column) => _column.variable.replacesVariableId === column.variable.id)
          ?.variable.id,
      ]);
    });

  return new Map<VariableId, ReplacementVariableId | undefined>([...variableReplacements, ...columnReplacements]);
};

export const mergeVariablesAndValues = (
  variables: VariableUnion[],
  variableValues: VariableValue[]
): VariableWithValues[] => {
  const stableIdToCurrentVariableId = getCurrentVariableIds(variables);
  const replacementVariableIds = getReplacementVariableIds(variables);

  return (
    variables
      // If the project has values for outdated variables in the deliverable, they will be returned
      // in the API response and the values for the outdated variables will be merged into the current
      // version of the variable within `associatedNonSectionVariableValues`.
      // Filter out any variables that aren't the current version of that variable
      .filter((variable) => stableIdToCurrentVariableId.get(variable.stableId) === variable.id)
      .map((variable) =>
        associateNonSectionVariableValuesV2(variables, variableValues, replacementVariableIds, variable)
      )
  );
};
