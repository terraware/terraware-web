import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Popover, Typography, useTheme } from '@mui/material';

import { PillListItemWithEmptyValue } from 'src/components/ProjectNewView/flow/ProjectEntitySearch';
import { ProjectEntityFilters } from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import Icon from 'src/components/common/icon/Icon';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export interface EntitySpecificFilterConfig {
  filterKey: string;
  label: string;
  initialSelection: (string | number)[];
  options: (string | number)[];
  renderOption: (value: string | number | null) => string;
  pillModifier: (filters: ProjectEntityFilters) => PillListItemWithEmptyValue[];
}

type ProjectEntityFilterProps = {
  filterConfig: EntitySpecificFilterConfig;
  setFilters: (value: ProjectEntityFilters) => void;
};

export default function ProjectEntityFilter(props: ProjectEntityFilterProps): JSX.Element {
  const { filterConfig, setFilters } = props;
  const { label, initialSelection, filterKey, options, renderOption } = filterConfig;

  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<undefined | HTMLElement>();

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);

  const handleClose = useCallback(() => setAnchorEl(undefined), []);

  const handleConfirm = useCallback(
    (selected: (number | string | null)[]) => {
      handleClose();
      setFilters({ [filterKey]: selected });
    },
    [handleClose, setFilters, filterKey]
  );

  const isOpen = Boolean(anchorEl);

  const notPresentFilterConfig = useMemo(
    () =>
      filterKey === 'projectIds' && activeLocale
        ? {
            notPresentFilterLabel: strings.NO_PROJECT,
            notPresentFilterShown: true,
          }
        : {},
    [filterKey, activeLocale]
  );

  return (
    <div>
      <Box
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
          borderRadius: '4px',
          width: '176px',
          height: '40px',
          padding: theme.spacing(1, 2, 1, 1),
          marginTop: theme.spacing(0.5),
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Typography>{label}</Typography>
        <Icon
          name={isOpen ? 'chevronUp' : 'chevronDown'}
          style={{
            height: '24px',
            width: '24px',
          }}
        />
      </Box>
      {isMobile && isOpen ? (
        <Box
          sx={{
            borderRadius: '8px',
            overflow: 'visible',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90%',
            width: '90%',
            zIndex: 1300,
          }}
        >
          <FilterMultiSelect
            filterKey={filterKey}
            initialSelection={initialSelection}
            label={label}
            onCancel={handleClose}
            onConfirm={(selected) => handleConfirm(selected)}
            options={options}
            renderOption={renderOption}
            {...notPresentFilterConfig}
          />
        </Box>
      ) : (
        <Popover
          id='pre-exposed-filter-popover'
          open={isOpen}
          onClose={handleClose}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '8px',
              overflow: 'visible',
              width: '480px',
            },
          }}
        >
          <FilterMultiSelect
            filterKey={filterKey}
            initialSelection={initialSelection}
            label={label}
            onCancel={handleClose}
            onConfirm={(selected) => handleConfirm(selected)}
            options={options}
            renderOption={renderOption}
            {...notPresentFilterConfig}
          />
        </Popover>
      )}
    </div>
  );
}
