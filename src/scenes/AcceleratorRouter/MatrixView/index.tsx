import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton, TextField } from '@mui/material';
import { Icon } from '@terraware/web-components';
import {
  MRT_Cell,
  MRT_Column,
  MRT_ColumnDef,
  MRT_Row,
  MRT_TableInstance,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

import Page from 'src/components/Page';
import DatePicker from 'src/components/common/DatePicker';
import { selectUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesSelector';
import { requestUpdateVariableValues } from 'src/redux/features/documentProducer/values/valuesThunks';
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
import {
  NewDateValuePayload,
  NewEmailValuePayload,
  NewLinkValuePayload,
  NewNumberValuePayload,
  NewSelectValuePayload,
  NewTextValuePayload,
  VariableValueDateValue,
  VariableValueEmailValue,
  VariableValueLinkValue,
  VariableValueNumberValue,
  VariableValueSelectValue,
  VariableValueTextValue,
} from 'src/types/documentProducer/VariableValue';

import ColumnsModal from './ColumnsModal';

const MatrixView = () => {
  const [requestId, setRequestId] = useState<string>('');
  const [requestVarsId, setRequestVarsId] = useState<string>('');
  const result = useAppSelector(selectProjectsWithVariables(requestId));
  const allVariablesResponse = useAppSelector(selectAllVariables(requestVarsId));
  const [projects, setProjects] = useState<ProjectsWithVariablesSearchResult[]>([]);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [allVariables, setAllVariables] = useState<VariableUnion[]>();
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (updateVariableValuesRequest?.status === 'success') {
      console.log('success saving!');
    }
  }, [updateVariableValuesRequest]);

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

  const onSaveHandler = useCallback(
    (
      projectId: number,
      updatedValue: string | number,
      variable: {
        stableId: string;
        variableId: string;
        variableName: string;
        variableType: string;
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
    ) => {
      const values = variable?.values;

      let newValue:
        | NewDateValuePayload
        | NewEmailValuePayload
        | NewTextValuePayload
        | NewNumberValuePayload
        | NewSelectValuePayload
        | NewLinkValuePayload
        | undefined;
      let valueIdToUpdate = -1;
      if (variable?.variableType === 'Text') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueTextValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Text', textValue: updatedValue.toString() };
      }
      if (variable?.variableType === 'Number') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueNumberValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Number', numberValue: Number(updatedValue) };
      }
      if (variable?.variableType === 'Select') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueSelectValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Select', optionIds: [Number(updatedValue)] };
      }
      if (variable?.variableType === 'Date') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueDateValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Date', dateValue: updatedValue.toString() };
      }
      if (variable?.variableType === 'Email') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueEmailValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Email', emailValue: updatedValue.toString() };
      }
      if (variable?.variableType === 'Link') {
        const firstValue = values && values.length > 0 ? (values[0] as unknown as VariableValueLinkValue) : undefined;
        valueIdToUpdate = firstValue?.id || -1;
        newValue = { type: 'Link', url: updatedValue.toString() };
      }
      if (newValue) {
        if (valueIdToUpdate.toString() !== '-1') {
          const request = dispatch(
            requestUpdateVariableValues({
              operations: [
                { operation: 'Update', valueId: valueIdToUpdate, value: newValue, existingValueId: valueIdToUpdate },
              ],
              projectId,
              updateStatuses: false,
            })
          );
          setUpdateVariableValuesRequestId(request.requestId);
        } else {
          const request = dispatch(
            requestUpdateVariableValues({
              operations: [{ operation: 'Append', variableId: Number(variable.variableId), value: newValue }],
              projectId,
              updateStatuses: false,
            })
          );
          setUpdateVariableValuesRequestId(request.requestId);
        }
      }
    },
    [dispatch]
  );

  const columnsMRT = useMemo<MRT_ColumnDef<ProjectsWithVariablesSearchResult>[]>(() => {
    const baseColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = [
      {
        accessorKey: 'name',
        header: strings.PROJECT_NAME,
        size: 200,
        id: 'projectName',
        enableEditing: false,
      },
      {
        accessorKey: 'participant_cohort_phase',
        header: strings.PHASE,
        size: 200,
        id: 'participantCohortPhase',
        enableEditing: false,
      },
      {
        accessorKey: 'acceleratorDetails_confirmedReforestableLand',
        header: strings.ELIGIBLE_LAND,
        size: 200,
        id: 'elegibleLand',
        enableEditing: false,
      },
      {
        accessorKey: 'country_name',
        header: strings.COUNTRY,
        size: 200,
        id: 'countryName',
        enableEditing: false,
      },
      {
        accessorKey: 'acceleratorDetails_projectLead',
        header: strings.PROJECT_LEAD,
        size: 200,
        id: 'projectLead',
        enableEditing: false,
      },
    ];

    const variableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = uniqueVariableIds.map((variableId) => {
      const selectedVariable = allVariables?.find((va) => va.stableId === variableId);
      const correspondingVariable = projects?.flatMap((p) => p.variables || []).find((v) => v.stableId === variableId);
      const correspondingValue = correspondingVariable?.values?.[0];
      let Edit: any;
      let editVariant: 'text' | 'select' = 'text';
      let editSelectOptions: { label: string; value: string }[] | undefined;

      if (correspondingValue?.dateValue) {
        // eslint-disable-next-line react/display-name, react/prop-types
        Edit = ({
          cell,
          table,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          column: MRT_Column<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
          table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
        }) => {
          const [value, setValue] = useState(cell.getValue<string>() || '');

          return (
            <DatePicker
              value={value ? new Date(value) : null}
              onChange={(date) => {
                const dateString = date ? date.toISOString().split('T')[0] : '';
                setValue(dateString);
                table.setEditingCell(null);
              }}
              aria-label={''}
              id={''}
              label={undefined} // Add your date picker props here
            />
          );
        };
      }

      if (correspondingValue?.options && correspondingValue?.options.length > 0) {
        const getSelectOptions = () => {
          if (selectedVariable && 'options' in selectedVariable && selectedVariable.options) {
            return selectedVariable.options.map((option) => ({
              label: option.renderedText ?? option.name,
              value: option.id.toString(),
            }));
          }
          return [];
        };

        editVariant = 'select';
        editSelectOptions = getSelectOptions();

        Edit = undefined;
      }

      if (correspondingValue?.numberValue !== undefined) {
        // Number input
        // eslint-disable-next-line react/display-name, react/prop-types
        Edit = ({
          cell,
          table,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          column: MRT_Column<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
          table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
        }) => {
          const [value, setValue] = useState(cell.getValue<number>() || 0);

          return (
            <TextField
              type='number'
              value={value}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={(e) => {
                const numValue = parseFloat(e.target.value) || 0;
                setValue(numValue);
              }}
              onBlur={() => {
                table.setEditingCell(null);
              }}
              size='small'
              fullWidth
            />
          );
        };
      }
      if (correspondingValue?.linkUrl) {
        // URL input
        // eslint-disable-next-line react/display-name, react/prop-types
        Edit = ({
          cell,
          table,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          column: MRT_Column<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
          table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
        }) => {
          const [value, setValue] = useState(cell.getValue<string>() || '');

          return (
            <TextField
              type='url'
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onBlur={() => {
                table.setEditingCell(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  table.setEditingCell(null);
                  // Handle save logic
                } else if (e.key === 'Escape') {
                  table.setEditingCell(null);
                }
              }}
              size='small'
              fullWidth
              placeholder='https://...'
            />
          );
        };
      }
      return {
        id: variableId,
        header: variableNameMap.get(variableId) || variableId,
        size: 150,
        editVariant,
        editSelectOptions,
        Edit,
        accessorFn: (row) => {
          const variable = row.variables?.find((_variable) => _variable.stableId === variableId);
          const variableValue = variable?.values?.[0];

          if (!variableValue || variable?.isList?.toString() === 'true') {
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
        // Handle saving the edited value
        muiEditTextFieldProps: ({
          row,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          column: MRT_Column<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
          table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
        }) => ({
          onBlur: (event) => {
            const newValue = event.target.value;
            const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
            const variableToProcess = variable ?? correspondingVariable;
            if (variableToProcess) {
              onSaveHandler(row.original.id, newValue, variableToProcess);
            }
          },
        }),
      };
    });

    return [...baseColumns, ...variableColumns];
  }, [allVariables, onSaveHandler, projects, uniqueVariableIds, variableNameMap]);

  useEffect(() => {
    if (result?.status === 'success' && result?.data) {
      setProjects(result.data);
    }
  }, [result]);

  const onColumnsClickHandler = useCallback(() => {
    setShowColumnsModal(true);
  }, []);

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
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <IconButton onClick={onColumnsClickHandler}>
          <Icon name='iconColumns' />
        </IconButton>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
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
      dataForMaterialReactTable.setColumnOrder(columns);
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
