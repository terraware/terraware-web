import MomentUtils from '@date-io/moment';
import { Chip, CircularProgress, Container, Grid, Link, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useRecoilState, useSetRecoilState, useRecoilValueLoadable } from 'recoil';
import { searchFilterAtom, searchSortAtom, searchSelectedColumnsAtom } from 'src/state/atoms/seeds/search';
import searchSelector from 'src/state/selectors/seeds/search';
import searchValuesSelector from 'src/state/selectors/seeds/searchValues';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import Button from '../../../components/common/button/Button';
import Table from '../../common/table';
import { Order } from '../../common/table/sort';
import PageHeader from '../PageHeader';
import {COLUMNS_INDEXED} from './columns';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';
import {
  AllFieldValuesPayload,
  findSingleAndMultiChoiceFields,
  getAllFieldOptions,
  getPendingAccessions, SearchField,
  SearchNodePayload,
  SearchResponsePayload,
  SearchResponseResults
} from '../../../api/seeds/search';

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
  searchColumns: SearchField[];
  setSearchColumns: (fields: SearchField[]) => void;
  displayColumnNames: SearchField[];
  setDisplayColumnNames: (fields: SearchField[]) => void;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { facilityId, searchColumns, setSearchColumns, displayColumnNames, setDisplayColumnNames } = props;
  const classes = useStyles();
  const history = useHistory();
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponsePayload>();
  /*
   * fieldOptions is a list of records
   * keys: all single and multi select search fields.
   * values: all the existing values that the field has in the database, for all accessions.
   */
  const [fieldOptions, setFieldOptions] = useState<AllFieldValuesPayload | null>();
  const [filters, setFilters] = useRecoilState(searchFilterAtom);
  const [sort, setSort] = useRecoilState(searchSortAtom);
  const setSearchSelectedColumns = useSetRecoilState(searchSelectedColumnsAtom);

  const displayColumnDetails = displayColumnNames.map((name) => {
    return COLUMNS_INDEXED[name];
  });
  const resultsLodable = useRecoilValueLoadable(searchSelector);
  const results = resultsLodable.state === 'hasValue' ? resultsLodable.contents.results : undefined;
  const availableValuesLodable = useRecoilValueLoadable(searchValuesSelector);
  const availableValues =
    availableValuesLodable.state === 'hasValue' ? availableValuesLodable.contents.results : undefined;

  useEffect(() => {
    const populatePendingAccessions = async () => {
      setPendingAccessions(await getPendingAccessions(facilityId));
    };
    populatePendingAccessions();
  }, [facilityId]);

  useEffect(() => {
    const populateSearchColumns = async () => {
      const singleAndMultiChoiceFields = findSingleAndMultiChoiceFields(searchColumns);
      setFieldOptions((await getAllFieldOptions(singleAndMultiChoiceFields, facilityId)).fieldValuesByFieldName);
    };
    populateSearchColumns();
  }, [facilityId, searchColumns]);

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
      setSearchColumns(searchSelectedColumns);
      setDisplayColumnNames(columnsintern);
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
  const onReorderEnd = useCallback(
    ({ oldIndex, newIndex }) => {
      if (newIndex !== 0 && oldIndex !== 0) {
        const newOrder = [...displayColumnNames];
        const moved = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved[0]);
        setDisplayColumnNames(newOrder);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayColumnNames, setDisplayColumnNames]
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
        <EditColumns open={editColumnsModalOpen} value={displayColumnNames} onClose={onCloseEditColumnsModal} />
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
          {availableValues && fieldOptions && (
            <Filters
              filters={filters}
              availableValues={availableValues}
              allValues={fieldOptions}
              columns={displayColumnDetails}
              onChange={onFilterChange}
            />
          )}
          {(fieldOptions === undefined ||
            availableValuesLodable.state === 'loading') && <CircularProgress />}
          {(fieldOptions === null ||
            availableValuesLodable.state === 'hasError') &&
            strings.GENERIC_ERROR}
        </PageHeader>
        <Container maxWidth={false} className={classes.mainContainer}>
          {pendingAccessions && pendingAccessions.results.length > 0 && (
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
                    {results && (
                      <Table
                        columns={displayColumnDetails}
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
                    {resultsLodable.state === 'loading' && (
                      <CircularProgress />
                    )}
                    {resultsLodable.state === 'hasError' &&
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
