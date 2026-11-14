import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Card, Checkbox, Chip, IconButton, Tooltip, useTheme } from '@mui/material';
import { BusySpinner, EditableTableColumn, Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_Column,
  MRT_Row,
  MRT_TableInstance,
  MRT_TableOptions,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
} from 'material-react-table';

import Page from 'src/components/Page';
import CurrentView, { DEFAULT_VIEW } from 'src/components/common/CurrentView';
import EditableTable from 'src/components/common/EditableTable';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import TableToolbarActions from 'src/components/common/table/TableToolbarActions';
import { mobileTopToolbarSx } from 'src/components/common/table/mobileTopToolbarSx';
import { APP_PATHS } from 'src/constants';
import useTableState from 'src/hooks/useTableState';
import { useLocalization, useUser } from 'src/providers';
import { useUpdateProjectVariableValuesMutation } from 'src/queries/generated/documentProducerValues';
import { useListVariablesQuery } from 'src/queries/generated/documentProducerVariables';
import {
  ProjectsWithVariablesSearchResult,
  useLazySearchProjectsWithVariablesQuery,
} from 'src/queries/search/projectsWithVariables';
import { SearchNodePayload } from 'src/types/Search';
import { TABLES } from 'src/types/Tables';
import { VariableUnion } from 'src/types/documentProducer/Variable';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

import ColumnsModal, { baseColumns } from './ColumnsModal';
import DateEditor from './editors/DateEditor';
import SelectEditor from './editors/SelectEditor';
import TextEditor from './editors/TextEditor';
import {
  MatrixRow,
  MatrixValue,
  SaveMatrixValue,
  buildMatrixValue,
  buildMatrixValueOperation,
  getMatrixValue,
} from './matrixValues';
import { getMatrixOptionIds } from './matrixValues';

const DEFAULT_COLUMN_PINNING = { left: ['projectName'], right: [] };

type ViewOption = typeof DEFAULT_VIEW | 'acceleratorProjects' | 'applicants';

type MatrixColumn = EditableTableColumn<ProjectsWithVariablesSearchResult>;
type CustomEditComponent = NonNullable<MatrixColumn['editConfig']>['customEditComponent'];
type MatrixEditProps = Parameters<NonNullable<CustomEditComponent>>[0];

const MatrixView = () => {
  const { isMobile } = useDeviceInfo();
  const [searchProjectsWithVariables, { data: projectsData }] = useLazySearchProjectsWithVariablesQuery();
  const projects = useMemo(() => projectsData ?? [], [projectsData]);
  const { currentData: allVariablesData } = useListVariablesQuery({});
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const allVariables = useMemo<VariableUnion[] | undefined>(
    () => allVariablesData?.variables.filter((v) => v.type !== 'Table' && v.type !== 'Image'),
    [allVariablesData]
  );
  const [updateProjectVariableValues, updateVariableValuesResult] = useUpdateProjectVariableValuesMutation();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { isAllowed } = useUser();
  const isAllowedEditMatrixView = isAllowed('UPDATE_MATRIX_VIEW');
  const { strings, countries, activeLocale } = useLocalization();
  const dateLocale = activeLocale === 'gx' ? 'fr' : activeLocale || 'en';
  const [currentView, setCurrentView] = useState<ViewOption>('acceleratorProjects');
  const {
    columnFilters,
    columnOrder,
    columnPinning,
    columnVisibility: savedColumnVisibility,
    globalFilter,
    setColumnFilters,
    setColumnOrder,
    setColumnPinning,
    setColumnVisibility,
    setGlobalFilter,
    setSorting,
    sorting,
  } = useTableState(TABLES.matrixView, {
    defaultColumnPinning: DEFAULT_COLUMN_PINNING,
    persistColumnPinning: true,
    persistFilters: true,
    persistGlobalFilter: true,
    persistSorting: true,
  });

  const uniqueVariableIds = useMemo(
    () =>
      Array.from(
        new Set(
          allVariables?.flatMap((variable) => {
            return variable.stableId ?? variable.name;
          }) || []
        )
      ),
    [allVariables]
  );

  const defaultViewSettings = useMemo(
    () => ({
      columnPinning: DEFAULT_COLUMN_PINNING,
      columnVisibility: Object.fromEntries(uniqueVariableIds.map((id) => [id, false])),
    }),
    [uniqueVariableIds]
  );

  const columnVisibility = useMemo(
    () => ({ ...defaultViewSettings.columnVisibility, ...savedColumnVisibility }),
    [defaultViewSettings, savedColumnVisibility]
  );

  const visibleVariableIds = useMemo(
    () => uniqueVariableIds.filter((id) => columnVisibility[id]),
    [columnVisibility, uniqueVariableIds]
  );

  const visibleColumnFilters = useMemo(
    () => columnFilters.filter((filter) => columnVisibility[filter.id] !== false),
    [columnFilters, columnVisibility]
  );

  const variableNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allVariables?.forEach((variable) => {
      if (!map.has(variable.stableId)) {
        map.set(variable.stableId, variable.name);
      }
    });
    return map;
  }, [allVariables]);

  const saveMatrixValue = useCallback<SaveMatrixValue>(
    async (projectId, updatedValue, variable) => {
      const newValue = buildMatrixValue(variable.type, updatedValue);
      const operation = newValue ? buildMatrixValueOperation(variable, newValue) : undefined;
      if (operation) {
        setLoading(true);
        await updateProjectVariableValues({
          projectId,
          updateVariableValuesRequestPayload: {
            operations: [operation],
            updateStatuses: false,
          },
        }).unwrap();
      }
    },
    [updateProjectVariableValues]
  );

  const onSaveHandler = useCallback(
    (...args: Parameters<SaveMatrixValue>) => {
      void saveMatrixValue(...args).catch(() => setLoading(false));
    },
    [saveMatrixValue]
  );

  const matrixColumns = useMemo<MatrixColumn[]>(() => {
    const baseNonVariableColumns: MatrixColumn[] = [
      {
        accessorKey: 'acceleratorDetails_dealName',
        header: strings.DEAL_NAME,
        size: 200,
        id: 'projectName',
        enableEditing: false,
        enableHiding: false,
        Cell: ({
          cell,
          row,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
        }) => {
          const projectName = cell.getValue<string>();
          const projectId = row.original.id;
          return (
            <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId.toString())}>
              {projectName}
            </Link>
          );
        },
        filterVariant: 'text',
      },
      {
        accessorKey: 'phase',
        header: strings.PHASE,
        size: 200,
        id: 'phase',
        enableEditing: false,
        filterVariant: 'text',
      },
      {
        accessorKey: 'acceleratorDetails_confirmedReforestableLand(raw)',
        header: strings.ELIGIBLE_LAND,
        size: 200,
        id: 'eligibleLand',
        enableEditing: false,
        filterVariant: 'range',
        filterFn: 'between',
        Cell: ({ cell }: { cell: MRT_Cell<ProjectsWithVariablesSearchResult> }) => {
          if (cell.getValue() !== undefined) {
            return <FormattedNumber value={cell.getValue<number>()} />;
          }
          return null;
        },
      },
      {
        accessorKey: 'country_name',
        header: strings.COUNTRY,
        size: 200,
        id: 'countryName',
        enableEditing: false,
        filterVariant: 'select',
        filterSelectOptions: countries.map((country) => country.name || ''),
      },
      {
        header: strings.PROJECT_LEAD,
        size: 200,
        id: 'projectLead',
        enableEditing: false,
        filterVariant: 'text',
        accessorFn: (row) =>
          row.internalUsers && row.internalUsers.length > 0 && row.internalUsers[0].user_firstName
            ? `${row.internalUsers[0].user_firstName} ${row.internalUsers[0].user_lastName}`
            : '',
      },
    ];

    const variableColumns: MatrixColumn[] = uniqueVariableIds.map((variableId) => {
      const selectedVariable = allVariables?.find((va) => va.stableId === variableId);
      const correspondingVariable = projects?.flatMap((p) => p.variables || []).find((v) => v.stableId === variableId);
      const correspondingValue = correspondingVariable?.values?.[0];
      let Edit: CustomEditComponent;
      let Cell: MatrixColumn['Cell'];
      let filterFunction: 'between' | 'fuzzy' | 'arrIncludesSome' = 'fuzzy';
      let filterVariant: 'text' | 'multi-select' | 'range' | 'date-range' = 'text';

      let filterSelectOptions: string[] = [];

      const saveVariableValue = async (row: MatrixRow, value: MatrixValue) => {
        const variable = row.variables?.find((candidate) => candidate.stableId === variableId) ?? selectedVariable;
        if (variable) {
          await saveMatrixValue(row.id, value, variable);
        }
      };

      if (correspondingValue?.dateValue) {
        filterVariant = 'date-range';
        filterFunction = 'between';
        // eslint-disable-next-line react/display-name
        Edit = ({ cell, row, table }: MatrixEditProps) => (
          <DateEditor
            value={String(cell.getValue() ?? '')}
            save={(value) => saveVariableValue(row.original, value)}
            cancel={() => table.setEditingCell(null)}
          />
        );
        // eslint-disable-next-line react/display-name
        Cell = ({ cell }: { cell: MRT_Cell<ProjectsWithVariablesSearchResult> }) => {
          if (cell.getValue() && cell.getValue() instanceof Date) {
            return <>{cell.getValue<Date>().toLocaleDateString(dateLocale)}</>;
          }
          return null;
        };
      }

      if (selectedVariable && 'options' in selectedVariable) {
        Cell = undefined;
        filterVariant = 'multi-select';
        const getSelectOptions = () => {
          if (selectedVariable && 'options' in selectedVariable && selectedVariable.options) {
            return selectedVariable.options.map((option) => ({
              label: option.renderedText ?? option.name,
              value: option.id.toString(),
            }));
          }
          return [];
        };

        filterSelectOptions = getSelectOptions().map((opt) => opt.label || '');
        filterFunction = 'arrIncludesSome';

        if (selectedVariable && 'isMultiple' in selectedVariable && selectedVariable.isMultiple) {
          // eslint-disable-next-line react/display-name
          Edit = ({
            cell,
            row,
            table,
          }: {
            cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
            column: MRT_Column<ProjectsWithVariablesSearchResult>;
            row: MRT_Row<ProjectsWithVariablesSearchResult>;
            table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
          }) => {
            const [selectedLabels] = React.useState<string[]>(
              cell.getValue<string>()
                ? cell
                    .getValue<string>()
                    .trim()
                    ?.split(',')
                    .map((item) => item.trim())
                : []
            );
            const [selections, setSelections] = React.useState<string[]>([]);
            const [isOpen, setIsOpen] = useState(false);
            const [position, setPosition] = useState({ top: 0, left: 0 });
            const triggerRef = useRef<HTMLDivElement>(null);
            const portalRef = useRef<HTMLDivElement>(null);

            const optionsMap = useMemo(
              () =>
                new Map<string, string>(
                  getSelectOptions()
                    .filter((opt) => opt.value && opt.label)
                    .map((opt) => [opt.value, opt.label])
                ),
              []
            );

            useEffect(() => {
              if (selectedLabels) {
                setSelections(
                  selectedLabels.map((sl) => getSelectOptions().find((opt) => opt.label === sl)?.value || '')
                );
              }
            }, [optionsMap, selectedLabels]);

            const handleSave = useCallback(() => {
              const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
              const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
              if (variableToProcess) {
                onSaveHandler(row.original.id, selections, variableToProcess);
              }
              table.setEditingCell(null);
            }, [row.original.id, row.original.variables, selections, table]);

            const onAdd = (value: string | null) => {
              const updatedValues = [...selections];
              const valueIndex = updatedValues.findIndex((v) => v === value);
              if (value && valueIndex < 0) {
                updatedValues.push(value);
                setSelections(updatedValues);
              }
            };

            const onRemove = (value: string | null) => {
              const updatedValues = [...selections];
              const valueIndex = updatedValues.findIndex((v) => v === value);
              if (valueIndex >= 0) {
                updatedValues.splice(valueIndex, 1);
                setSelections(updatedValues);
              }
            };

            const handleOpen = useCallback(() => {
              if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                  top: rect.bottom + window.scrollY,
                  left: rect.left + window.scrollX,
                });
                setIsOpen(true);
              }
            }, []);

            const handleClose = useCallback(() => {
              handleSave();
              setIsOpen(false);
            }, [handleSave]);

            useEffect(() => {
              const handleClickOutside = (event: MouseEvent) => {
                if (
                  isOpen &&
                  portalRef.current &&
                  triggerRef.current &&
                  !portalRef.current.contains(event.target as Node) &&
                  !triggerRef.current.contains(event.target as Node)
                ) {
                  handleClose();
                }
              };

              if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
              }

              return () => {
                document.removeEventListener('mousedown', handleClickOutside);
              };
            }, [handleClose, isOpen]);

            return (
              <>
                <div
                  ref={triggerRef}
                  onClick={handleOpen}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    minHeight: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {selections.map((value) => (
                    <Chip
                      key={value}
                      label={optionsMap.get(value) || value}
                      size='small'
                      onDelete={(e) => {
                        e.stopPropagation();
                        onRemove(value);
                      }}
                    />
                  ))}
                  {selections.length === 0 && <span style={{ color: '#999' }}>{strings.SELECT_OPTIONS}</span>}
                </div>

                {isOpen &&
                  createPortal(
                    <div
                      ref={portalRef}
                      style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        zIndex: 9999,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        minWidth: '200px',
                      }}
                    >
                      {Array.from(optionsMap.entries()).map(([value, label]) => (
                        <div
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selections.includes(value)) {
                              onRemove(value);
                            } else {
                              onAdd(value);
                            }
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #f0f0f0',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                          }}
                        >
                          <Checkbox checked={selections.includes(value)} size='small' style={{ marginRight: '8px' }} />
                          {label}
                        </div>
                      ))}
                    </div>,
                    document.body
                  )}
              </>
            );
          };
        } else {
          // eslint-disable-next-line react/display-name
          Edit = ({ row, table }: MatrixEditProps) => (
            <SelectEditor
              value={getMatrixOptionIds(row.original, variableId)[0] ?? ''}
              options={getSelectOptions()}
              save={(value) => saveVariableValue(row.original, value)}
              cancel={() => table.setEditingCell(null)}
            />
          );
        }
      }
      if (correspondingValue?.['numberValue(raw)'] !== undefined) {
        // eslint-disable-next-line react/display-name
        Cell = ({ cell }: { cell: MRT_Cell<ProjectsWithVariablesSearchResult> }) => {
          return <FormattedNumber value={cell.getValue<number>()} />;
        };
        filterVariant = 'range';
        filterFunction = 'between';
        // eslint-disable-next-line react/display-name
        Edit = ({ cell, row, table }: MatrixEditProps) => (
          <TextEditor
            type='number'
            value={String(cell.getValue() ?? '')}
            save={(value) => saveVariableValue(row.original, value)}
            cancel={() => table.setEditingCell(null)}
          />
        );
      }
      if (correspondingValue?.linkUrl) {
        Cell = undefined;
        // eslint-disable-next-line react/display-name
        Edit = ({ cell, row, table }: MatrixEditProps) => (
          <TextEditor
            type='url'
            value={String(cell.getValue() ?? '')}
            save={(value) => saveVariableValue(row.original, value)}
            cancel={() => table.setEditingCell(null)}
          />
        );
      }
      return {
        id: variableId,
        header: variableNameMap.get(variableId) || variableId,
        size: 150,
        enableEditing: isAllowedEditMatrixView,
        editConfig: Edit
          ? { editVariant: 'custom', customEditComponent: Edit }
          : {
              onSave: (row, newValue) => {
                const variable = row.variables?.find((_variable) => _variable.stableId === variableId);
                const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
                if (variableToProcess) {
                  onSaveHandler(row.id, newValue, variableToProcess);
                }
              },
            },
        filterVariant,
        filterSelectOptions,
        filterFn: filterFunction,
        accessorFn: (row) => getMatrixValue(row, variableId),
        Cell,
      };
    });

    return [...baseNonVariableColumns, ...variableColumns];
  }, [
    strings,
    allVariables,
    countries,
    dateLocale,
    isAllowedEditMatrixView,
    onSaveHandler,
    saveMatrixValue,
    projects,
    uniqueVariableIds,
    variableNameMap,
  ]);

  const onColumnsClickHandler = useCallback(() => {
    setShowColumnsModal(true);
  }, []);

  const onCurrentViewChange = useCallback((value: string) => setCurrentView(value as ViewOption), []);

  const reloadTable = useCallback(() => {
    let search: SearchNodePayload | undefined;
    if (currentView === DEFAULT_VIEW) {
      search = {
        operation: 'or',
        children: [
          {
            operation: 'not',
            child: {
              operation: 'field',
              field: 'application_id',
              type: 'Exact',
              values: [null],
            },
          },
          {
            operation: 'not',
            child: {
              operation: 'field',
              field: 'phase',
              type: 'Exact',
              values: [null],
            },
          },
        ],
      };
    } else if (currentView === 'acceleratorProjects') {
      search = {
        operation: 'not',
        child: {
          operation: 'field',
          field: 'phase',
          type: 'Exact',
          values: [null],
        },
      };
    } else if (currentView === 'applicants') {
      search = {
        operation: 'and',
        children: [
          {
            operation: 'field',
            field: 'application_status',
            type: 'Exact',
            values: [
              'Submitted',
              'Sourcing Team Review',
              'GIS Assessment',
              'Expert Review',
              'Carbon Assessment',
              'P0 Eligible',
              'Accepted',
              'Issue Active',
              'Issue Reassessment',
            ],
          },
          {
            operation: 'field',
            field: 'phase',
            type: 'Exact',
            values: [null],
          },
        ],
      };
    }

    return searchProjectsWithVariables({
      fields: [
        'id',
        'acceleratorDetails_dealName',
        'phase',
        'application_id',
        'acceleratorDetails_confirmedReforestableLand(raw)',
        'country_name',
        'internalUsers.role',
        'internalUsers.user_firstName',
        'internalUsers.user_lastName',
        'variables.stableId',
        'variables.id',
        'variables.variableName',
        'variables.type',
        'variables.isList',
        'variables.isMultiSelect',
        'variables.values.textValue',
        'variables.values.variableValueId',
        'variables.values.numberValue(raw)',
        'variables.values.linkUrl',
        'variables.values.dateValue',
        'variables.values.options.name',
        'variables.values.options.id',
        'variables.values.options.position',
      ],
      sortOrder: {
        field: 'acceleratorDetails_dealName',
        direction: 'Ascending',
      },
      search,
      filters: [
        {
          prefix: 'variables',
          search: {
            field: 'stableId',
            operation: 'field',
            type: 'Exact',
            values: visibleVariableIds.length > 0 ? visibleVariableIds : [''],
          },
        },
        {
          prefix: 'internalUsers',
          search: {
            operation: 'field',
            field: 'role',
            values: ['Project Lead'],
          },
        },
      ],
    });
  }, [currentView, searchProjectsWithVariables, visibleVariableIds]);

  useEffect(() => {
    if (updateVariableValuesResult.isSuccess) {
      void reloadTable().then(() => setLoading(false));
    }
    if (updateVariableValuesResult.isError) {
      snackbar.toastError();
      setLoading(false);
    }
  }, [reloadTable, snackbar, updateVariableValuesResult.isError, updateVariableValuesResult.isSuccess]);

  useEffect(() => {
    void reloadTable();
  }, [reloadTable]);

  const onCloseColumnsModalHandler = useCallback(() => {
    setShowColumnsModal(false);
  }, []);

  const onColumnsSelected = useCallback(
    (columns: string[]) => {
      const selectedVisibility: Record<string, boolean> = {};

      baseColumns().forEach((col) => {
        if (col.id !== 'projectName') {
          selectedVisibility[col.id] = false;
        }
      });

      uniqueVariableIds?.forEach((id) => {
        selectedVisibility[id] = false;
      });

      columns.forEach((id) => {
        selectedVisibility[id] = true;
      });

      const hiddenColumnIds = Object.entries(selectedVisibility)
        .filter(([, isVisible]) => !isVisible)
        .map(([columnId]) => columnId);

      setColumnFilters((prev) => prev.filter((filter) => !hiddenColumnIds.includes(filter.id)));
      setColumnVisibility((prev) => ({ ...prev, ...selectedVisibility }));
      setColumnOrder(columns);
    },
    [setColumnFilters, setColumnOrder, setColumnVisibility, uniqueVariableIds]
  );

  const renderToolbarInternalActions = useCallback(
    ({ table }: { table: MRT_TableInstance<ProjectsWithVariablesSearchResult> }) => (
      <TableToolbarActions>
        <MRT_ToggleFiltersButton table={table} />
        <Tooltip title={strings.MANAGE_COLUMNS}>
          <IconButton onClick={onColumnsClickHandler} id='manageColumns'>
            <Icon name='iconColumns' />
          </IconButton>
        </Tooltip>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        {showColumnsModal &&
          allVariables &&
          createPortal(
            <ColumnsModal
              onClose={onCloseColumnsModalHandler}
              onSave={onColumnsSelected}
              allVariables={allVariables}
              table={table}
            />,
            document.body
          )}
      </TableToolbarActions>
    ),
    [
      allVariables,
      onCloseColumnsModalHandler,
      onColumnsClickHandler,
      onColumnsSelected,
      showColumnsModal,
      strings.MANAGE_COLUMNS,
    ]
  );

  const tableOptions = useMemo<Partial<MRT_TableOptions<ProjectsWithVariablesSearchResult>>>(
    () => ({
      enableGlobalFilterRankedResults: false,
      initialState: { showColumnFilters: false },
      positionGlobalFilter: 'right',
      enableColumnDragging: !isMobile,
      muiTopToolbarProps: { sx: mobileTopToolbarSx },
      renderColumnActionsMenuItems: ({ internalColumnMenuItems }) => {
        // remove the last element (show all columns)
        const columnMenuItemsCopy = [...internalColumnMenuItems];
        void columnMenuItemsCopy.pop();
        return columnMenuItemsCopy;
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <CurrentView
          defaultPreset={currentView}
          defaultSettings={defaultViewSettings}
          onPresetChange={onCurrentViewChange}
          presetViews={[
            { label: strings.ACCELERATOR_PROJECTS, value: 'acceleratorProjects' },
            { label: strings.APPLICANTS, value: 'applicants' },
          ]}
          table={table}
          tableDefinition={TABLES.matrixView}
        />
      ),
      state: {
        columnFilters: visibleColumnFilters,
        sorting,
        columnPinning,
        columnOrder,
        columnVisibility,
        globalFilter,
        showGlobalFilter: true,
      },
      onGlobalFilterChange: setGlobalFilter,
      onColumnFiltersChange: setColumnFilters,
      onSortingChange: setSorting,
      onColumnPinningChange: setColumnPinning,
      onColumnOrderChange: setColumnOrder,
      onColumnVisibilityChange: setColumnVisibility,
      muiTableBodyRowProps: {
        sx: {
          '& td': {
            borderBottom: 'none',
          },
        },
      },
      muiTableBodyCellProps: ({ cell, column }) => ({
        sx: {
          '&[data-pinned="true"]:before': {
            backgroundColor: 'transparent !important',
          },
          '&[data-pinned="true"]': {
            filter: 'brightness(0.97)',
            boxShadow: '-4px 0 4px -4px rgba(97, 97, 97, 0.5) inset',
            zIndex: 1,
          },
          ...(column.id === 'projectName' && {
            maxWidth: '150px',
            '& a': {
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2em',
              maxHeight: '5.4em',
              whiteSpace: 'normal',
            },
          }),
        },
        title: column.id === 'projectName' ? cell.getValue()?.toString() || '' : undefined,
      }),
      muiTableProps: {
        sx: {
          tableLayout: 'fixed',
        },
      },
      muiTableHeadCellProps: ({ column }) => ({
        sx: {
          height: '56px',
          maxWidth: '200px',
          padding: '8px',
          '&.MuiTableCell-head': {
            height: '56px !important',
          },
          '&.MuiTableCell-head .Mui-TableHeadCell-Content-Wrapper': {
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.2em',
            maxHeight: '3.4em',
            whiteSpace: 'normal',
          },
        },
        title: column.columnDef.header,
      }),
    }),
    [
      columnOrder,
      columnPinning,
      columnVisibility,
      currentView,
      defaultViewSettings,
      globalFilter,
      isMobile,
      onCurrentViewChange,
      setColumnFilters,
      setColumnOrder,
      setColumnPinning,
      setColumnVisibility,
      setGlobalFilter,
      setSorting,
      sorting,
      strings,
      visibleColumnFilters,
    ]
  );

  return (
    <Page title={strings.PROJECTS}>
      {loading === true && <BusySpinner />}
      <Card sx={{ borderRadius: '24px', padding: theme.spacing(3), boxShadow: 'none' }}>
        <EditableTable
          clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
          columns={matrixColumns}
          data={projects}
          enableColumnFilters
          enableColumnOrdering
          enableColumnPinning
          enableEditing
          enableGlobalFilter
          renderToolbarInternalActions={renderToolbarInternalActions}
          sx={{ padding: 0 }}
          tableOptions={tableOptions}
        />
      </Card>
    </Page>
  );
};

export default MatrixView;
