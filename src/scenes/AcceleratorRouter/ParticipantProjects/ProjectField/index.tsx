import React, { isValidElement } from 'react';

import { Typography } from '@mui/material';

type FieldValue = string | number | null | undefined | JSX.Element;

export interface ProjectFieldProps {
  label?: string;
  link?: string;
  value?: FieldValue;
  rightBorder?: boolean;
  user?: string;
  date?: string;
}

export const renderFieldValue = (value: FieldValue): JSX.Element => {
  if (isValidElement(value)) {
    return value;
  }

  return (
    <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
      {([undefined, null] as FieldValue[]).includes(value) ? 'N/A' : value}
    </Typography>
  );
};
