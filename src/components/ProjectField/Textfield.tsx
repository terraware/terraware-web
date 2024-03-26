import React, { useCallback } from 'react';

import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { ProjectFieldEditProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldTextfield = ({ id, label, onChange, value }: ProjectFieldEditProps) => {
  const theme = useTheme();

  const handleOnChange = useCallback(
    (_value: unknown) => {
      onChange(id, _value as string);
    },
    [id, onChange]
  );

  return (
    <GridEntryWrapper>
      <Box paddingX={theme.spacing(2)}>
        <Textfield id={id} label={label} onChange={handleOnChange} value={value || ''} type='text' />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldTextfield;
