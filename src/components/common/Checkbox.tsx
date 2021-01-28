import {
  Checkbox as MUICheckbox,
  CheckboxProps,
  FormControlLabel,
} from '@material-ui/core';
import React from 'react';

interface Props extends CheckboxProps {
  label: string;
}

export default function Checkbox({ label, ...others }: Props): JSX.Element {
  return (
    <FormControlLabel
      label={label}
      control={<MUICheckbox color='primary' {...others} />}
    />
  );
}
