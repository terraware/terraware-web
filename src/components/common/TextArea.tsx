import { TextField as MUITextField } from '@material-ui/core';
import React from 'react';
import { Props } from './TextField';

export default function TextArea(props: Props): JSX.Element {
  const onChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    props.onChange(props.id, event.target.value);
  };

  return (
    <MUITextField
      id={props.id}
      value={props.value ?? ''}
      onChange={onChange}
      type={props.type}
      label={props.label}
      multiline
      rows={4}
      variant='outlined'
      size='small'
      fullWidth={true}
      placeholder={props.placeholder}
    />
  );
}
