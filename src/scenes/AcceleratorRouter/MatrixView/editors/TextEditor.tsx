import React, { useState } from 'react';

import { TextField } from '@mui/material';

import strings from 'src/strings';

import { EditorProps } from './types';
import { useEditorSave } from './useEditorSave';

const TextEditor = ({
  value: initial,
  save,
  cancel,
  type = 'text',
}: EditorProps<string> & { type?: 'text' | 'number' | 'url' | 'email' }) => {
  const [value, setValue] = useState(initial);
  const { commit, cancelEdit, isSaving, error } = useEditorSave(save, cancel);
  return (
    <TextField
      autoFocus
      type={type}
      value={value}
      disabled={isSaving}
      error={error}
      helperText={error ? strings.GENERIC_ERROR : undefined}
      size='small'
      fullWidth
      placeholder={type === 'url' ? 'https://...' : undefined}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => void commit(value)}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          event.preventDefault();
          void commit(value);
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          cancelEdit();
        }
      }}
    />
  );
};

export default TextEditor;
