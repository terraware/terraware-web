import { Grid, IconButton, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { conservationStatuses, ecosystemTypes, growthForms, storageBehaviors } from 'src/types/Species';
import useForm from 'src/utils/useForm';
import { SpeciesFiltersType } from '.';
import Button from '../common/button/Button';
import { Dropdown } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    height: '48px',
    marginLeft: '8px',
  },
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
    marginLeft: '8px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
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
    background: theme.palette.TwClrBgSecondary,
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: 600,
  },
  container: {
    padding: '24px',
  },
  footer: {
    background: theme.palette.TwClrBgSecondary,
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
        <Icon name='filter' size='medium' className={classes.icon} />
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
              <Dropdown
                id='growthForm'
                selectedValue={temporalRecord.growthForm}
                onChange={(value) => onChange('growthForm', value)}
                options={growthForms(true)}
                label={strings.GROWTH_FORM}
                aria-label={strings.GROWTH_FORM}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Dropdown
                id='conservationStatus'
                selectedValue={getSelectedConservationStatusValue()}
                onChange={(value) => onChangeConservationStatus(value)}
                options={conservationStatuses()}
                label={strings.CONSERVATION_STATUS}
                aria-label={strings.SEED_STORAGE_BEHAVIOR}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Dropdown
                id='seedStorageBehavior'
                selectedValue={temporalRecord.seedStorageBehavior}
                onChange={(value) => onChange('seedStorageBehavior', value)}
                options={storageBehaviors(true)}
                label={strings.SEED_STORAGE_BEHAVIOR}
                aria-label={strings.SEED_STORAGE_BEHAVIOR}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Dropdown
                id='ecosystemType'
                selectedValue={temporalRecord.ecosystemType}
                onChange={(value) => onChange('ecosystemType', value)}
                options={ecosystemTypes()}
                label={strings.ECOSYSTEM_TYPE}
                aria-label={strings.ECOSYSTEM_TYPE}
                placeholder={strings.SELECT}
                fullWidth={true}
              />
            </Grid>
          </Grid>
          <div className={classes.footer}>
            <Button label={strings.RESET} onClick={onReset} size='medium' priority='secondary' type='passive' />
            <Button label={strings.DONE} onClick={onDone} size='medium' />
          </div>
        </div>
      </Popover>
    </div>
  );
}
