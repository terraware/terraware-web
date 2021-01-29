import { Checkbox as MUICheckbox, FormControlLabel } from '@material-ui/core';
import React from 'react';

interface Props {
  id: string;
  name: string;
  label: React.ReactNode;
  value: boolean;
  onChange: (id: string, value: boolean) => void;
}

export default function Checkbox(props: Props): JSX.Element {
  const onChange = (
    event: React.ChangeEvent<Record<string, never>>,
    checked: boolean
  ) => {
    props.onChange(props.id, checked);
  };

  return (
    <FormControlLabel
      id={props.id}
      value={props.value}
      onChange={onChange}
      label={props.label}
      control={<MUICheckbox color='primary' />}
    />
  );
}
