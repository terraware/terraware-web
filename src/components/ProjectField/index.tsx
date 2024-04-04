import React, { isValidElement } from 'react';

import { Typography } from '@mui/material';
import { Props } from '@terraware/web-components/components/Textfield/Textfield';

type DisplayFieldValue = string | number | null | undefined | JSX.Element | false;

export interface ProjectFieldProps {
  label?: string;
  value?: DisplayFieldValue;
  rightBorder?: boolean;
  user?: string;
  date?: string;
}

export type ProjectIdFieldProps = ProjectFieldProps & {
  id: string;
};

type EditFieldValue = string | number | undefined;

export interface ProjectFieldEditProps {
  id: string;
  label: string;
  onChange: (id: string, value: string) => void;
  // Defaults to 'text'
  type?: Props['type'];
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
