import React, { type JSX, KeyboardEventHandler } from 'react';

import { TextField as MUITextField, SxProps } from '@mui/material';

export interface Props {
  id: string;
  autoFocus?: boolean;
  value: unknown;
  onChange: (id: string, value: unknown) => void;
  type?: React.InputHTMLAttributes<unknown>['type'];
  label: React.ReactNode;
  disabled?: boolean;
  endAdornment?: JSX.Element;
  onKeyPress?: KeyboardEventHandler;
  onKeyDown?: KeyboardEventHandler;
  min?: number;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  sx?: SxProps;
}

export default function TextField(props: Props): JSX.Element {
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    props.onChange(props.id, event.target.value);
  };

  return (
    <MUITextField
      id={props.id}
      autoFocus={props.autoFocus}
      value={props.value ?? ''}
      onChange={onChange}
      type={props.type}
      label={props.label}
      variant='outlined'
      size='small'
      fullWidth={true}
      disabled={props.disabled}
      onKeyPress={props.onKeyPress}
      onKeyDown={props.onKeyDown}
      InputProps={{
        endAdornment: props.endAdornment,
        inputProps: {
          min: props.min,
        },
        sx: {
          paddingRight: 0,
        },
      }}
      error={props.error}
      helperText={props.helperText}
      required={props.required}
      autoComplete={props.autocomplete}
      sx={props.sx}
    />
  );
}
