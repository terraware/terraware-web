import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Card, Checkbox, Chip, IconButton, MenuItem, TextField, Tooltip, useTheme } from '@mui/material';
import { BusySpinner, Icon } from '@terraware/web-components';
import { isArray } from 'lodash';
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
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
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
  const [updateVariableValuesRequestId, setUpdateVariableValuesRequestId] = useState<string>('');
  const updateVariableValuesRequest = useAppSelector(selectUpdateVariableValues(updateVariableValuesRequestId));
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const { isAllowed } = useUser();
  const isAllowedEditMatrixView = isAllowed('UPDATE_MATRIX_VIEW');
  const { countries } = useLocalization();

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
      const noTablePhotoVariables = allVariablesResponse.data?.filter((v) => v.type !== 'Table' && v.type !== 'Image');
      setAllVariables(noTablePhotoVariables);
    }
  }, [allVariablesResponse]);

  useEffect(() => {
    const request = dispatch(requestListAllVariables());
    setRequestVarsId(request.requestId);
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
      if (newValue) {
        setLoading(true);
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
          const varId = variable.id;
          if (varId) {
            const request = dispatch(
              requestUpdateVariableValues({
                operations: [{ operation: 'Append', variableId: Number(varId), value: newValue }],
                projectId,
                updateStatuses: false,
              })
            );
            setUpdateVariableValuesRequestId(request.requestId);
          }
        }
      }
    },
    [dispatch]
  );

  const columnsMRT = useMemo<MRT_ColumnDef<ProjectsWithVariablesSearchResult>[]>(() => {
    const baseNonVariableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = [
      {
        accessorKey: 'name',
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
            <Link to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId.toString())}>
              {projectName}
            </Link>
          );
        },
        muiTableBodyCellProps: ({
          cell,
        }: {
          cell: MRT_Cell<ProjectsWithVariablesSearchResult>;
          column: MRT_Column<ProjectsWithVariablesSearchResult>;
          row: MRT_Row<ProjectsWithVariablesSearchResult>;
          table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
        }) => {
          return {
            sx: {
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
            },
            title: cell.getValue()?.toString() || '',
          };
        },
      },
      {
        accessorKey: 'cohort_phase',
        header: strings.PHASE,
        size: 200,
        id: 'cohortPhase',
        enableEditing: false,
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
        accessorKey: 'internalUsers.user_firstName',
        header: strings.PROJECT_LEAD,
        size: 200,
        id: 'projectLead',
        enableEditing: false,
        accessorFn: (row) =>
          row.internalUsers && row.internalUsers.length > 0 && row.internalUsers[0].user_firstName
            ? `${row.internalUsers[0].user_firstName} ${row.internalUsers[0].user_lastName}`
            : '',
      },
    ];

    const variableColumns: MRT_ColumnDef<ProjectsWithVariablesSearchResult>[] = uniqueVariableIds.map((variableId) => {
      const selectedVariable = allVariables?.find((va) => va.stableId === variableId);
      const correspondingVariable = projects?.flatMap((p) => p.variables || []).find((v) => v.stableId === variableId);
      const correspondingValue = correspondingVariable?.values?.[0];
      let Edit: any;
      let Cell: any;
      let editVariant: 'text' | 'select' = 'text';
      let editSelectOptions: { label: string; value: string }[] | undefined;
      let filterFunction: 'between' | 'fuzzy' | 'arrIncludesSome' = 'fuzzy';
      let filterVariant: 'text' | 'multi-select' | 'range' | 'date-range' = 'text';

      let filterSelectOptions: string[] = [];

      if (correspondingValue?.dateValue) {
        filterVariant = 'date-range';
        filterFunction = 'between';
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
          const [value, setValue] = useState(cell.getValue<string>() || '');

          return (
            <DatePicker
              value={value ? new Date(value) : null}
              onDateChange={(date) => {
                const dateString = date ? date.toLocaleString() : '';
                setValue(dateString);
                table.setEditingCell(null);
                const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
                const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
                if (variableToProcess && date) {
                  onSaveHandler(row.original.id, date.toISODate() ?? '', variableToProcess);
                }
              }}
              aria-label={''}
              id={''}
              label={undefined}
            />
          );
        };
        Cell = ({ cell }: { cell: MRT_Cell<ProjectsWithVariablesSearchResult> }) => {
          if (cell.getValue() && cell.getValue() instanceof Date) {
            return cell.getValue<Date>().toLocaleDateString();
          }
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
                  {selections.length === 0 && <span style={{ color: '#999' }}>Select options...</span>}
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
          editVariant = 'select';
          editSelectOptions = getSelectOptions();
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
            const currentDisplayValue = cell.getValue<string>() || '';
            const options = getSelectOptions();

            const currentOption = options.find((opt) => opt.label === currentDisplayValue);
            const [selectedValue, setSelectedValue] = useState(currentOption?.value || '');

            const handleSave = () => {
              const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
              const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
              if (variableToProcess) {
                onSaveHandler(row.original.id, selectedValue, variableToProcess);
              }
              table.setEditingCell(null);
            };

            return (
              <TextField
                select
                value={selectedValue}
                onChange={(e) => {
                  setSelectedValue(e.target.value);
                }}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    table.setEditingCell(null);
                  }
                }}
                size='small'
                fullWidth
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          };
        }
      }
      if (correspondingValue?.['numberValue(raw)'] !== undefined) {
        // eslint-disable-next-line react/display-name
        Cell = ({ cell }: { cell: MRT_Cell<ProjectsWithVariablesSearchResult> }) => {
          return <FormattedNumber value={cell.getValue<number>()} />;
        };
        filterVariant = 'range';
        filterFunction = 'between';
        // Number input
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
          const [value, setValue] = useState<string>((cell.getValue<string>() || 0).toString());

          const handleSave = () => {
            table.setEditingCell(null);
            const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
            const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
            if (variableToProcess) {
              onSaveHandler(row.original.id, value, variableToProcess);
            }
          };

          return (
            <TextField
              type='number'
              value={value}
              onChange={(e) => {
                const numValue = e.target.value;
                setValue(numValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  table.setEditingCell(null);
                }
              }}
              onBlur={handleSave}
              size='small'
              fullWidth
            />
          );
        };
      }
      if (correspondingValue?.linkUrl) {
        Cell = undefined;
        // URL input
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
          const [value, setValue] = useState(cell.getValue<string>() || '');

          const handleSave = () => {
            table.setEditingCell(null);
            const variable = row.original.variables?.find((_variable) => _variable.stableId === variableId);
            const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
            if (variableToProcess) {
              onSaveHandler(row.original.id, value, variableToProcess);
            }
          };

          return (
            <TextField
              type='url'
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
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
        enableEditing: isAllowedEditMatrixView,
        Edit,
        filterVariant,
        filterSelectOptions,
        filterFn: filterFunction,
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
        Cell,
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
            const variableToProcess = variable ?? (correspondingVariable || selectedVariable);
            if (variableToProcess) {
              onSaveHandler(row.original.id, newValue, variableToProcess);
            }
          },
        }),
      };
    });

    return [...baseNonVariableColumns, ...variableColumns];
  }, [allVariables, countries, isAllowedEditMatrixView, onSaveHandler, projects, uniqueVariableIds, variableNameMap]);

  useEffect(() => {
    if (result?.status === 'success' && result?.data) {
      setProjects(result.data);
      setLoading(false);
    }
    if (result?.status === 'error') {
      setLoading(false);
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
    renderColumnActionsMenuItems: ({ internalColumnMenuItems }) => {
      // remove the last element (show all columns)
      const columnMenuItemsCopy = [...internalColumnMenuItems];
      void columnMenuItemsCopy.pop();
      return columnMenuItemsCopy;
    },
    editDisplayMode: 'cell',
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <Tooltip title={strings.MANAGE_COLUMNS}>
          <IconButton onClick={onColumnsClickHandler} id='manageColumns'>
            <Icon name='iconColumns' />
          </IconButton>
        </Tooltip>
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
    muiTableBodyRowProps: {
      sx: {
        '& td': {
          borderBottom: 'none',
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        '&[data-pinned="true"]:before': {
          backgroundColor: 'transparent !important',
        },
        '&[data-pinned="true"]': {
          filter: 'brightness(0.97)',
          boxShadow: '-4px 0 4px -4px rgba(97, 97, 97, 0.5) inset',
          zIndex: 1,
        },
      },
    },
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
  });

  const reloadTable = useCallback(() => {
    const visibleColumnIds = dataForMaterialReactTable
      .getVisibleFlatColumns()
      .filter((col) => !isNaN(Number(col.id)))
      .map((col) => col.id);

    const request = dispatch(
      requestGetProjectsWithVariables({
        fields: [
          'id',
          'name',
          'cohort_phase',
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
          field: 'name',
          direction: 'Ascending',
        },
        filters: [
          {
            prefix: 'variables',
            search: {
              field: 'stableId',
              operation: 'field',
              type: 'Exact',
              values: visibleColumnIds.length > 0 ? visibleColumnIds : [''],
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
      })
    );
    setRequestId(request.requestId);
    // eslint-disable-next-line
  }, [dispatch, dataForMaterialReactTable, dataForMaterialReactTable?.getState()?.columnVisibility]);

  useEffect(() => {
    if (updateVariableValuesRequest?.status === 'success') {
      reloadTable();
    }
    if (updateVariableValuesRequest?.status === 'error') {
      snackbar.toastError();
      setLoading(false);
    }
  }, [reloadTable, snackbar, updateVariableValuesRequest]);

  useEffect(() => {
    reloadTable();
  }, [dispatch, reloadTable]);

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
      const columnVisibility: Record<string, boolean> = {};

      baseColumns().forEach((col) => {
        if (col.id !== 'projectName') {
          columnVisibility[col.id] = false;
        }
      });

      uniqueVariableIds?.forEach((id) => {
        columnVisibility[id] = false;
      });

      columns.forEach((id) => {
        columnVisibility[id] = true;
      });

      // Get all hidden column IDs
      const hiddenColumnIds = Object.entries(columnVisibility)
        .filter(([, isVisible]) => !isVisible)
        .map(([columnId]) => columnId);

      // Remove filters for all hidden columns in one operation
      dataForMaterialReactTable.setColumnFilters((prev) =>
        prev.filter((filter) => !hiddenColumnIds.includes(filter.id))
      );

      dataForMaterialReactTable.setColumnVisibility((prev) => ({
        ...prev,
        ...columnVisibility,
      }));
      setColumnOrder(columns);

      // Save to localStorage
      localStorage.setItem('selectedColumns', JSON.stringify(columns));
      reloadTable();
    },
    [dataForMaterialReactTable, reloadTable, uniqueVariableIds]
  );

  return (
    <Page title={strings.MATRIX_VIEW}>
      {loading === true && <BusySpinner />}
      {showColumnsModal && allVariables && (
        <ColumnsModal
          onClose={onCloseColumnsModalHandler}
          onSave={onColumnsSelected}
          allVariables={allVariables}
          table={dataForMaterialReactTable}
        />
      )}
      <Card sx={{ borderRadius: '24px', padding: theme.spacing(3), boxShadow: 'none' }}>
        <MaterialReactTable table={dataForMaterialReactTable} />
      </Card>
    </Page>
  );
};

export default MatrixView;
