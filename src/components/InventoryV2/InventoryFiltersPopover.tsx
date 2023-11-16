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
import { Species } from 'src/types/Species';
import { useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { OriginPage } from './InventoryBatch';

export type InventoryFiltersType = {
  facilityIds?: number[];
  speciesIds?: number[];
  // Has to match up with SearchNodePayload['values']
  showEmptyBatches?: (string | null)[];
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
  origin: OriginPage;
};

export default function InventoryFiltersPopover(props: InventoryFiltersPopoverProps): JSX.Element {
  const { filters, setFilters } = props;
  const origin = props.origin || 'Species';

  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  const species = useAppSelector(selectSpecies);

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
    // This looks confusing, but it is intentional. On the nursery view you are filtering by species and vice versa
    if (origin === 'Species') {
      setNurseries(getAllNurseries(selectedOrganization));
    }
  }, [selectedOrganization, origin]);

  useEffect(() => {
    setOptions(nurseries.map((n: Facility) => n.id));
  }, [nurseries]);

  useEffect(() => {
    setOptions((species || []).map((n: Species) => n.id));
  }, [species]);

  // Default origin is 'Species', which filters based on nurseries
  let label = strings.NURSERY;
  let initialSelection = filters.facilityIds ?? [];
  let filterKey = 'facilityIds';
  let renderOption = (id: number) => nurseries.find((n) => n.id === id)?.name ?? '';

  if (origin === 'Nursery') {
    label = strings.SPECIES;
    initialSelection = filters.speciesIds ?? [];
    filterKey = 'speciesIds';
    renderOption = (id: number) => (species || []).find((n) => n.id === id)?.commonName ?? '';
  }

  const renderFilterMultiSelect = () => {
    return (
      <FilterMultiSelect
        label={label}
        initialSelection={initialSelection}
        onCancel={handleClose}
        onConfirm={(selectedIds: number[]) => {
          handleClose();
          setFilters({ [filterKey]: selectedIds });
        }}
        options={options}
        renderOption={renderOption}
      />
    );
  };

  return (
    <div>
      <div className={classes.dropdown} onClick={handleClick}>
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
