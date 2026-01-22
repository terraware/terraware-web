import React, { type JSX, useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, MultiSelect } from '@terraware/web-components';

import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Checkbox from '../Checkbox';

type FilterMultiSelectProps<T> = {
  filterKey: string;
  initialSelection: (T | null)[];
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  onCancel: () => void;
  onConfirm: (finalSelection: (T | null)[]) => void;
  options: T[];
  optionsVisible?: boolean | undefined;
  renderOption: (item: T) => string;
};

export default function FilterMultiSelect<T>(props: FilterMultiSelectProps<T>): JSX.Element {
  const {
    filterKey,
    initialSelection,
    label,
    notPresentFilterLabel,
    notPresentFilterShown,
    onCancel,
    onConfirm,
    options,
    optionsVisible,
    renderOption,
    onBlur,
    onFocus,
  } = props;

  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [selection, setSelection] = useState(initialSelection);
  const [multiSelectOptions, setMultiSelectOptions] = useState<Map<T | null, string>>(new Map());
  const [isNotPresentFilterSelected, setIsNotPresentFilterSelected] = useState<boolean>(selection[0] === null);

  const buttonStyles = { width: isMobile ? '100%' : 'auto' };

  useEffect(() => {
    const optionsMap = new Map<T, string>(options.map((option) => [option, renderOption(option)]));
    setMultiSelectOptions(optionsMap);
  }, [options, renderOption]);

  const onAdd = (item: T | null) => {
    setSelection([...selection, item]);
  };

  const onRemove = (item: T | null) => {
    const index = selection.findIndex((x) => item === x);
    const newSelection = [...selection];
    newSelection.splice(index, 1);
    setSelection(newSelection);
  };

  const clearFilters = () => {
    setSelection([]);
  };

  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      padding={0}
      width='100%'
      height='100%'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius={theme.spacing(1)}
    >
      {isMobile && (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='left'
          width='100%'
          borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
          borderRadius={theme.spacing(1, 1, 0, 0)}
          padding={theme.spacing(2, 3)}
          sx={{
            background: theme.palette.TwClrBgSecondary,
          }}
        >
          <Typography fontSize='20px' fontWeight={600}>
            {label}
          </Typography>
        </Box>
      )}
      <Box
        padding={theme.spacing(3)}
        width='100%'
        borderRadius={isMobile ? undefined : theme.spacing(1, 1, 0, 0)}
        sx={{
          background: theme.palette.TwClrBg,
        }}
      >
        <MultiSelect<T | null, string>
          fullWidth={true}
          onAdd={onAdd}
          onRemove={onRemove}
          options={multiSelectOptions}
          placeHolder={strings.SELECT}
          valueRenderer={(v) => v}
          selectedOptions={selection}
          disabled={isNotPresentFilterSelected}
          optionsVisible={optionsVisible}
          onBlur={onBlur}
          onFocus={onFocus}
          sx={{
            height: '100%',
            width: '100%',
          }}
        />

        {notPresentFilterShown && (
          <Box width='100%' sx={{ marginTop: theme.spacing(2) }}>
            <Checkbox
              id={`not-preset-${String(filterKey)}`}
              name={`not-preset-${String(filterKey)}`}
              label={notPresentFilterLabel}
              onChange={() => {
                const nextIsNotPresentFilterSelected = !isNotPresentFilterSelected;
                if (nextIsNotPresentFilterSelected) {
                  setSelection([null]);
                } else {
                  setSelection([]);
                }
                setIsNotPresentFilterSelected(nextIsNotPresentFilterSelected);
              }}
              value={isNotPresentFilterSelected}
            />
          </Box>
        )}
      </Box>
      <Box
        display='flex'
        flexDirection={isMobile ? 'column-reverse' : 'row'}
        justifyContent='flex-end'
        width='100%'
        borderTop={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        borderRadius={theme.spacing(0, 0, 1, 1)}
        padding={theme.spacing(2, 3)}
        sx={{
          background: theme.palette.TwClrBgSecondary,
        }}
      >
        <Button
          onClick={() => onCancel()}
          type='passive'
          priority='secondary'
          label={strings.CANCEL}
          style={buttonStyles}
        />
        <Button
          onClick={() => clearFilters()}
          type='passive'
          priority='secondary'
          label={strings.RESET}
          style={buttonStyles}
        />
        <Button
          onClick={() => onConfirm(selection)}
          type='productive'
          priority='primary'
          label={strings.APPLY}
          style={buttonStyles}
        />
      </Box>
    </Box>
  );
}
