import React from 'react';

import { EditableTableInstanceV2, EditableTableV2 } from '@terraware/web-components';
import { act, renderHook } from '@testing-library/react';
import { useMaterialReactTable } from 'material-react-table';

import { renderWithProviders } from 'src/test-utils';

import { getDefaultTableSettings, isTableModified } from './tableSettings';
import { CurrentViewTable, toViewTable } from './viewTable';

type Row = { a: string; b: string; c: string };
const columns = (['a', 'b', 'c'] as const).map((id) => ({ id, accessorKey: id, header: id }));

it.each(['legacy', 'v2'])('detects reordered columns omitted from a partial saved order on %s', (engine) => {
  let table: CurrentViewTable<Row>;
  if (engine === 'legacy') {
    table = renderHook(() => useMaterialReactTable<Row>({ columns, data: [] })).result.current;
  } else {
    let instance!: EditableTableInstanceV2<Row>;
    renderWithProviders(
      <EditableTableV2<Row>
        clearAllFiltersLabel='Clear'
        columns={columns}
        data={[]}
        renderTopToolbarCustomActions={({ table: current }) => {
          instance = current;
          return null;
        }}
      />
    );
    table = instance;
  }
  const view = toViewTable(table);
  const defaults = getDefaultTableSettings(table);
  const saved = { columnOrder: ['a'] };
  expect(isTableModified(table, saved, defaults)).toBe(false);
  act(() => view.setColumnOrder(['a', 'c', 'b']));
  expect(view.getColumns().map((column) => column.id)).toEqual(['a', 'c', 'b']);
  expect(view.getColumns('definition').map((column) => column.id)).toEqual(['a', 'b', 'c']);
  expect(isTableModified(table, saved, defaults)).toBe(true);
});
