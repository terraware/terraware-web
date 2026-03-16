import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, CircularProgress, Container, Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import { DropdownItem, Message } from '@terraware/web-components';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ColumnFiltersState,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import PageHeader from 'src/components/PageHeader';
import Card from 'src/components/common/Card';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextTruncated from 'src/components/common/TextTruncated';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SeedBankService from 'src/services/SeedBankService';
import strings from 'src/strings';
import { ACCESSION_2_STATES } from 'src/types/Accession';
import { Facility } from 'src/types/Facility';
import { Project } from 'src/types/Project';
import { SearchResponseElementWithId } from 'src/types/Search';
import { makeCsv } from 'src/utils/csv';
import { makeDateRangeFilterFn } from 'src/utils/tableFilters';
import { getAllSeedBanks, isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import SelectSeedBankModal from '../../../scenes/SeedBanksRouter/SelectSeedBankModal';
import ImportAccessionsModal from './ImportAccessionsModal';

const TABLE_STATE_STORAGE_KEY = 'accessions-database-table';

const DEFAULT_VISIBLE_COLUMNS = [
  'accessionNumber',
  'speciesName',
  'project_name',
  'state',
  'collectionSiteName',
  'collectedDate',
  'ageMonths',
  'estimatedWeightGrams',
  'estimatedCount',
];

const DEFAULT_COLUMN_ORDER = [
  'accessionNumber',
  'speciesName',
  'project_name',
  'state',
  'collectionSiteName',
  'collectedDate',
  'ageMonths',
  'estimatedWeightGrams',
  'estimatedCount',
  'facility_name',
  'subLocation_name',
  'species_commonName',
  'species_familyName',
  'collectionSiteLandowner',
  'collectionSiteNotes',
  'ageYears',
  'totalWithdrawnCount',
  'totalWithdrawnWeightMilligrams',
  'totalWithdrawnWeightGrams',
  'totalWithdrawnWeightKilograms',
  'totalWithdrawnWeightOunces',
  'totalWithdrawnWeightPounds',
  'totalViabilityPercent',
  'estimatedWeightMilligrams',
  'estimatedWeightKilograms',
  'estimatedWeightOunces',
  'estimatedWeightPounds',
  'geolocations',
  'plantId',
];

const DEFAULT_COLUMN_VISIBILITY = Object.fromEntries(
  DEFAULT_COLUMN_ORDER.filter((col) => !DEFAULT_VISIBLE_COLUMNS.includes(col)).map((col) => [col, false])
);

const ALL_ACCESSION_FIELDS = [
  'id',
  'accessionNumber',
  'state',
  'facility_name',
  'subLocation_name',
  'speciesName',
  'project_name',
  'species_commonName',
  'species_familyName',
  'collectedDate',
  'collectionSiteName',
  'collectionSiteLandowner',
  'collectionSiteNotes',
  'ageMonths',
  'ageYears',
  'totalWithdrawnCount',
  'totalWithdrawnWeightMilligrams',
  'totalWithdrawnWeightGrams',
  'totalWithdrawnWeightKilograms',
  'totalWithdrawnWeightOunces',
  'totalWithdrawnWeightPounds',
  'totalViabilityPercent',
  'estimatedWeightMilligrams',
  'estimatedWeightGrams',
  'estimatedWeightKilograms',
  'estimatedWeightOunces',
  'estimatedWeightPounds',
  'estimatedCount',
  'geolocations.coordinates',
  'plantId',
];

type DatabaseProps = {
  hasSeedBanks: boolean;
  hasSpecies: boolean;
  reloadData?: () => void;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { hasSeedBanks, hasSpecies, reloadData } = props;

  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const query = useQuery();
  const location = useStateLocation();
  const { goToNewAccession } = useNavigateTo();
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const contentRef = useRef(null);

  const [searchResults, setSearchResults] = useState<SearchResponseElementWithId[] | null>();
  const [pendingAccessions, setPendingAccessions] = useState<SearchResponseElementWithId[] | null>();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>();
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);

  const {
    columnFilters,
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    setColumnFilters,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    setSorting,
    showColumnFilters,
    showGlobalFilter,
    sorting,
  } = useTableState(TABLE_STATE_STORAGE_KEY, {
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultColumnVisibility: DEFAULT_COLUMN_VISIBILITY,
    defaultSorting: [{ id: 'accessionNumber', desc: false }],
    persistFilters: true,
    persistSorting: true,
  });

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  const fetchAccessions = useCallback(async () => {
    if (!selectedOrganization) {
      return;
    }
    try {
      const apiResponse = await SeedBankService.searchAccessions({
        organizationId: selectedOrganization.id,
        fields: ALL_ACCESSION_FIELDS,
      });
      setSearchResults(apiResponse as SearchResponseElementWithId[] | null);
    } catch (error) {
      setSearchResults(null);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    void fetchAccessions();
  }, [fetchAccessions]);

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }
    const populatePendingAccessions = async () => {
      const data = await SeedBankService.getPendingAccessions(selectedOrganization.id);
      setPendingAccessions(data);
    };
    void populatePendingAccessions();
  }, [selectedOrganization]);

  useEffect(() => {
    const facilityId = query.get('facilityId');
    const subLocationName = query.get('subLocationName');

    if (!facilityId && !subLocationName) {
      return;
    }

    const urlFilters: MRT_ColumnFiltersState = [];

    if (subLocationName) {
      urlFilters.push({ id: 'subLocation_name', value: subLocationName });
      query.delete('subLocationName');
    }

    if (facilityId && selectedOrganization) {
      const seedBanks = getAllSeedBanks(selectedOrganization);
      const facility = seedBanks.find((sb) => sb?.id === parseInt(facilityId, 10));
      if (facility) {
        urlFilters.push({ id: 'facility_name', value: facility.name });
      }
      query.delete('facilityId');
    }

    if (urlFilters.length > 0) {
      setColumnFilters((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const newFilters = urlFilters.filter((f) => !existingIds.has(f.id));
        return [...prev, ...newFilters];
      });
      setShowColumnFilters(true);
      navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    }
  }, [location, navigate, query, selectedOrganization, setColumnFilters, setShowColumnFilters]);

  const isOnboarded = hasSeedBanks && hasSpecies;

  const handleViewCollections = () => {
    navigate(APP_PATHS.CHECKIN);
  };

  const onSeedBankForImportSelected = (selectedFacilityOnModal: Facility | undefined) => {
    setSelectSeedBankForImportModalOpen(false);
    if (selectedFacilityOnModal) {
      setSelectedFacility(selectedFacilityOnModal);
      setOpenImportModal(true);
    }
  };

  const goTo = (appPath: string) => {
    navigate({ pathname: appPath });
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'import') {
      setSelectSeedBankForImportModalOpen(true);
    }
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
          onClick: () => setSelectSeedBankForImportModalOpen(true),
        },
      });
    }

    return emptyState;
  };

  const emptyStateSpacer = () => <Grid item xs={12} padding={theme.spacing(3)} />;

  const messageStyles = {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: '800px',
  };

  const uniqueStates = useMemo(() => ACCESSION_2_STATES as string[], []);

  const uniqueFacilityNames = useMemo(
    () => Array.from(new Set(searchResults?.map((r) => r.facility_name as string).filter(Boolean))).sort(),
    [searchResults]
  );

  const uniqueSubLocationNames = useMemo(
    () => Array.from(new Set(searchResults?.map((r) => r.subLocation_name as string).filter(Boolean))).sort(),
    [searchResults]
  );

  const uniqueProjectNames = useMemo(
    () =>
      (projects || [])
        .map((p: Project) => p.name)
        .filter((name): name is string => !!name)
        .sort(),
    [projects]
  );

  const AccessionNumberCell = useCallback(({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
    const row = cell.row.original;
    const value = cell.getValue() as string;
    return (
      <Link fontSize='16px' to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', String(row.id))}>
        {value}
      </Link>
    );
  }, []);

  const ViabilityCell = useCallback(({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
    const value = cell.getValue();
    return value !== undefined && value !== null ? <span>{`${value as number}%`}</span> : null;
  }, []);

  const GeolocationCell = useCallback(({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
    const value = cell.getValue() as string;
    const list = value ? value.split(', ') : [];
    return list.length > 0 ? (
      <TextTruncated
        stringList={list}
        listSeparator={strings.LIST_SEPARATOR_SECONDARY}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    ) : null;
  }, []);

  const editableColumns = useMemo<EditableTableColumn<SearchResponseElementWithId>[]>(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'accessionNumber',
        header: strings.ACCESSION,
        accessorKey: 'accessionNumber',
        filterVariant: 'text',
        Cell: AccessionNumberCell,
      },
      {
        id: 'state',
        header: strings.STATUS,
        accessorKey: 'state',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueStates,
      },
      {
        id: 'facility_name',
        header: strings.SEED_BANKS,
        accessorKey: 'facility_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueFacilityNames,
      },
      {
        id: 'subLocation_name',
        header: strings.SUB_LOCATION,
        accessorKey: 'subLocation_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueSubLocationNames,
      },
      {
        id: 'speciesName',
        header: strings.SPECIES,
        accessorKey: 'speciesName',
        filterVariant: 'text',
      },
      {
        id: 'project_name',
        header: strings.PROJECT,
        accessorKey: 'project_name',
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
      },
      {
        id: 'species_commonName',
        header: strings.COMMON_NAME,
        accessorKey: 'species_commonName',
        filterVariant: 'text',
      },
      {
        id: 'species_familyName',
        header: strings.FAMILY,
        accessorKey: 'species_familyName',
        filterVariant: 'text',
      },
      {
        id: 'collectedDate',
        header: strings.COLLECTION_DATE,
        accessorFn: (row) => {
          const dateStr = (row as Record<string, unknown>).collectedDate as string | null;
          if (!dateStr) {
            return null;
          }
          const [y, m, d] = dateStr.split('-').map(Number);
          return new Date(y, m - 1, d);
        },
        filterVariant: 'date-range',
        filterFn: makeDateRangeFilterFn<SearchResponseElementWithId>('collectedDate'),
        Cell: ({ cell }: { cell: MRT_Cell<SearchResponseElementWithId> }) => {
          const dateStr = (cell.row.original as Record<string, unknown>).collectedDate as string | null;
          return dateStr ? <span>{dateStr}</span> : null;
        },
      },
      {
        id: 'collectionSiteName',
        header: strings.COLLECTING_SITE,
        accessorKey: 'collectionSiteName',
        filterVariant: 'text',
      },
      {
        id: 'collectionSiteLandowner',
        header: strings.LANDOWNER,
        accessorKey: 'collectionSiteLandowner',
        filterVariant: 'text',
      },
      {
        id: 'collectionSiteNotes',
        header: strings.NOTES,
        accessorKey: 'collectionSiteNotes',
        filterVariant: 'text',
      },
      {
        id: 'ageMonths',
        header: strings.AGE_MONTHS,
        accessorFn: (row) => {
          const val = row.ageMonths;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'ageYears',
        header: strings.AGE_YEARS,
        accessorFn: (row) => {
          const val = row.ageYears;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnCount',
        header: strings.TOTAL_WITHDRAWN_COUNT,
        accessorFn: (row) => {
          const val = row.totalWithdrawnCount;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnWeightMilligrams',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_MILLIGRAMS,
        accessorFn: (row) => {
          const val = row.totalWithdrawnWeightMilligrams;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnWeightGrams',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_GRAMS,
        accessorFn: (row) => {
          const val = row.totalWithdrawnWeightGrams;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnWeightKilograms',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_KILOGRAMS,
        accessorFn: (row) => {
          const val = row.totalWithdrawnWeightKilograms;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnWeightOunces',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_OUNCES,
        accessorFn: (row) => {
          const val = row.totalWithdrawnWeightOunces;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalWithdrawnWeightPounds',
        header: strings.TOTAL_WITHDRAWN_WEIGHT_POUNDS,
        accessorFn: (row) => {
          const val = row.totalWithdrawnWeightPounds;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'totalViabilityPercent',
        header: strings.VIABILITY,
        accessorFn: (row) => {
          const val = row.totalViabilityPercent;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
        Cell: ViabilityCell,
      },
      {
        id: 'estimatedWeightMilligrams',
        header: strings.WEIGHT_MILLIGRAMS,
        accessorFn: (row) => {
          const val = row.estimatedWeightMilligrams;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'estimatedWeightGrams',
        header: strings.WEIGHT_GRAMS,
        accessorFn: (row) => {
          const val = row.estimatedWeightGrams;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'estimatedWeightKilograms',
        header: strings.WEIGHT_KILOGRAMS,
        accessorFn: (row) => {
          const val = row.estimatedWeightKilograms;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'estimatedWeightOunces',
        header: strings.WEIGHT_OUNCES,
        accessorFn: (row) => {
          const val = row.estimatedWeightOunces;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'estimatedWeightPounds',
        header: strings.WEIGHT_POUNDS,
        accessorFn: (row) => {
          const val = row.estimatedWeightPounds;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'estimatedCount',
        header: strings.COUNT,
        accessorFn: (row) => {
          const val = row.estimatedCount;
          return val !== undefined && val !== null ? Number(val) : undefined;
        },
        filterVariant: 'range',
      },
      {
        id: 'geolocations',
        header: strings.LATITUDE_LONGITUDE,
        accessorFn: (row) => {
          const geolocations = (row.geolocations || []) as any[];
          return geolocations.map((gl) => gl.coordinates as string).join(', ');
        },
        filterVariant: 'text',
        Cell: GeolocationCell,
      },
      {
        id: 'plantId',
        header: strings.PLANT_ID,
        accessorKey: 'plantId',
        filterVariant: 'text',
      },
    ];
  }, [
    activeLocale,
    uniqueStates,
    uniqueFacilityNames,
    uniqueSubLocationNames,
    uniqueProjectNames,
    AccessionNumberCell,
    ViabilityCell,
    GeolocationCell,
  ]);

  const downloadReportHandler = useCallback((table: MRT_TableInstance<SearchResponseElementWithId>) => {
    const filteredRows = table.getSortedRowModel().rows;
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => !col.id.startsWith('mrt-') && typeof col.columnDef.header === 'string');
    const csvColumns = visibleColumns.map((col) => ({
      key: col.id,
      displayLabel: col.columnDef.header as string,
    }));
    const csvData = filteredRows.map((row) => {
      const rowData: Record<string, string> = {};
      visibleColumns.forEach((col) => {
        const value = row.getValue(col.id);
        rowData[col.id] = value !== null && value !== undefined ? String(value) : '';
      });
      return rowData;
    });
    const blob = makeCsv(csvColumns, csvData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'accessions.csv');
    link.click();
    URL.revokeObjectURL(url);
  }, []);

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
        <SelectSeedBankModal open={selectSeedBankForImportModalOpen} onClose={onSeedBankForImportSelected} />
      )}
      <TfMain>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <PageHeader
            title=''
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
                    optionItems={[{ label: strings.IMPORT, value: 'import' }]}
                  />
                </>
              ) : undefined
            }
          >
            {null}
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
          {selectedOrganization ? (
            <>
              {isOnboarded ? (
                <Card>
                  {searchResults !== undefined ? (
                    searchResults !== null ? (
                      <EditableTable
                        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
                        columns={editableColumns}
                        data={searchResults ?? []}
                        enableEditing={false}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        enableColumnFilters={true}
                        enableColumnOrdering={true}
                        storageKey={TABLE_STATE_STORAGE_KEY}
                        enablePagination={false}
                        enableTopToolbar={true}
                        enableBottomToolbar={false}
                        tableOptions={{
                          defaultColumn: {
                            enableEditing: false,
                            filterVariant: 'text',
                            sortUndefined: 'last',
                          },
                          state: {
                            sorting,
                            columnOrder,
                            columnVisibility,
                            density,
                            columnFilters,
                            showColumnFilters,
                            showGlobalFilter,
                          },
                          onSortingChange: setSorting,
                          onColumnOrderChange: setColumnOrder,
                          onColumnVisibilityChange: setColumnVisibility,
                          onColumnFiltersChange: setColumnFilters,
                          onShowColumnFiltersChange: setShowColumnFilters,
                          onShowGlobalFilterChange: setShowGlobalFilter,
                          onDensityChange,
                          enableColumnPinning: true,
                          enableColumnActions: true,
                          enableHiding: true,
                          enableColumnDragging: true,
                          positionGlobalFilter: 'right',
                          getRowId: (row) => String(row.id),
                          renderToolbarInternalActions: ({ table }) => (
                            <Box display='flex' gap={0.5}>
                              <Tooltip title={strings.EXPORT}>
                                <IconButton onClick={() => downloadReportHandler(table)}>
                                  <Icon name='iconExport' size='medium' />
                                </IconButton>
                              </Tooltip>
                              <MRT_ToggleGlobalFilterButton table={table} />
                              <MRT_ToggleFiltersButton table={table} />
                              <MRT_ShowHideColumnsButton table={table} />
                              <MRT_ToggleDensePaddingButton table={table} />
                              <MRT_ToggleFullScreenButton table={table} />
                            </Box>
                          ),
                          muiTableBodyCellProps: ({ row, column, table }) => {
                            const visualIndex = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                            return { id: `row${visualIndex + 1}-${column.id}` };
                          },
                          muiTableBodyProps: {
                            sx: {
                              '& tr:nth-of-type(odd) > td': {
                                backgroundColor: theme.palette.TwClrBaseGray025,
                              },
                            },
                          },
                          muiTablePaperProps: {
                            elevation: 0,
                          },
                          muiTopToolbarProps: {
                            sx: {
                              position: 'relative',
                              '& > .MuiBox-root': {
                                position: 'relative',
                              },
                              '& .Mui-ToolbarDropZone': {
                                display: 'none',
                              },
                            },
                          },
                        }}
                        sx={{ padding: 0 }}
                      />
                    ) : (
                      <Box sx={{ padding: '32px', textAlign: 'center' }}>{strings.GENERIC_ERROR}</Box>
                    )
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                      <CircularProgress />
                    </Box>
                  )}
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
