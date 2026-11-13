import React, { useRef, useState } from 'react';

import { Box, Checkbox, Chip, MenuItem, Popover } from '@mui/material';
import { Button } from '@terraware/web-components';

import strings from 'src/strings';

import { EditorProps, SelectOption } from './types';
import { useEditorSave } from './useEditorSave';

const MultiSelectEditor = ({ value, options, save, cancel }: EditorProps<string[]> & { options: SelectOption[] }) => {
  const [selections, setSelections] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);
  const { commit, cancelEdit, isSaving, error } = useEditorSave(save, cancel);
  const toggle = (id: string) =>
    setSelections((current) =>
      current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]
    );
  const open = () => {
    if (!isSaving) {
      setIsOpen(true);
    }
  };
  return (
    <>
      <Box
        ref={trigger}
        role='combobox'
        aria-expanded={isOpen}
        aria-label={strings.SELECT_OPTIONS}
        aria-disabled={isSaving}
        tabIndex={0}
        onClick={open}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          minHeight: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelEdit();
          }
          if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) {
            event.preventDefault();
            open();
          }
        }}
      >
        {selections.map((id) => (
          <Chip
            key={id}
            size='small'
            label={options.find((option) => option.value === id)?.label ?? id}
            disabled={isSaving}
            onDelete={(event) => {
              event.stopPropagation();
              toggle(id);
            }}
          />
        ))}
        {!selections.length && strings.SELECT_OPTIONS}
      </Box>
      <Popover
        open={isOpen}
        anchorEl={trigger.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={(_, reason) => {
          if (reason === 'escapeKeyDown') {
            cancelEdit();
          } else {
            void commit(selections);
          }
        }}
      >
        <Box
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === 'Escape') {
              cancelEdit();
            }
          }}
          sx={{ minWidth: 200, maxHeight: 300, overflowY: 'auto', p: 1 }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} disabled={isSaving} onClick={() => toggle(option.value)}>
              <Checkbox
                checked={selections.includes(option.value)}
                size='small'
                inputProps={{ 'aria-label': option.label }}
              />
              {option.label}
            </MenuItem>
          ))}
          {error && <Box role='alert'>{strings.GENERIC_ERROR}</Box>}
          <Button label={strings.DONE} size='small' disabled={isSaving} onClick={() => void commit(selections)} />
        </Box>
      </Popover>
    </>
  );
};

export default MultiSelectEditor;
