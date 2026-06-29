import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { Dayjs } from 'dayjs';
import {
  MRT_Cell,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_PaginationState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MRT_VisibilityState,
} from 'material-react-table';

import TextTruncated from 'src/components/common/TextTruncated';
import { APP_PATHS, DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { SearchSortOrderElement } from 'src/queries/generated/search';
import {
  SearchNurseryWithdrawalPayload,
  SearchNurseryWithdrawalsApiArgs,
  useLazyCountNurseryWithdrawalsQuery,
  useLazySearchNurseryWithdrawalsFilterOptionsQuery,
  useLazySearchNurseryWithdrawalsQuery,
} from 'src/queries/search/nurseries';
import UndoWithdrawalModal from 'src/scenes/NurseryRouter/UndoWithdrawalModal';
import WithdrawalHistoryMenu from 'src/scenes/NurseryRouter/WithdrawalHistoryMenu';
import { exportNurseryWithdrawalResults } from 'src/scenes/NurseryRouter/exportNurseryData';
import {
  NurseryWithdrawalPurpose,
  NurseryWithdrawalPurposes,
  NurseryWithdrawalPurposesValues,
  purposeLabel,
} from 'src/types/Batch';
import { Project } from 'src/types/Project';
import { getMediumDate } from 'src/utils/dateFormatter';
import useDebounce from 'src/utils/useDebounce';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const TABLE_STATE_STORAGE_KEY = 'nursery-withdrawals-table';

const ITEMS_PER_PAGE = 100;
const PLANTING_DATE_COLUMN_ID = 'plantingDate';
const PLANTING_SEASON_COLUMN_ID = 'plantingSeasonName';
const PLANTING_SEASON_ID_QUERY_PARAM = 'plantingSeasonId';
const PURPOSE_QUERY_PARAM = 'purpose';
const MENU_COLUMN_ID = 'menu';
const HIDDEN_BY_DEFAULT_COLUMN_IDS = [PLANTING_SEASON_COLUMN_ID, PLANTING_DATE_COLUMN_ID];
const DEFAULT_COLUMN_VISIBILITY: MRT_VisibilityState = {
  [PLANTING_SEASON_COLUMN_ID]: false,
  [PLANTING_DATE_COLUMN_ID]: false,
};
const DEFAULT_COLUMN_ORDER: MRT_ColumnOrderState = [
  'withdrawnDate',
  'purpose',
  'nurseryName',
  'destinationName',
  'projectNames',
  'stratumName',
  'substratumShortName',
  'speciesNames',
  'totalWithdrawn',
  PLANTING_SEASON_COLUMN_ID,
  PLANTING_DATE_COLUMN_ID,
  MENU_COLUMN_ID,
];

const DEFAULT_SORT_ORDER: SearchSortOrderElement[] = [
  {
    field: 'withdrawnDate',
    direction: 'Descending',
  },
];

// Menu cell component that can use hooks
const MenuCellComponent = ({
  row,
  onUndo,
}: {
  row: SearchNurseryWithdrawalPayload;
  onUndo: (row: SearchNurseryWithdrawalPayload) => void;
}) => {
  const navigate = useSyncNavigate();
  const { NURSERY_TRANSFER } = NurseryWithdrawalPurposes;

  const handleReassign = useCallback(() => {
    if (row.deliveryId) {
      navigate({
        pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', String(row.deliveryId)),
        search: '?fromWithdrawal',
      });
    }
  }, [navigate, row.deliveryId]);

  if (row.purpose !== NURSERY_TRANSFER && !row.undoesWithdrawalId && !row.undoneByWithdrawalId) {
    return <WithdrawalHistoryMenu reassign={handleReassign} withdrawal={row} undo={() => onUndo(row)} />;
  }
  return null;
};

const normalizeMenuColumnOrder = (columnOrder: MRT_ColumnOrderState): MRT_ColumnOrderState => {
  const sourceOrder = columnOrder.length > 0 ? columnOrder : DEFAULT_COLUMN_ORDER;
  const seen = new Set<string>();
  const uniqueColumnOrder = sourceOrder.filter((columnId) => {
    if (seen.has(columnId)) {
      return false;
    }
    seen.add(columnId);
    return true;
  });
  const missingColumnIds = DEFAULT_COLUMN_ORDER.filter((columnId) => !seen.has(columnId));

  return [
    ...uniqueColumnOrder.filter((columnId) => columnId !== MENU_COLUMN_ID),
    ...missingColumnIds.filter((columnId) => columnId !== MENU_COLUMN_ID),
    MENU_COLUMN_ID,
  ];
};

const isHiddenByDefaultColumn = (columnId: string): boolean => HIDDEN_BY_DEFAULT_COLUMN_IDS.includes(columnId);

const normalizeColumnVisibility = (columnVisibility: MRT_VisibilityState): MRT_VisibilityState =>
  HIDDEN_BY_DEFAULT_COLUMN_IDS.reduce(
    (visibility, columnId) =>
      columnId in visibility ? visibility : { ...visibility, [columnId]: DEFAULT_COLUMN_VISIBILITY[columnId] ?? false },
    columnVisibility
  );

const getDateFilterValue = (dateFilterValue: unknown): { minDate?: string; maxDate?: string } | undefined => {
  if (!dateFilterValue || !Array.isArray(dateFilterValue)) {
    return undefined;
  }

  const minDate = dateFilterValue[0] ? (dateFilterValue[0] as Dayjs).format('YYYY-MM-DD') : undefined;
  const maxDate = dateFilterValue[1] ? (dateFilterValue[1] as Dayjs).format('YYYY-MM-DD') : undefined;

  return minDate || maxDate ? { minDate, maxDate } : undefined;
};

const moveHiddenByDefaultColumnsBeforeMenu = (columnOrder: MRT_ColumnOrderState): MRT_ColumnOrderState => {
  const normalizedColumnOrder = normalizeMenuColumnOrder(columnOrder);

  return [
    ...normalizedColumnOrder.filter((columnId) => !isHiddenByDefaultColumn(columnId) && columnId !== MENU_COLUMN_ID),
    ...HIDDEN_BY_DEFAULT_COLUMN_IDS,
    MENU_COLUMN_ID,
  ];
};

export default function NurseryWithdrawalsTable(): JSX.Element {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { activeLocale, strings } = useLocalization();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const query = useQuery();

  const { availableProjects: projects } = useProjects();

  const [undoModalRow, setUndoModalRow] = useState<SearchNurseryWithdrawalPayload>();
  const [listPlantingSeasons, plantingSeasonsResponse] = useLazyListPlantingSeasonsQuery();
  const [searchFilterOptions, searchFilterOptionsResponse] = useLazySearchNurseryWithdrawalsFilterOptionsQuery();
  const [searchNurseryWithdrawals, searchNurseryWithdrawalsResponse] = useLazySearchNurseryWithdrawalsQuery();
  const [countNurseryWithdrawals, searchCountNurseryWithdrawalsResponse] = useLazyCountNurseryWithdrawalsQuery();
  const rows = useMemo(() => searchNurseryWithdrawalsResponse?.data ?? [], [searchNurseryWithdrawalsResponse]);
  const [linkedPlantingSeasonIds, setLinkedPlantingSeasonIds] = useState<number[]>([]);
  const seededPlantingSeasonFromUrl = useRef(false);
  const totalRowCount = useMemo(
    () => searchCountNurseryWithdrawalsResponse.currentData ?? 0,
    [searchCountNurseryWithdrawalsResponse]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSeasons({ organizationId: selectedOrganization.id }, true);
      void searchFilterOptions(selectedOrganization.id);
    }
  }, [listPlantingSeasons, searchFilterOptions, selectedOrganization]);

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(searchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

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
    showColumnFilters,
    showGlobalFilter,
  } = useTableState(TABLE_STATE_STORAGE_KEY, {
    defaultColumnOrder: DEFAULT_COLUMN_ORDER,
    defaultColumnVisibility: DEFAULT_COLUMN_VISIBILITY,
    persistedMultiSelectColumnIds: [
      'destinationName',
      'projectNames',
      'purpose',
      'speciesNames',
      'substratumShortName',
    ],
    persistFilters: true,
  });

  const normalizedColumnOrder = useMemo(() => normalizeMenuColumnOrder(columnOrder), [columnOrder]);
  const normalizedColumnVisibility = useMemo(() => normalizeColumnVisibility(columnVisibility), [columnVisibility]);
  const plantingSeasonVisible = normalizedColumnVisibility[PLANTING_SEASON_COLUMN_ID] === true;
  const previousPlantingSeasonVisible = useRef(plantingSeasonVisible);

  useEffect(() => {
    if (JSON.stringify(columnOrder) !== JSON.stringify(normalizedColumnOrder)) {
      setColumnOrder(normalizedColumnOrder);
    }
  }, [columnOrder, normalizedColumnOrder, setColumnOrder]);

  useEffect(() => {
    if (HIDDEN_BY_DEFAULT_COLUMN_IDS.some((columnId) => !(columnId in columnVisibility))) {
      setColumnVisibility(normalizedColumnVisibility);
    }
  }, [columnVisibility, normalizedColumnVisibility, setColumnVisibility]);

  useEffect(() => {
    if (plantingSeasonVisible && !previousPlantingSeasonVisible.current) {
      setColumnOrder((currentColumnOrder) => moveHiddenByDefaultColumnsBeforeMenu(currentColumnOrder));
    }
    previousPlantingSeasonVisible.current = plantingSeasonVisible;
  }, [plantingSeasonVisible, setColumnOrder]);

  const handleColumnOrderChange = useCallback(
    (updater: React.SetStateAction<MRT_ColumnOrderState>) => {
      setColumnOrder((currentColumnOrder) =>
        normalizeMenuColumnOrder(typeof updater === 'function' ? updater(currentColumnOrder) : updater)
      );
    },
    [setColumnOrder]
  );

  const handleColumnVisibilityChange = useCallback(
    (updater: React.SetStateAction<typeof columnVisibility>) => {
      setColumnVisibility((currentColumnVisibility) => {
        const currentVisibility = normalizeColumnVisibility(currentColumnVisibility);
        const nextVisibility = typeof updater === 'function' ? updater(currentVisibility) : updater;

        return normalizeColumnVisibility(nextVisibility);
      });
    },
    [setColumnVisibility]
  );

  // Material React Table state
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: ITEMS_PER_PAGE,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([
    {
      id: 'withdrawnDate',
      desc: true,
    },
  ]);

  const numberFormatter = useNumberFormatter();

  const { nurseryNames, destinationNames, stratumOptions, substratumOptions, speciesOptions } = useMemo(() => {
    return {
      nurseryNames: searchFilterOptionsResponse.currentData?.nurseryNames ?? [],
      destinationNames: searchFilterOptionsResponse.currentData?.destinationNames ?? [],
      stratumOptions: searchFilterOptionsResponse.currentData?.stratumNames ?? [],
      substratumOptions: searchFilterOptionsResponse.currentData?.substratumNames ?? [],
      speciesOptions: searchFilterOptionsResponse.currentData?.speciesNames ?? [],
    };
  }, [
    searchFilterOptionsResponse.currentData?.destinationNames,
    searchFilterOptionsResponse.currentData?.nurseryNames,
    searchFilterOptionsResponse.currentData?.speciesNames,
    searchFilterOptionsResponse.currentData?.stratumNames,
    searchFilterOptionsResponse.currentData?.substratumNames,
  ]);

  const { plantingSeasonNames, plantingSeasonNameToIds } = useMemo(() => {
    const idsByName = new Map<string, number[]>();
    (plantingSeasonsResponse.currentData?.seasons ?? []).forEach((season) => {
      idsByName.set(season.name, [...(idsByName.get(season.name) ?? []), season.id]);
    });

    return {
      plantingSeasonNameToIds: idsByName,
      plantingSeasonNames: Array.from(idsByName.keys()).sort((a, b) => a.localeCompare(b)),
    };
  }, [plantingSeasonsResponse.currentData?.seasons]);

  const plantingSeasonFilterValue = useMemo(
    () => columnFilters.find((column) => column.id === PLANTING_SEASON_COLUMN_ID)?.value,
    [columnFilters]
  );

  useEffect(() => {
    if (seededPlantingSeasonFromUrl.current || linkedPlantingSeasonIds.length === 0) {
      return;
    }

    const seasonName = plantingSeasonsResponse.currentData?.seasons.find((season) =>
      linkedPlantingSeasonIds.includes(season.id)
    )?.name;

    if (!seasonName) {
      return;
    }

    seededPlantingSeasonFromUrl.current = true;
    setColumnFilters((curr) => [
      ...curr.filter((filter) => filter.id !== PLANTING_SEASON_COLUMN_ID),
      { id: PLANTING_SEASON_COLUMN_ID, value: seasonName },
    ]);
    setColumnVisibility((curr) => ({ ...curr, [PLANTING_SEASON_COLUMN_ID]: true }));
  }, [linkedPlantingSeasonIds, plantingSeasonsResponse.currentData?.seasons, setColumnFilters, setColumnVisibility]);

  useEffect(() => {
    if (!seededPlantingSeasonFromUrl.current || linkedPlantingSeasonIds.length === 0) {
      return;
    }

    if (typeof plantingSeasonFilterValue !== 'string') {
      setLinkedPlantingSeasonIds([]);
      return;
    }

    const idsForVisibleFilter = plantingSeasonNameToIds.get(plantingSeasonFilterValue) ?? [];
    if (!idsForVisibleFilter.some((id) => linkedPlantingSeasonIds.includes(id))) {
      setLinkedPlantingSeasonIds([]);
    }
  }, [linkedPlantingSeasonIds, plantingSeasonFilterValue, plantingSeasonNameToIds]);

  // Get all project names for filter (from all available projects, not just current results)
  const uniqueProjectNames = useMemo(() => {
    if (!projects) {
      return [];
    }
    const projectNames = projects
      .map((project: Project) => project.name)
      .filter((name) => name !== null && name !== undefined && name !== '');
    return Array.from(new Set(projectNames)).sort();
  }, [projects]);

  // Create reverse mapping from label to value for filtering
  const purposeLabelToValue = useMemo(() => {
    const map: Record<string, NurseryWithdrawalPurpose> = {};
    Object.values(NurseryWithdrawalPurposes).forEach((purpose) => {
      map[purposeLabel(purpose)] = purpose;
    });
    return map;
  }, []);

  // Cell renderer components
  const WithdrawnDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as string;
      const linkStyles = {
        fontSize: '16px',
        color: theme.palette.TwClrTxtBrand,
        textDecoration: 'none',
        ...(row.undoneByWithdrawalId ? { textDecoration: 'line-through' } : {}),
      };
      const withdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(
        ':withdrawalId',
        String(row.withdrawalId)
      );
      return (
        <Link to={withdrawalDetailLocation} style={linkStyles}>
          {value}
        </Link>
      );
    },
    [theme]
  );

  const PurposeCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const row = cell.row.original;
      const value = cell.getValue() as NurseryWithdrawalPurpose;
      const linkStyles = {
        fontSize: '16px',
        color: theme.palette.TwClrTxtBrand,
        textDecoration: 'none',
      };

      if (!row.undoesWithdrawalId) {
        return <span>{purposeLabel(value)}</span>;
      } else {
        const undoWithdrawalDetailLocation = APP_PATHS.NURSERY_WITHDRAWALS_DETAILS.replace(
          ':withdrawalId',
          String(row.undoesWithdrawalId)
        );
        return (
          <span style={{ display: 'block', margin: 0 }}>
            {`${strings.UNDO} `}
            <Link to={undoWithdrawalDetailLocation} style={linkStyles}>
              {String(row.undoesWithdrawalDate)}
            </Link>
          </span>
        );
      }
    },
    [theme, strings]
  );

  const SpeciesNamesCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const value = cell.getValue() as string[] | undefined;
      return value ? <TextTruncated stringList={value} moreText={strings.TRUNCATED_TEXT_MORE_LINK} /> : null;
    },
    [strings]
  );

  const StratumNameCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const value = cell.getValue() as string | undefined;
      return value ? <TextTruncated stringList={[value]} moreText={strings.TRUNCATED_TEXT_MORE_LINK} /> : null;
    },
    [strings]
  );

  const SubstratumNameCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const value = cell.getValue();
      return value ? (
        <TextTruncated stringList={[value as string]} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />
      ) : null;
    },
    [strings]
  );

  const TotalWithdrawnCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const value = cell.getValue() as number | undefined;
      return value !== undefined ? <span>{numberFormatter.format(value || 0)}</span> : null;
    },
    [numberFormatter]
  );

  const PlantingDateCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
      const value = cell.getValue() as string | undefined;
      return value ? <span>{getMediumDate(value, activeLocale)}</span> : null;
    },
    [activeLocale]
  );

  const MenuCell = useCallback(({ cell }: { cell: MRT_Cell<SearchNurseryWithdrawalPayload> }) => {
    const row = cell.row.original;
    return <MenuCellComponent row={row} onUndo={setUndoModalRow} />;
  }, []);

  const columns = useMemo<EditableTableColumn<SearchNurseryWithdrawalPayload>[]>(
    () => [
      {
        id: 'withdrawnDate',
        header: strings.DATE,
        accessorKey: 'withdrawnDate',
        enableEditing: false,
        filterVariant: 'date-range',
        Cell: WithdrawnDateCell,
      },
      {
        id: 'purpose',
        header: strings.PURPOSE,
        accessorKey: 'purpose',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: NurseryWithdrawalPurposesValues.map(purposeLabel),
        filterFn: () => true,
        Cell: PurposeCell,
      },
      {
        id: 'nurseryName',
        header: strings.FROM_NURSERY,
        accessorKey: 'nurseryName',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: nurseryNames,
        filterFn: () => true,
      },
      {
        id: 'destinationName',
        header: strings.PLANTING_SITE,
        accessorKey: 'destinationName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: destinationNames,
        filterFn: () => true,
      },
      {
        id: 'projectNames',
        header: strings.PROJECTS,
        accessorKey: 'projectNames',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueProjectNames,
        filterFn: () => true, // Disable client-side filtering, handled by backend
        Cell: ({ cell }) => {
          const value = cell.getValue() as string[] | undefined;
          return value ? <span>{value.filter((name) => !!name).join(', ')}</span> : null;
        },
      },
      {
        id: 'stratumName',
        header: strings.TO_STRATUM,
        accessorKey: 'stratumName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: stratumOptions,
        filterFn: () => true,
        Cell: StratumNameCell,
      },
      {
        id: 'substratumShortName',
        header: strings.TO_SUBSTRATUM,
        accessorKey: 'substratumShortName',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: substratumOptions,
        filterFn: () => true,
        Cell: SubstratumNameCell,
      },
      {
        id: 'speciesNames',
        header: strings.SPECIES,
        accessorKey: 'speciesNames',
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: speciesOptions,
        filterFn: () => true,
        Cell: SpeciesNamesCell,
      },
      {
        id: 'totalWithdrawn',
        header: strings.TOTAL_QUANTITY,
        accessorKey: 'totalWithdrawn',
        enableEditing: false,
        filterVariant: 'range',
        Cell: TotalWithdrawnCell,
      },
      {
        id: PLANTING_SEASON_COLUMN_ID,
        header: strings.PLANTING_SEASON,
        accessorKey: 'plantingSeasonName',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: plantingSeasonNames,
        filterFn: () => true,
      },
      {
        id: PLANTING_DATE_COLUMN_ID,
        header: strings.PLANTING_DATE,
        accessorKey: 'plantingDate',
        enableEditing: false,
        filterVariant: 'date-range',
        Cell: PlantingDateCell,
      },
      {
        id: MENU_COLUMN_ID,
        header: '',
        enableEditing: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        enableColumnDragging: false,
        enableHiding: false,
        Cell: MenuCell,
      },
    ],
    [
      strings,
      WithdrawnDateCell,
      PurposeCell,
      nurseryNames,
      destinationNames,
      uniqueProjectNames,
      stratumOptions,
      StratumNameCell,
      substratumOptions,
      SubstratumNameCell,
      speciesOptions,
      SpeciesNamesCell,
      TotalWithdrawnCell,
      plantingSeasonNames,
      PlantingDateCell,
      MenuCell,
    ]
  );

  const searchArgs: SearchNurseryWithdrawalsApiArgs = useMemo(() => {
    const dateFilterValue = columnFilters.find((column) => column.id === 'withdrawnDate')?.value;
    const projectFilterValue = columnFilters.find((column) => column.id === 'projectNames')?.value;
    const purposeFilterValue = columnFilters.find((column) => column.id === 'purpose')?.value;
    const nurseryFilterValue = columnFilters.find((column) => column.id === 'nurseryName')?.value;
    const destinationFilterValue = columnFilters.find((column) => column.id === 'destinationName')?.value;
    const stratumFilterValue = columnFilters.find((column) => column.id === 'stratumName')?.value;
    const subStratumFilterValue = columnFilters.find((column) => column.id === 'substratumShortName')?.value;
    const speciesFilterValue = columnFilters.find((column) => column.id === 'speciesNames')?.value;
    const totalWithdrawnFilterValue = columnFilters.find((column) => column.id === 'totalWithdrawn')?.value;
    const plantingDateFilterValue = columnFilters.find((column) => column.id === PLANTING_DATE_COLUMN_ID)?.value;

    const withdrawnDate = getDateFilterValue(dateFilterValue);
    const plantingDate = getDateFilterValue(plantingDateFilterValue);

    const purposes =
      purposeFilterValue && Array.isArray(purposeFilterValue)
        ? purposeFilterValue.map((v) => (typeof v === 'string' ? purposeLabelToValue[v] || v : v))
        : undefined;

    const totalWithdrawn =
      totalWithdrawnFilterValue && Array.isArray(totalWithdrawnFilterValue)
        ? {
            minValue:
              totalWithdrawnFilterValue[0] !== undefined && totalWithdrawnFilterValue[0] !== ''
                ? Number(totalWithdrawnFilterValue[0])
                : undefined,
            maxValue:
              totalWithdrawnFilterValue[1] !== undefined && totalWithdrawnFilterValue[1] !== ''
                ? Number(totalWithdrawnFilterValue[1])
                : undefined,
          }
        : undefined;

    const plantingSeasonIdsForFilter =
      typeof plantingSeasonFilterValue === 'string' ? plantingSeasonNameToIds.get(plantingSeasonFilterValue) ?? [] : [];
    const shouldUseLinkedPlantingSeasonIds =
      linkedPlantingSeasonIds.length > 0 &&
      (typeof plantingSeasonFilterValue !== 'string' ||
        plantingSeasonIdsForFilter.some((id) => linkedPlantingSeasonIds.includes(id)));

    const sortOrder =
      sorting.length > 0
        ? sorting.map(
            (sortingOption): SearchSortOrderElement => ({
              field: sortingOption.id,
              direction: sortingOption.desc ? 'Descending' : 'Ascending',
            })
          )
        : DEFAULT_SORT_ORDER;

    return {
      organizationId: selectedOrganization?.id,
      searchTerm: debouncedSearchTerm,
      withdrawnDate,
      projectNames: projectFilterValue as string[] | undefined,
      purposes: purposes as NurseryWithdrawalPurpose[] | undefined,
      nurseryName: nurseryFilterValue as string | undefined,
      destinationNames: destinationFilterValue as string[] | undefined,
      plantingSeasonIds: shouldUseLinkedPlantingSeasonIds ? linkedPlantingSeasonIds : plantingSeasonIdsForFilter,
      plantingDate,
      stratumNames: stratumFilterValue as string[] | undefined,
      substratumNames: subStratumFilterValue as string[] | undefined,
      speciesNames: speciesFilterValue as string[],
      totalWithdrawn,
      sortOrder,
    };
  }, [
    columnFilters,
    debouncedSearchTerm,
    linkedPlantingSeasonIds,
    plantingSeasonFilterValue,
    plantingSeasonNameToIds,
    purposeLabelToValue,
    selectedOrganization?.id,
    sorting,
  ]);

  useEffect(() => {
    if (searchArgs.organizationId) {
      void countNurseryWithdrawals(searchArgs, true);
    }
  }, [searchArgs, countNurseryWithdrawals, searchNurseryWithdrawals]);

  useEffect(() => {
    if (searchArgs.organizationId) {
      void searchNurseryWithdrawals(
        {
          ...searchArgs,
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
        },
        true
      );
    }
  }, [pagination.pageIndex, pagination.pageSize, searchArgs, searchNurseryWithdrawals]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters]);

  // Apply URL params as column filters once on mount, then strip them from the URL.
  useEffect(() => {
    const siteName = query.get('siteName') || undefined;
    const substratumNames = query.getAll('substratumName').filter(Boolean);
    const stratumNames = query.getAll('stratumName').filter(Boolean);
    const purposeValues = query.getAll(PURPOSE_QUERY_PARAM).filter(Boolean);
    const plantingSeasonIds = query
      .getAll(PLANTING_SEASON_ID_QUERY_PARAM)
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    if (
      !siteName &&
      substratumNames.length === 0 &&
      stratumNames.length === 0 &&
      purposeValues.length === 0 &&
      plantingSeasonIds.length === 0
    ) {
      return;
    }
    const seeded: MRT_ColumnFiltersState = [];
    if (siteName) {
      seeded.push({ id: 'destinationName', value: [siteName] });
    }
    if (substratumNames.length > 0) {
      seeded.push({ id: 'substratumShortName', value: substratumNames });
    }
    if (stratumNames.length > 0) {
      seeded.push({ id: 'stratumName', value: stratumNames });
    }
    if (purposeValues.length > 0) {
      const purposeLabels = Array.from(
        new Set(
          purposeValues.map((purpose) =>
            NurseryWithdrawalPurposesValues.includes(purpose as NurseryWithdrawalPurpose)
              ? purposeLabel(purpose as NurseryWithdrawalPurpose)
              : purpose
          )
        )
      );
      seeded.push({ id: 'purpose', value: purposeLabels });
    }
    if (plantingSeasonIds.length > 0) {
      setLinkedPlantingSeasonIds(plantingSeasonIds);
    }
    if (seeded.length > 0 || plantingSeasonIds.length > 0) {
      setColumnFilters(seeded);
    }
    query.delete('siteName');
    query.delete('substratumName');
    query.delete('stratumName');
    query.delete(PURPOSE_QUERY_PARAM);
    query.delete(PLANTING_SEASON_ID_QUERY_PARAM);
    navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
    // Run only once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExport = useCallback(async () => {
    if (!selectedOrganization) {
      return;
    }
    const isFiltered = !!(
      debouncedSearchTerm !== '' ||
      searchArgs.nurseryName ||
      searchArgs.destinationNames?.length ||
      searchArgs.plantingSeasonIds?.length ||
      searchArgs.projectNames?.length ||
      searchArgs.purposes?.length ||
      searchArgs.plantingDate?.maxDate ||
      searchArgs.plantingDate?.minDate ||
      searchArgs.stratumNames?.length ||
      searchArgs.substratumNames?.length ||
      searchArgs.withdrawnDate?.maxDate ||
      searchArgs.withdrawnDate?.minDate ||
      searchArgs.totalWithdrawn?.minValue ||
      searchArgs.totalWithdrawn?.maxValue
    );

    const allRows = await searchNurseryWithdrawals({
      ...searchArgs,
      limit: totalRowCount || 10000,
      offset: 0,
    }).unwrap();

    void exportNurseryWithdrawalResults({
      isFiltered,
      nurseryWithdrawalResults: allRows,
    });
  }, [debouncedSearchTerm, searchArgs, searchNurseryWithdrawals, selectedOrganization, totalRowCount]);

  return (
    <>
      {undoModalRow && <UndoWithdrawalModal onClose={() => setUndoModalRow(undefined)} row={undoModalRow} />}
      <EditableTable
        key='nursery-withdrawals-table'
        clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
        columns={columns}
        data={rows || []}
        enableEditing={false}
        enableSorting={true}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableColumnOrdering={true}
        storageKey={TABLE_STATE_STORAGE_KEY}
        enablePagination={true}
        enableTopToolbar={true}
        enableBottomToolbar={true}
        initialSorting={sorting}
        tableOptions={{
          state: {
            pagination,
            sorting,
            columnFilters,
            columnVisibility: normalizedColumnVisibility,
            showColumnFilters,
            showGlobalFilter,
            globalFilter: searchValue,
            density,
            columnOrder: normalizedColumnOrder,
          },
          onPaginationChange: setPagination,
          onSortingChange: setSorting,
          onColumnFiltersChange: setColumnFilters,
          onColumnVisibilityChange: handleColumnVisibilityChange,
          onShowColumnFiltersChange: setShowColumnFilters,
          onShowGlobalFilterChange: setShowGlobalFilter,
          onGlobalFilterChange: setSearchValue,
          onColumnOrderChange: handleColumnOrderChange,
          onDensityChange,
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          rowCount: totalRowCount || 0,
          enableColumnPinning: true,
          enableColumnActions: true,
          enableHiding: true,
          enableGrouping: false,
          enableColumnDragging: true,
          positionGlobalFilter: 'right',
          renderToolbarInternalActions: ({ table }) => (
            <Box display='flex' gap={0.5}>
              <Tooltip title={strings.EXPORT}>
                <IconButton onClick={() => void onExport()}>
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
          muiTableHeadCellProps: ({ column }) =>
            column.id === MENU_COLUMN_ID ? { sx: { '& .Mui-TableHeadCell-Content': { display: 'none' } } } : {},
          muiTableBodyCellProps: ({ row, column }) => ({ id: `row${row.index + 1}-${column.id}` }),
          muiTableBodyRowProps: {
            sx: {
              '& td': {
                borderBottom: 'none',
              },
            },
          },
        }}
        sx={{ padding: 0 }}
      />
    </>
  );
}
