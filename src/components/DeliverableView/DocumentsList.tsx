import React, { useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';

import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { TableColumnType } from 'src/components/common/table/types';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { SearchSortOrder } from 'src/types/Search';

import DocumentCellRenderer from './DocumentCellRenderer';
import { ViewProps } from './types';

interface DocumentsListProps extends ViewProps {
  columns: TableColumnType[];
}

const DocumentsList = (props: DocumentsListProps): JSX.Element => {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'deliverableName',
    direction: 'Ascending',
  } as SearchSortOrder);

  const onSortChange = (order: SortOrder, orderBy: string) =>
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });

  const rows = useMemo(
    () =>
      props.deliverable.documents.map((document) => ({
        ...document,
        projectName: props.deliverable.projectName,
        deliverableId: props.deliverable.id,
      })),
    [props.deliverable]
  );

  return (
    <Box display='flex' flexDirection='column'>
      <Grid item xs={12}>
        <Table
          id={'documents-list' + isAcceleratorRoute ? '-admin' : ''}
          columns={() => props.columns}
          rows={rows}
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
