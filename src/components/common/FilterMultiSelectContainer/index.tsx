import React, { useState } from 'react';
import { Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Icon from 'src/components/common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';

const useStyles = makeStyles((theme: Theme) => ({
  dropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '4px',
    width: '176px',
    height: '40px',
    padding: theme.spacing(1, 2, 1, 1),
    marginTop: theme.spacing(0.5),
    display: 'flex',
    justifyContent: 'space-between',
  },
  dropdownDisabled: {
    color: theme.palette.TwClrTxtTertiary,
  },
  dropdownIconRight: {
    height: '24px',
    width: '24px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      overflow: 'visible',
      width: '480px',
    },
  },
  mobileContainer: {
    borderRadius: '8px',
    overflow: 'visible',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90%',
    width: '90%',
    zIndex: 1300,
  },
}));

type FilterMultiSelectContainerProps<T> = {
  filters: T;
  setFilters: (f: T) => void;
  label: string;
  disabled?: boolean;
  filterKey: keyof T;
  options: number[];
  renderOption: (id: number) => string;
};

export default function FilterMultiSelectContainer<T extends Record<string, number[]>>(
  props: FilterMultiSelectContainerProps<T>
): JSX.Element {
  const { filters, setFilters, label, disabled, filterKey, options, renderOption } = props;
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const initialSelection = filters[filterKey] || [];

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect
        label={label}
        initialSelection={initialSelection}
        onCancel={handleClose}
        onConfirm={(selectedIds: number[]) => {
          handleClose();
          setFilters({ ...filters, [filterKey]: selectedIds });
        }}
        options={options}
        renderOption={renderOption}
      />
    );
  };

  return (
    <div>
      <div className={`${classes.dropdown}${disabled ? ` ${classes.dropdownDisabled}` : ''}`} onClick={handleClick}>
        <Typography>{label}</Typography>
        <Icon name={Boolean(anchorEl) ? 'chevronUp' : 'chevronDown'} className={classes.dropdownIconRight} />
      </div>
      {isMobile && Boolean(anchorEl) ? (
        <div className={classes.mobileContainer}>{renderFilterMultiSelect()}</div>
      ) : (
        <Popover
          id='pre-exposed-filter-popover'
          open={Boolean(anchorEl)}
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
          className={classes.popoverContainer}
        >
          {renderFilterMultiSelect()}
        </Popover>
      )}
    </div>
  );
}
