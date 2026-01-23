import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { Box, CircularProgress, Container, Grid, useTheme } from '@mui/material';
import { DropdownItem, Message } from '@terraware/web-components';
import { DatabaseColumn } from '@terraware/web-components/components/table/types';
import _ from 'lodash';

import PageHeader from 'src/components/PageHeader';
import ProjectAssignTopBarButton from 'src/components/ProjectAssignTopBarButton';
import Card from 'src/components/common/Card';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { BaseTable as Table } from 'src/components/common/table';
import { SortOrder as Order } from 'src/components/common/table/sort';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import { selectMessage } from 'src/redux/features/message/messageSelectors';
import { sendMessage } from 'src/redux/features/message/messageSlice';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PreferencesService } from 'src/services';
import SeedBankService, { DEFAULT_SEED_SEARCH_FILTERS, FieldValuesMap } from 'src/services/SeedBankService';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { Project } from 'src/types/Project';
import { SearchCriteria, SearchNodePayload, SearchResponseElementWithId, SearchSortOrder } from 'src/types/Search';
import { useSessionFilters } from 'src/utils/filterHooks/useSessionFilters';
import { getAllSeedBanks } from 'src/utils/organization';
import { isAdmin } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar, { SNACKBAR_PAGE_CLOSE_KEY } from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import SelectSeedBankModal from '../../../scenes/SeedBanksRouter/SelectSeedBankModal';
import DownloadReportModal from './DownloadReportModal';
import EditColumns from './EditColumns';
import Filters from './Filters';
import ImportAccessionsModal from './ImportAccessionsModal';
import SearchCellRenderer from './TableCellRenderer';
import { columnsIndexed } from './columns';

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

  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const { activeLocale } = useLocalization();
  const { reloadUserPreferences } = useUser();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const { sessionFilters, setSessionFilters } = useSessionFilters('accessions');
  const { goToNewAccession } = useNavigateTo();

  const messageStyles = {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: '800px',
  };

  const projects = useAppSelector(selectProjects);

  const columns = columnsIndexed();
  const displayColumnDetails = displayColumnNames.map((name) => {
    const detail = { ...columns[name] };

    return detail;
  });
  const filterColumns = displayColumnDetails.filter((col) => !['state', 'project_name'].includes(col.key));
  const searchTermColumns = [columns.accessionNumber, columns.speciesName, columns.collectionSiteName];
  const preExpFilterColumns = [columns.state, columns.project_name];
  const [editColumnsModalOpen, setEditColumnsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElementWithId[] | null>();
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
  const [searchResults, setSearchResults] = useState<SearchResponseElementWithId[] | null>();
  const [selectedRows, setSelectedRows] = useState<SearchResponseElementWithId[]>([]);
  const [unfilteredResults, setUnfilteredResults] = useState<SearchResponseElementWithId[] | null>();
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState<boolean>(false);
  const [openImportModal, setOpenImportModal] = useState<boolean>(false);
  const [showDefaultSystemSnackbar, setShowDefaultSystemSnackbar] = useState(false);
  const { userPreferences } = useUser();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const closeMessageSelector = useAppSelector(selectMessage(`seeds.${SNACKBAR_PAGE_CLOSE_KEY}.ackWeightSystem`));

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    const updatePreferences = async () => {
      await PreferencesService.updateUserPreferences({ defaultWeightSystemAcknowledgedOnMs: Date.now() });
      reloadUserPreferences();
    };
    if (closeMessageSelector) {
      dispatch(sendMessage({ key: `seeds.${SNACKBAR_PAGE_CLOSE_KEY}.dismissPageMessage`, data: undefined }));
      void updatePreferences();
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
      if (selectedOrganization) {
        await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, { accessionsColumns: columnNames });
        reloadOrgPreferences();
      }
    },
    [selectedOrganization, reloadOrgPreferences]
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
      if (!(orgPreferences.accessionsColumns as string[]).includes('project_name')) {
        (orgPreferences.accessionsColumns as string[]).push('project_name');
      }
      updateSearchColumnsBootstrap(orgPreferences.accessionsColumns as string[]);
    }
  }, [orgPreferences, updateSearchColumnsBootstrap]);

  useEffect(() => {
    // if url has facilityId= or subLocationName=, apply each filter
    const facilityId = query.get('facilityId');
    const subLocationName = query.get('subLocationName');
    let newSearchCriteria = searchCriteria || {};

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
      const seedBanks = selectedOrganization ? getAllSeedBanks(selectedOrganization) : [];
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

    if ((facilityId && selectedOrganization) || subLocationName) {
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
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
        void saveUpdateSearchColumns(newColumns);
      }
    }
  }, [
    query,
    location,
    navigate,
    setSearchCriteria,
    selectedOrganization,
    searchCriteria,
    displayColumnNames,
    saveUpdateSearchColumns,
  ]);

  useEffect(() => {
    if (selectedOrganization) {
      const populateUnfilteredResults = async () => {
        const apiResponse: SearchResponseElementWithId[] | null = await SeedBankService.searchAccessions({
          organizationId: selectedOrganization.id,
          fields: ['id'],
        });

        setUnfilteredResults(apiResponse);
      };

      const populatePendingAccessions = async () => {
        const data: SearchResponseElementWithId[] | null = await SeedBankService.getPendingAccessions(
          selectedOrganization.id
        );
        setPendingAccessions(data);
      };

      void populateUnfilteredResults();
      void populatePendingAccessions();
    }
  }, [selectedOrganization]);

  const initAccessions = useCallback(() => {
    const getFieldsFromSearchColumns = () => {
      let columnsNamesToSearch: string[];
      if (searchColumns.includes('active')) {
        columnsNamesToSearch = [...searchColumns, 'id'];
      } else {
        columnsNamesToSearch = [...searchColumns, 'active', 'id'];
      }

      return columnsNamesToSearch;
    };

    if (selectedOrganization) {
      const requestId = setRequestId('accessions_search');

      const populateSearchResults = async () => {
        const apiResponse: SearchResponseElementWithId[] | null = await SeedBankService.searchAccessions({
          organizationId: selectedOrganization.id,
          fields: getFieldsFromSearchColumns(),
          sortOrder: searchSortOrder,
          searchCriteria,
        });

        if (requestId === getRequestId('accessions_search')) {
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

        if (requestId === getRequestId('accessions_search')) {
          setAvailableFieldOptions(data);
        }
      };

      const populateFieldOptions = async () => {
        // Since the seed bank service doesn't return values for project IDs, we need to merge the values in
        const singleAndMultiChoiceFields = filterSelectFields(
          searchColumns.filter((column) => column !== 'project_name')
        );

        const allValues =
          (await SeedBankService.searchFieldValues(singleAndMultiChoiceFields, {}, selectedOrganization.id)) || {};

        allValues.project_name = {
          partial: false,
          values: (projects || []).map((project: Project) => project.name),
        };

        if (requestId === getRequestId('accessions_search')) {
          setFieldOptions(allValues);
        }
      };

      if (searchCriteria) {
        void populateSearchResults();
      }

      void populateAvailableFieldOptions();
      void populateFieldOptions();
    }
  }, [projects, searchColumns, searchCriteria, searchSortOrder, selectedOrganization]);

  useEffect(() => {
    void initAccessions();
  }, [initAccessions]);

  useEffect(() => {
    if (searchedLocaleRef.current && activeLocale && searchedLocaleRef.current !== activeLocale) {
      // If we've already done a search with a different locale, throw away search criteria since
      // they might contain localized values. Copy the default filters so React sees this as a
      // modification even if the existing search was also using the default.
      setSearchCriteria({ ...DEFAULT_SEED_SEARCH_FILTERS });
    }

    searchedLocaleRef.current = activeLocale;
  }, [activeLocale, setSearchCriteria]);

  useEffect(() => {
    if (!sessionFilters || Object.keys(sessionFilters).length === 0) {
      return;
    }

    const nextSearchCriteria = {
      ...searchCriteria,
      // These filters need to be converted into SearchNodePayload
      ...Object.keys(sessionFilters).reduce(
        (newSearchCriteria, sessionFilterKey) => ({
          ...newSearchCriteria,
          [sessionFilterKey]: {
            field: sessionFilterKey,
            operation: 'field',
            type: 'Exact',
            values: sessionFilters[sessionFilterKey],
          },
        }),
        {} as SearchNodePayload
      ),
    };

    if (!_.isEqual(searchCriteria, nextSearchCriteria)) {
      setSearchCriteria(nextSearchCriteria);
    }
  }, [searchCriteria, sessionFilters, setSearchCriteria]);

  const onSelect = (row: SearchResponseElementWithId) => {
    if (row.id) {
      const seedCollectionLocation = {
        pathname: APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', row.id),
        state: { from: location.pathname },
      };
      navigate(seedCollectionLocation);
    }
  };

  const onSortChange = (order: Order, orderBy: string) => {
    setSearchSortOrder({
      field: orderBy,
      direction: order === 'asc' ? 'Ascending' : 'Descending',
    });
  };

  const onFilterChange = (newFilters: Record<string, SearchNodePayload>) => {
    setSearchCriteria(newFilters);

    // Since `state` is an obvious "in" filter, add to query and session, we can add other filters later
    // as needed (they include ranges and other things that are not yet supported in the useSessionFilters hook)
    if (newFilters.state) {
      setSessionFilters({ state: newFilters.state.values });
    } else {
      setSessionFilters({});
    }
  };

  const onOpenEditColumnsModal = () => {
    setEditColumnsModalOpen(true);
  };

  const onDownloadReport = () => {
    setReportModalOpen(true);
  };

  const onCloseEditColumnsModal = (columnNames?: string[]) => {
    if (columnNames) {
      void saveUpdateSearchColumns(columnNames);
    }
    setEditColumnsModalOpen(false);
  };

  const onCloseDownloadReportModal = () => {
    setReportModalOpen(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isInactive = (row: SearchResponseElementWithId) => {
    return false;
  };

  const handleViewCollections = () => {
    navigate(APP_PATHS.CHECKIN);
  };

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    navigate(appPathLocation);
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
    }
  };

  const emptyStateSpacer = () => {
    return <Grid item xs={12} padding={theme.spacing(3)} />;
  };

  const selectAllRows = useCallback(() => {
    if (searchResults) {
      setSelectedRows(searchResults);
    }
  }, [searchResults]);

  const reloadAccessions = useCallback(() => {
    void initAccessions();
  }, [initAccessions]);

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
      <TfMain>
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
            snackbarPageKey={'seeds'}
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
        <Container ref={contentRef} maxWidth={false} sx={{ padding: 0 }}>
          {selectedOrganization && unfilteredResults ? (
            <>
              {isOnboarded ? (
                <Card>
                  <Box
                    sx={{
                      backgroundColor: theme.palette.TwClrBg,
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
                        customizeColumns={onOpenEditColumnsModal}
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
                        onReorderEnd={(columnNames) => void reorderSearchColumns(columnNames)}
                        isPresorted
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        showCheckbox
                        isClickable={() => false}
                        showTopBar
                        topBarButtons={[
                          <ProjectAssignTopBarButton
                            key={1}
                            totalResultsCount={searchResults?.length}
                            selectAllRows={selectAllRows}
                            reloadData={reloadAccessions}
                            projectAssignPayloadCreator={() => ({
                              accessionIds: selectedRows.map((row) => Number(row.id)),
                            })}
                          />,
                        ]}
                      />
                    )}
                    {searchResults === undefined && <CircularProgress />}
                    {searchResults === null && strings.GENERIC_ERROR}
                  </Box>
                </Card>
              ) : isAdmin(selectedOrganization) ? (
                <Container maxWidth={false} sx={{ padding: '32px 0' }}>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage title={strings.ONBOARDING_ADMIN_TITLE} rowItems={getEmptyState()} sx={messageStyles} />
                </Container>
              ) : (
                <Container maxWidth={false} sx={{ padding: '32px 0' }}>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    title={strings.REACH_OUT_TO_ADMIN_TITLE}
                    text={strings.NO_SEEDBANKS_NON_ADMIN_MSG}
                    sx={messageStyles}
                  />
                </Container>
              )}
            </>
          ) : (
            <Box
              sx={{
                position: 'fixed',
                top: '50%',
                left: 'calc(50% + 100px)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Container>
      </TfMain>
    </>
  );
}
