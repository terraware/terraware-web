import React, { useMemo, useState } from 'react';

import { Box, Popover, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Tooltip } from '@terraware/web-components';
import { TableDensityType } from '@terraware/web-components/components/table/types';

import Button from 'src/components/common/button/Button';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';

export type DensitySettingsProp = {
  density?: TableDensityType;
  onChange?: (density: TableDensityType) => void;
};

const DensitySettings = ({ density, onChange }: DensitySettingsProp): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { updateUserPreferences, userPreferences } = useUser();
  const tableDensity: TableDensityType = useMemo(
    () => density ?? (userPreferences['tableDensity'] as TableDensityType) ?? 'comfortable',
    [density, userPreferences]
  );

  const saveTableDensity = (newDensity: TableDensityType) => {
    if (onChange) {
      onChange(newDensity);
    }
    updateUserPreferences({ tableDensity: newDensity });
  };

  const options: DropdownItem[] = useMemo(
    () => [
      {
        label: strings.COMPACT,
        value: 'compact',
      },
      {
        label: strings.COMFORTABLE,
        value: 'comfortable',
      },
      {
        label: strings.ROOMY,
        value: 'roomy',
      },
    ],
    [activeLocale]
  );

  const handleChange = (value: string | null) => {
    saveTableDensity(value as TableDensityType);
  };

  return (
    <Box display='flex' flexDirection='column' maxHeight='90vh'>
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
          {strings.SETTINGS}
        </Typography>
      </Box>

      <Box flex='1 1 auto' overflow={'visible'} maxHeight='380px'>
        <Typography fontSize='14px' fontWeight={600} margin={theme.spacing(2, 2, 0, 2)}>
          {strings.DENSITY}
        </Typography>
        <Box sx={{ padding: theme.spacing(1.75) }}>
          <Dropdown
            options={options}
            onChange={(val) => handleChange(val)}
            selectedValue={tableDensity}
            fullWidth={true}
          />
        </Box>
      </Box>
    </Box>
  );
};

const TableDensitySettingsButton = ({ density, onChange }: DensitySettingsProp) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={strings.SETTINGS}>
        <Button
          id='openTableDensity'
          onClick={(event) => event && handleClick(event)}
          type='passive'
          priority='ghost'
          icon='iconSettings'
        />
      </Tooltip>
      <Popover
        id='observations-filter-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPaper-root': {
            border: `1px solid ${theme.palette.TwClrBaseGray300}`,
            borderRadius: '8px',
            overflow: 'visible',
            width: '240px',
          },
        }}
      >
        <DensitySettings density={density} onChange={onChange} />
      </Popover>
    </>
  );
};

export default TableDensitySettingsButton;
