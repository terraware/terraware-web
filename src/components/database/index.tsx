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
import { useHistory } from 'react-router-dom';
import { useRecoilValueLoadable } from 'recoil';
import {
  ListFieldValuesRequestPayload,
  SearchField,
  SearchFilter,
  SearchRequestPayload,
  SearchResponseResults,
  SearchSortOrderElement,
} from '../../api/types/search';
import searchSelector from '../../state/selectors/search';
import searchValues from '../../state/selectors/searchValues';
import Table from '../common/table';
import { Order } from '../common/table/sort';
import PageHeader from '../PageHeader';
import { COLUMNS, defaultPreset } from './columns';
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
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const [reportModalOpen, setReportModalOpen] = React.useState(false);

  const history = useHistory();
  const [sort, setSort] = React.useState<SearchSortOrderElement>({
    field: 'accessionNumber',
    direction: 'Ascending',
  });
  const [visibleColumns, setVisibleColumns] = React.useState<
    Record<SearchField, boolean>
  >(
    defaultPreset.fields.reduce((acum, field) => {
      acum[field] = true;
      return acum;
    }, {} as Record<SearchField, boolean>)
  );
  const [filters, setFilters] = React.useState<SearchFilter[]>([]);

  const tableColumns = COLUMNS.filter((c) => visibleColumns[c.key]);

  const searchParams: SearchRequestPayload = {
    fields: tableColumns.map((c) => c.key),
    sortOrder: [{ field: sort.field, direction: sort.direction }],
    filters,
    count: 1000,
  };
  const searchResultsLoadable = useRecoilValueLoadable(
    searchSelector({ searchParams })
  );
  const searchValuesParams: ListFieldValuesRequestPayload = {
    fields: tableColumns.reduce((acum, c) => {
      if (
        ['multiple_selection', 'single_selection'].includes(
          c.filter?.type ?? ''
        )
      ) {
        acum.push(c.key);
      }
      return acum;
    }, [] as any[]),
    filters,
  };
  const searchValuesResultsLoadable = useRecoilValueLoadable(
    searchValues({ searchValuesParams })
  );

  if (
    searchResultsLoadable.state === 'loading' ||
    searchValuesResultsLoadable.state === 'loading'
  ) {
    return (
      <Box display='flex' justifyContent='center'>
        <CircularProgress />
      </Box>
    );
  } else if (
    searchResultsLoadable.state === 'hasError' ||
    searchValuesResultsLoadable.state === 'hasError'
  ) {
    return <div>An error ocurred</div>;
  }
  const results = searchResultsLoadable.contents.results;
  const availableValues = searchValuesResultsLoadable.contents.results;

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
    setOpen(true);
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
    setOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  return (
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <main>
        <EditColumns
          open={open}
          value={visibleColumns}
          onClose={onCloseEditColumnsModal}
        />
        <DownloadReportModal
          open={reportModalOpen}
          onClose={onCloseDownloadReportModal}
          searchParams={searchParams}
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
                  defaultSort='accessionNumber'
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
