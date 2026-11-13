import React, { useState } from 'react';

import { MenuItem, TextField } from '@mui/material';

import strings from 'src/strings';

import { EditorProps, SelectOption } from './types';
import { useEditorSave } from './useEditorSave';

const SelectEditor = ({ value: initial, options, save, cancel }: EditorProps<string> & { options: SelectOption[] }) => {
  const [value, setValue] = useState(initial);
  const [isOpen, setIsOpen] = useState(false);
  const { commit, cancelEdit, isSaving, error } = useEditorSave(save, cancel);
  return (
    <TextField
      select
      autoFocus
      value={value}
      disabled={isSaving}
      error={error}
      helperText={error ? strings.GENERIC_ERROR : undefined}
      size='small'
      fullWidth
      SelectProps={{ onOpen: () => setIsOpen(true), onClose: () => setIsOpen(false) }}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => {
        if (!isOpen) {
          void commit(value);
        }
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (!isOpen && event.key === 'Enter') {
          event.preventDefault();
          void commit(value);
        }
        if (!isOpen && event.key === 'Escape') {
          event.preventDefault();
          cancelEdit();
        }
      }}
    >
      <MenuItem value=''>{strings.NONE}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default SelectEditor;
