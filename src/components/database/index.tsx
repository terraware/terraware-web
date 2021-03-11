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
  columnsAtom,
  searchFilterAtom,
  searchSelectedColumnsAtom,
  searchSortAtom,
} from '../../state/atoms/search';
import snackbarAtom from '../../state/atoms/snackbar';
import searchSelector, { columnsSelector } from '../../state/selectors/search';
import searchAllValuesSelector from '../../state/selectors/searchAllValues';
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
  const setSearchSelectedColumns = useSetRecoilState(searchSelectedColumnsAtom);
  const [columns, setColumns] = useRecoilState(columnsAtom);
  const tableColumns = useRecoilValue(columnsSelector);
  const results = useRecoilValue(searchSelector).results;
  const availableValues = useRecoilValue(searchValuesSelector).results;
  const allValues = useRecoilValue(searchAllValuesSelector).results;

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
      const seedCollectionLocation = {
        pathname: `/accessions/${row.accessionNumber}/seed-collection`,
        state: { from: location.pathname },
      };
      history.push(seedCollectionLocation);
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

  const onCloseEditColumnsModal = (columns?: SearchField[]) => {
    if (columns) {
      const selectedColumns = columns.reduce((acum, value) => {
        acum[value] = true;
        return acum;
      }, {} as Record<SearchField, boolean>);

      setSearchSelectedColumns(columns);
      setColumns(columns);
      const newFilters = filters.filter((f) => selectedColumns[f.field]);
      setFilters(newFilters);
    }
    setEditColumnsModalOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  const isInactive = (row: SearchResponseResults) => {
    return row.active === 'Inactive';
  };
  const onReorderEnd = React.useCallback(
    ({ oldIndex, newIndex }) => {
      if (newIndex !== 0 && oldIndex !== 0) {
        const newOrder = [...columns];
        const moved = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved[0]);
        setColumns(newOrder);
      }
    },
    [columns]
  );

  return (
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <main>
        <EditColumns
          open={editColumnsModalOpen}
          value={columns}
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
                label='Edit Columns'
                onClick={onOpenEditColumnsModal}
                icon={<EditIcon />}
              />
              <Chip
                id='download-report'
                variant='outlined'
                size='medium'
                label='Download as Report'
                onClick={onDownloadReport}
                className={classes.downloadReport}
              />
            </div>
          }
        >
          <Filters
            filters={filters}
            availableValues={availableValues}
            allValues={allValues}
            columns={tableColumns}
            onChange={onFilterChange}
          />
        </PageHeader>
        <Container maxWidth={false} className={classes.mainContainer}>
          <Grid container spacing={3}>
            <Grid item xs={1} />
            <Grid item xs={10}>
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
                      isInactive={isInactive}
                      onReorderEnd={onReorderEnd}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={1} />
          </Grid>
        </Container>
      </main>
    </MuiPickersUtilsProvider>
  );
}
