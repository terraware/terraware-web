import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import { ProjectFieldEditProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

type ProjectFieldSelectProps = ProjectFieldEditProps & {
  options: DropdownItem[];
};

const ProjectFieldSelect = ({ id, label, onChange, value, options }: ProjectFieldSelectProps) => {
  const theme = useTheme();

  const [localValue, setLocalValue] = useState<string | undefined>();

  const handleOnChange = useCallback(
    (_value: string) => {
      setLocalValue(_value);
      onChange(id, `${_value}`);
    },
    [id, onChange]
  );

  useEffect(() => {
    setLocalValue(`${value}`);
  }, [value]);

  return (
    <GridEntryWrapper height={'100px'}>
      <Box paddingX={theme.spacing(2)}>
        <Dropdown
          id={id}
          label={label}
          selectedValue={localValue}
          options={options}
          onChange={handleOnChange}
          fullWidth
        />
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldSelect;
