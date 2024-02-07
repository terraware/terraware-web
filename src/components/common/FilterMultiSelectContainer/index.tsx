import React, { useCallback, useState } from 'react';
import { Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Icon from 'src/components/common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';

const useStyles = makeStyles((theme: Theme) => ({
  dropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '8px',
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
  disabled?: boolean;
  filterKey: keyof T;
  filters: T;
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  options: (string | number)[];
  renderOption: (id: number) => string;
  setFilters: (f: T) => void;
};

export default function FilterMultiSelectContainer<T extends Record<string, (number | null)[]>>(
  props: FilterMultiSelectContainerProps<T>
): JSX.Element {
  const {
    filters,
    setFilters,
    label,
    disabled,
    filterKey,
    options,
    renderOption,
    notPresentFilterLabel,
    notPresentFilterShown,
  } = props;

  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  /*
    Admittedly, this is a bit confusing. Because the onBlur event within the MultiSelect bubbles up _before_ the
    onClose event in the Popover, we need to store, within this component's state, whether or not the options _were_
    visible before the blur event occurred. I tried many, many configurations where setOptionsVisible was passed into
    the MultiSelect, but the onBlur would still fire before the child component could tell the parent component that
    the options were no longer visible (using setOptionsVisible), which resulted in the options being close, the parent
    component re-rendering, and then the onClose handler would think that the options aren't visible, so the Popover
    should be closed, which resulted in not achieving the goal.
   */
  const [optionsWereVisibleBeforeBlur, setOptionsWereVisibleBeforeblur] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const hideOptionsOrClose = useCallback(() => {
    if (optionsWereVisibleBeforeBlur) {
      setOptionsVisible(false);
      setOptionsWereVisibleBeforeblur(false);
    } else {
      setAnchorEl(null);
    }
  }, [optionsWereVisibleBeforeBlur]);

  const onMultiSelectBlur = () => {
    setOptionsWereVisibleBeforeblur(true);
  };

  const initialSelection = filters[filterKey] || [];

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect
        filterKey={String(filterKey)}
        initialSelection={initialSelection}
        label={label}
        onCancel={handleClose}
        onConfirm={(selectedIds: (number | null)[]) => {
          handleClose();
          setFilters({ ...filters, [filterKey]: selectedIds });
        }}
        options={options.map((option) => Number(option))}
        optionsVisible={optionsVisible}
        renderOption={renderOption}
        notPresentFilterLabel={notPresentFilterLabel}
        notPresentFilterShown={notPresentFilterShown}
        onBlur={onMultiSelectBlur}
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
          onClose={hideOptionsOrClose}
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
