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

  const uniqueVariableIds = useMemo(() => Array.from(variableNameMap.keys()), [variableNameMap]);

  const columnsMRT = useMemo<MRT_ColumnDef<ProjectsWithVariablesSearchResult>[]>(() => {
    const baseColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = [
      {
        accessorKey: 'name',
        header: strings.PROJECT_NAME,
        size: 200,
      },
      {
        accessorKey: 'participant_cohort_phase',
        header: strings.PHASE,
        size: 200,
      },
      {
        accessorKey: 'acceleratorDetails_confirmedReforestableLand',
        header: strings.ELIGIBLE_LAND,
        size: 200,
      },
      {
        accessorKey: 'country_name',
        header: strings.COUNTRY,
        size: 200,
      },
      {
        accessorKey: 'acceleratorDetails_projectLead',
        header: strings.PROJECT_LEAD,
        size: 200,
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
