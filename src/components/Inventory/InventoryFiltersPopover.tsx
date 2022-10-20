import { Grid, IconButton, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import { InventoryFiltersType } from './InventoryTable';
import NurseryDropdown from './NurseryDropdown';

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
    borderRadius: '8px',
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

type InventoryFiltersPopoverProps = {
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
  organization: ServerOrganization;
};

export default function InventoryFiltersPopover({
  filters,
  setFilters,
  organization,
}: InventoryFiltersPopoverProps): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [temporalRecord, setTemporalRecord] = useForm<InventoryFiltersType>({});
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
      facilityId: undefined,
    });
    handleClose();
  };

  const onDone = () => {
    setFilters(temporalRecord);
    handleClose();
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
              <NurseryDropdown
                organization={organization}
                record={temporalRecord}
                setRecord={setTemporalRecord}
                label={strings.NURSERY}
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
