import React, { useEffect, useMemo, useState } from 'react';

import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import Page from 'src/components/Page';
import { selectProjectsWithVariables } from 'src/redux/features/matrixView/matrixViewSelectors';
import {
  ProjectsWithVariablesSearchResult,
  requestGetProjectsWithVariables,
} from 'src/redux/features/matrixView/matrixViewThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

const MatrixView = () => {
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectProjectsWithVariables(requestId));
  const [projects, setProjects] = useState<ProjectsWithVariablesSearchResult[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const request = dispatch(
      requestGetProjectsWithVariables({
        fields: [
          'id',
          'name',
          'variableValues.stableId',
          'variableValues.variableId',
          'variableValues.variableValueId',
          'variableValues.variableType',
          'variableValues.textValue',
          'variableValues.numberValue',
          'variableValues.dateValue',
          'variableValues.isMultiSelect',
          'variableValues.options.id',
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
          projects?.flatMap((project) => {
            return project.variableValues?.map((variable) => variable.variableId) || [];
          }) || []
        )
      ),
    [projects]
  );

  const columnsMRT = useMemo<MRT_ColumnDef<ProjectsWithVariablesSearchResult>[]>(() => {
    const baseColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = [
      {
        accessorKey: 'name',
        header: 'Project Name',
        size: 200,
      },
    ];

    const variableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = uniqueVariableIds.map((variableId) => ({
      id: variableId,
      header: variableId,
      size: 150,
      accessorFn: (row) => {
        const variableValue = row.variableValues.find((variable) => variable.variableId === variableId);

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
    }));

    return [...baseColumns, ...variableColumns];
  }, [uniqueVariableIds]);

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
  });

  return (
    <Page title={strings.MATRIX_VIEW}>
      <MaterialReactTable table={dataForMaterialReactTable} />
    </Page>
  );
};

export default MatrixView;
