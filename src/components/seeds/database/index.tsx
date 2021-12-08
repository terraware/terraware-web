import MomentUtils from '@date-io/moment';
import { Chip, CircularProgress, Container, Grid, Link, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import {
  AllFieldValuesMap,
  convertToSearchNodePayload,
  FieldValuesMap,
  filterSelectFields,
  getAllFieldValues,
  getPendingAccessions,
  search,
  SearchField,
  searchFieldValues,
  SearchNodePayload,
  SearchResponseElement,
  SeedSearchCriteria,
  SeedSearchSortOrder,
} from 'src/api/seeds/search';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { Order } from 'src/components/common/table/sort';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
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
  searchCriteria: SeedSearchCriteria;
  setSearchCriteria: (criteria: SeedSearchCriteria) => void;
  searchSortOrder: SeedSearchSortOrder;
  setSearchSortOrder: (order: SeedSearchSortOrder) => void;
  searchColumns: SearchField[];
  setSearchColumns: (fields: SearchField[]) => void;
  displayColumnNames: SearchField[];
  setDisplayColumnNames: (fields: SearchField[]) => void;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const {
    facilityId,
    searchCriteria,
    setSearchCriteria,
    searchSortOrder,
    setSearchSortOrder,
    searchColumns,
    setSearchColumns,
    displayColumnNames,
    setDisplayColumnNames,
  } = props;
  const displayColumnDetails = displayColumnNames.map((name) => {
    return COLUMNS_INDEXED[name];
  });
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  /*
   * fieldOptions is a list of records
   * keys: all single and multi select search fields.
   * values: all the existing values that the field has in the database, for all accessions.
   */
  const [fieldOptions, setFieldOptions] = useState<AllFieldValuesMap | null>();
  /*
   * availableFieldOptions is a list of records
   * keys: all single and multi select search fields.
   * values: all the values that are associated with an accession in the current facility AND that aren't being
   * filtered out by the given search criteria.
   */
  const [availableFieldOptions, setAvailableFieldOptions] = useState<FieldValuesMap | null>();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();

  useEffect(() => {
    const populatePendingAccessions = async () => {
      setPendingAccessions(await getPendingAccessions(facilityId));
    };
    populatePendingAccessions();
  }, [facilityId]);

  useEffect(() => {
    const populateFieldOptions = async () => {
      const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
      setFieldOptions(await getAllFieldValues(singleAndMultiChoiceFields, facilityId));
    };
    populateFieldOptions();
  }, [facilityId, searchColumns]);

  useEffect(() => {
    const populateAvailableFieldOptions = async () => {
      const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
      setAvailableFieldOptions(await searchFieldValues(singleAndMultiChoiceFields, searchCriteria, facilityId));
    };
    populateAvailableFieldOptions();
  }, [facilityId, searchColumns, searchCriteria]);

  useEffect(() => {
    const populateSearchResults = async () => {
      const apiResponse = await search({
        facilityId,
        fields: searchColumns.includes('active') ? searchColumns : [...searchColumns, 'active'],
        sortOrder: [searchSortOrder],
        search: convertToSearchNodePayload(searchCriteria),
        count: 1000,
      });

      setSearchResults(apiResponse);
    };

    populateSearchResults();
  }, [facilityId, searchCriteria, searchSortOrder, searchColumns]);

  const onSelect = (row: SearchResponseElement) => {
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
    setSearchSortOrder({
      field: orderBy as SearchField,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const onFilterChange = (newFilters: Record<string, SearchNodePayload>) => {
    setSearchCriteria(newFilters);
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

      setSearchColumns(searchSelectedColumns);
      setDisplayColumnNames(columnsintern);
    }
    setEditColumnsModalOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  const isInactive = (row: SearchResponseElement) => {
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
    if (searchResults) {
      return `${searchResults.length} total`;
    }
    if (searchResults === undefined) {
      return <CircularProgress />;
    }
    if (searchResults === null) {
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
        <DownloadReportModal
          searchCriteria={searchCriteria}
          searchSortOrder={searchSortOrder}
          searchColumns={searchColumns}
          facilityId={facilityId}
          open={reportModalOpen}
          onClose={onCloseDownloadReportModal}
        />
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
          {availableFieldOptions && fieldOptions && (
            <Filters
              filters={searchCriteria}
              availableValues={availableFieldOptions}
              allValues={fieldOptions}
              columns={displayColumnDetails}
              onChange={onFilterChange}
            />
          )}
          {(fieldOptions === undefined || availableFieldOptions === undefined) && <CircularProgress />}
          {(fieldOptions === null || availableFieldOptions === null) && strings.GENERIC_ERROR}
        </PageHeader>
        <Container maxWidth={false} className={classes.mainContainer}>
          {pendingAccessions && pendingAccessions.length > 0 && (
            <Grid container spacing={3} className={classes.checkinMessage}>
              <Grid item xs={1} />
              <Grid item xs={10}>
                <Paper>
                  <Grid container spacing={4}>
                    <Grid item xs={12} className={classes.checkInContent}>
                      <div>
                        <span> {strings.CHECKIN_BAGS}</span>
                        <p>{strings.formatString(strings.CHECK_IN_MESSAGE, pendingAccessions.length)}</p>
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
                    {searchResults && (
                      <Table
                        columns={displayColumnDetails}
                        rows={searchResults}
                        orderBy={searchSortOrder.field}
                        order={searchSortOrder.direction === 'Ascending' ? 'asc' : 'desc'}
                        Renderer={SearchCellRenderer}
                        onSelect={onSelect}
                        sortHandler={onSortChange}
                        isInactive={isInactive}
                        onReorderEnd={onReorderEnd}
                      />
                    )}
                    {searchResults === undefined && <CircularProgress />}
                    {searchResults === null && strings.GENERIC_ERROR}
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
