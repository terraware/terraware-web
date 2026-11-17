import { ProjectsWithVariablesSearchResult } from 'src/queries/search/projectsWithVariables';
import { VariableUnion } from 'src/types/documentProducer/Variable';
import { NewNonSectionValuePayloadUnion, Operation } from 'src/types/documentProducer/VariableValue';

export type MatrixVariable = ProjectsWithVariablesSearchResult['variables'][number] | VariableUnion;
export type MatrixValue = string | number | string[];

export const buildMatrixValueOperation = (
  variable: MatrixVariable,
  value: NewNonSectionValuePayloadUnion
): Operation | undefined => {
  const values = 'values' in variable ? variable.values : undefined;
  const valueId = variable.isList?.toString() === 'true' ? undefined : values?.[0]?.variableValueId;
  if (valueId) {
    return { operation: 'Update', valueId: Number(valueId), existingValueId: Number(valueId), value };
  }
  if (variable.id) {
    return { operation: 'Append', variableId: Number(variable.id), value };
  }
};

export const buildMatrixValue = (type: string, value: MatrixValue): NewNonSectionValuePayloadUnion | undefined => {
  switch (type) {
    case 'Text':
      return { type, textValue: String(value) };
    case 'Number':
      return { type, numberValue: Number(value) };
    case 'Select':
      return { type, optionIds: (Array.isArray(value) ? value : value === '' ? [] : [value]).map(Number) };
    case 'Date':
      return { type, dateValue: String(value) };
    case 'Email':
      return { type, emailValue: String(value) };
    case 'Link':
      return { type, url: String(value) };
    default:
      return undefined;
  }
};
