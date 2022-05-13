import { Grid, List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { GrowthForms, StorageBehaviors } from 'src/types/Species';
import { SpeciesFilters } from '.';
import Button from '../common/button/Button';
import Select from '../common/Select/Select';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconContainer: {
      borderRadius: 0,
      fontSize: '16px',
      height: '48px',
      marginLeft: '8px',
    },
    icon: {
      fill: '#3A4445',
      marginLeft: '8px',
    },
    popoverContainer: {
      '& .MuiPaper-root': {
        border: '1px solid #A9B7B8',
        borderRadius: '8px',
        overflow: 'visible',
      },
    },
    popover: {
      width: '478px',
      paddingTop: 0,
      borderRadius: '8px',
    },
    title: {
      padding: '16px 24px',
      background: '#F2F4F5',
      fontSize: '20px',
      fontWeight: 600,
    },
    container: {
      padding: '24px',
    },
    footer: {
      background: '#F2F4F5',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'end',

      '& button+button': {
        marginLeft: '8px',
      },
    },
  })
);

type SpeciesFiltersPopoverProps = {
  filters: SpeciesFilters;
  setFilters: React.Dispatch<React.SetStateAction<SpeciesFilters>>;
  onChangeFilters: (id: string, value: unknown) => void;
  onApplyFilters: () => void;
};

export default function SpeciesFiltersPopover({
  filters,
  setFilters,
  onChangeFilters,
  onApplyFilters,
}: SpeciesFiltersPopoverProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // this use effect is used to clear filters
  useEffect(() => {
    if (Object.values(filters).every((value) => value === undefined)) {
      onApplyFilters();
    }
  }, [filters]);

  const onReset = () => {
    setFilters({
      growthForm: undefined,
      seedStorageBehavior: undefined,
      rare: undefined,
      endangered: undefined,
    });
    handleClose();
  };

  const onDone = () => {
    onApplyFilters();
    handleClose();
  };

  const getSelectedConservationStatusValue = () => {
    if (filters.rare) {
      return 'Rare';
    }
    if (filters.endangered) {
      return 'Endangered';
    }
  };

  const onChangeConservationStatus = (newValue: string) => {
    if (newValue === 'Rare') {
      onChangeFilters('rare', true);
    }
    if (newValue === 'Endangered') {
      onChangeFilters('endangered', true);
    }
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <Icon name='filter' />
      </IconButton>
      <Popover
        id='simple-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className={classes.popoverContainer}
      >
        <div className={classes.popover}>
          <div className={classes.title}>{strings.FILTERS}</div>
          <Grid container spacing={2} className={classes.container}>
            <Grid item xs={12}>
              <Select
                id='growthForm'
                selectedValue={filters.growthForm}
                onChange={(value) => onChangeFilters('growthForm', value)}
                options={GrowthForms}
                label={strings.GROWTH_FORM}
                aria-label={strings.GROWTH_FORM}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                id='conservationStatus'
                selectedValue={getSelectedConservationStatusValue()}
                onChange={(value) => onChangeConservationStatus(value)}
                options={['Rare', 'Endangered']}
                label={strings.CONSERVATION_STATUS}
                aria-label={strings.SEED_STORAGE_BEHAVIOR}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                id='seedStorageBehavior'
                selectedValue={filters.seedStorageBehavior}
                onChange={(value) => onChangeFilters('seedStorageBehavior', value)}
                options={StorageBehaviors}
                label={strings.SEED_STORAGE_BEHAVIOR}
                aria-label={strings.SEED_STORAGE_BEHAVIOR}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
          </Grid>
          <div className={classes.footer}>
            <Button label='Reset' onClick={onReset} size='small' priority='secondary' type='passive' />
            <Button label='Done' onClick={onDone} size='small' />
          </div>
        </div>
      </Popover>
    </div>
  );
}
