import {
  MatrixRow,
  buildMatrixValue,
  buildMatrixValueOperation,
  getMatrixOptionIds,
  getMatrixValue,
} from './matrixValues';

const row: MatrixRow = {
  id: 1,
  name: 'Project',
  country_name: '',
  internalUsers: [],
  variables: [
    {
      id: '2',
      stableId: 'v',
      variableName: 'Variable',
      type: 'Select',
      values: [
        {
          variableValueId: '3',
          options: [{ id: '4', name: 'Forest, coastal', position: '1' }],
        },
      ],
    },
  ],
};

it('appends list values without overwriting hidden items but updates existing non-list values', () => {
  const value = { type: 'Select' as const, optionIds: [4] };
  expect(buildMatrixValueOperation({ ...row.variables[0], isList: true }, value)).toEqual({
    operation: 'Append',
    variableId: 2,
    value,
  });
  expect(buildMatrixValueOperation(row.variables[0], value)).toEqual({
    operation: 'Update',
    valueId: 3,
    existingValueId: 3,
    value,
  });
  expect(buildMatrixValueOperation({ ...row.variables[0], values: [] }, value)).toEqual({
    operation: 'Append',
    variableId: 2,
    value,
  });
  expect(buildMatrixValueOperation({ ...row.variables[0], id: '', values: [] }, value)).toBeUndefined();
});

it('keeps option names intact for display and IDs separate for saves', () => {
  expect(getMatrixValue(row, 'v')).toBe('Forest, coastal');
  expect(getMatrixOptionIds(row, 'v')).toEqual(['4']);
  expect(buildMatrixValue('Select', ['4'])).toEqual({ type: 'Select', optionIds: [4] });
  expect(buildMatrixValue('Select', '')).toEqual({ type: 'Select', optionIds: [] });
  expect(getMatrixValue(row, 'missing')).toBe('');
  expect(getMatrixOptionIds(row, 'missing')).toEqual([]);
});

it('does not lose numeric zero and does not construct unsupported payloads', () => {
  const numeric: MatrixRow = {
    ...row,
    variables: [{ ...row.variables[0], type: 'Number', values: [{ variableValueId: '3', 'numberValue(raw)': 0 }] }],
  };
  expect(getMatrixValue(numeric, 'v')).toBe(0);
  expect(buildMatrixValue('Number', '0')).toEqual({ type: 'Number', numberValue: 0 });
  expect(buildMatrixValue('Section', 'x')).toBeUndefined();
});
