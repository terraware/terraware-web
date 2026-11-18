import {
  MatrixRow,
  MatrixVariable,
  buildMatrixValue,
  buildMatrixValueOperation,
  getMatrixOptionIds,
  getMatrixValue,
  matchesMatrixSelection,
} from './matrixValues';

const variable: MatrixVariable = {
  id: '2',
  stableId: 'v',
  variableName: 'Variable',
  type: 'Select',
  values: [{ variableValueId: '3' }],
};
const value = { type: 'Select' as const, optionIds: [4] };

it.each([true, 'true'])('appends list values without overwriting hidden items (%s)', (isList) => {
  expect(buildMatrixValueOperation({ ...variable, isList: isList as boolean }, value)).toEqual({
    operation: 'Append',
    variableId: 2,
    value,
  });
});

it('updates non-list values by variableValueId, appending only when no value exists', () => {
  expect(buildMatrixValueOperation(variable, value)).toEqual({
    operation: 'Update',
    valueId: 3,
    existingValueId: 3,
    value,
  });
  expect(buildMatrixValueOperation({ ...variable, values: [] }, value)).toEqual({
    operation: 'Append',
    variableId: 2,
    value,
  });
  expect(buildMatrixValueOperation({ ...variable, id: '', values: [] }, value)).toBeUndefined();
});

it('clears select values without sending option zero and ignores unsupported types', () => {
  expect(buildMatrixValue('Select', '')).toEqual({ type: 'Select', optionIds: [] });
  expect(buildMatrixValue('Select', ['4'])).toEqual(value);
  expect(buildMatrixValue('Section', 'x')).toBeUndefined();
});

const row: MatrixRow = {
  id: 1,
  name: 'Project',
  country_name: '',
  internalUsers: [],
  variables: [
    {
      id: '2',
      stableId: 'v',
      variableName: 'Habitat',
      type: 'Select',
      values: [{ variableValueId: '3', options: [{ id: '7', name: 'Forest, coastal', position: '0' }] }],
    },
  ],
};

it('keeps complete option names for filters and numeric option IDs for saves', () => {
  expect(getMatrixValue(row, 'v')).toBe('Forest, coastal');
  expect(getMatrixOptionIds(row, 'v')).toEqual(['7']);
  expect(matchesMatrixSelection(row, 'v', ['Forest, coastal'])).toBe(true);
  expect(matchesMatrixSelection(row, 'v', ['Forest'])).toBe(false);
  expect(matchesMatrixSelection(row, 'v', ['Coastal forest'])).toBe(false);
  expect(matchesMatrixSelection(row, 'v', [])).toBe(true);
  expect(matchesMatrixSelection(row, 'missing', ['Forest'])).toBe(false);
  expect(getMatrixValue(row, 'missing')).toBe('');
  expect(getMatrixOptionIds(row, 'missing')).toEqual([]);
  expect(buildMatrixValue('Select', getMatrixOptionIds(row, 'v'))).toEqual({ type: 'Select', optionIds: [7] });
});

it('preserves numeric zero and keeps empty or hidden list values blank', () => {
  const numeric: MatrixRow = {
    ...row,
    variables: [{ ...row.variables[0], type: 'Number', values: [{ variableValueId: '3', 'numberValue(raw)': 0 }] }],
  };
  expect(getMatrixValue(numeric, 'v')).toBe(0);
  expect(buildMatrixValue('Number', '0')).toEqual({ type: 'Number', numberValue: 0 });
  expect(getMatrixValue({ ...row, variables: [{ ...row.variables[0], values: [] }] }, 'v')).toBe('');
  expect(getMatrixValue({ ...row, variables: [{ ...row.variables[0], isList: true }] }, 'v')).toBe('');
});
