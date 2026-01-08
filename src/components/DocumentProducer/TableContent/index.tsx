import React from 'react';

import { Box, Grid } from '@mui/material';
import { SortOrder, TableColumnType, TableRowType } from '@terraware/web-components';
import { TopBarButton } from '@terraware/web-components/components/table';
import { RendererProps } from '@terraware/web-components/components/table/types';

import Search, { SearchProps } from 'src/components/DocumentProducer/Search';
import Table from 'src/components/common/table';
import CellRenderer from 'src/components/common/table/TableCellRenderer';

export type TableProps<T> = {
  tableOrderBy: string;
  tableOrder?: SortOrder;
  tableColumns: TableColumnType[];
  tableRows: T[];
  tableButtons?: TopBarButton[];
  tableSelectable?: boolean;
  tableCellRenderer?: (props: RendererProps<T>) => JSX.Element;
  tableSelectedRows?: T[];
  tableSetSelectedRows?: React.Dispatch<React.SetStateAction<T[]>>;
  tableOnSelect?: (data: T) => void;
  tableReloadData?: () => void;
  sortComparator?: (a: T, b: T, orderBy: keyof T) => number;
};

export type TableContentProps<T> = {
  // Search
  searchProps?: SearchProps;

  // table
  tableProps: TableProps<T>;
};

const TableContent = <T extends TableRowType>({ searchProps, tableProps }: TableContentProps<T>): JSX.Element => {
  const {
    tableOrderBy,
    tableColumns,
    tableRows,
    tableButtons,
    tableSelectable,
    tableCellRenderer,
    tableSelectedRows,
    tableSetSelectedRows,
    tableOnSelect,
    tableReloadData,
    sortComparator,
  } = tableProps;

  const tableOrder = tableProps.tableOrder || 'asc';

  const tableId = `table-content-${Date.now()}`;

  return (
    <Grid container>
      {searchProps && (
        <Box>
          <Search {...searchProps} tableId={tableId} />
        </Box>
      )}
      <Grid item xs={12}>
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                id={tableId}
                columns={() => tableColumns}
                rows={tableRows}
                orderBy={tableOrderBy}
                order={tableOrder}
                Renderer={tableCellRenderer || CellRenderer}
                isClickable={() => !!tableOnSelect}
                onSelect={tableOnSelect}
                selectedRows={tableSelectedRows}
                setSelectedRows={tableSetSelectedRows}
                showCheckbox={!!tableSelectable}
                showTopBar={!!tableButtons?.length}
                topBarButtons={tableButtons}
                reloadData={tableReloadData}
                sortComparator={sortComparator}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  );
};

export default TableContent;
