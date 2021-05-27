import { FormControlLabel, Radio } from '@material-ui/core';
import React from 'react';

export interface Props {
  id: string;
  name: string;
  label: React.ReactNode;
  value?: boolean | null;
  onChange: (id: string, value: boolean) => void;
}

export default function RadioButton(props: Props): JSX.Element {
  const onChange = (
    event: React.ChangeEvent<Record<string, never>>,
    checked: boolean
  ) => {
    props.onChange(props.id, checked);
  };

  return (
    <FormControlLabel
      id={props.id}
      onChange={onChange}
      label={props.label}
      control={
        <Radio
          id={'radio-' + props.id}
          color='primary'
          checked={props.value ?? false}
        />
      }
    />
  );
}
