import React, { useMemo, useState } from 'react';

import { Popover, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';

import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import strings from 'src/strings';
import { FieldValuesPayload, SearchNodePayload } from 'src/types/Search';

import { FilterConfig } from './index';

interface IconFiltersProps {
  filters: FilterConfig[];
  setCurrentFilters: (filters: Record<string, any>) => void;
  currentFilters: Record<string, SearchNodePayload>;
}

const IconFilters = ({ filters, setCurrentFilters, currentFilters }: IconFiltersProps) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const fields = useMemo(
    (): FilterField[] =>
      filters.map(
        (filter: FilterConfig): FilterField => ({
          name: filter.field,
          label: filter.label,
          showLabel: filter.showLabel,
          type: filter.type || 'multiple_selection',
          pillValueRenderer: filter.pillValueRenderer,
        })
      ),
    [filters]
  );

  const values = useMemo(
    (): FieldValuesPayload =>
      filters.reduce(
        (acc: FieldValuesPayload, filter: FilterConfig): FieldValuesPayload => ({
          ...acc,
          [filter.field]: {
            partial: false,
            values: filter.options.map((option) => (option !== null ? `${option}` : option)),
          },
        }),
        {} as FieldValuesPayload
      ),
    [filters]
  );

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
          initialFilters={currentFilters}
          fields={fields}
          values={values}
          onConfirm={(fs) => {
            handleFilterClose();
            setCurrentFilters(fs);
          }}
          onCancel={handleFilterClose}
        />
      </Popover>
    </>
  );
};

export default IconFilters;
