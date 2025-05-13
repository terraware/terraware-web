import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { ProjectFieldEditProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldTextAreaEdit = ({ id, label, onChange, value, height }: ProjectFieldEditProps) => {
  const theme = useTheme();

  const [localValue, setLocalValue] = useState<string | undefined>();

  const handleOnChange = useCallback(
    (_value: unknown) => {
      setLocalValue(`${_value as string}`);
      onChange(id, _value as string);
    },
    [id, onChange]
  );

  useEffect(() => {
    if (value) {
      setLocalValue(`${value}`);
    }
  }, [value]);

  const finalHeight = Number(height?.replace('px', '') || 144);

  const styles: Record<string, Record<string, unknown>> = {
    textarea: {
      height: `${finalHeight - 24}px`,
    },
  };

  return (
    <GridEntryWrapper md={6} height={height || `${finalHeight}px`}>
      <Box paddingX={theme.spacing(2)}>
        <Textfield id={id} label={label} onChange={handleOnChange} value={localValue} styles={styles} type='textarea' />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldTextAreaEdit;
