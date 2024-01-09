import React, { useEffect, useState } from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, MultiSelect } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : 'auto'),
  },
  multiSelectStyle: {
    height: '100%',
    width: '100%',
  },
}));

type FilterMultiSelectProps<T> = {
  label: string;
  initialSelection: T[];
  onCancel: () => void;
  onConfirm: (finalSelection: T[]) => void;
  options: T[];
  renderOption: (item: T) => string;
};

export default function FilterMultiSelect<T>(props: FilterMultiSelectProps<T>): JSX.Element {
  const { label, initialSelection, onCancel, onConfirm, options, renderOption } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles({ isMobile });

  const [selection, setSelection] = useState(initialSelection);
  const [multiSelectOptions, setMultiSelectOptions] = useState<Map<T, string>>(new Map());

  useEffect(() => {
    const optionsMap = new Map<T, string>(options.map((option) => [option, renderOption(option)]));
    setMultiSelectOptions(optionsMap);
  }, [options, renderOption]);

  const onAdd = (item: T) => {
    setSelection([...selection, item]);
  };

  const onRemove = (item: T) => {
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
        <MultiSelect
          className={classes.multiSelectStyle}
          fullWidth={true}
          onAdd={onAdd}
          onRemove={onRemove}
          options={multiSelectOptions}
          placeHolder={strings.SELECT}
          valueRenderer={(v) => v}
          selectedOptions={selection}
        />
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
          className={classes.button}
          onClick={() => onCancel()}
          type='passive'
          priority='secondary'
          label={strings.CANCEL}
        />
        <Button
          className={classes.button}
          onClick={() => clearFilters()}
          type='passive'
          priority='secondary'
          label={strings.RESET}
        />
        <Button
          className={classes.button}
          onClick={() => onConfirm(selection)}
          type='productive'
          priority='primary'
          label={strings.APPLY}
        />
      </Box>
    </Box>
  );
}
