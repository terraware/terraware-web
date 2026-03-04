import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, ClickAwayListener, IconButton, Popover, Tooltip, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import EmptyMessage from 'src/components/common/EmptyMessage';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextTruncated from 'src/components/common/TextTruncated';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import SearchService from 'src/services/SearchService';
import strings from 'src/strings';
import { SearchRequestPayload } from 'src/types/Search';
import { Species, SpeciesProblemElement } from 'src/types/Species';
import { makeCsv } from 'src/utils/csv';
import { isContributor } from 'src/utils/organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';

import CheckDataModal from './CheckDataModal';
import ImportSpeciesModal from './ImportSpeciesModal';
import ProblemTooltip from './ProblemTooltip';
import { SpeciesSearchResultRow } from './types';

type ProblemsCellProps = {
  row: SpeciesSearchResultRow;
  reloadData: () => Promise<void>;
  onRowClick: (id: number) => void;
};

const ProblemsCellComponent = ({ row, reloadData, onRowClick }: ProblemsCellProps): JSX.Element | null => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const value = row.problems;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    e.stopPropagation();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton onClick={handleClick} sx={{ borderRadius: 0, fontSize: '16px', height: '48px' }}>
        <Icon name='warning' style={{ fill: theme.palette.TwClrIcnWarning }} />
      </IconButton>
      <ClickAwayListener onClickAway={handleClose}>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <ProblemTooltip
            problems={value as SpeciesProblemElement[]}
            openedTooltip={Boolean(anchorEl)}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            reloadData={reloadData}
            onRowClick={() => onRowClick(row.id)}
            onClose={handleClose}
          />
        </Popover>
      </ClickAwayListener>
    </>
  );
};

type SpeciesListProps = {
  reloadData: () => void;
  species: Species[];
};

export default function SpeciesListView({ reloadData, species }: SpeciesListProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
  const [results, setResults] = useState<SpeciesSearchResultRow[]>();
  const query = useQuery();
  const navigate = useSyncNavigate();
  const { activeLocale } = useLocalization();

  const contentRef = React.useRef(null);

  const [handleProblemsColumn, setHandleProblemsColumn] = useState<boolean>(false);
  const [hasNewData, setHasNewData] = useState<boolean>(false);
  const [showProblemsColumn, setShowProblemsColumn] = useState<boolean>(false);

  const userCanEdit = !isContributor(selectedOrganization);
  const { isMobile } = useDeviceInfo();

  const {
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    setColumnOrder,
    setColumnVisibility,
    setShowColumnFilters,
    setShowGlobalFilter,
    setSorting,
    showColumnFilters,
    showGlobalFilter,
    sorting,
  } = useTableState('species-list-table', {
    defaultSorting: [{ id: 'scientificName', desc: false }],
  });

  const getParams = useCallback((): SearchRequestPayload => {
    if (!selectedOrganization) {
      return {
        prefix: 'species',
        fields: [],
        search: { operation: 'and', children: [] },
        count: 0,
      };
    }

    return {
      prefix: 'species',
      fields: [
        'scientificName',
        'commonName',
        'conservationCategory',
        'familyName',
        'seedStorageBehavior',
        'id',
        'createdTime',
        'modifiedTime',
        'rare',
        'growthForms.growthForm',
        'ecosystemTypes.ecosystemType',
        'organization_id',
        'participantProjectSpecies.project.id',
        'participantProjectSpecies.project.name',
      ],
      search: {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'organization_id',
            type: 'Exact',
            values: [selectedOrganization.id],
          },
        ],
      },
      count: 0,
    };
  }, [selectedOrganization]);

  const onApplyFilters = useCallback(async () => {
    const params = getParams();

    if (species) {
      const requestId = Math.random().toString();
      setRequestId('searchSpecies', requestId);
      const searchResults = await SearchService.search(params);
      if (getRequestId('searchSpecies') === requestId) {
        const speciesResults: SpeciesSearchResultRow[] = [];
        searchResults?.forEach((result) => {
          speciesResults.push({
            id: result.id as number,
            acceleratorProjects: (result.acceleratorProjectSpecies as any[])?.map(
              (ppsData) => ppsData.project.name
            ) as string[],
            problems: species.find((sp) => sp.id.toString() === (result.id as string))?.problems,
            scientificName: result.scientificName as string,
            commonName: result.commonName as string,
            familyName: result.familyName as string,
            growthForms: (result.growthForms as any[])?.map((growthFormData) => growthFormData.growthForm) as string[],
            seedStorageBehavior: result.seedStorageBehavior as string,
            ecosystemTypes: (result.ecosystemTypes as any[])?.map((et) => et.ecosystemType) as string[],
            rare: result.rare === strings.BOOLEAN_TRUE ? 'true' : 'false',
            conservationCategory: result.conservationCategory as string,
            createdTime: result.createdTime as string,
            modifiedTime: result.modifiedTime as string,
          });
        });

        setResults(speciesResults);
      }
    }
  }, [getParams, species]);

  useEffect(() => {
    const shouldCheckData = query.has('checkData');
    if (shouldCheckData) {
      query.delete('checkData');
      setCheckDataModalOpen(true);
      navigate({ pathname: APP_PATHS.SPECIES, search: query.toString() }, { replace: true });
    }
  }, [query, setCheckDataModalOpen, navigate]);

  useEffect(() => {
    void onApplyFilters();
  }, [onApplyFilters]);

  // Unique filter option values derived from results (client-side)
  const uniqueConservationCategories = useMemo(
    () =>
      Array.from(new Set(results?.map((r) => r.conservationCategory).filter((v): v is string => Boolean(v)))).sort(),
    [results]
  );

  const uniqueGrowthForms = useMemo(
    () =>
      Array.from(new Set(results?.flatMap((r) => r.growthForms ?? []).filter((v): v is string => Boolean(v)))).sort(),
    [results]
  );

  const uniqueSeedStorageBehaviors = useMemo(
    () => Array.from(new Set(results?.map((r) => r.seedStorageBehavior).filter((v): v is string => Boolean(v)))).sort(),
    [results]
  );

  const uniqueEcosystemTypes = useMemo(
    () =>
      Array.from(
        new Set(results?.flatMap((r) => r.ecosystemTypes ?? []).filter((v): v is string => Boolean(v)))
      ).sort(),
    [results]
  );

  const uniqueAcceleratorProjects = useMemo(
    () =>
      Array.from(
        new Set(results?.flatMap((r) => r.acceleratorProjects ?? []).filter((v): v is string => Boolean(v)))
      ).sort(),
    [results]
  );

  const onNewSpecies = () => {
    navigate(APP_PATHS.SPECIES_NEW);
  };

  const downloadReportHandler = (table: MRT_TableInstance<SpeciesSearchResultRow>) => {
    const filteredRows = table.getSortedRowModel().rows;
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter((col) => !col.id.startsWith('mrt-') && col.id !== 'problems' && typeof col.columnDef.header === 'string');
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
    link.setAttribute('download', 'species.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImportSpecies = () => {
    setImportSpeciesModalOpen(true);
  };

  const onCloseImportSpeciesModal = (completed: boolean) => {
    if (completed && reloadData) {
      reloadData();
      setCheckDataModalOpen(true);
    }
    setImportSpeciesModalOpen(false);
  };

  const onCheckData = () => {
    setCheckDataModalOpen(true);
  };

  const reviewErrorsHandler = (hasErrors: boolean) => {
    setCheckDataModalOpen(false);
    setShowProblemsColumn(hasErrors);
    void onApplyFilters();
  };

  const reloadDataProblemsHandler = useCallback(async () => {
    setHasNewData(false);
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await reloadData();
    setHandleProblemsColumn(true);
  }, [reloadData]);

  useEffect(() => {
    setHasNewData(true);
  }, [results, setHasNewData]);

  useEffect(() => {
    if (handleProblemsColumn && hasNewData) {
      const hasErrors = results && results.filter((result) => result.problems && result.problems.length);
      setShowProblemsColumn(Boolean(hasErrors?.length));
      setHandleProblemsColumn(false);
      setHasNewData(false);
    }
  }, [handleProblemsColumn, results, hasNewData]);

  const onOptionItemClick = (optionItem: DropdownItem) => {
    switch (optionItem.value) {
      case 'checkData': {
        onCheckData();
        break;
      }
      case 'import': {
        onImportSpecies();
        break;
      }
    }
  };

  // Cell renderers
  const ScientificNameCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
    const row = cell.row.original;
    const value = cell.getValue() as string;
    return (
      <Link fontSize='16px' to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', String(row.id))}>
        {value}
      </Link>
    );
  }, []);

  const GrowthFormsCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
    const value = cell.getValue() as string | undefined;
    const list = value ? value.split(', ') : [];
    return (
      <TextTruncated
        fontSize={16}
        stringList={list}
        width={150}
        listSeparator={strings.LIST_SEPARATOR_SECONDARY}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
  }, []);

  const EcosystemTypesCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
    const value = cell.getValue() as string | undefined;
    const list = value ? value.split(', ') : [];
    return (
      <TextTruncated
        fontSize={16}
        stringList={list}
        width={150}
        listSeparator={strings.LIST_SEPARATOR_SECONDARY}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
  }, []);

  const AcceleratorProjectsCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
    const value = cell.getValue() as string | undefined;
    const list = value ? value.split(', ') : [];
    return <TextTruncated fontSize={16} stringList={list} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
  }, []);

  const ProblemsCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => (
      <ProblemsCellComponent
        row={cell.row.original}
        reloadData={reloadDataProblemsHandler}
        onRowClick={(id) => navigate(APP_PATHS.SPECIES_EDIT.replace(':speciesId', String(id)))}
      />
    ),
    [reloadDataProblemsHandler, navigate]
  );

  const editableColumns = useMemo<EditableTableColumn<SpeciesSearchResultRow>[]>(() => {
    // No-op to make lint happy so it doesn't think the dependency is unused.
    if (!activeLocale) {
      return [];
    }

    const cols: any[] = [
      ...(showProblemsColumn
        ? [
            {
              id: 'problems',
              header: (
                <Box component='span' sx={{ marginLeft: '12px' }}>
                  <Icon name='warning' style={{ fill: theme.palette.TwClrIcnSecondary }} />
                </Box>
              ),
              accessorKey: 'problems',
              enableEditing: false,
              enableHiding: false,
              sortUndefined: 'last' as const,
              Cell: ProblemsCell,
            },
          ]
        : []),
      {
        id: 'scientificName',
        header: strings.SCIENTIFIC_NAME,
        accessorKey: 'scientificName',
        enableEditing: false,
        filterVariant: 'text',
        sortUndefined: 'last',
        Cell: ScientificNameCell,
      },
      {
        id: 'commonName',
        header: strings.COMMON_NAME,
        accessorKey: 'commonName',
        enableEditing: false,
        filterVariant: 'text',
        sortUndefined: 'last',
      },
      {
        id: 'familyName',
        header: strings.FAMILY,
        accessorKey: 'familyName',
        enableEditing: false,
        filterVariant: 'text',
        sortUndefined: 'last',
      },
      {
        id: 'acceleratorProjects',
        header: strings.PROJECTS,
        accessorFn: (row: SpeciesSearchResultRow) => (row.acceleratorProjects ?? []).join(', '),
        enableEditing: false,
        filterVariant: 'multi-select' as const,
        filterSelectOptions: uniqueAcceleratorProjects,
        sortUndefined: 'last' as const,
        Cell: AcceleratorProjectsCell,
      },
      {
        id: 'conservationCategory',
        header: strings.CONSERVATION_CATEGORY,
        accessorKey: 'conservationCategory',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: uniqueConservationCategories,
        sortUndefined: 'last',
      },
      {
        id: 'rare',
        header: strings.RARE,
        accessorFn: (row: SpeciesSearchResultRow) => (row.rare === 'true' ? strings.YES : strings.NO),
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: [strings.YES, strings.NO],
        sortUndefined: 'last',
      },
      {
        id: 'growthForms',
        header: strings.GROWTH_FORM,
        accessorFn: (row: SpeciesSearchResultRow) => (row.growthForms ?? []).join(', '),
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueGrowthForms,
        sortUndefined: 'last',
        Cell: GrowthFormsCell,
      },
      {
        id: 'seedStorageBehavior',
        header: strings.SEED_STORAGE_BEHAVIOR,
        accessorKey: 'seedStorageBehavior',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: uniqueSeedStorageBehaviors,
        sortUndefined: 'last',
      },
      {
        id: 'ecosystemTypes',
        header: strings.ECOSYSTEM_TYPE,
        accessorFn: (row: SpeciesSearchResultRow) => (row.ecosystemTypes ?? []).join(', '),
        enableEditing: false,
        filterVariant: 'multi-select',
        filterSelectOptions: uniqueEcosystemTypes,
        sortUndefined: 'last',
        Cell: EcosystemTypesCell,
      },
    ];

    return cols as EditableTableColumn<SpeciesSearchResultRow>[];
  }, [
    activeLocale,
    showProblemsColumn,
    uniqueAcceleratorProjects,
    uniqueConservationCategories,
    uniqueGrowthForms,
    uniqueSeedStorageBehaviors,
    uniqueEcosystemTypes,
    theme,
    ProblemsCell,
    ScientificNameCell,
    AcceleratorProjectsCell,
    GrowthFormsCell,
    EcosystemTypesCell,
  ]);

  return (
    <TfMain>
      <CheckDataModal
        open={checkDataModalOpen}
        onClose={() => setCheckDataModalOpen(false)}
        species={species}
        reviewErrors={reviewErrorsHandler}
        reloadData={reloadData}
      />
      <ImportSpeciesModal
        open={importSpeciesModalOpen}
        onClose={onCloseImportSpeciesModal}
        setCheckDataModalOpen={setCheckDataModalOpen}
      />
      <Box ref={contentRef}>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                lineHeight: '32px',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {strings.SPECIES}
            </h1>
            {species && species.length > 0 && !isMobile && userCanEdit && (
              <div>
                <Button id='add-species' label={strings.ADD_SPECIES} icon='plus' onClick={onNewSpecies} size='medium' />
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[
                    { label: strings.CHECK_DATA, value: 'checkData' },
                    { label: strings.IMPORT, value: 'import' },
                  ]}
                />
              </div>
            )}
            {isMobile && userCanEdit && <Button id='add-species' onClick={onNewSpecies} size='medium' icon='plus' />}
          </Box>
          <PageSnackbar />
        </PageHeaderWrapper>
      </Box>
      <Card flushMobile>
        {species && species.length ? (
          <EditableTable
            columns={editableColumns}
            data={results ?? []}
            enableEditing={false}
            enableSorting={true}
            enableGlobalFilter={true}
            enableColumnFilters={true}
            enableColumnOrdering={true}
            stickyFilters={true}
            storageKey='species-list-table'
            enablePagination={false}
            enableTopToolbar={true}
            enableBottomToolbar={false}
            tableOptions={{
              state: {
                sorting,
                columnOrder,
                columnVisibility,
                density,
                showColumnFilters,
                showGlobalFilter,
              },
              onSortingChange: setSorting,
              onColumnOrderChange: setColumnOrder,
              onColumnVisibilityChange: setColumnVisibility,
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
          <EmptyMessage
            title={strings.ADD_A_SPECIES}
            text={strings.SPECIES_EMPTY_MSG_BODY}
            buttonText={strings.ADD_SPECIES}
            onClick={onNewSpecies}
            sx={{
              margin: '0 auto',
              width: '50%',
              marginTop: '10%',
            }}
          />
        )}
      </Card>
    </TfMain>
  );
}
