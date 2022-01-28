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
import { ServerOrganization } from 'src/types/Organization';
import { seedsDatabaseSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import { useRecoilState } from 'recoil';
import EmptyMessage from 'src/components/common/EmptyMessage';

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
    addAccessionIcon: {
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
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
  })
);

type DatabaseProps = {
  organization?: ServerOrganization;
  searchCriteria: SeedSearchCriteria;
  setSearchCriteria: (criteria: SeedSearchCriteria) => void;
  searchSortOrder: SeedSearchSortOrder;
  setSearchSortOrder: (order: SeedSearchSortOrder) => void;
  searchColumns: string[];
  setSearchColumns: (fields: string[]) => void;
  displayColumnNames: string[];
  setDisplayColumnNames: (fields: string[]) => void;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const {
    searchCriteria,
    setSearchCriteria,
    searchSortOrder,
    setSearchSortOrder,
    searchColumns,
    setSearchColumns,
    displayColumnNames,
    setDisplayColumnNames,
    organization,
  } = props;
  const displayColumnDetails = displayColumnNames.map((name) => {
    return COLUMNS_INDEXED[name];
  });
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const [selectedOrgInfo, setSelectedOrgInfo] = useRecoilState(seedsDatabaseSelectedOrgInfo);
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
   * filtered out by searchCriteria.
   */
  const [availableFieldOptions, setAvailableFieldOptions] = useState<FieldValuesMap | null>();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();

  // Remove this when download report receives site/project/org id
  const [facilityIdForReport, setFacilityIdForReport] = useState<number>();

  useEffect(() => {
    const populatePendingAccessions = async () => {
      if (organization && selectedOrgInfo.selectedFacility?.id) {
        setPendingAccessions(await getPendingAccessions(selectedOrgInfo, organization.id));
      }
    };
    populatePendingAccessions();
  }, [selectedOrgInfo, organization]);

  useEffect(() => {
    const populateFieldOptions = async () => {
      const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
      setFieldOptions(await getAllFieldValues(singleAndMultiChoiceFields, 0));
    };
    populateFieldOptions();
  }, [selectedOrgInfo, searchColumns]);

  useEffect(() => {
    let facilityId = selectedOrgInfo?.selectedFacility?.id;
    // If no faciliyId is selected, then select first facility of first project of first site, until endpoint receives siteId, projectId or OrgId
    if (
      !facilityId &&
      organization &&
      organization.projects &&
      organization.projects[0] &&
      organization.projects[0].sites &&
      organization.projects[0].sites[0] &&
      organization.projects[0].sites[0].facilities &&
      organization.projects[0].sites[0].facilities[0]
    ) {
      facilityId = organization.projects[0].sites[0].facilities[0].id;
      setFacilityIdForReport(facilityId);
    }
    const populateAvailableFieldOptions = async () => {
      const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
      setAvailableFieldOptions(await searchFieldValues(singleAndMultiChoiceFields, searchCriteria, facilityId || 0));
    };
    populateAvailableFieldOptions();
  }, [selectedOrgInfo, searchColumns, searchCriteria, organization]);

  useEffect(() => {
    if (organization) {
      const populateSearchResults = async () => {
        const apiResponse = await search({
          prefix: 'projects.sites.facilities.accessions',
          fields: searchColumns.includes('active') ? [...searchColumns, 'id'] : [...searchColumns, 'active', 'id'],
          sortOrder: [searchSortOrder],
          search: convertToSearchNodePayload(searchCriteria, selectedOrgInfo, organization.id),
          count: 1000,
        });

        setSearchResults(apiResponse);
      };

      populateSearchResults();
    }
  }, [selectedOrgInfo, searchCriteria, searchSortOrder, searchColumns, organization]);

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
      field: orderBy as string,
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

  const onCloseEditColumnsModal = (columnsintern?: string[]) => {
    if (columnsintern) {
      const searchSelectedColumns = columnsintern.reduce((acum, value) => {
        acum.push(value);
        const additionalColumns = COLUMNS_INDEXED[value].additionalKeys;
        if (additionalColumns) {
          return acum.concat(additionalColumns);
        }

        return acum;
      }, [] as string[]);

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

  const goToProjects = () => {
    const projectsLocation = {
      pathname: `/projects`,
    };
    history.push(projectsLocation);
  };

  const location = useStateLocation();

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <main>
        <EditColumns open={editColumnsModalOpen} value={displayColumnNames} onClose={onCloseEditColumnsModal} />
        {facilityIdForReport && (
          <DownloadReportModal
            searchCriteria={searchCriteria}
            searchSortOrder={searchSortOrder}
            searchColumns={searchColumns}
            facilityId={facilityIdForReport}
            open={reportModalOpen}
            onClose={onCloseDownloadReportModal}
          />
        )}
        <PageHeader
          title=''
          allowAll={true}
          subtitle={getSubtitle()}
          page={strings.ACCESSIONS}
          parentPage={strings.SEEDS}
          organization={organization}
          selectedOrgInfo={selectedOrgInfo}
          showFacility={true}
          onChangeSelectedOrgInfo={(newValues) => setSelectedOrgInfo(newValues)}
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
              {selectedOrgInfo.selectedFacility && (
                <Link component={RouterLink} to={getLocation('/accessions/new', location)}>
                  <Chip
                    id='newAccession'
                    className={classes.addAccession}
                    label={strings.NEW_ACCESSION}
                    clickable={true}
                    deleteIcon={<AddIcon className={classes.addAccessionIcon} />}
                    color='primary'
                    onDelete={() => {
                      return true;
                    }}
                  />
                </Link>
              )}
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
        <Grid item xs={12}>
          {!!organization?.projects?.length && !searchResults?.length && (
            <EmptyMessage
              title={strings.COLLECT_IN_FIELD_PLANT_DATA}
              text={strings.TERRAWARE_MOBILE_APP_INFO_MSG}
              buttonText={strings.REQUEST_MOBILE_APP}
              onClick={goToProjects}
            />
          )}
        </Grid>
        {!!organization?.projects?.length ? (
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
        ) : ['Admin', 'Manager', 'Owner'].includes(organization?.role || '') ? (
          <EmptyMessage
            className={classes.message}
            title={strings.PLANTS_EMPTY_MSG_TITLE}
            text={strings.PLANTS_EMPTY_MSG_BODY}
            buttonText={strings.GO_TO_PROJECTS}
            onClick={goToProjects}
          />
        ) : (
          <EmptyMessage
            className={classes.message}
            title={strings.CHECK_BACK_LATER}
            text={strings.EMPTY_MESSAGE_CONTRIBUTOR}
          />
        )}
      </main>
    </MuiPickersUtilsProvider>
  );
}
