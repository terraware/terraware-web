import {
  MatrixRow,
  MatrixVariable,
  buildMatrixValue,
  buildMatrixValueOperation,
  getMatrixOptionIds,
  getMatrixValue,
  matchesMatrixRange,
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
  expect(matchesMatrixSelection({ original: row }, 'v', ['Forest, coastal'])).toBe(true);
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
  expect(getMatrixOptionIds({ ...row, variables: [{ ...row.variables[0], isList: true }] }, 'v')).toEqual([]);
});

it('round-trips open numeric and calendar-date ranges without losing zero or same-day timestamps', () => {
  const numeric: MatrixRow = {
    ...row,
    variables: [{ ...row.variables[0], type: 'Number', values: [{ variableValueId: '3', 'numberValue(raw)': 0 }] }],
  };
  const dated: MatrixRow = {
    ...row,
    variables: [
      { ...row.variables[0], type: 'Date', values: [{ variableValueId: '3', dateValue: '2026-01-01T12:00:00Z' }] },
    ],
  };
  expect(matchesMatrixRange(numeric, 'v', JSON.parse(JSON.stringify([0, undefined])))).toBe(true);
  expect(matchesMatrixRange({ original: numeric }, 'v', [null, 0])).toBe(true);
  expect(matchesMatrixRange(numeric, 'v', [1, null])).toBe(false);
  expect(matchesMatrixRange(dated, 'v', JSON.parse(JSON.stringify(['2026-01-01', undefined])))).toBe(true);
  expect(matchesMatrixRange(dated, 'v', [null, '2026-01-01'])).toBe(true);
  expect(matchesMatrixRange(dated, 'v', [null, '2026-01-01T00:00:00Z'])).toBe(true);
  const persisted = JSON.parse(JSON.stringify(['2026-01-01T00:00:00-10:00', '2026-01-01T00:00:00+14:00']));
  expect(matchesMatrixRange(dated, 'v', persisted)).toBe(true);
  const localDay = { format: () => '2026-01-01', isValid: () => true };
  expect(matchesMatrixRange({ original: dated }, 'v', [localDay, localDay])).toBe(true);
  expect(matchesMatrixRange(dated, 'v', ['2026-01-02T00:00:00-10:00', null])).toBe(false);
  expect(matchesMatrixRange(dated, 'v', [null, '2025-12-31T00:00:00+14:00'])).toBe(false);
  expect(matchesMatrixRange(dated, 'v', ['invalid', null])).toBe(false);
  expect(matchesMatrixRange(dated, 'missing', [0, null])).toBe(false);
  expect(matchesMatrixRange(dated, 'missing', [null, null])).toBe(true);
});

it('matches selections in every list entry without changing blank list rendering', () => {
  const listRow: MatrixRow = {
    ...row,
    variables: [
      {
        ...row.variables[0],
        isList: true,
        values: [
          { variableValueId: '1' },
          ...(row.variables[0].values ?? []),
          { variableValueId: '4', options: [{ id: '8', name: 'Desert', position: '1' }] },
        ],
      },
    ],
  };
  expect(getMatrixValue(listRow, 'v')).toBe('');
  expect(matchesMatrixSelection(listRow, 'v', ['Forest, coastal'])).toBe(true);
  expect(matchesMatrixSelection({ original: listRow }, 'v', ['Desert'])).toBe(true);
  expect(matchesMatrixSelection(listRow, 'v', ['Ocean'])).toBe(false);
  expect(matchesMatrixSelection(listRow, 'v', [])).toBe(true);
  expect(matchesMatrixSelection({ ...listRow, variables: [] }, 'v', ['Desert'])).toBe(false);
});
