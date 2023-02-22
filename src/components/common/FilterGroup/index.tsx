import React, { useState } from 'react';
import { FieldValuesPayload, SearchNodePayload } from 'src/services/SearchService';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import MultipleSelection from './filters/FilterMultipleSelection';
import SingleSelection from './filters/FilterSingleSelection';
import Search from './filters/FilterSearch';
import DateRange from './filters/FilterDateRange';
import FilterNumberRange from './filters/FilterNumberRange';
import FilterCountWeight from './filters/FilterCountWeight';
import { Option } from '@terraware/web-components/components/table/types';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile?: boolean;
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    maxWidth: '90%',
    border: 'none',
    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
  },
  button: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : 'auto'),
  },
}));

export type FilterField = {
  name: string;
  label: string;
  type:
    | 'multiple_selection'
    | 'single_selection'
    | 'search'
    | 'date_range'
    | 'number_range'
    | 'count_weight'
    | 'hidden';
};

export type FilterGroupProps = {
  initialFilters: Record<string, SearchNodePayload>;
  fields: FilterField[];
  values: FieldValuesPayload;
  onConfirm: (filters: Record<string, SearchNodePayload>) => void;
  onCancel: () => void;
};

export default function FilterGroup(props: FilterGroupProps): JSX.Element {
  const { initialFilters, fields, values, onConfirm, onCancel } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles({ isMobile });

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
      <Box flex='1 1 auto' overflow='auto' maxHeight='380px'>
        {fields.map((f, index) => (
          <Box key={f.name}>
            {index > 0 && <hr className={classes.divider} />}
            <Typography fontSize='14px' fontWeight={600} margin={theme.spacing(2, 2, 0, 2)}>
              {f.label}
            </Typography>
            {f.type === 'multiple_selection' && (
              <MultipleSelection
                field={f.name}
                values={filters[f.name]?.values ?? []}
                onChange={(filter) => onFilterChange(f.name, filter)}
                options={getOptions(f.name, values)}
              />
            )}
            {f.type === 'single_selection' && (
              <SingleSelection
                field={f.name}
                value={filters[f.name]?.values[0]}
                onChange={(filter) => onFilterChange(f.name, filter)}
                options={getOptions(f.name, values)}
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
          </Box>
        ))}
      </Box>
      <Box
        display='flex'
        flexDirection={isMobile ? 'column-reverse' : 'row'}
        justifyContent='space-between'
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
          onClick={onCancel}
          type='passive'
          priority='secondary'
          label={strings.CANCEL}
        />
        <Button
          className={classes.button}
          onClick={clearFilters}
          type='passive'
          priority='secondary'
          label={strings.RESET}
        />
        <Button
          className={classes.button}
          onClick={() => onConfirm(filters)}
          type='productive'
          priority='primary'
          label={strings.APPLY}
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
