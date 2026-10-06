import React, { type JSX, useId } from 'react';

import TextField from '@terraware/web-components/components/Textfield/Textfield';

type DetailFieldProps = {
  label: string;
  tooltipTitle?: string;
  value?: string;
};

const DetailField = ({ label, tooltipTitle, value }: DetailFieldProps): JSX.Element => {
  const id = useId();

  return <TextField display id={id} label={label} tooltipTitle={tooltipTitle} type='text' value={value || '—'} />;
};

export default DetailField;
