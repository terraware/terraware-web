import { MatrixVariable, buildMatrixValue, buildMatrixValueOperation } from './matrixValues';

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
