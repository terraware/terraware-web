import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { MultiSelect } from '@terraware/web-components';

import GridEntryWrapper from './GridEntryWrapper';

type ProjectFieldMultiSelectProps = {
  id: string;
  label: string;
  onChange: (id: string, values: string[]) => void;
  options: Map<string, string>;
  values?: string[];
};

const ProjectFieldMultiSelect = ({ id, label, onChange, options, values }: ProjectFieldMultiSelectProps) => {
  const theme = useTheme();

  const [localValues, setLocalValues] = useState<string[]>([]);

  const handleOnAdd = useCallback(
    (_value: string) => {
      const nextValues = [...localValues, _value as string];
      setLocalValues(nextValues);
      onChange(id, nextValues);
    },
    [id, localValues, onChange]
  );

  const handleOnRemove = useCallback(
    (_value: string) => {
      const nextValues = localValues.filter((value) => value !== _value);
      setLocalValues(nextValues);
      onChange(id, nextValues);
    },
    [id, localValues, onChange]
  );

  useEffect(() => {
    setLocalValues(values || []);
  }, [values]);

  return (
    <GridEntryWrapper>
      <Box paddingX={theme.spacing(2)}>
        <MultiSelect<string, string>
          id={id}
          label={label}
          onAdd={handleOnAdd}
          onRemove={handleOnRemove}
          options={options}
          selectedOptions={localValues}
          valueRenderer={(value) => value}
          fullWidth
        />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldMultiSelect;
