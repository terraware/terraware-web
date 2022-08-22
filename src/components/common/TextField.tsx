import { TextField as MUITextField } from '@mui/material';
import React, { KeyboardEventHandler } from 'react';
import { makeStyles } from '@mui/styles';
import { isWhitespaces } from 'src/utils/text';

const useStyles = makeStyles(() => ({
  adornedEnd: {
    paddingRight: 0,
  },
}));

export interface Props {
  id: string;
  value: unknown | null;
  onChange: (id: string, value: unknown) => void;
  type?: React.InputHTMLAttributes<unknown>['type'];
  label: React.ReactNode;
  disabled?: boolean;
  endAdornment?: JSX.Element;
  onKeyPress?: KeyboardEventHandler;
  min?: number;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
}

export default function TextField(props: Props): JSX.Element {
  const classes = useStyles();

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const textValue = event.target.value;
    if (isWhitespaces(textValue)) {
      return;
    }
    props.onChange(props.id, textValue);
  };

  return (
    <MUITextField
      id={props.id}
      value={props.value ?? ''}
      onChange={onChange}
      type={props.type}
      label={props.label}
      variant='outlined'
      size='small'
      fullWidth={true}
      disabled={props.disabled}
      onKeyPress={props.onKeyPress}
      InputProps={{
        endAdornment: props.endAdornment,
        classes: {
          adornedEnd: classes.adornedEnd,
        },
        inputProps: {
          min: props.min,
        },
      }}
      error={props.error}
      helperText={props.helperText}
      required={props.required}
      autoComplete={props.autocomplete}
    />
  );
}
