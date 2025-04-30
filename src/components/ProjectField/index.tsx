import React, { isValidElement, useMemo } from 'react';

import { Typography } from '@mui/material';
import { Props } from '@terraware/web-components/components/Textfield/Textfield';

type DisplayFieldValue = string | number | null | undefined | JSX.Element | false;

export interface ProjectFieldProps {
  height?: string;
  label?: string;
  md?: number;
  value?: DisplayFieldValue;
  units?: DisplayFieldValue;
  tooltip?: string;
  rightBorder?: boolean;
  user?: string;
  date?: string;
  backgroundColor?: string;
}

export type ProjectIdFieldProps = ProjectFieldProps & {
  id: string;
};

export type EditFieldValue = string | number | undefined;

export interface ProjectFieldEditProps {
  height?: string;
  id: string;
  label: string;
  onChange: (id: string, value: string) => void;
  md?: number;
  // Defaults to 'text'
  type?: Props['type'];
  value?: EditFieldValue;
}

export const renderFieldValue = (value: DisplayFieldValue, units?: DisplayFieldValue): JSX.Element => {
  if (isValidElement(value)) {
    return value;
  }

  const hasValue = useMemo(() => !([undefined, null] as DisplayFieldValue[]).includes(value), [value]);

  return (
    <Typography fontSize='24px' fontWeight={600} lineHeight='32px' overflow='hidden' textOverflow='ellipsis'>
      {hasValue ? value : 'N/A'} {hasValue && units}
    </Typography>
  );
};
