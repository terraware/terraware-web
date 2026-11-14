import React, { useId } from 'react';

import DatePicker from 'src/components/common/DatePicker';
import strings from 'src/strings';

import { EditorProps } from './types';
import { useEditorSave } from './useEditorSave';

const DateEditor = ({ value, save, cancel }: EditorProps<string>) => {
  const id = useId();
  const { commit, cancelEdit, isSaving, error } = useEditorSave(save, cancel);
  return (
    <div
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Escape') {
          cancelEdit();
        }
      }}
    >
      <DatePicker
        id={id}
        aria-label={''}
        label={undefined}
        value={value ? new Date(value) : null}
        disabled={isSaving}
        onDateChange={(date) => {
          if (date?.isValid) {
            void commit(date.toISODate() ?? '');
          }
        }}
      />
      {error && <span role='alert'>{strings.GENERIC_ERROR}</span>}
    </div>
  );
};

export default DateEditor;
