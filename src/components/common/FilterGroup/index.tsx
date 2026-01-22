import React, { type JSX, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { Option } from '@terraware/web-components/components/table/types';

import strings from 'src/strings';
import { FieldValuesPayload, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import FilterBoolean from './filters/FilterBoolean';
import FilterCountWeight from './filters/FilterCountWeight';
import DateRange from './filters/FilterDateRange';
import MultipleSelection from './filters/FilterMultipleSelection';
import FilterNumberRange from './filters/FilterNumberRange';
import Search from './filters/FilterSearch';
import SingleSelection from './filters/FilterSingleSelection';

export type FilterField = {
  name: string;
  label: string;
  showLabel?: boolean;
  type:
    | 'multiple_selection'
    | 'single_selection'
    | 'search'
    | 'date_range'
    | 'number_range'
    | 'count_weight'
    | 'hidden'
    | 'boolean';
  pillValueRenderer?: (values: (string | number | null)[]) => string | undefined;
};

export type FilterGroupProps = {
  initialFilters: Record<string, SearchNodePayload>;
  fields: FilterField[];
  values?: FieldValuesPayload;
  onConfirm: (filters: Record<string, SearchNodePayload>) => void;
  onCancel: () => void;
  noScroll?: boolean;
  optionsRenderer?: (filterName: string, values: FieldValuesPayload) => Option[] | undefined;
};

export default function FilterGroup(props: FilterGroupProps): JSX.Element {
  const { initialFilters, fields, values, onConfirm, onCancel, noScroll, optionsRenderer } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const buttonStyles = {
    width: isMobile ? '100%' : 'auto',
  };

  // the filters defined by this filter group
  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>(initialFilters);
  const onFilterChange = (key: string, filter: SearchNodePayload) => {
    if (filter.values.length) {
      setFilters({ ...filters, [key]: filter });
    } else {
      onDeleteFilter(key);
    }
  };
  const onDeleteFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };
  const clearFilters = () => setFilters({});

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
          {strings.FILTERS}
        </Typography>
      </Box>

      <Box flex='1 1 auto' overflow={noScroll ? 'visible' : 'auto'} maxHeight='380px'>
        {fields.map((f, index) => {
          const options: Option[] | undefined = optionsRenderer && optionsRenderer(f.name, values || {});

          return (
            <Box key={f.name}>
              {index > 0 && (
                <hr
                  style={{
                    maxWidth: '90%',
                    border: 'none',
                    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  }}
                />
              )}
              {f.showLabel !== false ? (
                <Typography fontSize='14px' fontWeight={600} margin={theme.spacing(2, 2, 0, 2)}>
                  {f.label}
                </Typography>
              ) : null}
              {f.type === 'multiple_selection' && (
                <MultipleSelection
                  field={f.name}
                  values={filters[f.name]?.values ?? []}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  options={options ?? getOptions(f.name, values || {})}
                  pillValueRenderer={f.pillValueRenderer}
                />
              )}
              {f.type === 'single_selection' && (
                <SingleSelection
                  field={f.name}
                  value={filters[f.name]?.values[0]}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  options={getOptions(f.name, values || {})}
                  isBoolean={false}
                />
              )}
              {f.type === 'search' && (
                <Search
                  field={f.name}
                  autoFocus={false}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  onDelete={() => onDeleteFilter(f.name)}
                  value={filters[f.name]?.values[0]}
                />
              )}
              {f.type === 'date_range' && (
                <DateRange
                  field={f.name}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  onDelete={() => onDeleteFilter(f.name)}
                  values={filters[f.name]?.values ?? []}
                />
              )}
              {f.type === 'number_range' && (
                <FilterNumberRange
                  field={f.name}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  onDelete={() => onDeleteFilter(f.name)}
                  values={filters[f.name]?.values ?? []}
                />
              )}
              {f.type === 'count_weight' && (
                <FilterCountWeight
                  field={f.name}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                  payloads={filters[f.name]?.children ?? []}
                />
              )}
              {f.type === 'boolean' && (
                <FilterBoolean
                  field={f.name}
                  label={f.label}
                  value={filters[f.name]?.values[0] === 'true'}
                  onChange={(filter) => onFilterChange(f.name, filter)}
                />
              )}
            </Box>
          );
        })}
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
        <Button onClick={onCancel} type='passive' priority='secondary' label={strings.CANCEL} style={buttonStyles} />
        <Button onClick={clearFilters} type='passive' priority='secondary' label={strings.RESET} style={buttonStyles} />
        <Button
          onClick={() => onConfirm(filters)}
          type='productive'
          priority='primary'
          label={strings.APPLY}
          style={buttonStyles}
        />
      </Box>
    </Box>
  );
}

function getOptions(field: string, values: FieldValuesPayload): Option[] {
  const map1 =
    values[field]?.values?.map((v) => {
      return {
        label: v,
        value: v,
        disabled: false,
      };
    }) ?? [];

  return map1;
}
