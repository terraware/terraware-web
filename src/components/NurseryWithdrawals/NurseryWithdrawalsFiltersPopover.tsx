import { Box, Grid, IconButton, Popover, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import { Checkbox } from '@terraware/web-components';
import { getAllNurseries } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { NurseryWithdrawalsFiltersType } from './NurseryWithdrawals';
import { NurseryWithdrawalPurposesValues } from 'src/api/types/batch';

export type InventoryFiltersType = {
  facilityIds?: number[];
};

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    marginLeft: '8px',
    padding: 0,
  },
  icon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      overflow: 'visible',
    },
  },
  popover: {
    width: (props: StyleProps) => (props.isMobile ? '350px' : '478px'),
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
    maxHeight: 'calc(100vh - 150px)',
    overflow: 'auto',
  },
  footer: {
    background: '#F2F4F5',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'end',
    flexDirection: (props: StyleProps) => (props.isMobile ? 'column-reverse' : 'row'),

    '& button+button': {
      marginLeft: (props: StyleProps) => (props.isMobile ? 0 : theme.spacing(1)),
      marginBottom: (props: StyleProps) => (props.isMobile ? theme.spacing(1) : 0),
    },
  },
}));

type NurseryWithdrawalsFiltersPopoverProps = {
  filters: NurseryWithdrawalsFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<NurseryWithdrawalsFiltersType>>;
  organization: ServerOrganization;
};

export default function NurseryWithdrawalsFiltersPopover({
  filters,
  setFilters,
  organization,
}: NurseryWithdrawalsFiltersPopoverProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [temporalRecord, setTemporalRecord] = useForm<NurseryWithdrawalsFiltersType>({});
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
      fromNurseryIds: undefined,
    });
    handleClose();
  };

  const onDone = () => {
    setFilters(temporalRecord);
    handleClose();
  };

  const addFilter = (filter: keyof NurseryWithdrawalsFiltersType, itemChanged: string) => {
    setTemporalRecord((prev) => {
      return {
        ...prev,
        [filter]: [...(prev[filter] || []), itemChanged],
      };
    });
  };

  const removeFilter = (filter: keyof NurseryWithdrawalsFiltersType, itemChanged: string) => {
    setTemporalRecord((prev) => {
      const oldValues = prev[filter];
      return {
        ...prev,
        [filter]: oldValues?.filter((val) => val.toString() !== itemChanged.toString()),
      };
    });
  };

  const onChangeHandler = (itemChanged: string, selected: any, filter: keyof NurseryWithdrawalsFiltersType) => {
    if (selected) {
      addFilter(filter, itemChanged);
    } else {
      removeFilter(filter, itemChanged);
    }
  };

  const hasFilter = (filterId: keyof NurseryWithdrawalsFiltersType, value: number | string) => {
    return temporalRecord[filterId]?.some((n) => n.toString() === value.toString()) === true;
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='medium' className={classes.iconContainer}>
        <Icon name='filter' className={classes.icon} size='medium' />
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
          <Box className={classes.container}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography fontSize='16px' paddingLeft={theme.spacing(2)} color='#708284'>
                  {strings.FROM_NURSERY}
                </Typography>
                {getAllNurseries(organization).map((n) => (
                  <Grid item xs={12} key={n.id}>
                    <Checkbox
                      id={n.id.toString()}
                      name={n.name}
                      label={n.name}
                      value={hasFilter('fromNurseryIds', n.id)}
                      onChange={(id, value) => onChangeHandler(id, value, 'fromNurseryIds')}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography fontSize='16px' paddingLeft={theme.spacing(2)} color='#708284'>
                  {strings.PURPOSE}
                </Typography>
                {NurseryWithdrawalPurposesValues.map((purpose) => (
                  <Grid item xs={12} key={purpose}>
                    <Checkbox
                      id={purpose}
                      name={purpose}
                      label={purpose}
                      value={hasFilter('purposes', purpose)}
                      onChange={(id, value) => onChangeHandler(id, value, 'purposes')}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Box>
          <div className={classes.footer}>
            <Button label='Reset' onClick={onReset} size='medium' priority='secondary' type='passive' />
            <Button label='Done' onClick={onDone} size='medium' />
          </div>
        </div>
      </Popover>
    </div>
  );
}
