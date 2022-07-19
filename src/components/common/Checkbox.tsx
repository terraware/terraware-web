import { Checkbox as MUICheckbox, FormControlLabel } from '@mui/material';
import React, { SyntheticEvent } from 'react';

export interface Props {
  id: string;
  name: string;
  label: React.ReactNode;
  value?: boolean | null;
  onChange: (id: string, value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox(props: Props): JSX.Element {
  const onChange = (event: SyntheticEvent<Element, Event>, checked: boolean) => {
    props.onChange(props.id, checked);
  };

  return (
    <FormControlLabel
      id={props.id}
      onChange={onChange}
      label={props.label}
      disabled={props.disabled}
      control={<MUICheckbox id={'check-' + props.id} color='primary' checked={props.value ?? false} />}
      className={props.className}
    />
  );
}
