import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { ProjectFieldEditProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldTextfield = ({ height, id, label, onChange, type, value }: ProjectFieldEditProps) => {
  const theme = useTheme();

  const [localValue, setLocalValue] = useState<string | undefined>();

  const handleOnChange = useCallback(
    (_value: unknown) => {
      setLocalValue(`${_value}`);
      onChange(id, _value as string);
    },
    [id, onChange]
  );

  useEffect(() => {
    if (value) {
      setLocalValue(`${value}`);
    }
  }, [value]);

  return (
    <GridEntryWrapper height={height}>
      <Box paddingX={theme.spacing(2)}>
        <Textfield id={id} label={label} onChange={handleOnChange} value={localValue} type={type || 'text'} />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldTextfield;
