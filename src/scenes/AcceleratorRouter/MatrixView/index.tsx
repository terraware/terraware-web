import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Card, Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import { BusySpinner, EditableTable, EditableTableColumn, Icon } from '@terraware/web-components';
import { isArray } from 'lodash';
import {
  MRT_Cell,
  MRT_Row,
  MRT_TableInstance,
  MRT_TableOptions,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
} from 'material-react-table';

import Page from 'src/components/Page';
import CurrentView, { DEFAULT_VIEW } from 'src/components/common/CurrentView';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
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
import {
  NewNonSectionValuePayloadUnion,
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';
import useSnackbar from 'src/utils/useSnackbar';

import ColumnsModal, { baseColumns } from './ColumnsModal';
import { DateEditor, MatrixEditorProps, MultiSelectEditor, SelectEditor, SelectOption, TextEditor } from './editors';

const DEFAULT_COLUMN_PINNING = { left: ['projectName'], right: [] };

type ViewOption = typeof DEFAULT_VIEW | 'acceleratorProjects' | 'applicants';

type MatrixRow = ProjectsWithVariablesSearchResult;

type MatrixColumnSpec = {
  id: string;
  header: string;
  size: number;
  enableEditing: boolean;
  enableHiding?: boolean;
  accessorKey?: keyof MatrixRow;
  accessorFn?: (row: MatrixRow) => unknown;
  filterVariant: 'text' | 'select' | 'multi-select' | 'range' | 'date-range';
  filterFn?: 'between' | 'fuzzy' | 'arrIncludesSome';
  filterSelectOptions?: string[];
  render?: (value: unknown, row: MatrixRow) => ReactNode;
  renderEditor?: (props: MatrixEditorProps) => ReactNode;
  onSave?: (row: MatrixRow, value: string | number | string[]) => void;
};

const toColumnV1 = ({ render, renderEditor, onSave, ...column }: MatrixColumnSpec): EditableTableColumn<MatrixRow> => ({
  ...column,
  Cell: render
    ? ({ cell, row }: { cell: MRT_Cell<MatrixRow>; row: MRT_Row<MatrixRow> }) => (
        <>{render(cell.getValue(), row.original)}</>
      )
    : undefined,
  editConfig: renderEditor
    ? {
        editVariant: 'custom',
        customEditComponent: ({
          cell,
          row,
          table,
        }: {
          cell: MRT_Cell<MatrixRow>;
          row: MRT_Row<MatrixRow>;
          table: MRT_TableInstance<MatrixRow>;
        }) => (
          <>
            {renderEditor({
              value: cell.getValue(),
              onSave: (value) => {
                table.setEditingCell(null);
                onSave?.(row.original, value);
              },
              onCancel: () => table.setEditingCell(null),
            })}
          </>
        ),
      }
    : { onSave },
});

const MatrixView = () => {
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
  const { strings, countries } = useLocalization();
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

  const onSaveHandler = useCallback(
    (
      projectId: number,
      updatedValue: string | number | string[],
      variable:
        | {
            stableId: string;
            id: string;
            variableName: string;
            type: string;
            isList?: boolean;
            isMultiselect?: boolean;
            values?: {
              variableValueId: string;
              options?: { id: string; name: string; position: string }[];
              numberValue?: string;
              textValue?: string;
              dateValue?: string;
              linkUrl?: string;
            }[];
          }
        | VariableUnion
    ) => {
      const values = 'values' in variable ? variable?.values : undefined;

      let newValue: NewNonSectionValuePayloadUnion | undefined;
      let firstValue;
      if (variable.type === 'Text') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueTextValue) : undefined;
        newValue = { type: 'Text', textValue: updatedValue.toString() };
      }
      if (variable.type === 'Number') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueNumberValue) : undefined;
        newValue = { type: 'Number', numberValue: Number(updatedValue) };
      }
      if (variable.type === 'Select') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueSelectValue) : undefined;
        newValue = {
          type: 'Select',
          optionIds: isArray(updatedValue) ? updatedValue.map((uVal) => Number(uVal)) : [Number(updatedValue)],
        };
      }
      if (variable.type === 'Date') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueDateValue) : undefined;
        newValue = { type: 'Date', dateValue: updatedValue.toString() };
      }
      if (variable.type === 'Email') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueEmailValue) : undefined;
        newValue = { type: 'Email', emailValue: updatedValue.toString() };
      }
      if (variable.type === 'Link') {
        firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueLinkValue) : undefined;
        newValue = { type: 'Link', url: updatedValue.toString() };
      }
      const valueIdToUpdate = firstValue?.id || -1;
      const handleError = () => {
        snackbar.toastError();
        setLoading(false);
      };
      if (newValue) {
        setLoading(true);
        if (valueIdToUpdate.toString() !== '-1') {
          void updateProjectVariableValues({
            projectId,
            updateVariableValuesRequestPayload: {
              operations: [
                { operation: 'Update', valueId: valueIdToUpdate, value: newValue, existingValueId: valueIdToUpdate },
              ],
              updateStatuses: false,
            },
          })
            .unwrap()
            .catch(handleError);
        } else {
          const varId = variable.id;
          if (varId) {
            void updateProjectVariableValues({
              projectId,
              updateVariableValuesRequestPayload: {
                operations: [{ operation: 'Append', variableId: Number(varId), value: newValue }],
                updateStatuses: false,
              },
            })
              .unwrap()
              .catch(handleError);
          }
        }
      }
    },
    [snackbar, updateProjectVariableValues]
  );

  const matrixColumnSpecs = useMemo<MatrixColumnSpec[]>(() => {
    const baseNonVariableColumns: MatrixColumnSpec[] = [
      {
        accessorKey: 'acceleratorDetails_dealName',
        header: strings.DEAL_NAME,
        size: 200,
        id: 'projectName',
        enableEditing: false,
        enableHiding: false,
        render: (value, row) => (
          <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', row.id.toString())}>
            {value as string}
          </Link>
        ),
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
        render: (value) => (value !== undefined ? <FormattedNumber value={value as number} /> : null),
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

    const variableColumns: MatrixColumnSpec[] = uniqueVariableIds.map((variableId) => {
      const selectedVariable = allVariables?.find((va) => va.stableId === variableId);
      const correspondingVariable = projects?.flatMap((p) => p.variables || []).find((v) => v.stableId === variableId);
      const correspondingValue = correspondingVariable?.values?.[0];
      let renderEditor: MatrixColumnSpec['renderEditor'];
      let render: MatrixColumnSpec['render'];
      let filterFn: MatrixColumnSpec['filterFn'] = 'fuzzy';
      let filterVariant: MatrixColumnSpec['filterVariant'] = 'text';
      let filterSelectOptions: string[] = [];

      if (correspondingValue?.dateValue) {
        filterVariant = 'date-range';
        filterFn = 'between';
        renderEditor = (props) => <DateEditor {...props} />;
        render = (value) => (value instanceof Date ? <>{value.toLocaleDateString()}</> : null);
      }

      if (selectedVariable && 'options' in selectedVariable) {
        render = undefined;
        filterVariant = 'multi-select';
        const options: SelectOption[] =
          selectedVariable.options?.map((option) => ({
            label: option.renderedText ?? option.name,
            value: option.id.toString(),
          })) ?? [];

        filterSelectOptions = options.map((opt) => opt.label || '');
        filterFn = 'arrIncludesSome';

        if ('isMultiple' in selectedVariable && selectedVariable.isMultiple) {
          renderEditor = (props) => <MultiSelectEditor {...props} options={options} />;
        } else {
          renderEditor = (props) => <SelectEditor {...props} options={options} />;
        }
      }
      if (correspondingValue?.['numberValue(raw)'] !== undefined) {
        render = (value) => <FormattedNumber value={value as number} />;
        filterVariant = 'range';
        filterFn = 'between';
        renderEditor = (props) => <TextEditor {...props} type='number' />;
      }
      if (correspondingValue?.linkUrl) {
        render = undefined;
        renderEditor = (props) => <TextEditor {...props} type='url' />;
      }
      return {
        id: variableId,
        header: variableNameMap.get(variableId) || variableId,
        size: 150,
        enableEditing: isAllowedEditMatrixView,
        renderEditor,
        onSave: (row, newValue) => {
          const variable = row.variables?.find((_variable) => _variable.stableId === variableId);
          const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
          if (variableToProcess) {
            onSaveHandler(row.id, newValue, variableToProcess);
          }
        },
        filterVariant,
        filterSelectOptions,
        filterFn,
        accessorFn: (row) => {
          const variable = row.variables?.find((_variable) => _variable.stableId === variableId);
          const variableValue = variable?.values?.[0];

          if (!variableValue || variable?.isList?.toString() === 'true') {
            return '';
          }

          if (variableValue['numberValue(raw)']) {
            return variableValue['numberValue(raw)'];
          }
          if (variableValue.textValue) {
            return variableValue.textValue;
          }
          if (variableValue.dateValue) {
            return new Date(variableValue.dateValue);
          }
          if (variableValue.options) {
            return variableValue.options.map((option) => option.name).join(', ');
          }
          if (variableValue.linkUrl) {
            return variableValue.linkUrl;
          }

          return '';
        },
        render,
      };
    });

    return [...baseNonVariableColumns, ...variableColumns];
  }, [
    strings,
    allVariables,
    countries,
    isAllowedEditMatrixView,
    onSaveHandler,
    projects,
    uniqueVariableIds,
    variableNameMap,
  ]);

  const matrixColumns = useMemo(() => matrixColumnSpecs.map(toColumnV1), [matrixColumnSpecs]);

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
        'variables.values.numberValue(raw)',
        'variables.values.linkUrl',
        'variables.values.dateValue',
        'variables.values.options.name',
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
  }, [reloadTable, updateVariableValuesResult.isSuccess]);

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
      <Box>
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
      </Box>
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
      renderColumnActionsMenuItems: ({ internalColumnMenuItems }) => {
        // remove the last element (show all columns)
        const columnMenuItemsCopy = [...internalColumnMenuItems];
        void columnMenuItemsCopy.pop();
        return columnMenuItemsCopy;
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <Grid container style={{ maxWidth: '50%' }} spacing={1}>
          <Grid>
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
          </Grid>
        </Grid>
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
