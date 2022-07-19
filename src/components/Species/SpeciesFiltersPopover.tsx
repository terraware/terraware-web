import { Grid, IconButton, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { GrowthForms, StorageBehaviors } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import { SpeciesFiltersType } from '.';
import Button from '../common/button/Button';
import Select from '../common/Select/Select';

const useStyles = makeStyles(() => ({
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
}));

type SpeciesFiltersPopoverProps = {
  filters: SpeciesFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<SpeciesFiltersType>>;
};

export default function SpeciesFiltersPopover({ filters, setFilters }: SpeciesFiltersPopoverProps): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [temporalRecord, setTemporalRecord, onChange] = useForm<SpeciesFiltersType>({});
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setTemporalRecord(filters);
  }, [filters, setTemporalRecord]);

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
    setFilters(temporalRecord);
    handleClose();
  };

  const getSelectedConservationStatusValue = () => {
    if (temporalRecord.rare) {
      return 'Rare';
    }
    if (temporalRecord.endangered) {
      return 'Endangered';
    }
  };

  const onChangeConservationStatus = (newValue: string) => {
    if (newValue === 'Rare') {
      onChange('rare', true);
    }
    if (newValue === 'Endangered') {
      onChange('endangered', true);
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
                selectedValue={temporalRecord.growthForm}
                onChange={(value) => onChange('growthForm', value)}
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
                selectedValue={temporalRecord.seedStorageBehavior}
                onChange={(value) => onChange('seedStorageBehavior', value)}
                options={StorageBehaviors}
                label={strings.SEED_STORAGE_BEHAVIOR}
                aria-label={strings.SEED_STORAGE_BEHAVIOR}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
          </Grid>
          <div className={classes.footer}>
            <Button label='Reset' onClick={onReset} size='medium' priority='secondary' type='passive' />
            <Button label='Done' onClick={onDone} size='medium' />
          </div>
        </div>
      </Popover>
    </div>
  );
}
