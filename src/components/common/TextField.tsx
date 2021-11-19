import { createStyles, makeStyles, TextField as MUITextField } from '@material-ui/core';
import React, { KeyboardEventHandler } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    adornedEnd: {
      paddingRight: 0,
    },
  })
);

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
    props.onChange(props.id, event.target.value);
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
