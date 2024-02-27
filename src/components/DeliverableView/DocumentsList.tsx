import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import strings from 'src/strings';
import { SearchSortOrder } from 'src/types/Search';
import { useLocalization } from 'src/providers';
import { TableColumnType } from 'src/components/common/table/types';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { ViewProps } from './types';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.DOCUMENT_NAME,
          type: 'string',
        },
        {
          key: 'description',
          name: strings.DESCRIPTION,
          type: 'string',
        },
        {
          key: 'dateUploaded',
          name: strings.DATE_UPLOADED,
          type: 'string',
        },
      ]
    : [];

const DocumentsList = (props: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();

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
          columns={() => columns(activeLocale)}
          rows={props.deliverable.documents}
          orderBy={searchSortOrder.field}
          order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
          sortHandler={onSortChange}
        />
      </Grid>
    </Box>
  );
};

export default DocumentsList;
