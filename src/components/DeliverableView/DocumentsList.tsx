import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { SearchSortOrder } from 'src/types/Search';
import { TableColumnType } from 'src/components/common/table/types';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { ViewProps } from './types';
import DocumentCellRenderer from './DocumentCellRenderer';

interface DocumentsListProps extends ViewProps {
  columns: TableColumnType[];
}

const DocumentsList = (props: DocumentsListProps): JSX.Element => {
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'deliverableName',
    direction: 'Ascending',
  } as SearchSortOrder);

  const onSortChange = (order: SortOrder, orderBy: string) =>
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });

  return (
    <Box display='flex' flexDirection='column'>
      <Grid item xs={12}>
        <Table
          id={'documents-list'}
          columns={() => props.columns}
          rows={props.deliverable.documents}
          orderBy={searchSortOrder.field}
          order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
          Renderer={DocumentCellRenderer}
          sortHandler={onSortChange}
        />
      </Grid>
    </Box>
  );
};

export default DocumentsList;
