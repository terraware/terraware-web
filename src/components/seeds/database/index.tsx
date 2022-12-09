import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Popover,
  Typography,
  MenuList,
  MenuItem,
  useTheme,
} from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useQuery from '../../../utils/useQuery';
import {
  AllFieldValuesMap,
  FieldValuesMap,
  filterSelectFields,
  getAllFieldValues,
  getPendingAccessions,
  searchFieldValues,
} from 'src/api/seeds/search';
import {
  convertToSearchNodePayload,
  search,
  SearchNodePayload,
  SearchResponseElement,
  SearchCriteria,
  SearchSortOrder,
} from 'src/api/search';
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
import ImportAccessionsModal from './ImportAccessionsModal';
import { Icon, Message } from '@terraware/web-components';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import { downloadAccessionsTemplate } from 'src/api/accessions2/accession';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { updatePreferences } from 'src/api/preferences/preferences';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: 0,
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
    marginBottom: theme.spacing(1),
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
    maxWidth: '800px',
    padding: '48px',
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
  searchCriteria: SearchCriteria;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  searchSortOrder: SearchSortOrder;
  setSearchSortOrder: (order: SearchSortOrder) => void;
  searchColumns: string[];
  setSearchColumns: (fields: string[]) => void;
  displayColumnNames: string[];
  setDisplayColumnNames: (fields: string[]) => void;
  hasSeedBanks: boolean;
  hasSpecies: boolean;
  reloadData?: () => void;
  orgScopedPreferences?: { [key: string]: unknown };
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
    reloadData,
    orgScopedPreferences,
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
  const contentRef = useRef(null);

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
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState<boolean>(false);
  const [openImportModal, setOpenImportModal] = useState<boolean>(false);

  const updateSearchColumns = useCallback(
    (columnNames?: string[]) => {
      if (columnNames) {
        const searchSelectedColumns = columnNames.reduce((acum, value) => {
          acum.push(value);
          const additionalColumns = COLUMNS_INDEXED[value].additionalKeys;
          if (additionalColumns) {
            return acum.concat(additionalColumns);
          }

          return acum;
        }, [] as string[]);

        setSearchColumns(searchSelectedColumns);
        setDisplayColumnNames(columnNames);
      }
    },
    [setDisplayColumnNames, setSearchColumns]
  );

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

        if (activeRequests) {
          setFieldOptions(allValues);
        }
      };
      populateUnfilteredResults();
      populateSearchResults();
      populateAvailableFieldOptions();
      populatePendingAccessions();
      populateFieldOptions();
    }

    return () => {
      activeRequests = false;
    };
  }, [searchCriteria, searchSortOrder, searchColumns, organization]);

  useEffect(() => {
    if (orgScopedPreferences?.accessionsColumns) {
      updateSearchColumns(orgScopedPreferences.accessionsColumns as string[]);
    }
  }, [orgScopedPreferences, updateSearchColumns]);

  const onSelect = (row: SearchResponseElement) => {
    if (row.id) {
      const seedCollectionLocation = {
        pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', row.id as string),
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

  const onCloseEditColumnsModal = (columnNames?: string[]) => {
    if (columnNames) {
      updateSearchColumns(columnNames);
      if (organization?.id) {
        updatePreferences('accessionsColumns', columnNames, organization.id);
      }
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
    const newAccessionLocation = getLocation(APP_PATHS.ACCESSIONS2_NEW, location);
    history.push(newAccessionLocation);
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

    if (!hasSeedBanks) {
      emptyState.push({
        title: strings.ADD_SEED_BANKS,
        text: emptyMessageStrings.ACCESSIONS_ONBOARDING_SEEDBANKS_MSG,
        buttonText: strings.GO_TO_SEED_BANKS,
        onClick: () => goTo(APP_PATHS.SEED_BANKS),
      });
    }

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: emptyMessageStrings.ACCESSIONS_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        disabled: !hasSeedBanks,
        altItem: {
          title: strings.IMPORT_ACCESSIONS_ALT_TITLE,
          text: strings.IMPORT_ACCESSIONS_WITH_TEMPLATE,
          linkText: strings.DOWNLOAD_THE_CSV_TEMPLATE,
          onLinkClick: () => downloadCsvTemplateHandler(downloadAccessionsTemplate),
          buttonText: strings.IMPORT_ACCESSIONS,
          onClick: () => importAccessions(),
        },
      });
    }

    return emptyState;
  };

  const isOnboarded = hasSeedBanks && hasSpecies;

  const getHeaderButtons = () => (
    <>
      <Box marginLeft={1} display='inline'>
        <Button
          id='more-options'
          icon='menuVertical'
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
          {!isMobile && (
            <MenuItem onClick={importAccessions} id='import-accessions' sx={{ padding: theme.spacing(1, 2) }}>
              <Icon name='iconImport' />
              <Typography color={theme.palette.TwClrTxtBrand} paddingLeft={1}>
                {strings.IMPORT}
              </Typography>
            </MenuItem>
          )}
          <MenuItem onClick={() => onDownloadReport()} id='download-report' sx={{ padding: theme.spacing(1, 2) }}>
            <Icon name='iconExport' />
            <Typography color={theme.palette.TwClrTxtBrand} paddingLeft={1}>
              {strings.EXPORT}
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => onOpenEditColumnsModal()} id='edit-columns' sx={{ padding: theme.spacing(1, 2) }}>
            <Icon name='iconColumns' />
            <Typography color={theme.palette.TwClrTxtBrand} paddingLeft={1}>
              {strings.CUSTOMIZE_TABLE_COLUMNS}
            </Typography>
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );

  const emptyStateSpacer = () => {
    return <Grid item xs={12} padding={theme.spacing(3)} />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {selectedOrgInfo.selectedFacility && (
        <ImportAccessionsModal
          open={openImportModal}
          onClose={() => setOpenImportModal(false)}
          facility={selectedOrgInfo.selectedFacility}
          reloadData={reloadData}
        />
      )}
      {organization && (
        <>
          <SelectSeedBankModal
            organization={organization}
            open={selectSeedBankForImportModalOpen}
            onClose={onSeedBankForImportSelected}
          />
        </>
      )}
      <TfMain backgroundImageVisible={!isOnboarded}>
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
        <PageHeaderWrapper nextElement={contentRef.current}>
          <PageHeader
            title=''
            subtitle={strings.ACCESSIONS_DATABASE_DESCRIPTION}
            allowAll={true}
            page={strings.ACCESSIONS}
            parentPage={strings.SEEDS}
            rightComponent={
              isOnboarded ? (
                <>
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
                  {getHeaderButtons()}
                </>
              ) : undefined
            }
          >
            {(fieldOptions === null || availableFieldOptions === null) && strings.GENERIC_ERROR}
            {pendingAccessions && pendingAccessions.length > 0 && (
              <Grid item xs={12}>
                <Message
                  type='page'
                  priority='info'
                  title={strings.CHECKIN_ACCESSIONS}
                  body={strings.formatString(strings.CHECK_IN_MESSAGE, pendingAccessions.length).toString()}
                  pageButtons={[
                    <Button
                      key='1'
                      label={strings.VIEW}
                      onClick={handleViewCollections}
                      size='small'
                      priority='secondary'
                      type='passive'
                    />,
                  ]}
                />
              </Grid>
            )}
          </PageHeader>
        </PageHeaderWrapper>
        <Container ref={contentRef} maxWidth={false} className={classes.mainContainer}>
          {organization && unfilteredResults ? (
            <Grid container>
              {isOnboarded ? (
                <>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        backgroundColor: theme.palette.TwClrBg,
                        borderRadius: '32px',
                        padding: theme.spacing(3),
                        minWidth: 'fit-content',
                      }}
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
                    </Box>
                  </Grid>
                </>
              ) : isAdmin(organization) ? (
                <>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    className={classes.message}
                    title={emptyMessageStrings.ONBOARDING_ADMIN_TITLE}
                    rowItems={getEmptyState()}
                  />
                </>
              ) : (
                <>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    className={classes.message}
                    title={emptyMessageStrings.REACH_OUT_TO_ADMIN_TITLE}
                    text={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_MSG}
                  />
                </>
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
