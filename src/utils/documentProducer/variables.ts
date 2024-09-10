import { VariableWithValues, isSelectVariable, isTextVariable } from 'src/types/documentProducer/Variable';
import {
  isNumberVariableValue,
  isSelectVariableValue,
  isTextVariableValue,
} from 'src/types/documentProducer/VariableValue';
import { isArrayOfT, isNumber } from 'src/types/utils';

export const variableDependencyMet = (variable: VariableWithValues, allVariables: VariableWithValues[]): boolean => {
  if (
    !(variable.dependencyCondition && variable.dependencyVariableStableId && variable.dependencyValue !== undefined)
  ) {
    return true;
  }

  const dependsOnVariable = allVariables.find(
    (_variable: VariableWithValues) => _variable.stableId === variable.dependencyVariableStableId
  );

  if (!dependsOnVariable) {
    return false;
  }

  const rawDependsOnValue = getRawValue(dependsOnVariable);

  if (rawDependsOnValue === undefined) {
    return false;
  }

  switch (variable.dependencyCondition) {
    case 'eq':
      if (isSelectVariable(dependsOnVariable) && isArrayOfT(rawDependsOnValue, isNumber)) {
        const optionIdOfDependencyValue = dependsOnVariable.options.find(
          // Remove double-quoutes here. But we likely want to update that in the spreadsheet instead.
          (option) => option.name === variable.dependencyValue?.replace(/"/g, '')
        )?.id;
        if (!optionIdOfDependencyValue) {
          // This means the value listed as the dependency value doesn't exist within the depended on variable
          return false;
        }

        return rawDependsOnValue.includes(optionIdOfDependencyValue);
      }

      if (isTextVariable(dependsOnVariable)) {
        return variable.dependencyValue.toLowerCase() === `${rawDependsOnValue}`.toLowerCase();
      }

      return variable.dependencyValue == rawDependsOnValue;
    case 'gt':
      return Number(rawDependsOnValue) > Number(variable.dependencyValue);
    case 'gte':
      return Number(rawDependsOnValue) >= Number(variable.dependencyValue);
    case 'lt':
      return Number(rawDependsOnValue) < Number(variable.dependencyValue);
    case 'lte':
      return Number(rawDependsOnValue) <= Number(variable.dependencyValue);
    case 'neq':
      if (isTextVariable(dependsOnVariable)) {
        return variable.dependencyValue.toLowerCase() !== `${rawDependsOnValue}`.toLowerCase();
      }

      return variable.dependencyValue != rawDependsOnValue;
  }
};

export const getRawValue = (variable: VariableWithValues): number | number[] | string | undefined => {
  const firstValue = variable.values[0];

  if (!firstValue) {
    return;
  }

  switch (true) {
    case isNumberVariableValue(firstValue):
      return firstValue.numberValue;
    case isTextVariableValue(firstValue):
      return firstValue.textValue;
    case isSelectVariableValue(firstValue):
      return firstValue.optionValues;
  }
};

export const missingRequiredFields = (variablesWithValues: VariableWithValues[]) => {
  const allRequiredVariables = variablesWithValues.filter(
    (v) => v.isRequired && variableDependencyMet(v, variablesWithValues)
  );

  const missingRequiredFields = allRequiredVariables.some((variable) => {
    let hasEmptyValue = false;
    const values = variable.values;
    if (
      !values ||
      values.length === 0 ||
      ((variable.type === 'Text' || variable.type === 'Number' || variable.type === 'Select') &&
        (getRawValue(variable) === undefined || getRawValue(variable) === ''))
    ) {
      hasEmptyValue = true;
    }
    return hasEmptyValue;
  });

  return missingRequiredFields;
};
