import MomentUtils from '@date-io/moment';
import { CircularProgress, Container, Grid, Paper } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import PageHeader from '../PageHeader';
import { COLUMNS_INDEXED } from './columns';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import { seedsDatabaseSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import { useRecoilState } from 'recoil';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      padding: '32px 0',
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
      padding: '24px',
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
    checkInText: {
      marginBottom: 0,
    },
    buttonSpc: {
      marginRight: '16px',
    },
    requestMobileMessage: {
      marginBottom: '32px',
    },
    spinnerContainer: {
      position: 'fixed',
      top: '50%',
      left: 'calc(50% + 100px)',
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
  const [unfilteredResults, setUnfilteredResults] = useState<SearchResponseElement[] | null>();

  // Remove this when download report receives site/project/org id
  const [facilityIdForReport, setFacilityIdForReport] = useState<number>();

  useEffect(() => {
    if (organization) {
      const seedbankProject = organization?.projects?.length ? organization?.projects[0] : undefined;
      const seedbankSite = seedbankProject?.sites?.find((site) => site.name === 'Seed Bank');
      const seedbankFacility = seedbankSite?.facilities?.find((facility) => facility.name === 'Seed Bank');

      const selected = {
        selectedFacility: seedbankFacility,
        selectedProject: seedbankProject,
        selectedSite: seedbankSite,
      };
      setFacilityIdForReport(seedbankFacility?.id);
      setSelectedOrgInfo(selected);

      const populateUnfilteredResults = async () => {
        const apiResponse = await search({
          prefix: 'projects.sites.facilities.accessions',
          fields: searchColumns.includes('active') ? [...searchColumns, 'id'] : [...searchColumns, 'active', 'id'],
          sortOrder: [searchSortOrder],
          search: convertToSearchNodePayload({}, selected, organization.id),
          count: 1000,
        });

        setUnfilteredResults(apiResponse);
      };

      const populateSearchResults = async () => {
        const apiResponse = await search({
          prefix: 'projects.sites.facilities.accessions',
          fields: searchColumns.includes('active') ? [...searchColumns, 'id'] : [...searchColumns, 'active', 'id'],
          sortOrder: [searchSortOrder],
          search: convertToSearchNodePayload(searchCriteria, selected, organization.id),
          count: 1000,
        });

        setSearchResults(apiResponse);
      };

      const populateAvailableFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        setAvailableFieldOptions(
          await searchFieldValues(singleAndMultiChoiceFields, searchCriteria, seedbankFacility?.id || 0)
        );
      };

      const populatePendingAccessions = async () => {
        if (organization && seedbankFacility?.id) {
          setPendingAccessions(await getPendingAccessions(selected, organization.id));
        }
      };

      const populateFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        setFieldOptions(await getAllFieldValues(singleAndMultiChoiceFields, 0));
      };

      populateUnfilteredResults();
      populateSearchResults();
      populateAvailableFieldOptions();
      populatePendingAccessions();
      populateFieldOptions();
    }
  }, [setSelectedOrgInfo, searchCriteria, searchSortOrder, searchColumns, organization]);

  const onSelect = (row: SearchResponseElement) => {
    if (row.id) {
      const seedCollectionLocation = {
        pathname: APP_PATHS.ACCESSIONS_ITEM.replace(':accessionId', row.id as string),
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
    if (searchResults === null) {
      return strings.GENERIC_ERROR;
    }
  };

  const handleViewCollections = () => {
    history.push(APP_PATHS.CHECKIN);
  };

  const goToProjects = () => {
    const projectsLocation = {
      pathname: APP_PATHS.PROJECTS,
    };
    history.push(projectsLocation);
  };

  const goToNewAccession = () => {
    const newAccessionLocation = getLocation(APP_PATHS.ACCESSIONS_NEW, location);
    history.push(newAccessionLocation);
  };

  const location = useStateLocation();

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <TfMain>
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
          rightComponent={
            <div>
              <Button
                id='edit-columns'
                label={strings.ADD_COLUMNS}
                onClick={onOpenEditColumnsModal}
                priority='secondary'
                type='passive'
                size='medium'
                className={classes.buttonSpc}
              />
              <Button
                id='download-report'
                label={strings.DOWNLOAD_AS_REPORT}
                onClick={onDownloadReport}
                priority='secondary'
                type='passive'
                size='medium'
                className={classes.buttonSpc}
              />
              {selectedOrgInfo.selectedFacility && (
                <Button label={strings.NEW_ACCESSION} onClick={goToNewAccession} size='medium' id='newAccession' />
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
          {(fieldOptions === null || availableFieldOptions === null) && strings.GENERIC_ERROR}
        </PageHeader>
        <Container maxWidth={false} className={classes.mainContainer}>
          {organization && unfilteredResults ? (
            <Grid container>
              {!!organization?.projects?.length ? (
                <>
                  {pendingAccessions && pendingAccessions.length > 0 && (
                    <Grid item xs={12} className={classes.checkinMessage}>
                      <Paper>
                        <Grid item xs={12} className={classes.checkInContent}>
                          <div>
                            <span> {strings.CHECKIN_BAGS}</span>
                            <p className={classes.checkInText}>
                              {strings.formatString(strings.CHECK_IN_MESSAGE, pendingAccessions.length)}
                            </p>
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
                      </Paper>
                    </Grid>
                  )}
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
                </>
              ) : HighOrganizationRolesValues.includes(organization?.role || '') ? (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.PLANTS_EMPTY_MSG_TITLE}
                  text={emptyMessageStrings.PLANTS_EMPTY_MSG_BODY}
                  buttonText={strings.GO_TO_PROJECTS}
                  onClick={goToProjects}
                />
              ) : (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.CHECK_BACK_LATER}
                  text={emptyMessageStrings.EMPTY_MESSAGE_CONTRIBUTOR}
                />
              )}
            </Grid>
          ) : (
            <div className={classes.spinnerContainer}>
              <CircularProgress />
            </div>
          )}
        </Container>
      </TfMain>
    </MuiPickersUtilsProvider>
  );
}
