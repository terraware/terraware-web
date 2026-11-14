import React from 'react';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { ProjectsWithVariablesSearchResult } from 'src/queries/search/projectsWithVariables';
import { VariableUnion } from 'src/types/documentProducer/Variable';
import { NewNonSectionValuePayloadUnion, Operation } from 'src/types/documentProducer/VariableValue';

export type MatrixRow = ProjectsWithVariablesSearchResult;
export type MatrixVariable = MatrixRow['variables'][number] | VariableUnion;
export type MatrixValue = string | number | string[];
export type SaveMatrixValue = (projectId: number, value: MatrixValue, variable: MatrixVariable) => Promise<void>;

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

export const getMatrixValue = (row: MatrixRow, stableId: string) => {
  const variable = row.variables?.find((candidate) => candidate.stableId === stableId);
  const value = variable?.values?.[0];
  if (!value || variable?.isList?.toString() === 'true') {
    return '';
  }
  if (value['numberValue(raw)'] !== undefined) {
    return value['numberValue(raw)'];
  }
  if (value.textValue) {
    return value.textValue;
  }
  if (value.dateValue) {
    return new Date(value.dateValue);
  }
  if (value.options) {
    return value.options.map((option) => option.name).join(', ');
  }
  return value.linkUrl ?? '';
};

export const getMatrixOptionIds = (row: MatrixRow, stableId: string) =>
  row.variables
    ?.find((variable) => variable.stableId === stableId)
    ?.values?.[0]?.options?.map((option) => String(option.id)) ?? [];

export const renderMatrixValue = (value: unknown, locale: string) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : <>{value.toLocaleDateString(locale)}</>;
  }
  if (typeof value === 'number') {
    return <FormattedNumber value={value} />;
  }
  return <>{value === undefined || value === null ? '' : String(value)}</>;
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
