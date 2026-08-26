import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, ClickAwayListener, IconButton, Popover, Tooltip, useTheme } from '@mui/material';
import { Badge, DropdownItem, Message } from '@terraware/web-components';
import { EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_Row,
  MRT_ShowHideColumnsButton,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
} from 'material-react-table';

import PageSnackbar from 'src/components/PageSnackbar';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TextTruncated from 'src/components/common/TextTruncated';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import useTableState from 'src/hooks/useTableState';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useListSpeciesAcceleratorProjectsQuery } from 'src/queries/search/species';
import strings from 'src/strings';
import {
  Species,
  SpeciesProjectElement,
  conservationCategories,
  getConservationCategoryString,
} from 'src/types/Species';
import { makeCsv } from 'src/utils/csv';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';

import CheckDataModal from './CheckDataModal';
import ImportSpeciesModal from './ImportSpeciesModal';
import ProblemTooltip from './ProblemTooltip';
import SpeciesCheckModal, { SpeciesCheckEntry } from './SpeciesCheck/SpeciesCheckModal';
import { NATIVITY_VALUES, Nativity, getNativityLabel } from './SpeciesCheck/types';
import SpeciesNativityBadge from './SpeciesNativityBadge';
import { SpeciesSearchResultRow } from './types';

const TABLE_STATE_STORAGE_KEY = 'species-list-table';
const EMPTY_ACCELERATOR_PROJECT_NAMES_BY_SPECIES_ID: Record<number, string[]> = {};

const nativityOf = (element?: SpeciesProjectElement): Nativity | undefined =>
  element?.overriddenNativity ?? element?.calculatedNativity;

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
            problems={value}
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

export default function SpeciesListView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { species, isLoading, refetch: reloadData } = useOrganizationSpecies({ preferCacheValue: false });
  const theme = useTheme();
  const trackEvent = useTrackEvent();
  const [importSpeciesModalOpen, setImportSpeciesModalOpen] = useState(false);
  const [checkDataModalOpen, setCheckDataModalOpen] = useState(false);
  const query = useQuery();
  const navigate = useSyncNavigate();
  const { activeLocale } = useLocalization();
  const { availableProjects } = useProjects();
  const organizationId = selectedOrganization?.id;
  const { data: acceleratorProjectNamesBySpeciesId = EMPTY_ACCELERATOR_PROJECT_NAMES_BY_SPECIES_ID } =
    useListSpeciesAcceleratorProjectsQuery(organizationId ?? -1, {
      skip: !organizationId || species.length === 0,
      refetchOnMountOrArgChange: true,
    });

  const contentRef = React.useRef(null);

  const [handleProblemsColumn, setHandleProblemsColumn] = useState<boolean>(false);
  const [hasNewData, setHasNewData] = useState<boolean>(false);
  const [showProblemsColumn, setShowProblemsColumn] = useState<boolean>(false);

  const userCanEdit = !isContributor(selectedOrganization);
  const speciesIntelligenceEnabled = isEnabled('Species Intelligence');

  const speciesCheckEnabled = speciesIntelligenceEnabled;
  const hasMultipleProjects = (availableProjects?.length ?? 0) > 1;
  const orgScopeKnown = availableProjects !== undefined && availableProjects.length <= 1;
  const { isMobile } = useDeviceInfo();

  const [speciesCheckOpen, setSpeciesCheckOpen] = useState(false);
  const [speciesCheckEntry, setSpeciesCheckEntry] = useState<SpeciesCheckEntry>('menu');
  const [firstTimeBannerDismissed, setFirstTimeBannerDismissed] = useState(false);
  const [addedBannerDismissed, setAddedBannerDismissed] = useState(false);

  const openSpeciesCheck = useCallback((entry: SpeciesCheckEntry) => {
    setSpeciesCheckEntry(entry);
    setSpeciesCheckOpen(true);
  }, []);

  const noLocationSet = hasMultipleProjects
    ? (availableProjects ?? []).every((p) => !p.botanicalCountryCode)
    : !selectedOrganization?.botanicalCountryCode;
  const orgLocationSet = !hasMultipleProjects && !!selectedOrganization?.botanicalCountryCode;

  const uncheckedSpecies = useMemo(
    () =>
      species.filter((sp) => {
        if (hasMultipleProjects) {
          return (sp.projects ?? []).some((element) => {
            const project = availableProjects?.find((p) => p.id === element.projectId);
            return !!project?.botanicalCountryCode && !element.calculatedNativity && !element.overriddenNativity;
          });
        }
        if (!orgLocationSet) {
          return false;
        }
        const orgElement = (sp.projects ?? []).find((e) => e.projectId === undefined);
        if (nativityOf(orgElement)) {
          return false;
        }
        if (orgElement?.pendingNativity) {
          return true;
        }
        if (orgScopeKnown) {
          return !(sp.projects ?? []).some((element) => nativityOf(element));
        }
        return true;
      }),
    [species, availableProjects, hasMultipleProjects, orgLocationSet, orgScopeKnown]
  );

  const showFirstTimeBanner = speciesCheckEnabled && noLocationSet && !firstTimeBannerDismissed;
  const showAddedBanner = speciesCheckEnabled && !noLocationSet && uncheckedSpecies.length > 0 && !addedBannerDismissed;

  const firstTimeBannerImpressionRef = React.useRef(false);
  useEffect(() => {
    if (showFirstTimeBanner && !firstTimeBannerImpressionRef.current) {
      firstTimeBannerImpressionRef.current = true;
      trackEvent(MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_BANNER_SHOWN, {});
    }
  }, [showFirstTimeBanner, trackEvent]);

  const {
    columnFilters,
    columnOrder,
    columnVisibility,
    density,
    onDensityChange,
    onPaginationChange,
    pagination,
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
    defaultSorting: [{ id: 'scientificName', desc: false }],
  });

  const selectedProjectIds = useMemo<Set<number>>(() => {
    const filter = columnFilters.find((f) => f.id === 'project');
    const names = Array.isArray(filter?.value) ? (filter?.value as string[]) : [];
    const ids = new Set<number>();
    names.forEach((name) => {
      const project = availableProjects?.find((p) => p.name === name);
      if (project) {
        ids.add(project.id);
      }
    });
    return ids;
  }, [columnFilters, availableProjects]);

  const resolveScopeNativities = useCallback(
    (sp: Species): Nativity[] => {
      const elements = sp.projects ?? [];
      const distinct = (values: (Nativity | undefined)[]): Nativity[] =>
        NATIVITY_VALUES.filter((value) => values.includes(value));

      if (hasMultipleProjects) {
        const scopedElements =
          selectedProjectIds.size > 0
            ? elements.filter((element) => element.projectId !== undefined && selectedProjectIds.has(element.projectId))
            : elements;
        return distinct(scopedElements.map((element) => nativityOf(element)));
      }

      const orgNativity = nativityOf(elements.find((element) => element.projectId === undefined));
      if (orgNativity) {
        return [orgNativity];
      }
      return orgScopeKnown ? distinct([nativityOf(elements.find((element) => nativityOf(element)))]) : [];
    },
    [hasMultipleProjects, orgScopeKnown, selectedProjectIds]
  );

  const speciesCheckRan = species.some((sp) => resolveScopeNativities(sp).length > 0);
  const showStatusColumn = speciesCheckEnabled && speciesCheckRan;

  const statusBySpeciesId = useMemo(() => {
    const map = new Map<number, Nativity[]>();
    if (showStatusColumn) {
      species.forEach((sp) => {
        map.set(sp.id, resolveScopeNativities(sp));
      });
    }
    return map;
  }, [showStatusColumn, species, resolveScopeNativities]);

  const projectNamesBySpeciesId = useMemo(() => {
    const map = new Map<number, string[]>();
    species.forEach((sp) => {
      const names: string[] = [];
      sp.projects?.forEach((project) => {
        if (project.projectId !== undefined) {
          const name = availableProjects?.find((p) => p.id === project.projectId)?.name;
          if (name) {
            names.push(name);
          }
        }
      });
      map.set(sp.id, names);
    });
    return map;
  }, [species, availableProjects]);

  const results = useMemo<SpeciesSearchResultRow[]>(
    () =>
      species.map((sp) => ({
        ...sp,
        acceleratorProjects: acceleratorProjectNamesBySpeciesId[sp.id],
      })),
    [species, acceleratorProjectNamesBySpeciesId]
  );

  useEffect(() => {
    const shouldCheckData = query.has('checkData');
    if (shouldCheckData) {
      query.delete('checkData');
      setCheckDataModalOpen(true);
      navigate({ pathname: APP_PATHS.SPECIES, search: query.toString() }, { replace: true });
    }
  }, [query, setCheckDataModalOpen, navigate]);

  // Unique filter option values derived from results (client-side)
  const uniqueConservationCategories = useMemo(() => {
    const values = new Set(results?.map((r) => r.conservationCategory).filter((v): v is string => Boolean(v)));
    return conservationCategories().filter((c) => values.has(c.value));
  }, [results]);

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

  const availableProjectNames = useMemo(
    () => (availableProjects ?? []).map((project) => project.name).sort((a, b) => a.localeCompare(b)),
    [availableProjects]
  );

  const showProjectColumn = speciesIntelligenceEnabled && hasMultipleProjects && !!availableProjects;

  const onNewSpecies = () => {
    navigate(APP_PATHS.SPECIES_NEW);
  };

  const downloadReportHandler = (table: MRT_TableInstance<SpeciesSearchResultRow>) => {
    const filteredRows = table.getSortedRowModel().rows;
    trackEvent(MIXPANEL_EVENTS.REPORT_DOWNLOADED, {
      report_type: 'species_list',
      format: 'csv',
      row_count: filteredRows.length,
    });
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
      void reloadData();
      if (speciesCheckEnabled) {
        openSpeciesCheck('added');
      } else {
        setCheckDataModalOpen(true);
      }
    }
    setImportSpeciesModalOpen(false);
  };

  const onCheckData = () => {
    setCheckDataModalOpen(true);
  };

  const reviewErrorsHandler = (hasErrors: boolean) => {
    setCheckDataModalOpen(false);
    setShowProblemsColumn(hasErrors);
  };

  const reloadDataProblemsHandler = useCallback(async () => {
    setHasNewData(false);
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
      case 'runSpeciesCheck': {
        openSpeciesCheck('menu');
        break;
      }
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
        fontSize={14}
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
    return <TextTruncated fontSize={14} stringList={list} moreText={strings.TRUNCATED_TEXT_MORE_LINK} />;
  }, []);

  const ProjectCell = useCallback(({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
    const value = cell.getValue() as string | undefined;
    const list = value ? value.split(', ') : [];
    return (
      <TextTruncated
        fontSize={14}
        stringList={list}
        width={150}
        listSeparator={strings.LIST_SEPARATOR_SECONDARY}
        moreText={strings.TRUNCATED_TEXT_MORE_LINK}
      />
    );
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

  const StatusCell = useCallback(
    ({ cell }: { cell: MRT_Cell<SpeciesSearchResultRow> }) => {
      const nativities = statusBySpeciesId.get(cell.row.original.id) ?? [];
      if (nativities.length === 0) {
        return (
          <Badge
            label={strings.NOT_SET}
            backgroundColor={theme.palette.TwClrBgSecondary}
            borderColor={theme.palette.TwClrBrdrSecondary}
            labelColor={theme.palette.TwClrTxtSecondary}
          />
        );
      }
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing(0.5) }}>
          {nativities.map((nativity) => (
            <SpeciesNativityBadge key={nativity} nativity={nativity} />
          ))}
        </Box>
      );
    },
    [statusBySpeciesId, theme]
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
      ...(showStatusColumn
        ? [
            {
              id: 'status',
              header: strings.STATUS,
              accessorFn: (row: SpeciesSearchResultRow) => {
                const nativities = statusBySpeciesId.get(row.id) ?? [];
                return nativities.length ? nativities.map(getNativityLabel).join(', ') : strings.NOT_SET;
              },
              enableEditing: false,
              filterVariant: 'select' as const,
              filterSelectOptions: [
                strings.NATIVE,
                strings.INTRODUCED,
                strings.INVASIVE,
                strings.UNKNOWN,
                strings.NOT_SET,
              ],
              filterFn: (row: MRT_Row<SpeciesSearchResultRow>, _columnId: string, filterValue: string) => {
                const nativities = statusBySpeciesId.get(row.original.id) ?? [];
                const labels = nativities.length ? nativities.map(getNativityLabel) : [strings.NOT_SET];
                return labels.includes(filterValue);
              },
              sortUndefined: 'last' as const,
              Cell: StatusCell,
            },
          ]
        : []),
      ...(showProjectColumn
        ? [
            {
              id: 'project',
              header: strings.PROJECT,
              accessorFn: (row: SpeciesSearchResultRow) => (projectNamesBySpeciesId.get(row.id) ?? []).join(', '),
              enableEditing: false,
              filterVariant: 'multi-select',
              filterSelectOptions: availableProjectNames,
              filterFn: (row: MRT_Row<SpeciesSearchResultRow>, _columnId: string, filterValue: string[]) => {
                if (!filterValue?.length) {
                  return true;
                }
                const names = projectNamesBySpeciesId.get(row.original.id) ?? [];
                return filterValue.some((value) => names.includes(value));
              },
              sortUndefined: 'last',
              Cell: ProjectCell,
            },
          ]
        : []),
      {
        id: 'acceleratorProjects',
        header: strings.ACCELERATOR_PROJECTS,
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
        accessorFn: (row: SpeciesSearchResultRow) => getConservationCategoryString(row.conservationCategory),
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: uniqueConservationCategories.map((category) => category.label),
        sortUndefined: 'last',
      },
      {
        id: 'rare',
        header: strings.RARE,
        accessorFn: (row: SpeciesSearchResultRow) => (row.rare ? strings.YES : strings.NO),
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
    showStatusColumn,
    showProjectColumn,
    availableProjectNames,
    projectNamesBySpeciesId,
    statusBySpeciesId,
    uniqueAcceleratorProjects,
    uniqueConservationCategories,
    uniqueGrowthForms,
    uniqueSeedStorageBehaviors,
    uniqueEcosystemTypes,
    theme,
    ProblemsCell,
    StatusCell,
    ScientificNameCell,
    ProjectCell,
    AcceleratorProjectsCell,
    GrowthFormsCell,
    EcosystemTypesCell,
  ]);

  if (!species.length) {
    if (isLoading) {
      return (
        <TfMain>
          <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '64px' }}>
            <CircularProgress />
          </Box>
        </TfMain>
      );
    }

    return <EmptyStatePage pageName={'Species'} reloadData={() => void reloadData()} />;
  }

  return (
    <TfMain>
      <CheckDataModal
        open={checkDataModalOpen}
        onClose={() => setCheckDataModalOpen(false)}
        species={species}
        reviewErrors={reviewErrorsHandler}
        reloadData={() => void reloadData()}
      />
      <ImportSpeciesModal
        open={importSpeciesModalOpen}
        onClose={onCloseImportSpeciesModal}
        setCheckDataModalOpen={setCheckDataModalOpen}
      />
      {speciesCheckEnabled && (
        <SpeciesCheckModal
          open={speciesCheckOpen}
          onClose={() => setSpeciesCheckOpen(false)}
          species={species}
          projects={hasMultipleProjects ? availableProjects ?? [] : []}
          entry={speciesCheckEntry}
          reloadSpecies={reloadData}
        />
      )}
      {(showFirstTimeBanner || showAddedBanner) && (
        <Box marginBottom={theme.spacing(2)} paddingLeft={theme.spacing(3)} paddingRight={theme.spacing(3)}>
          {showFirstTimeBanner ? (
            <Message
              type='page'
              priority='info'
              body={strings.SPECIES_CHECK_SET_LOCATION_BANNER}
              showCloseButton
              onClose={() => setFirstTimeBannerDismissed(true)}
              pageButtons={[
                <Button
                  key='run'
                  label={strings.RUN_SPECIES_CHECK}
                  priority='secondary'
                  type='passive'
                  onClick={() => openSpeciesCheck('first-time')}
                />,
              ]}
            />
          ) : (
            <Message
              type='page'
              priority='info'
              body={strings.formatString(
                uncheckedSpecies.length === 1
                  ? strings.SPECIES_CHECK_ADDED_BANNER_ONE
                  : strings.SPECIES_CHECK_ADDED_BANNER,
                String(uncheckedSpecies.length),
                uncheckedSpecies.map((sp) => sp.scientificName).join(', ')
              )}
              showCloseButton
              onClose={() => setAddedBannerDismissed(true)}
              pageButtons={[
                <Button
                  key='run'
                  label={strings.RUN_SPECIES_CHECK}
                  priority='secondary'
                  type='passive'
                  onClick={() => openSpeciesCheck('added')}
                />,
              ]}
            />
          )}
        </Box>
      )}
      <Box ref={contentRef}>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: theme.spacing(2),
              paddingLeft: theme.spacing(isMobile ? 1 : 3),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
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
            </Box>
            {!isMobile && userCanEdit && (
              <div>
                <Button id='add-species' label={strings.ADD_SPECIES} icon='plus' onClick={onNewSpecies} size='medium' />
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[
                    speciesCheckEnabled
                      ? { label: strings.RUN_SPECIES_CHECK, value: 'runSpeciesCheck' }
                      : { label: strings.CHECK_DATA, value: 'checkData' },
                    { label: strings.IMPORT, value: 'import' },
                  ]}
                />
              </div>
            )}
            {isMobile && userCanEdit && (
              <Box display='flex' alignItems='center' gap={theme.spacing(0.5)}>
                <Button id='add-species' onClick={onNewSpecies} size='medium' icon='plus' style={{ marginRight: 0 }} />
                {speciesCheckEnabled && (
                  <OptionsMenu
                    onOptionItemClick={onOptionItemClick}
                    optionItems={[{ label: strings.RUN_SPECIES_CHECK, value: 'runSpeciesCheck' }]}
                    sx={{ marginLeft: 0, '& button': { margin: 0 } }}
                  />
                )}
              </Box>
            )}
          </Box>
          <PageSnackbar />
        </PageHeaderWrapper>
      </Box>
      <Card flushMobile>
        <EditableTable
          clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
          columns={editableColumns}
          data={results}
          enableEditing={false}
          enableSorting={true}
          enableGlobalFilter={true}
          enableColumnFilters={true}
          enableColumnOrdering={true}
          stickyFilters={true}
          storageKey={TABLE_STATE_STORAGE_KEY}
          enablePagination={true}
          enableTopToolbar={true}
          enableBottomToolbar={true}
          tableOptions={{
            state: {
              sorting,
              columnFilters,
              columnOrder,
              columnVisibility,
              density,
              pagination,
              showColumnFilters,
              showGlobalFilter,
            },
            onSortingChange: setSorting,
            onColumnFiltersChange: setColumnFilters,
            onPaginationChange,
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
      </Card>
    </TfMain>
  );
}
