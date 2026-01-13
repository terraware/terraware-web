import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Close as CloseIcon,
  DragIndicator as DragIcon,
  PushPin as PinIcon,
  Search as SearchIcon,
  PushPinOutlined as UnpinIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import { MRT_TableInstance } from 'material-react-table';

import { useLocalization } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { ProjectsWithVariablesSearchResult } from 'src/redux/features/matrixView/matrixViewThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { VariableUnion } from 'src/types/documentProducer/Variable';

type ColumnsModalProps = {
  onClose: () => void;
  onSave: (columns: string[]) => void;
  allVariables: VariableUnion[];
  table: MRT_TableInstance<ProjectsWithVariablesSearchResult>;
};

export function baseColumns() {
  return [
    { id: 'projectName', name: strings.DEAL_NAME },
    { id: 'cohortPhase', name: strings.PHASE },
    { id: 'eligibleLand', name: strings.ELIGIBLE_LAND },
    { id: 'countryName', name: strings.COUNTRY },
    { id: 'projectLead', name: strings.PROJECT_LEAD },
  ];
}

export default function ColumnsModal(props: ColumnsModalProps): JSX.Element {
  const { onClose, onSave, allVariables, table } = props;

  const [activeTab, setActiveTab] = useState(0);
  const [selectedDeliverables, setSelectedDeliverables] = useState(new Set());
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const { activeLocale } = useLocalization();
  const deliverablesResult = useAppSelector(selectDeliverablesSearchRequest(requestId));
  const [deliverables, setDeliverables] = useState<ListDeliverablesElementWithOverdue[]>();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const theme = useTheme();
  const baseColumnsIds = baseColumns().map((c) => c.id);

  useEffect(() => {
    const request = dispatch(
      requestListDeliverables({
        locale: activeLocale,
      })
    );
    setRequestId(request.requestId);
  }, [dispatch, activeLocale]);

  useEffect(() => {
    if (deliverablesResult?.status === 'success') {
      setDeliverables(deliverablesResult.data);
    }
  }, [deliverablesResult]);
  const filteredVariables = useMemo(() => {
    if (!searchTerm) {
      return allVariables;
    }
    return allVariables.filter((variable) => variable.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allVariables, searchTerm]);

  useEffect(() => {
    const columnOrder = table.getState().columnOrder;
    const visibleColumnIds = table.getVisibleFlatColumns().map((col) => col.id);

    if (columnOrder.length > 0) {
      const orderedVisibleColumns = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
      setSelectedColumns(orderedVisibleColumns);
    } else {
      setSelectedColumns(visibleColumnIds);
    }
  }, [table]);

  // Get current pinning state from the table
  const columnPinning = table?.getState()?.columnPinning || { left: [], right: [] };
  const pinnedColumns = useMemo(
    () => [...(columnPinning.left || []), ...(columnPinning.right || [])],
    [columnPinning.left, columnPinning.right]
  );

  // Group variables by deliverable
  const deliverableGroups = useMemo(() => {
    const groups: Record<
      number,
      {
        id: number;
        name: string;
        variables: typeof allVariables;
      }
    > = {};

    allVariables.forEach((variable) => {
      const deliverableName = deliverables?.find((del) => del.id === variable.deliverableId)?.name || '';
      const deliverableId = variable.deliverableId || 0;

      if (!groups[deliverableId]) {
        groups[deliverableId] = {
          id: deliverableId,
          name: deliverableName,
          variables: [],
        };
      }
      groups[deliverableId].variables.push(variable);
    });

    return Object.values(groups);
  }, [allVariables, deliverables]);

  React.useEffect(() => {
    const complianceDeliverable = deliverableGroups.find((d) => d.name.toLowerCase().includes('compliance'));

    if (complianceDeliverable) {
      setSelectedDeliverables(new Set([complianceDeliverable.id]));
      setSelectedColumns(complianceDeliverable.variables.map((v) => v.stableId));
    }
  }, [deliverableGroups]);

  const handleDeliverableToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const deliverableId = parseInt(event.target.value, 10);
      const newSelected = new Set(selectedDeliverables);
      const deliverable = deliverableGroups.find((d) => d.id === deliverableId);

      if (!deliverable) {
        return;
      }

      if (checked) {
        newSelected.add(deliverableId);
        // Add all variables from this deliverable
        const variableIds = deliverable.variables?.map((v) => v.stableId) || [];
        setSelectedColumns((prev) => {
          const currentColumns = prev || [];
          const newVariableIds = variableIds.filter((vid) => !currentColumns.includes(vid));
          return [...currentColumns, ...newVariableIds];
        });
      } else {
        newSelected.delete(deliverableId);
        // Remove all variables from this deliverable
        const variableIds = deliverable.variables?.map((v) => v.stableId) || [];
        setSelectedColumns((prev) => prev?.filter((col) => !variableIds.includes(col)) || []);
      }

      setSelectedDeliverables(newSelected);
    },
    [deliverableGroups, selectedDeliverables]
  );

  const handleVariableToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const variableStableId = event.target.value;
    setSelectedColumns((prev) => {
      const currentColumns = prev || [];
      if (checked) {
        return currentColumns.includes(variableStableId) ? currentColumns : [...currentColumns, variableStableId];
      } else {
        return currentColumns.filter((col) => col !== variableStableId);
      }
    });
  }, []);

  const removeColumn = useCallback(
    (variableStableId: string) => {
      setSelectedColumns((prev) => prev.filter((col) => col !== variableStableId));

      // Update deliverable selection if needed
      const updatedColumns = selectedColumns.filter((col) => col !== variableStableId);
      const newSelectedDeliverables = new Set();

      deliverableGroups.forEach((deliverable) => {
        const hasVariables = deliverable.variables.some((v) => updatedColumns.includes(v.stableId));
        if (hasVariables) {
          newSelectedDeliverables.add(deliverable.id);
        }
      });

      setSelectedDeliverables(newSelectedDeliverables);
    },
    [deliverableGroups, selectedColumns]
  );

  const handleHideAll = useCallback(() => {
    setSelectedColumns([]);
    setSelectedDeliverables(new Set());
  }, []);

  const handleResetOrder = useCallback(() => {
    // Reset to original order based on variable positions
    const orderedColumns = allVariables
      .filter((v) => selectedColumns?.includes(v.stableId))
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map((v) => v.stableId);
    setSelectedColumns([...baseColumnsIds, ...orderedColumns]);
  }, [allVariables, baseColumnsIds, selectedColumns]);

  const handleUnpinAll = useCallback(() => {
    // Unpin all columns using Material React Table's functionality
    table?.setColumnPinning({ left: [], right: [] });
  }, [table]);

  const handlePinColumn = useCallback(
    (columnId: string, position: 'left' | 'right' = 'left') => {
      const currentPinning = table?.getState()?.columnPinning || { left: [], right: [] };

      const newPinning = {
        left:
          position === 'left'
            ? [...(currentPinning.left || []), columnId].filter((id, index, arr) => arr.indexOf(id) === index)
            : (currentPinning.left || []).filter((id) => id !== columnId),
        right:
          position === 'right'
            ? [...(currentPinning.right || []), columnId].filter((id, index, arr) => arr.indexOf(id) === index)
            : (currentPinning.right || []).filter((id) => id !== columnId),
      };

      table?.setColumnPinning(newPinning);
    },
    [table]
  );

  const handleUnpinColumn = useCallback(
    (columnId: string) => {
      const currentPinning = table?.getState()?.columnPinning || { left: [], right: [] };

      const newPinning = {
        left: (currentPinning.left || []).filter((id) => id !== columnId.toString()),
        right: (currentPinning.right || []).filter((id) => id !== columnId.toString()),
      };

      table?.setColumnPinning(newPinning);
    },
    [table]
  );

  const isColumnPinned = useCallback(
    (columnName: string) => {
      // Find the column by name and check if it's pinned
      const column = table
        ?.getVisibleFlatColumns()
        ?.find(
          (col) =>
            'accessorKey' in col.columnDef &&
            (col.columnDef?.header === columnName || col.columnDef?.accessorKey === columnName || col.id === columnName)
        );

      return column ? pinnedColumns.includes(column.id) : false;
    },
    [pinnedColumns, table]
  );

  const getColumnId = useCallback(
    (columnName: string) => {
      // Get the column ID for pinning operations
      const column = table
        ?.getVisibleFlatColumns()
        ?.find(
          (col) =>
            col.columnDef &&
            'accessorKey' in col.columnDef &&
            (col.columnDef?.header === columnName || col.columnDef?.accessorKey === columnName || col.id === columnName)
        );

      return column?.id || columnName;
    },
    [table]
  );

  const handleResetColumns = useCallback(() => {
    setSelectedDeliverables(new Set());
    setSelectedColumns(baseColumnsIds);
  }, [baseColumnsIds]);

  const moveColumn = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) {
        return;
      }

      const newColumns = [...selectedColumns];
      const [removed] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, removed);
      setSelectedColumns(newColumns);
    },
    [selectedColumns]
  );

  const handleDragStart = useCallback((e: React.DragEvent<HTMLLIElement>) => {
    const index = parseInt(e.currentTarget.dataset.index || '0', 10);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';

    e.dataTransfer.setData('text/plain', index.toString());

    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedIndex(null);

    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLIElement>) => {
      e.preventDefault();

      const dropIndex = parseInt(e.currentTarget.dataset.index || '0', 10);
      const dragIndex = e.dataTransfer.getData('text/plain');

      if (Number(dragIndex) !== dropIndex && draggedIndex !== null) {
        moveColumn(Number(dragIndex), dropIndex);
      }

      setDraggedIndex(null);
    },
    [draggedIndex, moveColumn]
  );

  const onSaveHandler = useCallback(() => {
    onSave(selectedColumns);
    onClose();
  }, [onClose, onSave, selectedColumns]);

  const onChangeTab = useCallback((_event: any, newValue: React.SetStateAction<number>) => {
    setActiveTab(newValue);
  }, []);

  const onSearch = useCallback(
    (e: { target: { value: React.SetStateAction<string> } }) => setSearchTerm(e.target.value),
    []
  );

  const pinUnpinHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const columnName = event.currentTarget.dataset.columnName;
      if (!columnName) {
        return;
      }
      const columnId = getColumnId(columnName);
      if (isColumnPinned(columnName)) {
        handleUnpinColumn(columnId);
      } else {
        handlePinColumn(columnId, 'left');
      }
    },
    [getColumnId, handlePinColumn, handleUnpinColumn, isColumnPinned]
  );

  const removeColumnHandler = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const variableStableId = event.currentTarget.dataset.variableStableId;
      if (!variableStableId) {
        return;
      }
      removeColumn(variableStableId);
    },
    [removeColumn]
  );

  const listElement = (id: string, label?: string) => (
    <ListItem
      key={id}
      sx={{
        px: 0,
        py: 0.5,
        '&:hover': { backgroundColor: 'action.hover' },
        borderRadius: 1,
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={selectedColumns.includes(id)}
            onChange={handleVariableToggle}
            value={id}
            size='small'
            disabled={id === 'projectName'}
          />
        }
        label={
          <Box>
            <Typography variant='body2'>{label || id}</Typography>
          </Box>
        }
        sx={{ width: '100%', m: 0 }}
      />
    </ListItem>
  );

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.MANAGE_COLUMNS}
      size='xx-large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={onSaveHandler} label={strings.APPLY} key='button-2' />,
      ]}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={onChangeTab}
          sx={{
            '.MuiTab-root': {
              textTransform: 'capitalize',
              fontSize: '16px',
              padding: theme.spacing(1, 2),
              fontWeight: 600,

              '&.Mui-selected': {
                color: theme.palette.TwClrBaseGreen500,
              },
            },
            '.MuiTabs-indicator': {
              left: '0px',
              background: theme.palette.TwClrBaseGreen500,
              height: '4px',
            },
          }}
        >
          <Tab label={strings.VARIABLES} />
          <Tab label={strings.DELIVERABLES} />
        </Tabs>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button size='small' priority='ghost' onClick={handleHideAll} label={strings.HIDE_ALL} />
          <Button size='small' priority='ghost' onClick={handleResetOrder} label={strings.RESET_ORDER} />
          <Button size='small' priority='ghost' onClick={handleUnpinAll} label={strings.UNPIN_ALL} />
          <Button size='small' priority='ghost' onClick={handleResetColumns} label={strings.RESET_COLUMNS} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', height: '58vh' }}>
        {/* Left Panel - Variables or Deliverables based on active tab */}
        <Box
          sx={{
            width: '50%',
            borderRight: 1,
            borderColor: 'divider',
            p: 3,
            overflowY: 'auto',
          }}
        >
          {activeTab === 0 ? (
            // Variables Tab
            <>
              <Typography variant='subtitle1' gutterBottom>
                {strings.VARIABLES} ({filteredVariables.length})
              </Typography>

              <TextField
                size='small'
                placeholder='Search Variables'
                value={searchTerm}
                onChange={onSearch}
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <List dense>
                <>
                  {baseColumns().map((col) => listElement(col.id, col.name))}
                  {filteredVariables.map((variable) => listElement(variable.stableId, variable.name))}
                </>
              </List>
            </>
          ) : (
            // Deliverables Tab
            <>
              <Typography variant='subtitle1' gutterBottom>
                {strings.DELIVERABLES} ({deliverableGroups.length})
              </Typography>
              <List dense>
                {deliverableGroups.map((deliverable) => (
                  <ListItem
                    key={deliverable.id}
                    sx={{
                      px: 0,
                      py: 0.5,
                      '&:hover': { backgroundColor: 'action.hover' },
                      borderRadius: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedDeliverables.has(deliverable.id)}
                          onChange={handleDeliverableToggle}
                          size='small'
                          value={deliverable.id}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant='body2'>{deliverable.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ({deliverable.variables.length} {strings.VARIABLES})
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>

        {/* Right Panel - Selected Columns */}
        <Box sx={{ width: '50%', p: 3, overflowY: 'auto' }}>
          <Typography variant='subtitle1' gutterBottom>
            {strings.SELECTED_COLUMNS} ({selectedColumns.length})
          </Typography>

          {selectedColumns.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                {strings.NO_COLUMNS_SELECTED}
              </Typography>
            </Box>
          ) : (
            <List dense>
              {selectedColumns.map((variableStableId, index) => {
                const columnName =
                  allVariables.find((v) => v.stableId === variableStableId)?.name ||
                  baseColumns().find((c) => c.id === variableStableId)?.name ||
                  variableStableId;
                return (
                  <ListItem
                    key={columnName}
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-index={index}
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 0.5,
                      backgroundColor: draggedIndex === index ? 'action.selected' : 'grey.50',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: draggedIndex === index ? 'action.selected' : 'grey.100' },
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'move',
                      transition: 'background-color 0.2s ease',
                      border: draggedIndex === index ? '2px dashed' : '2px solid transparent',
                      borderColor: draggedIndex === index ? 'primary.main' : 'transparent',
                    }}
                  >
                    <DragIcon
                      sx={{
                        fontSize: 16,
                        color: 'grey.500',
                        mr: 1,
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                      }}
                    />
                    <Typography variant='body2' sx={{ flex: 1 }}>
                      {columnName}
                    </Typography>

                    {/* Pin/Unpin Button */}
                    <Tooltip title={isColumnPinned(columnName) ? 'Unpin column' : 'Pin to left'}>
                      <IconButton size='small' onClick={pinUnpinHandler} sx={{ ml: 0.5 }} data-column-name={columnName}>
                        {isColumnPinned(columnName) ? (
                          <PinIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        ) : (
                          <UnpinIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    </Tooltip>

                    {/* Remove Button */}
                    <Tooltip title={strings.REMOVE_COLUMN}>
                      <IconButton
                        size='small'
                        onClick={removeColumnHandler}
                        sx={{ ml: 0.5 }}
                        data-variable-stable-id={variableStableId}
                        disabled={columnName === strings.DEAL_NAME}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>
      </Box>
    </DialogBox>
  );
}
