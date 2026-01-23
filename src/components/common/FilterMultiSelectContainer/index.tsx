import React, { type JSX, useCallback, useState } from 'react';

import { Box, Popover, Typography, useTheme } from '@mui/material';

import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import Icon from 'src/components/common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type FilterMultiSelectContainerProps<T> = {
  disabled?: boolean;
  filterKey: keyof T;
  filters: T;
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  options: (string | number)[];
  renderOption: (id: number | string) => string;
  setFilters: (f: T) => void;
  onFilterApplied?: (filter: string, values: (string | number | null)[]) => void;
};

export default function FilterMultiSelectContainer<T extends Record<string, (string | number | null)[]>>(
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
    onFilterApplied,
  } = props;

  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const hideOptionsOrClose = () => {
    if (shouldClose) {
      setAnchorEl(null);
    }
  };

  const onMultiSelectBlur = () => {
    /*
      I admit this is less than ideal. I was unable to find another solution (and I spent way to long on it already).
      Because there are two events that fire in immediate succession (and in this order), the MultiSelect onBlur
      and the Popover onClick, we need to setOptionsVisible(false) and setShouldClose(false) _after_ the
      Popover's onClickCapture executes. I chose 100 ms arbitrarily based on the desire to still be able to double
      click away from the popover to close the options and subsequently close the popover. Choosing a number
      like 1000ms, for example, makes the double click not work unless 1000ms has elapsed between the two clicks.
     */
    const delaySet = async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
      setShouldClose(false);
      setOptionsVisible(false);
    };

    void delaySet();
  };

  const onMultiSelectFocus = () => {
    setOptionsVisible(true);
    setShouldClose(false);
  };

  const initialSelection = filters[filterKey] || [];

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect<string | number>
        filterKey={String(filterKey)}
        initialSelection={initialSelection}
        label={label}
        onCancel={handleClose}
        onConfirm={(selectedValues: (string | number | null)[]) => {
          if (onFilterApplied) {
            onFilterApplied(String(filterKey), selectedValues);
          }
          handleClose();
          if (selectedValues.length === 0) {
            const newFilters = { ...filters };
            delete newFilters[filterKey];
            setFilters(newFilters);
          } else {
            setFilters({ ...filters, [filterKey]: selectedValues });
          }
        }}
        options={options}
        optionsVisible={optionsVisible}
        renderOption={renderOption}
        notPresentFilterLabel={notPresentFilterLabel}
        notPresentFilterShown={notPresentFilterShown}
        onBlur={onMultiSelectBlur}
        onFocus={onMultiSelectFocus}
      />
    );
  };

  return (
    <div>
      <Box
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
          borderRadius: '8px',
          width: '176px',
          height: '40px',
          padding: theme.spacing(1, 2, 1, 1),
          marginTop: theme.spacing(0.5),
          display: 'flex',
          justifyContent: 'space-between',
          ...(disabled ? { color: theme.palette.TwClrTxtTertiary } : {}),
        }}
      >
        <Typography>{label}</Typography>
        <Icon
          name={anchorEl ? 'chevronUp' : 'chevronDown'}
          style={{
            height: '24px',
            width: '24px',
          }}
        />
      </Box>
      {isMobile && Boolean(anchorEl) ? (
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
          {renderFilterMultiSelect()}
        </Box>
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
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '8px',
              overflow: 'visible',
              width: '480px',
            },
          }}
          onClickCapture={(event) => {
            // If the captured event is not for the backdrop, do nothing
            const eventIsBackdropClick = Array.from((event.target as HTMLElement).classList?.values() || []).some(
              (targetClass: string) => targetClass.toLowerCase().includes('backdrop')
            );
            if (!eventIsBackdropClick) {
              return;
            }

            // Since two events are fired when the options are opened, the MultiSelect onBlur and
            // the Popover onClick (of the backdrop, which prompts the onClose event), we need to stop event propagation
            // if the options are visible. Otherwise, we setShouldClose(true) so that when the onClose handler fires
            // it knows that it should close
            if (optionsVisible) {
              event.stopPropagation();
            } else {
              setShouldClose(true);
            }
          }}
        >
          {renderFilterMultiSelect()}
        </Popover>
      )}
    </div>
  );
}
