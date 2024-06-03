import React, { useState } from 'react';

import { Popover, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';

import FilterGroup from 'src/components/common/FilterGroup';
import strings from 'src/strings';

import { SearchFiltersProps } from './index';

interface RegularFiltersProps {
  filtersProps: SearchFiltersProps;
}

const IconFilters = ({ filtersProps }: RegularFiltersProps) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={strings.FILTER}>
        <Button
          id='filter-observations-button'
          onClick={(event) => event && handleFilterClick(event)}
          type='passive'
          priority='ghost'
          icon='filter'
        />
      </Tooltip>
      <Popover
        id='observations-filter-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
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
            width: '480px',
          },
        }}
      >
        <FilterGroup
          initialFilters={filtersProps.filters}
          fields={filtersProps.filterColumns}
          values={filtersProps.filterOptions || {}}
          onConfirm={(fs) => {
            handleFilterClose();
            filtersProps.setFilters(fs);
          }}
          onCancel={handleFilterClose}
          noScroll={filtersProps.noScroll === undefined}
          optionsRenderer={filtersProps.optionsRenderer}
        />
      </Popover>
    </>
  );
};

export default IconFilters;
