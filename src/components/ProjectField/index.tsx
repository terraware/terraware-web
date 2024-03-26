import React, { isValidElement } from 'react';

import { Typography } from '@mui/material';

type DisplayFieldValue = string | number | null | undefined | JSX.Element | false;

export interface ProjectFieldProps {
  label?: string;
  link?: string;
  value?: DisplayFieldValue;
  rightBorder?: boolean;
  user?: string;
  date?: string;
}

type EditFieldValue = string | number | undefined;

export interface ProjectFieldEditProps {
  id: string;
  label: string;
  onChange: (id: string, value: string) => void;
  value?: EditFieldValue;
}

export const renderFieldValue = (value: DisplayFieldValue): JSX.Element => {
  if (isValidElement(value)) {
    return value;
  }

  return (
    <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
      {([undefined, null] as DisplayFieldValue[]).includes(value) ? 'N/A' : value}
    </Typography>
  );
};
