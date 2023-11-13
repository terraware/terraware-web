import { Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { getAllNurseries } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useOrganization } from 'src/providers/hooks';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import { Facility } from 'src/types/Facility';

export type InventoryFiltersType = {
  facilityIds?: number[];
};

const useStyles = makeStyles((theme: Theme) => ({
  dropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '4px',
    width: '176px',
    height: '40px',
    padding: theme.spacing(1, 2, 1, 1),
    margin: theme.spacing(0.5, 0, 0, 1),
    display: 'flex',
    justifyContent: 'space-between',
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

type InventoryFiltersPopoverProps = {
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
};

export default function InventoryFiltersPopover({ filters, setFilters }: InventoryFiltersPopoverProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [nurseries, setNurseries] = useState<Facility[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setNurseries(getAllNurseries(selectedOrganization));
  }, [selectedOrganization]);

  useEffect(() => {
    setOptions(nurseries.map((n) => n.id));
  }, [nurseries]);

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect
        label={strings.NURSERIES}
        initialSelection={filters.facilityIds ?? []}
        onCancel={handleClose}
        onConfirm={(selectedIds: number[]) => {
          handleClose();
          setFilters({ facilityIds: selectedIds });
        }}
        options={options}
        renderOption={(id: number) => nurseries.find((n) => n.id === id)?.name ?? ''}
      />
    );
  };

  return (
    <div>
      <div className={classes.dropdown} onClick={handleClick}>
        <Typography>{strings.NURSERIES}</Typography>
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
