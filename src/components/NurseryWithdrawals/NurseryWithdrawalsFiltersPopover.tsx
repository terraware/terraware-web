import { Box, Grid, IconButton, Popover, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import Button from '../common/button/Button';
import { Checkbox } from '@terraware/web-components';
import DatePicker from 'src/components/common/DatePicker';
import { getAllNurseries } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { NurseryWithdrawalsFiltersType } from './NurseryWithdrawals';
import { NurseryWithdrawalPurposesValues } from 'src/types/Batch';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite } from 'src/types/Tracking';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';
import moment from 'moment';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { useOrganization } from 'src/providers/hooks';

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
      border: `1px solid ${theme.palette.TwClrBaseGray300}`,
      borderRadius: '8px',
      overflow: 'visible',
    },
  },
  popover: {
    width: (props: StyleProps) => (props.isMobile ? '350px' : '600px'),
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
    maxHeight: 'calc(100vh - 150px)',
    overflow: 'auto',
  },
  footer: {
    background: theme.palette.TwClrBgSecondary,
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
  species?: Species[];
};

export default function NurseryWithdrawalsFiltersPopover({
  filters,
  setFilters,
  species,
}: NurseryWithdrawalsFiltersPopoverProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [temporalRecord, setTemporalRecord] = useForm<NurseryWithdrawalsFiltersType>({});
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const snackbar = useSnackbar();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setTemporalRecord(filters);
  }, [filters, setTemporalRecord]);

  useEffect(() => {
    const populatePlantingSites = async () => {
      const result = await listPlantingSites(selectedOrganization.id);
      if (result.requestSucceeded) {
        setPlantingSites(result.sites);
      } else {
        snackbar.toastError(result.error);
      }
    };
    populatePlantingSites();
  }, [selectedOrganization, snackbar]);

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

  const addStartDate = (value: string) => {
    setTemporalRecord((prev) => {
      return {
        ...prev,
        withdrawnDates: [
          value,
          prev.withdrawnDates && prev.withdrawnDates[1] ? prev.withdrawnDates[1] : getTodaysDateFormatted(),
        ],
      };
    });
  };

  const addEndDate = (value: string) => {
    setTemporalRecord((prev) => {
      return {
        ...prev,
        withdrawnDates: [
          prev.withdrawnDates && prev.withdrawnDates[0]
            ? prev.withdrawnDates[0]
            : moment(new Date(0)).format('YYYY-MM-DD'),
          value,
        ],
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

  const onChangeDate = (id: string, value?: any) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return;
    } else {
      const valueFormatted = moment(value).format('YYYY-MM-DD');
      if (id === 'startDate') {
        addStartDate(valueFormatted);
      } else {
        addEndDate(valueFormatted);
      }
    }
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
              <Grid item xs={4}>
                <Typography fontSize='16px' color={theme.palette.TwClrBaseGray500}>
                  {strings.FROM_NURSERY}
                </Typography>
                {getAllNurseries(selectedOrganization).map((n) => (
                  <Grid item xs={12} key={n.id}>
                    <Checkbox
                      id={n.id.toString()}
                      name={n.name}
                      label={n.name}
                      value={hasFilter('fromNurseryIds', n.id)}
                      onChange={(value) => onChangeHandler(n.id.toString(), value, 'fromNurseryIds')}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={4}>
                <Typography fontSize='16px' color={theme.palette.TwClrBaseGray500}>
                  {strings.PURPOSE}
                </Typography>
                {NurseryWithdrawalPurposesValues.map((purpose) => (
                  <Grid item xs={12} key={purpose}>
                    <Checkbox
                      id={purpose}
                      name={purpose}
                      label={purpose}
                      value={hasFilter('purposes', purpose)}
                      onChange={(value) => onChangeHandler(purpose, value, 'purposes')}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={4}>
                <Typography fontSize='16px' color={theme.palette.TwClrBaseGray500}>
                  {strings.WITHDRAWN_DATE}
                </Typography>
                <DatePicker
                  id='startDate'
                  label={strings.START}
                  aria-label={strings.DATE}
                  value={temporalRecord.withdrawnDates ? temporalRecord.withdrawnDates[0] : ''}
                  onChange={(value) => onChangeDate('startDate', value)}
                />
                <DatePicker
                  id='endDate'
                  label={strings.END}
                  aria-label={strings.DATE}
                  value={temporalRecord.withdrawnDates ? temporalRecord.withdrawnDates[1] : ''}
                  onChange={(value) => onChangeDate('endDate', value)}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography fontSize='16px' color={theme.palette.TwClrBaseGray500}>
                  {strings.DESTINATION}
                </Typography>
                {plantingSites?.map((plantingSite) => (
                  <Grid item xs={12} key={plantingSite.id}>
                    <Checkbox
                      id={plantingSite.name.toString()}
                      name={plantingSite.name}
                      label={plantingSite.name}
                      value={hasFilter('destinationNames', plantingSite.name)}
                      onChange={(value) => onChangeHandler(plantingSite.name.toString(), value, 'destinationNames')}
                    />
                  </Grid>
                ))}
              </Grid>
              <Grid item xs={6}>
                <Typography fontSize='16px' color={theme.palette.TwClrBaseGray500}>
                  {strings.SPECIES}
                </Typography>
                {species?.map((iSpecies) => (
                  <Grid item xs={12} key={iSpecies.id}>
                    <Checkbox
                      id={iSpecies.id.toString()}
                      name={iSpecies.scientificName}
                      label={iSpecies.scientificName}
                      value={hasFilter('speciesId', iSpecies.id)}
                      onChange={(value) => onChangeHandler(iSpecies.id.toString(), value, 'speciesId')}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Box>
          <div className={classes.footer}>
            <Button label={strings.RESET} onClick={onReset} size='medium' priority='secondary' type='passive' />
            <Button label={strings.DONE} onClick={onDone} size='medium' />
          </div>
        </div>
      </Popover>
    </div>
  );
}
