import React, { useCallback, useState } from 'react';

import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Portal,
  Select,
  SelectChangeEvent,
  TextField,
  useTheme,
} from '@mui/material';
import { BusySpinner, Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

import { MAX_VIEW_NAME_LENGTH, getViewNameError } from './viewName';

export const DEFAULT_VIEW = 'default';
const SAVE_VIEW = 'saveView';

export type ViewOption = {
  description?: string;
  label: string;
  value: string;
};

export const sortViewsByLabel = (views?: ViewOption[]) =>
  views && [...views].sort((a, b) => a.label.localeCompare(b.label));

export type CurrentViewSelectProps = {
  defaultViewLabel?: string | null;
  id?: string;
  modified?: boolean;
  myViews?: ViewOption[];
  onChange: (value: string) => void;
  onDeleteView?: (value: string) => void;
  onRenameView?: (value: string, name: string) => Promise<void> | void;
  onSave?: () => void;
  presetViews?: ViewOption[];
  selected: string;
  showSave?: boolean;
};

const CurrentViewSelect = ({
  defaultViewLabel: defaultViewLabelProp,
  id = 'current-view',
  modified,
  myViews,
  onChange,
  onDeleteView,
  onRenameView,
  onSave,
  presetViews,
  selected,
  showSave,
}: CurrentViewSelectProps) => {
  const { strings } = useLocalization();
  const defaultViewLabel = defaultViewLabelProp === undefined ? strings.DEFAULT : defaultViewLabelProp;
  const theme = useTheme();
  const labelId = `${id}-outlined-label`;
  const [open, setOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<string>();
  const [editingName, setEditingName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      if (showSave && event.target.value === SAVE_VIEW) {
        onSave?.();
      } else {
        onChange(event.target.value);
      }
    },
    [onChange, onSave, showSave]
  );

  const handleReselect = useCallback(() => onChange(selected), [onChange, selected]);
  const getReselectHandler = (value: string) => (value === selected ? handleReselect : undefined);

  const stopPropagation = useCallback((event: React.SyntheticEvent) => event.stopPropagation(), []);

  const cancelEditing = useCallback(() => setEditingValue(undefined), []);

  const handleOpen = useCallback(() => setOpen(true), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    cancelEditing();
  }, [cancelEditing]);

  const deleteView = useCallback(
    (value?: string) => {
      if (value) {
        handleClose();
        onDeleteView?.(value);
      }
    },
    [handleClose, onDeleteView]
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      deleteView(event.currentTarget.dataset.value);
    },
    [deleteView]
  );

  const renameError = editingValue
    ? getViewNameError(
        editingName,
        (myViews ?? []).filter((view) => view.value !== editingValue).map((view) => view.label)
      )
    : undefined;

  const confirmEditing = useCallback(async () => {
    if (isRenaming || !editingValue || renameError) {
      return;
    }
    const name = editingName.trim();
    if (name !== myViews?.find((view) => view.value === editingValue)?.label) {
      setIsRenaming(true);
      try {
        await onRenameView?.(editingValue, name);
      } catch {
        return;
      } finally {
        setIsRenaming(false);
      }
    }
    setEditingValue(undefined);
  }, [editingName, editingValue, isRenaming, myViews, onRenameView, renameError]);

  const startEditingView = useCallback(
    (value?: string) => {
      setEditingValue(value);
      setEditingName(myViews?.find((view) => view.value === value)?.label ?? '');
    },
    [myViews]
  );

  const startEditing = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      startEditingView(event.currentTarget.dataset.value);
    },
    [startEditingView]
  );

  const handleMyViewKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      const value = event.currentTarget.dataset.value;
      if (event.key === 'F2' && onRenameView) {
        event.preventDefault();
        startEditingView(value);
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && onDeleteView) {
        event.preventDefault();
        deleteView(value);
      }
    },
    [deleteView, onDeleteView, onRenameView, startEditingView]
  );

  const myViewKeyShortcuts =
    [...(onRenameView ? ['F2'] : []), ...(onDeleteView ? ['Delete', 'Backspace'] : [])].join(' ') || undefined;

  const handleCancelClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      cancelEditing();
    },
    [cancelEditing]
  );

  const handleConfirmClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      void confirmEditing();
    },
    [confirmEditing]
  );

  const handleEditingNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setEditingName(event.target.value),
    []
  );

  const handleEditingKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        void confirmEditing();
      } else if (event.key === 'Escape') {
        cancelEditing();
      }
    },
    [cancelEditing, confirmEditing]
  );

  const renderLabel = (label: string, value: string, isMyView = false, description?: string) => (
    <Box display='flex' alignItems='center' width='100%'>
      <Box flexGrow={1} minWidth={0}>
        <Box overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
          {label}
        </Box>
        {description && (
          <Box
            color={theme.palette.TwClrTxtSecondary}
            fontSize='12px'
            overflow='hidden'
            textOverflow='ellipsis'
            whiteSpace='nowrap'
          >
            {description}
          </Box>
        )}
      </Box>
      {value === selected && !modified && (
        <Icon
          name='checkmark'
          size='small'
          fillColor={theme.palette.TwClrIcnSuccess}
          style={{ stroke: theme.palette.TwClrIcnSuccess, strokeWidth: 1 }}
        />
      )}
      {isMyView && onRenameView && (
        <IconButton
          aria-label={strings.EDIT}
          data-value={value}
          id={`${id}-edit-${value}`}
          onClick={startEditing}
          size='small'
          sx={{ marginLeft: theme.spacing(1), padding: 0 }}
        >
          <Icon name='iconEdit' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      )}
      {isMyView && onDeleteView && (
        <IconButton
          aria-label={strings.DELETE}
          data-value={value}
          id={`${id}-delete-${value}`}
          onClick={handleDeleteClick}
          size='small'
          sx={{ marginLeft: theme.spacing(1), padding: 0 }}
        >
          <Icon name='iconTrashCan' size='small' fillColor={theme.palette.TwClrIcnSecondary} />
        </IconButton>
      )}
    </Box>
  );

  const renderEditingLabel = (value: string) => (
    <Box
      alignItems='center'
      display='flex'
      onClick={stopPropagation}
      onKeyDown={handleEditingKeyDown}
      onKeyUp={stopPropagation}
      padding={theme.spacing(0.5, 2)}
      width='100%'
    >
      <TextField
        autoFocus
        error={!!renameError}
        fullWidth
        helperText={renameError}
        id={`${id}-edit-name-${value}`}
        onChange={handleEditingNameChange}
        size='small'
        slotProps={{ htmlInput: { 'aria-label': strings.VIEW_NAME, maxLength: MAX_VIEW_NAME_LENGTH } }}
        value={editingName}
      />
      <IconButton
        aria-label={strings.SAVE}
        disabled={isRenaming || !!renameError}
        id={`${id}-edit-confirm`}
        onClick={handleConfirmClick}
        size='small'
        sx={{ marginLeft: theme.spacing(1) }}
      >
        <Icon
          name='checkmark'
          size='small'
          fillColor={theme.palette.TwClrIcnSuccess}
          style={{ stroke: theme.palette.TwClrIcnSuccess, strokeWidth: 1 }}
        />
      </IconButton>
      <IconButton aria-label={strings.CANCEL} id={`${id}-edit-cancel`} onClick={handleCancelClick} size='small'>
        <Icon name='close' size='small' fillColor={theme.palette.TwClrIcn} />
      </IconButton>
    </Box>
  );

  const renderValue = useCallback(
    (value: string) => {
      const label =
        [...(presetViews ?? []), ...(myViews ?? [])].find((view) => view.value === value)?.label ??
        defaultViewLabel ??
        '';
      return modified ? (
        <Box display='flex' minWidth={0}>
          <Box component='span' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
            {label}
          </Box>
          <Box component='i' flexShrink={0} marginLeft={theme.spacing(0.5)}>
            ({strings.MODIFIED})
          </Box>
        </Box>
      ) : (
        label
      );
    },
    [defaultViewLabel, modified, myViews, presetViews, strings, theme]
  );

  const renderSection = (header: string, views?: ViewOption[], showDivider = true, isMyViews = false) =>
    views?.length
      ? [
          ...(showDivider ? [<Divider key={`${header}-divider`} />] : []),
          <ListSubheader key={`${header}-header`} sx={{ fontSize: '12px', lineHeight: '30px' }}>
            {header.toUpperCase()}
          </ListSubheader>,
          ...views.map(({ description, label, value }) =>
            isMyViews && value === editingValue ? (
              <MenuItem key={value} id={value} value={value} disableRipple sx={{ padding: 0 }}>
                {renderEditingLabel(value)}
              </MenuItem>
            ) : (
              <MenuItem
                aria-keyshortcuts={isMyViews ? myViewKeyShortcuts : undefined}
                data-value={value}
                key={value}
                id={value}
                value={value}
                onClick={getReselectHandler(value)}
                onKeyDown={isMyViews ? handleMyViewKeyDown : undefined}
              >
                {renderLabel(label, value, isMyViews, description)}
              </MenuItem>
            )
          ),
        ]
      : [];

  return (
    <FormControl variant='outlined' size='small' sx={{ width: '100%' }}>
      <InputLabel id={labelId}>{strings.CURRENT_VIEW}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        label={strings.CURRENT_VIEW}
        onChange={handleChange}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        renderValue={renderValue}
        value={selected}
      >
        {defaultViewLabel !== null && (
          <MenuItem id={DEFAULT_VIEW} value={DEFAULT_VIEW} onClick={getReselectHandler(DEFAULT_VIEW)}>
            {renderLabel(defaultViewLabel, DEFAULT_VIEW)}
          </MenuItem>
        )}
        {renderSection(strings.PRESET_VIEWS, sortViewsByLabel(presetViews), defaultViewLabel !== null)}
        {renderSection(strings.MY_VIEWS, myViews, defaultViewLabel !== null || !!presetViews?.length, true)}
        {showSave && <Divider />}
        {showSave && (
          <MenuItem
            id={`${id}-save`}
            value={SAVE_VIEW}
            sx={{
              color: theme.palette.TwClrTxtSuccess,
              '&:hover, &.Mui-focusVisible': { backgroundColor: theme.palette.TwClrBgSuccessTertiary },
            }}
          >
            <Icon
              name='plus'
              size='small'
              fillColor={theme.palette.TwClrIcnSuccess}
              style={{ marginRight: theme.spacing(1), stroke: theme.palette.TwClrIcnSuccess, strokeWidth: 1 }}
            />
            {strings.SAVE_TABLE_NEW_VIEW}
          </MenuItem>
        )}
      </Select>
      {isRenaming && (
        <Portal>
          <BusySpinner withSkrim />
        </Portal>
      )}
    </FormControl>
  );
};

export default CurrentViewSelect;
