import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { ProjectFieldEditProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldTextAreaEdit = ({ id, label, onChange, value }: ProjectFieldEditProps) => {
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

  const styles: Record<string, Record<string, unknown>> = {
    textarea: {
      height: '120px',
    },
  };

  return (
    <GridEntryWrapper md={6} height={'144px'}>
      <Box paddingX={theme.spacing(2)}>
        <Textfield id={id} label={label} onChange={handleOnChange} value={localValue} styles={styles} type='textarea' />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldTextAreaEdit;
