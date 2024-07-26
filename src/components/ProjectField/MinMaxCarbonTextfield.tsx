import React, { useCallback, useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';

import { EditFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

type MinMaxCarbonTextFieldProps = {
  height?: string;
  label: string;
  onChange: (id: string, value: string) => void;
  valueMax?: EditFieldValue;
  valueMin?: EditFieldValue;
};

const MinMaxCarbonTextfield = ({ height, onChange, valueMax, valueMin }: MinMaxCarbonTextFieldProps) => {
  const theme = useTheme();

  const [minLocalValue, setMinLocalValue] = useState<string | undefined>();
  const [maxLocalValue, setMaxLocalValue] = useState<string | undefined>();

  const handleOnChangeMin = useCallback(
    (_value: unknown) => {
      setMinLocalValue(`${_value}`);
      onChange('minCarbonAccumulation', _value as string);
    },
    [onChange]
  );

  const handleOnChangeMax = useCallback(
    (_value: unknown) => {
      setMaxLocalValue(`${_value}`);
      onChange('maxCarbonAccumulation', _value as string);
    },
    [onChange]
  );

  useEffect(() => {
    if (valueMin) {
      setMinLocalValue(`${valueMin}`);
    }
  }, [valueMin]);

  useEffect(() => {
    if (valueMax) {
      setMaxLocalValue(`${valueMax}`);
    }
  }, [valueMax]);

  return (
    <GridEntryWrapper height={height}>
      <>
        <Typography
          component='label'
          paddingX={theme.spacing(2)}
          sx={{
            color: theme.palette.TwClrTxtSecondary,
            display: 'block',
            fontSize: '14px',
            lineHeight: '20px',
          }}
        >
          {strings.MIN_MAX_CARBON_ACCUMULATION}
        </Typography>
        <Box display='flex' alignItems='center' paddingX={theme.spacing(2)}>
          <Textfield
            id='minCarbonAccumulation'
            label=''
            onChange={handleOnChangeMin}
            value={minLocalValue}
            type={'number'}
          />
          <Typography>-</Typography>
          <Textfield
            id='maxCarbonAccumulation'
            label=''
            onChange={handleOnChangeMax}
            value={maxLocalValue}
            type={'number'}
          />
        </Box>
      </>
    </GridEntryWrapper>
  );
};

export default MinMaxCarbonTextfield;
