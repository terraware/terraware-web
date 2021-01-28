import { TextField, TextFieldProps } from '@material-ui/core';
import React from 'react';

export default function TextArea(props: TextFieldProps): JSX.Element {
  return (
    <TextField
      multiline
      rows={4}
      variant='outlined'
      fullWidth={true}
      {...props}
    />
  );
}
