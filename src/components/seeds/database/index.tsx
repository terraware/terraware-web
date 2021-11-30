import MomentUtils from '@date-io/moment';
import { Chip, CircularProgress, Container, Grid, Link, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from 'recoil';
import { SearchField, SearchNodePayload, SearchResponseResults } from 'src/api/types/search';
import { columnsAtom, searchFilterAtom, searchSelectedColumnsAtom, searchSortAtom } from 'src/state/atoms/seeds/search';
import searchSelector, { columnsSelector } from 'src/state/selectors/seeds/search';
import searchAllValuesSelector from 'src/state/selectors/seeds/searchAllValues';
import searchValuesSelector from 'src/state/selectors/seeds/searchValues';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import Button from '../../../components/common/button/Button';
import { pendingAccessionsSelector } from '../../../state/selectors/seeds/pendingCheckIn';
import Table from '../../common/table';
import { Order } from '../../common/table/sort';
import PageHeader from '../PageHeader';
import { COLUMNS_INDEXED } from './columns';
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
    addAccession: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    checkinMessage: {
      marginBottom: theme.spacing(6),
    },
    checkInContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: theme.spacing(3),
    },
    checkInButton: {
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(3),
    },
  })
);

const newAccessionChipStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

type DatabaseProps = {
  facilityId: number;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { facilityId } = props;
  const classes = useStyles();
  const history = useHistory();
  const [editColumnsModalOpen, setEditColumnsModalOpen] = React.useState(false);
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [filters, setFilters] = useRecoilState(searchFilterAtom);
  const [sort, setSort] = useRecoilState(searchSortAtom);
  const setSearchSelectedColumns = useSetRecoilState(searchSelectedColumnsAtom);
  const [columns, setColumns] = useRecoilState(columnsAtom);

  const pendingAccessions = useRecoilValue(pendingAccessionsSelector);
  const tableColumnsLodable = useRecoilValueLoadable(columnsSelector);
  const tableColumns = tableColumnsLodable.state === 'hasValue' ? tableColumnsLodable.contents : undefined;
  const resultsLodable = useRecoilValueLoadable(searchSelector);
  const results = resultsLodable.state === 'hasValue' ? resultsLodable.contents.results : undefined;
  const availableValuesLodable = useRecoilValueLoadable(searchValuesSelector);
  const availableValues =
    availableValuesLodable.state === 'hasValue' ? availableValuesLodable.contents.results : undefined;
  const allValuesLodable = useRecoilValueLoadable(searchAllValuesSelector);
  const allValues = allValuesLodable.state === 'hasValue' ? allValuesLodable.contents.results : undefined;

  const onSelect = (row: SearchResponseResults) => {
    if (row.id) {
      const seedCollectionLocation = {
        pathname: `/accessions/${row.id}`,
        // eslint-disable-next-line no-restricted-globals
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

  const onFilterChange = (newFilters: Record<string, SearchNodePayload>) => {
    setFilters(newFilters);
  };

  const onOpenEditColumnsModal = () => {
    setEditColumnsModalOpen(true);
  };

  const onDownloadReport = () => {
    setReportModalOpen(true);
  };

  const onCloseEditColumnsModal = (columnsintern?: SearchField[]) => {
    if (columnsintern) {
      const searchSelectedColumns = columnsintern.reduce((acum, value) => {
        acum.push(value);
        const additionalColumns = COLUMNS_INDEXED[value].additionalKeys;
        if (additionalColumns) {
          return acum.concat(additionalColumns);
        }

        return acum;
      }, [] as SearchField[]);

      setSearchSelectedColumns(searchSelectedColumns);
      setColumns(columnsintern);
      setFilters(filters);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns]
  );

  const getSubtitle = () => {
    if (results) {
      return `${results.length} total`;
    }
    if (resultsLodable.state === 'loading') {
      return <CircularProgress />;
    }
    if (resultsLodable.state === 'hasError') {
      return strings.GENERIC_ERROR;
    }
  };

  const handleViewCollections = () => {
    history.push('/checkin');
  };

  const location = useStateLocation();

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <main>
        <EditColumns open={editColumnsModalOpen} value={columns} onClose={onCloseEditColumnsModal} />
        <DownloadReportModal facilityId={facilityId} open={reportModalOpen} onClose={onCloseDownloadReportModal} />
        <PageHeader
          title=''
          subtitle={getSubtitle()}
          page={strings.ACCESSIONS}
          parentPage={strings.SEEDS}
          rightComponent={
            <div>
              <Chip
                id='edit-columns'
                variant='outlined'
                size='medium'
                label='Add Columns'
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
              <Link component={RouterLink} to={getLocation('/accessions/new', location)}>
                <Chip
                  id='newAccession'
                  className={classes.addAccession}
                  label={strings.NEW_ACCESSION}
                  clickable={true}
                  deleteIcon={<AddIcon classes={newAccessionChipStyles()} />}
                  color='primary'
                  onDelete={() => {
                    return true;
                  }}
                />
              </Link>
            </div>
          }
        >
          {availableValues && allValues && tableColumns && (
            <Filters
              filters={filters}
              availableValues={availableValues}
              allValues={allValues}
              columns={tableColumns}
              onChange={onFilterChange}
            />
          )}
          {(allValuesLodable.state === 'loading' ||
            availableValuesLodable.state === 'loading' ||
            tableColumnsLodable.state === 'loading') && <CircularProgress />}
          {(allValuesLodable.state === 'hasError' ||
            availableValuesLodable.state === 'hasError' ||
            tableColumnsLodable.state === 'hasError') &&
            strings.GENERIC_ERROR}
        </PageHeader>
        <Container maxWidth={false} className={classes.mainContainer}>
          {pendingAccessions.results.length > 0 && (
            <Grid container spacing={3} className={classes.checkinMessage}>
              <Grid item xs={1} />
              <Grid item xs={10}>
                <Paper>
                  <Grid container spacing={4}>
                    <Grid item xs={12} className={classes.checkInContent}>
                      <div>
                        <span> {strings.CHECKIN_BAGS}</span>
                        <p>{strings.formatString(strings.CHECK_IN_MESSAGE, pendingAccessions.results.length)}</p>
                      </div>
                      <Button
                        className={classes.checkInButton}
                        onClick={handleViewCollections}
                        id='viewCollections'
                        label={strings.VIEW_COLLECTIONS}
                        priority='secondary'
                        type='passive'
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={1} />
            </Grid>
          )}
          <Grid container spacing={3}>
            <Grid item xs={1} />
            <Grid item xs={10}>
              <Paper>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    {results && tableColumns && (
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
                    )}
                    {(resultsLodable.state === 'loading' || tableColumnsLodable.state === 'loading') && (
                      <CircularProgress />
                    )}
                    {(resultsLodable.state === 'hasError' || tableColumnsLodable.state === 'hasError') &&
                      strings.GENERIC_ERROR}
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
