import { VariableWithValues, isSelectVariable } from 'src/types/documentProducer/Variable';
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

  switch (variable.dependencyCondition) {
    case 'eq':
      if (isSelectVariable(dependsOnVariable) && isArrayOfT(rawDependsOnValue, isNumber)) {
        return rawDependsOnValue.includes(Number(variable.dependencyValue));
      }
      return variable.dependencyValue == rawDependsOnValue;
    case 'gt':
      if (!rawDependsOnValue) {
        return false;
      }
      return Number(rawDependsOnValue) > Number(variable.dependencyValue);
    case 'gte':
      if (!rawDependsOnValue) {
        return false;
      }
      return Number(rawDependsOnValue) >= Number(variable.dependencyValue);
    case 'lt':
      if (!rawDependsOnValue) {
        return true;
      }
      return Number(rawDependsOnValue) < Number(variable.dependencyValue);
    case 'lte':
      if (!rawDependsOnValue) {
        return true;
      }
      return Number(rawDependsOnValue) <= Number(variable.dependencyValue);
    case 'neq':
      return variable.dependencyValue != rawDependsOnValue;
  }
};

const getRawValue = (variable: VariableWithValues): number | number[] | string | undefined => {
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
