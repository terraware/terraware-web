import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Popover,
  Typography,
  MenuList,
  MenuItem,
  useTheme,
} from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useQuery from '../../../utils/useQuery';
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
  searchSummary,
  SearchSummaryResponsePayload,
  SeedSearchCriteria,
  SeedSearchSortOrder,
} from 'src/api/seeds/search';
import Button from 'src/components/common/button/Button';
import Table from 'src/components/common/table';
import { SortOrder as Order } from 'src/components/common/table/sort';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { getAllSeedBanks } from 'src/utils/organization';
import PageHeader from '../PageHeader';
import { COLUMNS_INDEXED, RIGHT_ALIGNED_COLUMNS } from './columns';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';
import { ServerOrganization } from 'src/types/Organization';
import { Facility } from 'src/api/types/facilities';
import { seedsDatabaseSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import { useRecoilState } from 'recoil';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import { ACCESSION_STATES, ACCESSION_2_STATES } from '../../../types/Accession';
import SelectSeedBankModal from '../../SeedBank/SelectSeedBankModal';
import { isAdmin } from 'src/utils/organization';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import featureEnabled from 'src/features';
import ImportAccessionsModal from './ImportAccessionsModal';
import { Icon } from '@terraware/web-components';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    marginRight: (props: StyleProps) => (props.isMobile ? 0 : theme.spacing(3)),
    marginLeft: (props: StyleProps) => (props.isMobile ? theme.spacing(1) : 0),
    '&.mobile': {
      minWidth: '70px',
    },
    height: 'auto',
  },
  message: {
    margin: '0 auto',
    marginTop: '10%',
    maxWidth: '800px',
    width: '800px',
  },
  checkInText: {
    marginBottom: 0,
  },
  buttonSpc: {
    marginRight: '8px',
    '&:last-child': {
      marginRight: '0',
    },
  },
  requestMobileMessage: {
    marginBottom: '32px',
  },
  spinnerContainer: {
    position: 'fixed',
    top: '50%',
    left: 'calc(50% + 100px)',
  },
  headerButtonsContainer: {
    display: 'flex',
    '& .button--medium': {
      fontSize: '14px',
    },
  },
  rightAligned: {
    textAlign: 'right',
  },
}));

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
  hasSeedBanks: boolean;
  hasSpecies: boolean;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const theme = useTheme();
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();
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
    hasSeedBanks,
    hasSpecies,
  } = props;
  const displayColumnDetails = displayColumnNames.map((name) => {
    const detail = { ...COLUMNS_INDEXED[name] };

    // set the classname for right aligned columns
    if (RIGHT_ALIGNED_COLUMNS.indexOf(name) !== -1) {
      detail.className = classes.rightAligned;
    }

    return detail;
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
  const [searchSummaryResults, setSearchSummaryResults] = useState<SearchSummaryResponsePayload | null>();
  const [unfilteredResults, setUnfilteredResults] = useState<SearchResponseElement[] | null>();
  const [selectSeedBankModalOpen, setSelectSeedBankModalOpen] = useState<boolean>(false);
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState<boolean>(false);
  const [openImportModal, setOpenImportModal] = useState<boolean>(false);

  useEffect(() => {
    // if url has stage=<accession state>, apply that filter
    const stage = query.get('stage');
    const facilityId = query.get('facilityId');
    let newSearchCriteria = searchCriteria || {};
    if (stage || query.has('stage')) {
      delete newSearchCriteria.state;
      if (stage && [...ACCESSION_STATES, ...ACCESSION_2_STATES].indexOf(stage) !== -1) {
        newSearchCriteria = {
          ...newSearchCriteria,
          state: {
            field: 'state',
            values: [stage],
            type: 'Exact',
            operation: 'field',
          },
        };
      }
      query.delete('stage');
    }
    if ((facilityId || query.has('facilityId')) && organization) {
      const seedBanks = getAllSeedBanks(organization);
      delete newSearchCriteria.facility_name;
      if (seedBanks && facilityId) {
        const facility = seedBanks.find((seedBank) => seedBank?.id === parseInt(facilityId, 10));
        if (facility) {
          newSearchCriteria = {
            ...newSearchCriteria,
            facility_name: {
              field: 'facility_name',
              values: [facility.name],
              type: 'Exact',
              operation: 'field',
            },
          };
        }
      }
      query.delete('facilityId');
    }
    if (stage || (facilityId && organization)) {
      history.replace(getLocation(location.pathname, location, query.toString()));
      setSearchCriteria(newSearchCriteria);
    }
  }, [query, location, history, setSearchCriteria, organization, searchCriteria]);

  useEffect(() => {
    let activeRequests = true;
    const getFieldsFromSearchColumns = () => {
      let columnsNamesToSearch = Array<string>();
      if (searchColumns.includes('active')) {
        columnsNamesToSearch = [...searchColumns, 'id'];
      } else {
        columnsNamesToSearch = [...searchColumns, 'active', 'id'];
      }

      return columnsNamesToSearch;
    };

    if (organization) {
      const populateUnfilteredResults = async () => {
        const apiResponse = await search({
          prefix: 'facilities.accessions',
          fields: getFieldsFromSearchColumns(),
          sortOrder: [searchSortOrder],
          search: convertToSearchNodePayload({}, organization.id),
          count: 1000,
        });

        if (activeRequests) {
          setUnfilteredResults(apiResponse);
        }
      };

      const populateSearchResults = async () => {
        const apiResponse = await search({
          prefix: 'facilities.accessions',
          fields: getFieldsFromSearchColumns(),
          sortOrder: [searchSortOrder],
          search: convertToSearchNodePayload(searchCriteria, organization.id),
          count: 1000,
        });

        if (activeRequests) {
          setSearchResults(apiResponse);
        }
      };

      const populateAvailableFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        const data = await searchFieldValues(singleAndMultiChoiceFields, searchCriteria, organization.id);

        if (activeRequests) {
          setAvailableFieldOptions(data);
        }
      };

      const populatePendingAccessions = async () => {
        if (organization) {
          const data = await getPendingAccessions(organization.id);

          if (activeRequests) {
            setPendingAccessions(data);
          }
        }
      };

      const populateFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        const allValues = await getAllFieldValues(singleAndMultiChoiceFields, organization.id);

        const isV2 = featureEnabled('V2 Accessions');
        if (!isV2 && allValues?.state?.values) {
          allValues.state.values = allValues.state.values.filter(
            (state) => ['Awaiting Processing', 'Used Up'].indexOf(state) === -1
          );
        }

        if (activeRequests) {
          setFieldOptions(allValues);
        }
      };

      const populateSearchSummary = async () => {
        const apiResponse = await searchSummary({
          search: convertToSearchNodePayload(searchCriteria, organization.id),
        });

        if (activeRequests) {
          setSearchSummaryResults(apiResponse);
        }
      };
      populateUnfilteredResults();
      populateSearchResults();
      populateAvailableFieldOptions();
      populatePendingAccessions();
      populateFieldOptions();
      populateSearchSummary();
    }

    return () => {
      activeRequests = false;
    };
  }, [searchCriteria, searchSortOrder, searchColumns, organization]);

  const onSelect = (row: SearchResponseElement) => {
    if (row.id) {
      const isV2 = featureEnabled('V2 Accessions');
      const seedCollectionLocation = {
        pathname: (isV2 ? APP_PATHS.ACCESSIONS2_ITEM : APP_PATHS.ACCESSIONS_ITEM).replace(
          ':accessionId',
          row.id as string
        ),
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
    setAnchorEl(null);
    setEditColumnsModalOpen(true);
  };

  const onDownloadReport = () => {
    setAnchorEl(null);
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
    return false;
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

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const goToNewAccession = () => {
    if (featureEnabled('V2 Accessions')) {
      const newAccessionLocation = getLocation(APP_PATHS.ACCESSIONS2_NEW, location);
      history.push(newAccessionLocation);
    } else {
      setSelectSeedBankModalOpen(true);
    }
  };

  const onSeedBankSelected = (selectedFacility: Facility | undefined) => {
    setSelectSeedBankModalOpen(false);
    if (selectedFacility) {
      setSelectedOrgInfo({ ...selectedOrgInfo, selectedFacility });
      const newAccessionLocation = getLocation(APP_PATHS.ACCESSIONS_NEW, location);
      history.push(newAccessionLocation);
    }
  };

  const onSeedBankForImportSelected = (selectedFacility: Facility | undefined) => {
    setSelectSeedBankForImportModalOpen(false);
    if (selectedFacility) {
      setSelectedOrgInfo({ ...selectedOrgInfo, selectedFacility });
      setOpenImportModal(true);
    }
  };

  const importAccessions = () => {
    setSelectSeedBankForImportModalOpen(true);
  };

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSpecies) {
      emptyState.push({
        title: strings.SPECIES,
        text: emptyMessageStrings.ACCESSIONS_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
      });
    }

    if (!hasSeedBanks) {
      emptyState.push({
        title: strings.SEED_BANKS,
        text: emptyMessageStrings.ACCESSIONS_ONBOARDING_SEEDBANKS_MSG,
        buttonText: strings.GO_TO_SEED_BANKS,
        onClick: () => goTo(APP_PATHS.SEED_BANKS),
      });
    }

    return emptyState;
  };

  const isOnboarded = hasSeedBanks && hasSpecies;

  const getHeaderButtons = () => (
    <>
      <Box marginRight={1} display='inline'>
        <Button
          id='more-options'
          icon='iconMenuHorizontal'
          onClick={(event) => event && handleClick(event)}
          priority='secondary'
          size='medium'
        />
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuList sx={{ padding: theme.spacing(2, 0) }}>
          <MenuItem onClick={() => onDownloadReport()} id='download-report' sx={{ padding: theme.spacing(1, 2) }}>
            <Icon name='export' />
            <Typography sx={{ color: '#136BD3', paddingLeft: 1 }}>{strings.EXPORT_RECORDS}</Typography>
          </MenuItem>
          <MenuItem onClick={() => onOpenEditColumnsModal()} id='edit-columns' sx={{ padding: theme.spacing(1, 2) }}>
            <Icon name='iconColumns' />
            <Typography sx={{ color: '#136BD3', paddingLeft: 1 }}>{strings.CUSTOMIZE_TABLE_COLUMNS}</Typography>
          </MenuItem>
        </MenuList>
      </Popover>
      {!isMobile && (
        <Box paddingRight={1} display='inline'>
          <Button label={strings.IMPORT} size='medium' onClick={importAccessions} priority='secondary' />
        </Box>
      )}
    </>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {selectedOrgInfo.selectedFacility && (
        <ImportAccessionsModal
          open={openImportModal}
          onClose={() => setOpenImportModal(false)}
          facility={selectedOrgInfo.selectedFacility}
        />
      )}
      {organization && (
        <>
          <SelectSeedBankModal
            organization={organization}
            open={selectSeedBankModalOpen || selectSeedBankForImportModalOpen}
            onClose={selectSeedBankModalOpen ? onSeedBankSelected : onSeedBankForImportSelected}
          />
        </>
      )}
      <TfMain>
        <EditColumns open={editColumnsModalOpen} value={displayColumnNames} onClose={onCloseEditColumnsModal} />
        {organization && (
          <DownloadReportModal
            searchCriteria={searchCriteria}
            searchSortOrder={searchSortOrder}
            searchColumns={searchColumns}
            organization={organization}
            open={reportModalOpen}
            onClose={onCloseDownloadReportModal}
          />
        )}
        <PageHeader
          title=''
          allowAll={true}
          subtitle={isOnboarded ? getSubtitle() : undefined}
          page={strings.ACCESSIONS}
          parentPage={strings.SEEDS}
          rightComponent={
            isOnboarded ? (
              <>
                {getHeaderButtons()}
                {organization &&
                  (isMobile ? (
                    <Button icon='plus' onClick={goToNewAccession} size='medium' id='newAccession' />
                  ) : (
                    <Button
                      label={strings.NEW_ACCESSION}
                      icon='plus'
                      onClick={goToNewAccession}
                      size='medium'
                      id='newAccession'
                    />
                  ))}
              </>
            ) : undefined
          }
        >
          {isOnboarded && availableFieldOptions && fieldOptions && (
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
              {isOnboarded ? (
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
                            className={`${classes.checkInButton} ${isMobile ? 'mobile' : ''}`}
                            onClick={handleViewCollections}
                            id='viewCollections'
                            label={strings.VIEW}
                            priority='secondary'
                            type='passive'
                          />
                        </Grid>
                      </Paper>
                    </Grid>
                  )}

                  {searchSummaryResults && (
                    <Grid item xs={12}>
                      <Box sx={{ background: '#F2F4F5', display: 'flex', color: '#000000', padding: 2 }}>
                        <Typography>{strings.TOTAL}</Typography>
                        <Typography sx={{ paddingLeft: '4px', fontWeight: 500 }}>
                          {searchSummaryResults.accessions}
                        </Typography>
                        <Typography sx={{ paddingLeft: '4px' }}>
                          {searchSummaryResults.accessions === 1
                            ? strings.ACCESSION.toLowerCase()
                            : strings.ACCESSIONS.toLowerCase()}
                        </Typography>
                        <Typography sx={{ paddingLeft: '12px', fontWeight: 500 }}>
                          {searchSummaryResults.species}
                        </Typography>
                        <Typography sx={{ paddingLeft: '4px' }}>{strings.SPECIES.toLowerCase()}</Typography>
                        <Typography sx={{ paddingLeft: '12px', fontWeight: 500 }}>{`${
                          searchSummaryResults.seedsRemaining.total
                        }${
                          searchSummaryResults.seedsRemaining &&
                          searchSummaryResults.seedsRemaining.unknownQuantityAccessions > 0
                            ? '+'
                            : ''
                        }`}</Typography>
                        <Typography sx={{ paddingLeft: '4px' }}>
                          {searchSummaryResults.seedsRemaining.total === 1
                            ? strings.SEED.toLowerCase()
                            : strings.SEEDS.toLowerCase()}
                        </Typography>
                      </Box>
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
              ) : isAdmin(organization) ? (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.ACCESSIONS_ONBOARDING_ADMIN_TITLE}
                  rowItems={getEmptyState()}
                />
              ) : (
                <EmptyMessage
                  className={classes.message}
                  title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
                  text={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_MSG}
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
    </LocalizationProvider>
  );
}
