import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton } from '@mui/material';
import { Icon } from '@terraware/web-components';
import {
  MRT_ColumnDef,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import Page from 'src/components/Page';
import { selectAllVariables } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListAllVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { selectProjectsWithVariables } from 'src/redux/features/matrixView/matrixViewSelectors';
import {
  ProjectsWithVariablesSearchResult,
  requestGetProjectsWithVariables,
} from 'src/redux/features/matrixView/matrixViewThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import ColumnsModal from './ColumnsModal';

const STORAGE_KEYS = {
  SELECTED_COLUMNS: 'matrixView_selectedColumns',
  COLUMN_ORDER: 'matrixView_columnOrder',
  COLUMN_VISIBILITY: 'matrixView_columnVisibility',
  COLUMN_FILTERS: 'matrixView_columnFilters',
  SORTING: 'matrixView_sorting',
  COLUMN_PINNING: 'matrixView_columnPinning',
};

const MatrixView = () => {
  const [requestId, setRequestId] = useState<string>('');
  const [requestVarsId, setRequestVarsId] = useState<string>('');
  const result = useAppSelector(selectProjectsWithVariables(requestId));
  const allVariablesResponse = useAppSelector(selectAllVariables(requestVarsId));
  const [projects, setProjects] = useState<ProjectsWithVariablesSearchResult[]>([]);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [allVariables, setAllVariables] = useState<VariableUnion[]>();
  const dispatch = useAppDispatch();

  const [columnFilters, setColumnFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLUMN_FILTERS) || '[]');
    } catch {
      return [];
    }
  });

  const [sorting, setSorting] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SORTING) || '[]');
    } catch {
      return [];
    }
  });

  const [columnPinning, setColumnPinning] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COLUMN_PINNING) || '{"left": ["projectName"], "right": []}');
    } catch {
      return { left: ['projectName'], right: [] };
    }
  });

  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLUMN_ORDER) || '[]');
      return Array.isArray(savedOrder) ? savedOrder : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage when state changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.COLUMN_FILTERS, columnFilters);
  }, [columnFilters]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.SORTING, sorting);
  }, [sorting]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.COLUMN_PINNING, columnPinning);
  }, [columnPinning]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.COLUMN_ORDER, columnOrder);
  }, [columnOrder]);

  useEffect(() => {
    if (allVariablesResponse?.status === 'success') {
      setAllVariables(allVariablesResponse.data);
    }
  }, [allVariablesResponse]);

  useEffect(() => {
    const request = dispatch(requestListAllVariables());
    setRequestVarsId(request.requestId);
  }, [dispatch]);

  useEffect(() => {
    const request = dispatch(
      requestGetProjectsWithVariables({
        fields: [
          'id',
          'name',
          'participant_cohort_phase',
          'acceleratorDetails_confirmedReforestableLand',
          'country_name',
          'acceleratorDetails_projectLead',
          'variables.stableId',
          'variables.variableId',
          'variables.variableName',
          'variables.variableType',
          'variables.isList',
          'variables.isMultiSelect',
          'variables.values.textValue',
          'variables.values.numberValue',
          'variables.values.dateValue',
          'variables.values.options.name',
          'variables.values.options.position',
        ],
        sortOrder: {
          field: 'name',
          direction: 'Ascending',
        },
      })
    );
    setRequestId(request.requestId);
  }, [dispatch]);

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

  const variableNameMap = useMemo(() => {
    const map = new Map<string, string>();
    projects?.forEach((project) => {
      project.variables?.forEach((variable) => {
        if (!map.has(variable.stableId)) {
          map.set(variable.stableId, variable.variableName);
        }
      });
    });
    return map;
  }, [projects]);

  const columnsMRT = useMemo<MRT_ColumnDef<ProjectsWithVariablesSearchResult>[]>(() => {
    const baseColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = [
      {
        accessorKey: 'name',
        header: strings.PROJECT_NAME,
        size: 200,
        id: 'projectName',
      },
      {
        accessorKey: 'participant_cohort_phase',
        header: strings.PHASE,
        size: 200,
        id: 'participantCohortPhase',
      },
      {
        accessorKey: 'acceleratorDetails_confirmedReforestableLand',
        header: strings.ELIGIBLE_LAND,
        size: 200,
        id: 'elegibleLand',
      },
      {
        accessorKey: 'country_name',
        header: strings.COUNTRY,
        size: 200,
        id: 'countryName',
      },
      {
        accessorKey: 'acceleratorDetails_projectLead',
        header: strings.PROJECT_LEAD,
        size: 200,
        id: 'projectLead',
      },
    ];

    const variableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = uniqueVariableIds.map((variableId) => {
      return {
        id: variableId,
        header: variableNameMap.get(variableId) || variableId,
        size: 150,
        accessorFn: (row) => {
          const variable = row.variables?.find((_variable) => _variable.stableId === variableId);
          const variableValue = variable?.values?.[0];

          if (!variableValue || variable?.isList) {
            return '';
          }

          if (variableValue.numberValue) {
            return variableValue.numberValue;
          }
          if (variableValue.textValue) {
            return variableValue.textValue;
          }
          if (variableValue.dateValue) {
            return variableValue.dateValue;
          }
          if (variableValue.options) {
            return variableValue.options.map((option) => option.name).join(', ');
          }
          if (variableValue.linkUrl) {
            return variableValue.linkUrl;
          }

          return '';
        },
      };
    });

    return [...baseColumns, ...variableColumns];
  }, [uniqueVariableIds, variableNameMap]);

  useEffect(() => {
    if (result?.status === 'success' && result?.data) {
      setProjects(result.data);
    }
  }, [result]);

  const onColumnsClickHandler = useCallback(() => {
    setShowColumnsModal(true);
  }, []);

  const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const dataForMaterialReactTable = useMaterialReactTable({
    columns: columnsMRT,
    data: projects || [],
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableEditing: true,
    editDisplayMode: 'cell',
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <IconButton onClick={onColumnsClickHandler}>
          <Icon name='iconColumns' />
        </IconButton>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Box>
    ),
    state: {
      columnFilters,
      sorting,
      columnPinning,
      columnOrder,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnPinningChange: setColumnPinning,
    onColumnOrderChange: setColumnOrder,
  });

  useEffect(() => {
    const loadSavedColumnState = () => {
      const savedColumns = localStorage.getItem('selectedColumns');
      if (savedColumns) {
        const parsedColumns = JSON.parse(savedColumns);
        if (Array.isArray(parsedColumns) && parsedColumns.length > 0) {
          // Apply saved column visibility
          const columnVisibility: Record<string, boolean> = {};

          // Hide all columns first
          uniqueVariableIds?.forEach((id) => {
            columnVisibility[id] = false;
          });

          // Show only saved columns
          parsedColumns.forEach((id) => {
            columnVisibility[id] = true;
          });

          dataForMaterialReactTable.setColumnVisibility(columnVisibility);
        }
      } else {
        if (uniqueVariableIds && dataForMaterialReactTable) {
          const columnVisibility = uniqueVariableIds.reduce((acc: Record<string, boolean>, id) => {
            acc[id] = false;
            return acc;
          }, {});

          dataForMaterialReactTable.setColumnVisibility(columnVisibility);
        }
      }
    };

    // Load after table and data are ready
    if (dataForMaterialReactTable && uniqueVariableIds) {
      loadSavedColumnState();
    }
  }, [dataForMaterialReactTable, uniqueVariableIds]);

  const onCloseColumnsModalHandler = useCallback(() => {
    setShowColumnsModal(false);
  }, []);

  const onColumnsSelected = useCallback(
    (columns: string[]) => {
      const columnVisibility = columns.reduce((acc: Record<string, boolean>, id) => {
        acc[id] = true;
        return acc;
      }, {});
      dataForMaterialReactTable.setColumnVisibility((prev) => ({
        ...prev,
        ...columnVisibility,
      }));
      setColumnOrder(columns);

      // Save to localStorage
      localStorage.setItem('selectedColumns', JSON.stringify(columns));
    },
    [dataForMaterialReactTable]
  );

  return (
    <Page title={strings.MATRIX_VIEW}>
      {showColumnsModal && allVariables && (
        <ColumnsModal
          onClose={onCloseColumnsModalHandler}
          onSave={onColumnsSelected}
          allVariables={allVariables}
          table={dataForMaterialReactTable}
        />
      )}
      <MaterialReactTable table={dataForMaterialReactTable} />
    </Page>
  );
};

export default MatrixView;
