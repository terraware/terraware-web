import { Box, CircularProgress, Container, Grid, useTheme } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import useQuery from '../../../utils/useQuery';
import SeedBankService, { DEFAULT_SEED_SEARCH_FILTERS, FieldValuesMap } from 'src/services/SeedBankService';
import { SearchNodePayload, SearchResponseElement, SearchCriteria, SearchSortOrder } from 'src/types/Search';
import Button from 'src/components/common/button/Button';
import { BaseTable as Table } from 'src/components/common/table';
import { SortOrder as Order } from 'src/components/common/table/sort';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { getAllSeedBanks } from 'src/utils/organization';
import PageHeader from '../PageHeader';
import { columnsIndexed, RIGHT_ALIGNED_COLUMNS } from './columns';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import SearchCellRenderer from './TableCellRenderer';
import { Facility } from 'src/types/Facility';
import { stateName } from 'src/types/Accession';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import { ACCESSION_2_STATES } from '../../../types/Accession';
import SelectSeedBankModal from '../../SeedBank/SelectSeedBankModal';
import { isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ImportAccessionsModal from './ImportAccessionsModal';
import { DropdownItem, Message } from '@terraware/web-components';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import useSnackbar, { SNACKBAR_PAGE_CLOSE_KEY } from 'src/utils/useSnackbar';
import { PreferencesService } from 'src/services';
import { DatabaseColumn } from '@terraware/web-components/components/table/types';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectMessage } from 'src/redux/features/message/messageSelectors';
import { sendMessage } from 'src/redux/features/message/messageSlice';
import isEnabled from 'src/features';

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

const filterSelectFields = (fields: string[]): string[] => {
  const columns = columnsIndexed();

  return fields.reduce((acum: string[], value) => {
    const dbColumn: DatabaseColumn = columns[value];
    if (['multiple_selection', 'single_selection'].includes(dbColumn.filter?.type ?? '')) {
      acum.push(dbColumn.key);
    }

    return acum;
  }, [] as string[]);
};

type DatabaseProps = {
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
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const { activeLocale } = useLocalization();
  const { reloadUserPreferences } = useUser();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const theme = useTheme();
  const history = useHistory();
  const query = useQuery();
  const location = useStateLocation();
  const featureFlagProjects = isEnabled('Projects');
  const {
    searchCriteria,
    setSearchCriteria,
    searchSortOrder,
    setSearchSortOrder,
    searchColumns,
    setSearchColumns,
    displayColumnNames,
    setDisplayColumnNames,
    hasSeedBanks,
    hasSpecies,
    reloadData,
  } = props;
  const columns = columnsIndexed();
  const displayColumnDetails = displayColumnNames
    .filter((name) => (featureFlagProjects ? true : name !== 'project_name'))
    .map((name) => {
      const detail = { ...columns[name] };

      // set the classname for right aligned columns
      if (RIGHT_ALIGNED_COLUMNS.indexOf(name) !== -1) {
        detail.className = classes.rightAligned;
      }

      return detail;
    });
  const filterColumns = displayColumnDetails.filter((col) => !['state', 'project_name'].includes(col.key));
  const searchTermColumns = [columns.accessionNumber, columns.speciesName, columns.collectionSiteName];
  const preExpFilterColumns = featureFlagProjects ? [columns.state, columns.project_name] : [columns.state];
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElement[] | null>();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>();
  const contentRef = useRef(null);
  const searchedLocaleRef = useRef<string | null>(activeLocale);

  /*
   * fieldOptions is a list of records
   * keys: all single and multi select search fields.
   * values: all the existing values that the field has in the database, for all accessions.
   */
  const [fieldOptions, setFieldOptions] = useState<FieldValuesMap | null>();
  /*
   * availableFieldOptions is a list of records
   * keys: all single and multi select search fields.
   * values: all the values that are associated with an accession in the current facility AND that aren't being
   * filtered out by searchCriteria.
   */
  const [availableFieldOptions, setAvailableFieldOptions] = useState<FieldValuesMap | null>();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [selectedRows, setSelectedRows] = useState<SearchResponseElement[]>([]);
  const [unfilteredResults, setUnfilteredResults] = useState<SearchResponseElement[] | null>();
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState<boolean>(false);
  const [openImportModal, setOpenImportModal] = useState<boolean>(false);
  const [showDefaultSystemSnackbar, setShowDefaultSystemSnackbar] = useState(false);
  const { userPreferences } = useUser();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const closeMessageSelector = useAppSelector(selectMessage(`seeds.${SNACKBAR_PAGE_CLOSE_KEY}.ackWeightSystem`));

  useEffect(() => {
    const updatePreferences = async () => {
      await PreferencesService.updateUserPreferences({ defaultWeightSystemAcknowledgedOnMs: Date.now() });
      reloadUserPreferences();
    };
    if (closeMessageSelector) {
      dispatch(sendMessage({ key: `seeds.${SNACKBAR_PAGE_CLOSE_KEY}.dismissPageMessage`, data: undefined }));
      updatePreferences();
    }
  }, [closeMessageSelector, dispatch, reloadUserPreferences]);

  useEffect(() => {
    const showSnackbar = () => {
      snackbar.pageInfo(
        strings.formatString<any>(
          strings.CHANGE_DEFAULT_WEIGHT_SYSTEM,
          <Link to={APP_PATHS.MY_ACCOUNT}>{strings.MY_ACCOUNT}</Link>
        ),
        '',
        {
          label: strings.GOT_IT,
          key: 'ackWeightSystem',
          payload: Date.now(),
        }
      );
    };
    if (showDefaultSystemSnackbar) {
      showSnackbar();
    }
  }, [showDefaultSystemSnackbar, snackbar, userPreferences.preferredWeightSystem, reloadUserPreferences]);

  const updateSearchColumns = useCallback(
    (columnNames?: string[]) => {
      if (columnNames) {
        const columnInfo = columnsIndexed();
        const validColumns = columnNames.filter((name) => name in columnInfo);
        const searchSelectedColumns = validColumns.reduce((acum, value) => {
          acum.push(value);
          const additionalColumns = columnInfo[value].additionalKeys;
          if (additionalColumns) {
            return acum.concat(additionalColumns);
          }

          return acum;
        }, [] as string[]);

        setSearchColumns(searchSelectedColumns);
        setDisplayColumnNames(validColumns);
      }
    },
    [setSearchColumns, setDisplayColumnNames]
  );

  const updateSearchColumnsBootstrap = useCallback(
    (columnNames?: string[]) => {
      if (columnNames) {
        if (
          !userPreferences.defaultWeightSystemAcknowledgedOnMs &&
          userPreferences.preferredWeightSystem !== 'imperial' &&
          columnNames.find((cn) => cn === 'estimatedWeightOunces' || cn === 'estimatedWeightPounds')
        ) {
          setShowDefaultSystemSnackbar(true);
        }
        updateSearchColumns(columnNames);
      }
    },
    [userPreferences.preferredWeightSystem, userPreferences.defaultWeightSystemAcknowledgedOnMs, updateSearchColumns]
  );

  const saveSearchColumns = useCallback(
    async (columnNames?: string[]) => {
      await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, { accessionsColumns: columnNames });
      reloadOrgPreferences();
    },
    [selectedOrganization.id, reloadOrgPreferences]
  );

  const saveUpdateSearchColumns = useCallback(
    async (columnNames?: string[]) => {
      updateSearchColumns(columnNames);
      await saveSearchColumns(columnNames);
    },
    [updateSearchColumns, saveSearchColumns]
  );

  const reorderSearchColumns = async (columnNames: string[]) => {
    setDisplayColumnNames(columnNames);
    await saveSearchColumns(columnNames);
  };

  useEffect(() => {
    if (orgPreferences?.accessionsColumns) {
      if (featureFlagProjects && !(orgPreferences.accessionsColumns as string[]).includes('project_name')) {
        (orgPreferences.accessionsColumns as string[]).push('project_name');
      }
      updateSearchColumnsBootstrap(orgPreferences.accessionsColumns as string[]);
    }
  }, [featureFlagProjects, orgPreferences, updateSearchColumnsBootstrap]);

  useEffect(() => {
    // if url has stage=<accession state>, apply that filter
    const stage = query.getAll('stage');
    const facilityId = query.get('facilityId');
    const subLocationName = query.get('subLocationName');
    let newSearchCriteria = searchCriteria || {};
    if (stage.length || query.has('stage')) {
      delete newSearchCriteria.state;
      const stageNames = ACCESSION_2_STATES.map((name) => stateName(name));
      const stages = (stage || []).filter((stageName) => stageNames.indexOf(stageName) !== -1);
      if (stages.length) {
        newSearchCriteria = {
          ...newSearchCriteria,
          state: {
            field: 'state',
            values: stages,
            type: 'Exact',
            operation: 'field',
          },
        };
      }
      query.delete('stage');
    }
    if (subLocationName || query.has('subLocationName')) {
      delete newSearchCriteria.subLocation_name;
      if (subLocationName) {
        newSearchCriteria = {
          ...newSearchCriteria,
          subLocation_name: {
            field: 'subLocation_name',
            values: [subLocationName],
            type: 'Exact',
            operation: 'field',
          },
        };
      }
      query.delete('subLocationName');
    }
    if ((facilityId || query.has('facilityId')) && selectedOrganization) {
      const seedBanks = getAllSeedBanks(selectedOrganization);
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

    if (stage.length || (facilityId && selectedOrganization) || subLocationName) {
      history.replace(getLocation(location.pathname, location, query.toString()));
      setSearchCriteria(newSearchCriteria);

      // add seed bank and sub-location columns to show the filtered values as needed
      if (facilityId || subLocationName) {
        const newColumns = displayColumnNames
          .filter((name) => {
            if (facilityId && name === 'facility_name') {
              return false;
            }
            return name !== 'subLocation_name';
          })
          .concat(facilityId ? ['facility_name'] : [])
          .concat(subLocationName ? ['subLocation_name'] : []);
        saveUpdateSearchColumns(newColumns);
      }
    }
  }, [
    query,
    location,
    history,
    setSearchCriteria,
    selectedOrganization,
    searchCriteria,
    displayColumnNames,
    saveUpdateSearchColumns,
  ]);

  useEffect(() => {
    const populateUnfilteredResults = async () => {
      const apiResponse = await SeedBankService.searchAccessions({
        organizationId: selectedOrganization.id,
        fields: ['id'],
      });

      setUnfilteredResults(apiResponse);
    };
    const populatePendingAccessions = async () => {
      const data = await SeedBankService.getPendingAccessions(selectedOrganization.id);
      setPendingAccessions(data);
    };
    populateUnfilteredResults();
    populatePendingAccessions();
  }, [selectedOrganization.id]);

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

    if (selectedOrganization) {
      const populateSearchResults = async () => {
        const apiResponse = await SeedBankService.searchAccessions({
          organizationId: selectedOrganization.id,
          fields: getFieldsFromSearchColumns(),
          sortOrder: searchSortOrder,
          searchCriteria,
        });

        if (activeRequests) {
          setSearchResults(apiResponse);
        }
      };

      const populateAvailableFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        const data = await SeedBankService.searchFieldValues(
          singleAndMultiChoiceFields,
          searchCriteria,
          selectedOrganization.id
        );

        if (activeRequests) {
          setAvailableFieldOptions(data);
        }
      };

      const populateFieldOptions = async () => {
        const singleAndMultiChoiceFields = filterSelectFields(searchColumns);
        const allValues = await SeedBankService.searchFieldValues(
          singleAndMultiChoiceFields,
          {},
          selectedOrganization.id
        );

        if (activeRequests) {
          setFieldOptions(allValues);
        }
      };
      if (searchCriteria) {
        populateSearchResults();
      }
      populateAvailableFieldOptions();

      populateFieldOptions();
    }

    return () => {
      activeRequests = false;
    };
  }, [searchCriteria, searchSortOrder, searchColumns, selectedOrganization]);

  useEffect(() => {
    if (searchedLocaleRef.current && activeLocale && searchedLocaleRef.current !== activeLocale) {
      // If we've already done a search with a different locale, throw away search criteria since
      // they might contain localized values. Copy the default filters so React sees this as a
      // modification even if the existing search was also using the default.
      setSearchCriteria({ ...DEFAULT_SEED_SEARCH_FILTERS });
    }

    searchedLocaleRef.current = activeLocale;
  }, [activeLocale, setSearchCriteria]);

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
    setEditColumnsModalOpen(true);
  };

  const onDownloadReport = () => {
    setReportModalOpen(true);
  };

  const onCloseEditColumnsModal = (columnNames?: string[]) => {
    if (columnNames) {
      saveUpdateSearchColumns(columnNames);
    }
    setEditColumnsModalOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  const isInactive = (row: SearchResponseElement) => {
    return false;
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
    const newAccessionLocation = getLocation(APP_PATHS.ACCESSIONS2_NEW, location);
    history.push(newAccessionLocation);
  };

  const onSeedBankForImportSelected = (selectedFacilityOnModal: Facility | undefined) => {
    setSelectSeedBankForImportModalOpen(false);
    if (selectedFacilityOnModal) {
      setSelectedFacility(selectedFacilityOnModal);
      setOpenImportModal(true);
    }
  };

  const importAccessions = () => {
    setSelectSeedBankForImportModalOpen(true);
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSeedBanks) {
      emptyState.push({
        title: strings.ADD_SEED_BANKS,
        text: strings.ACCESSIONS_ONBOARDING_SEEDBANKS_MSG,
        buttonText: strings.GO_TO_SEED_BANKS,
        onClick: () => goTo(APP_PATHS.SEED_BANKS),
      });
    }

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: strings.ACCESSIONS_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        disabled: !hasSeedBanks,
        altItem: {
          title: strings.IMPORT_ACCESSIONS_ALT_TITLE,
          text: strings.IMPORT_ACCESSIONS_WITH_TEMPLATE,
          linkText: strings.DOWNLOAD_THE_CSV_TEMPLATE,
          onLinkClick: () => downloadCsvTemplateHandler(SeedBankService.downloadAccessionsTemplate),
          buttonText: strings.IMPORT_ACCESSIONS,
          onClick: () => importAccessions(),
        },
      });
    }

    return emptyState;
  };

  const isOnboarded = hasSeedBanks && hasSpecies;

  const onOptionItemClick = (optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'import': {
        setSelectSeedBankForImportModalOpen(true);
        break;
      }
      case 'export': {
        onDownloadReport();
        break;
      }
      case 'tableColumns': {
        onOpenEditColumnsModal();
        break;
      }
    }
  };

  const emptyStateSpacer = () => {
    return <Grid item xs={12} padding={theme.spacing(3)} />;
  };

  return (
    <>
      {selectedFacility && (
        <ImportAccessionsModal
          open={openImportModal}
          onClose={() => setOpenImportModal(false)}
          facility={selectedFacility}
          reloadData={reloadData}
        />
      )}
      {selectedOrganization && (
        <>
          <SelectSeedBankModal open={selectSeedBankForImportModalOpen} onClose={onSeedBankForImportSelected} />
        </>
      )}
      <TfMain backgroundImageVisible={!isOnboarded}>
        <EditColumns open={editColumnsModalOpen} value={displayColumnNames} onClose={onCloseEditColumnsModal} />
        {selectedOrganization && (
          <DownloadReportModal
            searchCriteria={searchCriteria}
            searchSortOrder={searchSortOrder}
            searchColumns={searchColumns}
            open={reportModalOpen}
            onClose={onCloseDownloadReportModal}
          />
        )}
        <PageHeaderWrapper nextElement={contentRef.current}>
          <PageHeader
            title=''
            subtitle={strings.ACCESSIONS_DATABASE_DESCRIPTION}
            page={strings.ACCESSIONS}
            parentPage={strings.SEEDS}
            rightComponent={
              isOnboarded ? (
                <>
                  {selectedOrganization &&
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
                  <OptionsMenu
                    onOptionItemClick={onOptionItemClick}
                    optionItems={[
                      { label: strings.IMPORT, value: 'import' },
                      { label: strings.EXPORT, value: 'export' },
                      { label: strings.CUSTOMIZE_TABLE_COLUMNS, value: 'tableColumns' },
                    ]}
                  />
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
          {selectedOrganization && unfilteredResults ? (
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
                          columns={filterColumns}
                          searchColumns={searchTermColumns}
                          preExpFilterColumns={preExpFilterColumns}
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
                          onReorderEnd={reorderSearchColumns}
                          isPresorted
                          selectedRows={selectedRows}
                          setSelectedRows={setSelectedRows}
                          showCheckbox
                          isClickable={() => false}
                        />
                      )}
                      {searchResults === undefined && <CircularProgress />}
                      {searchResults === null && strings.GENERIC_ERROR}
                    </Box>
                  </Grid>
                </>
              ) : isAdmin(selectedOrganization) ? (
                <>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    className={classes.message}
                    title={strings.ONBOARDING_ADMIN_TITLE}
                    rowItems={getEmptyState()}
                  />
                </>
              ) : (
                <>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    className={classes.message}
                    title={strings.REACH_OUT_TO_ADMIN_TITLE}
                    text={strings.NO_SEEDBANKS_NON_ADMIN_MSG}
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
    </>
  );
}
