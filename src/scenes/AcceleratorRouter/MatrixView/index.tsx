import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton } from '@mui/material';
import { Icon } from '@terraware/web-components';
import {
  MRT_ColumnDef,
  MRT_ToggleDensePaddingButton,
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

const MatrixView = () => {
  const [requestId, setRequestId] = useState<string>('');
  const [requestVarsId, setRequestVarsId] = useState<string>('');
  const result = useAppSelector(selectProjectsWithVariables(requestId));
  const allVariablesResponse = useAppSelector(selectAllVariables(requestVarsId));
  const [projects, setProjects] = useState<ProjectsWithVariablesSearchResult[]>([]);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [allVariables, setAllVariables] = useState<VariableUnion[]>();
  const dispatch = useAppDispatch();

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
          'acceleratorDetails.confirmedReforestableLand',
          'country_name',
          'acceleratorDetails.projectLead',
          'variableValues.stableId',
          'variableValues.variableId',
          'variableValues.variableName',
          'variableValues.variableType',
          'variableValues.textValue',
          'variableValues.numberValue',
          'variableValues.dateValue',
          'variableValues.isMultiSelect',
          'variableValues.options.name',
          'variableValues.options.position',
        ],
        sortOrder: {
          field: 'variableValues.stableId',
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
            return variable.stableId;
          }) || []
        )
      ),
    [allVariables]
  );

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
        accessorKey: 'acceleratorDetails.confirmedReforestableLand',
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
        accessorKey: 'acceleratorDetails.projectLead',
        header: strings.PROJECT_LEAD,
        size: 200,
        id: 'projectLead',
      },
    ];

    const variableNameMap = new Map<string, string>();
    projects?.forEach((project) => {
      project.variableValues?.forEach((variable) => {
        if (!variableNameMap.has(variable.stableId)) {
          variableNameMap.set(variable.stableId, variable.variableName);
        }
      });
    });

    const variableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = uniqueVariableIds.map((variableId) => {
      return {
        id: variableId,
        header: variableNameMap.get(variableId) || variableId,
        size: 150,
        accessorFn: (row) => {
          const variableValue = row.variableValues.find((variable) => variable.stableId === variableId);

          if (!variableValue) {
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

          return '';
        },
      };
    });

    return [...baseColumns, ...variableColumns];
    // return baseColumns;
  }, [projects, uniqueVariableIds]);

  useEffect(() => {
    if (result?.status === 'success' && result?.data) {
      setProjects(result.data);
    }
  }, [result]);

  const dataForMaterialReactTable = useMaterialReactTable({
    columns: columnsMRT,
    data: projects || [],
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableEditing: true,
    editDisplayMode: 'cell',
    initialState: {
      columnPinning: { left: ['name'] },
    },
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        {/* add custom button to print table  */}
        <IconButton
          onClick={() => {
            setShowColumnsModal(true);
          }}
        >
          <Icon name='iconColumns' />
        </IconButton>
        {/* along-side built-in buttons in whatever order you want them */}
        <MRT_ToggleDensePaddingButton table={table} />
      </Box>
    ),
  });

  // Update column visibility when uniqueVariableIds changes
  useEffect(() => {
    if (uniqueVariableIds && dataForMaterialReactTable) {
      const columnVisibility = uniqueVariableIds.reduce((acc: Record<string, boolean>, id) => {
        acc[id] = false;
        return acc;
      }, {});

      dataForMaterialReactTable.setColumnVisibility(columnVisibility);
    }
  }, [uniqueVariableIds, dataForMaterialReactTable]);

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
