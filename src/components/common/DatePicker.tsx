import { DatePicker as DatePickerMUI } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import 'moment/min/locales';
import React, { KeyboardEventHandler } from 'react';
import { TextField } from '@mui/material';

export interface Props {
  id: string;
  label: React.ReactNode;
  value?: string | null;
  onChange: (id: string, value?: string | unknown) => void;
  'aria-label': string;
  onKeyPress?: KeyboardEventHandler;
  maxDate?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  autocomplete?: string;
  autoOk?: boolean;
}

export default function DatePicker(props: Props): JSX.Element {
  React.useEffect(() => {
    moment.locale([window.navigator.language, 'en']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.navigator.language]);

  return (
    <DatePickerMUI
      value={props.value ?? null}
      onChange={(newValue) => {
        props.onChange(props.id, newValue);
      }}
      label={props.label}
      renderInput={(params) => <TextField {...params} id={props.id} />}
      disabled={props.disabled}
    />
  );
}
