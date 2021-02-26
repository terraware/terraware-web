import DayJSUtils from '@date-io/dayjs';
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  SearchField,
  SearchFilter,
  SearchResponseResults,
} from '../../api/types/search';
import {
  searchFilterAtom,
  searchSortAtom,
  searchVisibleColumnsAtom,
} from '../../state/atoms/search';
import snackbarAtom from '../../state/atoms/snackbar';
import searchSelector, {
  searchTableColumnsSelector,
} from '../../state/selectors/search';
import searchValuesSelector from '../../state/selectors/searchValues';
import Table from '../common/table';
import { Order } from '../common/table/sort';
import ErrorBoundary from '../ErrorBoundary';
import PageHeader from '../PageHeader';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(8),
      paddingBottom: theme.spacing(4),
    },
    downloadReport: {
      background: theme.palette.common.black,
      color: theme.palette.common.white,
      marginLeft: theme.spacing(2),
      '&:hover, &:focus': {
        backgroundColor: `${theme.palette.common.black}!important`,
      },
    },
  })
);

export default function Database(): JSX.Element {
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const errorHandler = () => {
    setSnackbar({
      type: 'error',
      msg: 'An error occurred when fetching accessions.',
    });
  };

  return (
    <ErrorBoundary handler={errorHandler}>
      <React.Suspense
        fallback={
          <Box display='flex' justifyContent='center'>
            <CircularProgress id='spinner-database' />
          </Box>
        }
      >
        <Content />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function Content(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [editColumnsModalOpen, setEditColumnsModalOpen] = React.useState(false);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  const [filters, setFilters] = useRecoilState(searchFilterAtom);
  const [sort, setSort] = useRecoilState(searchSortAtom);
  const [visibleColumns, setVisibleColumns] = useRecoilState(
    searchVisibleColumnsAtom
  );
  const tableColumns = useRecoilValue(searchTableColumnsSelector);
  const results = useRecoilValue(searchSelector).results;
  const availableValues = useRecoilValue(searchValuesSelector).results;

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const initializeFilters = () => {
    const filters: SearchFilter[] = [];
    const values: string[] = [];
    if (query.get('state')) {
      values.push(query.get('state') || '');
      filters.push({
        field: 'state',
        values: values,
        type: 'Exact',
      });
    }
    return filters;
  };

  React.useEffect(() => {
    if (query.get('state')) {
      setFilters(initializeFilters);
    }
  }, [query.get('state')]);

  const onSelect = (row: SearchResponseResults) => {
    if (row.accessionNumber) {
      history.push(`/accessions/${row.accessionNumber}/seed-collection`);
    }
  };

  const onSortChange = (order: Order, orderBy: string) => {
    setSort({
      field: orderBy as SearchField,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const onFilterChange = (newFilters: SearchFilter[]) => {
    setFilters(newFilters);
  };

  const onOpenEditColumnsModal = () => {
    setEditColumnsModalOpen(true);
  };

  const onDownloadReport = () => {
    setReportModalOpen(true);
  };

  const onCloseEditColumnsModal = (columns?: Record<SearchField, boolean>) => {
    if (columns) {
      setVisibleColumns(columns);
      const newFilters = filters.filter((f) => columns[f.field]);
      setFilters(newFilters);
    }
    setEditColumnsModalOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  return (
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <main>
        <EditColumns
          open={editColumnsModalOpen}
          value={visibleColumns}
          onClose={onCloseEditColumnsModal}
        />
        <DownloadReportModal
          open={reportModalOpen}
          onClose={onCloseDownloadReportModal}
        />
        <PageHeader
          title='Database'
          subtitle={`${results.length} total`}
          rightComponent={
            <div>
              <Chip
                id='edit-columns'
                variant='outlined'
                size='medium'
                label='Edit columns'
                onClick={onOpenEditColumnsModal}
                icon={<EditIcon />}
              />
              <Chip
                id='download-report'
                variant='outlined'
                size='medium'
                label='Download as report'
                onClick={onDownloadReport}
                className={classes.downloadReport}
              />
            </div>
          }
        >
          <Filters
            filters={filters}
            availableValues={availableValues}
            columns={tableColumns}
            onChange={onFilterChange}
          />
        </PageHeader>
        <Container maxWidth='lg' className={classes.mainContainer}>
          <Paper>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Table
                  columns={tableColumns}
                  rows={results}
                  orderBy={sort.field}
                  order={sort.direction === 'Ascending' ? 'asc' : 'desc'}
                  Renderer={SearchCellRenderer}
                  onSelect={onSelect}
                  sortHandler={onSortChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </main>
    </MuiPickersUtilsProvider>
  );
}
