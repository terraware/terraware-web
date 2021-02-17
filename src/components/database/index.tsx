import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValueLoadable } from 'recoil';
import {
  SearchField,
  SearchFilter,
  SearchRequestPayload,
  SearchResponseResults,
} from '../../api/types/search';
import searchSelector from '../../state/selectors/search';
import Table from '../common/table';
import { Order } from '../common/table/sort';
import PageHeader from '../PageHeader';
import { COLUMNS } from './columns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
    },
  })
);

export default function Database(): JSX.Element {
  const classes = useStyles();

  const history = useHistory();
  const [sortField, setSortField] = React.useState<SearchField>(
    'accessionNumber'
  );
  const [sortOrder, setSortOrder] = React.useState<'Ascending' | 'Descending'>(
    'Ascending'
  );
  const [filters, setFilters] = React.useState<SearchFilter[]>([]);

  const searchParams: SearchRequestPayload = {
    fields: COLUMNS.map((c) => c.key as SearchField),
    sortOrder: [{ field: sortField, direction: sortOrder }],
    filters,
    count: 10000,
  };

  const resultsLoadable = useRecoilValueLoadable(
    searchSelector({ searchParams })
  );

  if (resultsLoadable.state === 'loading') {
    return (
      <Box display='flex' justifyContent='center'>
        <CircularProgress />
      </Box>
    );
  } else if (resultsLoadable.state === 'hasError') {
    return <div>An error ocurred</div>;
  }

  const results = resultsLoadable.contents.results;

  const onSelect = (row: SearchResponseResults) => {
    if (row.accessionNumber) {
      history.push(`/accessions/${row.accessionNumber}/seed-collection`);
    }
  };

  const onSort = (order: Order, orderBy: string) => {
    setSortField(orderBy as SearchField);
    setSortOrder(order === 'asc' ? 'Ascending' : 'Descending');
  };

  const onFilterChange = (newFilters: SearchFilter[]) => {
    setFilters(newFilters);
  };

  return (
    <main>
      <PageHeader title='Database' subtitle={`${results.length} total`}>
        <Filters
          filters={filters}
          columns={COLUMNS}
          onChange={onFilterChange}
        />
      </PageHeader>
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Paper>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                columns={COLUMNS}
                rows={results}
                defaultSort='accessionNumber'
                Renderer={SearchCellRenderer}
                onSelect={onSelect}
                sortHandler={onSort}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </main>
  );
}
