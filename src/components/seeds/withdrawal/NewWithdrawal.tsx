import MomentUtils from '@date-io/moment';
import {
  Box,
  Chip,
  Grid,
  InputAdornment,
  Link,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import React from 'react';
import { AccessionWithdrawal } from '../../../api/types/accessions';
import strings from '../../../strings';
import preventDefault from '../../../utils/preventDefaultEvent';
import useForm from '../../../utils/useForm';
import CancelButton from '../../common/CancelButton';
import Checkbox from '../../common/Checkbox';
import DatePicker from '../../common/DatePicker';
import DialogCloseButton from '../../common/DialogCloseButton';
import Divisor from '../../common/Divisor';
import Dropdown from '../../common/Dropdown';
import SummaryBox from '../../common/SummaryBox';
import TextArea from '../../common/TextArea';
import TextField from '../../common/TextField';
import { FieldError } from '../newAccession';
import { Unit, WEIGHT_UNITS } from '../nursery/NewTest';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
    },
    paper: {
      minWidth: '650px',
    },
  })
);

export interface Props {
  allowWithdrawalInGrams: boolean;
  value?: AccessionWithdrawal;
  seedsAvailable: number;
  open: boolean;
  onClose: (value?: AccessionWithdrawal) => void;
  onDelete: (value: AccessionWithdrawal) => void;
}

function initWithdrawal(withdrawal?: AccessionWithdrawal): AccessionWithdrawal {
  return (
    withdrawal ?? {
      date: moment().format('YYYY-MM-DD'),
      purpose: 'Propagation',
    }
  );
}

export default function NewWithdrawalDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [withdrawRemaining, setWithdrawRemaining] = React.useState(false);
  const [remainingSeeds, setRemainingSeeds] = React.useState(0);
  const [errors, setErrors] = React.useState<FieldError[]>([]);
  const [withdrawalType, setWithdrawalType] = React.useState(
    props.allowWithdrawalInGrams ? 'weight' : 'count'
  );

  const [record, setRecord, onChange] = useForm<AccessionWithdrawal>(
    initWithdrawal(props.value)
  );
  React.useEffect(() => {
    setRecord(initWithdrawal(props.value));
    setWithdrawalType(props.allowWithdrawalInGrams ? 'weight' : 'count');
    setErrors([]);
    if (!props.allowWithdrawalInGrams) {
      setRemainingSeeds(
        props.value?.remainingQuantity?.quantity || props.seedsAvailable
      );
    } else {
      setRemainingSeeds(props.value?.remainingQuantity?.quantity || 0);
    }
    setWithdrawRemaining(false);
  }, [
    props.allowWithdrawalInGrams,
    props.open,
    props.seedsAvailable,
    props.value,
    setRecord,
  ]);

  const handleCancel = () => {
    setRecord(initWithdrawal(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const onQuantityChange = (id: string, _value: unknown) => {
    const value = _value ? parseInt(_value as string, 10) : undefined;
    let newWithdrawnQuantity = {
      units: record.withdrawnQuantity?.units || WEIGHT_UNITS[0].value,
      quantity: record.withdrawnQuantity?.quantity || 0,
      [id]: _value,
    };

    if (withdrawalType === 'count') {
      newWithdrawnQuantity = {
        units: record.withdrawnQuantity?.units || countUnits[0].value,
        quantity: record.withdrawnQuantity?.quantity || 0,
        [id]: _value,
      };

      setRemainingSeeds(
        props.seedsAvailable +
          (props.value?.withdrawnQuantity?.quantity ?? 0) -
          (value ?? 0)
      );
    }
    const newRecord = {
      ...record,
      withdrawnQuantity: newWithdrawnQuantity,
    };

    setRecord(newRecord);
  };

  const onWithdrawRemaining = () => {
    if (withdrawRemaining) {
      setWithdrawRemaining(false);
    } else {
      setWithdrawRemaining(true);
      onQuantityChange(
        'quantity',
        '' +
          (props.seedsAvailable +
            (props.value?.withdrawnQuantity?.quantity ?? 0))
      );
    }
  };

  const countUnits: Unit[] = [{ label: strings.S_SEED_COUNT, value: 'Seeds' }];

  const withdrawalOptions = (includeSeedCount: boolean) => {
    let values = [];
    if (props.allowWithdrawalInGrams) {
      values = [...WEIGHT_UNITS];

      if (includeSeedCount) {
        values.unshift({ label: strings.S_SEED_COUNT, value: 'Seeds' });
      }
    } else {
      values = [...countUnits];
    }

    return values;
  };

  const schedule = new Date(record.date) > new Date();
  const dateSubtext = schedule
    ? strings.formatString(
        strings.SCHEDULING_FOR,
        moment(record.date).format('MMMM Do, YYYY')
      )
    : strings.SCHEDULE_DATE_INFO;
  const submitText = props.value
    ? strings.SAVE_CHANGES
    : schedule
    ? strings.SCHEDULE_WITHDRAWAL
    : strings.WITHDRAW_SEEDS;

  const getErrorText = (id: string) => {
    const error = errors.find((_error) => _error.id === id);

    return error ? error.msg : '';
  };

  const onSeedsRemainingChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (!value) {
      if (errorIndex < 0) {
        newErrors.push({
          id,
          msg: strings.REQUIRED_FIELD,
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setErrors(newErrors);
    setRemainingSeeds(value as number);
  };

  const onSubmitHandler = () => {
    if (withdrawalType === 'weight' && !remainingSeeds) {
      onSeedsRemainingChange('remainingSeeds', '');
    } else {
      handleOk();
    }
  };

  const onChangeRemainingQuantity = (id: string, value: unknown) => {
    const newRemainingQuantity = {
      units: record.remainingQuantity?.units || WEIGHT_UNITS[0].value,
      quantity: record.remainingQuantity?.quantity || 0,
      [id]: value,
    };

    setRecord({
      ...record,
      remainingQuantity: newRemainingQuantity,
    });
    if (id === 'quantity') {
      onSeedsRemainingChange('remainingSeeds', value);
    }
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>New withdrawal</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <SummaryBox
                id='modal-seeds-available'
                title={strings.SEEDS_REMAINING}
                value={`${props.seedsAvailable} ${
                  props.allowWithdrawalInGrams
                    ? WEIGHT_UNITS[0].value
                    : countUnits[0].value
                }`}
                variant={props.seedsAvailable === 0 ? 'zero' : 'default'}
              />
            </Grid>

            <Grid item xs={6}>
              <DatePicker
                id='date'
                value={record.date}
                onChange={onChange}
                label={strings.WITHDRAWN_ON}
                aria-label='Withdraw date'
              />
              <Typography id='date-tip' component='p' variant='body2'>
                {dateSubtext}
              </Typography>
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={6} id='withdrawnQuantity'>
              <TextField
                id='quantity'
                value={record.withdrawnQuantity?.quantity}
                onChange={(id, value) => {
                  setWithdrawRemaining(false);
                  onQuantityChange(id, value);
                }}
                label={strings.SEEDS_WITHDRAWN}
                type='number'
                endAdornment={
                  <InputAdornment position='end'>
                    <Dropdown
                      id='units'
                      label=''
                      selected={
                        props.allowWithdrawalInGrams
                          ? record.withdrawnQuantity?.units ||
                            WEIGHT_UNITS[0].value
                          : countUnits[0].value
                      }
                      values={withdrawalOptions(true)}
                      onChange={onQuantityChange}
                    />
                  </InputAdornment>
                }
              />
              {withdrawalType !== 'weight' && (
                <Checkbox
                  id='withdraw_remaining'
                  name='withdraw_remaining'
                  label={
                    <Typography id='date-tip' component='p' variant='body2'>
                      {strings.WITHDRAW_REMAINING_SEEDS}
                    </Typography>
                  }
                  value={withdrawRemaining}
                  onChange={onWithdrawRemaining}
                />
              )}
            </Grid>
            <Grid item xs={6} id='remainingQuantity'>
              {withdrawalType !== 'weight' && (
                <TextField
                  id='remaining'
                  value={remainingSeeds}
                  disabled={true}
                  onChange={onChangeRemainingQuantity}
                  label={strings.SEEDS_REMAINING}
                />
              )}
              {withdrawalType === 'weight' && (
                <TextField
                  id='quantity'
                  value={record.remainingQuantity?.quantity}
                  onChange={onChangeRemainingQuantity}
                  label={strings.SEEDS_REMAINING}
                  type='Number'
                  endAdornment={
                    <InputAdornment position='end'>
                      <Dropdown
                        id='units'
                        label=''
                        selected={
                          record.remainingQuantity?.units ||
                          WEIGHT_UNITS[0].value
                        }
                        values={withdrawalOptions(false)}
                        onChange={onChangeRemainingQuantity}
                      />
                    </InputAdornment>
                  }
                  required={true}
                  helperText={
                    getErrorText('remainingSeeds') || strings.REQUIRED_FIELD
                  }
                  error={getErrorText('remainingSeeds') ? true : false}
                />
              )}
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='destination'
                value={record.destination}
                onChange={onChange}
                label={strings.DESTINATION}
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='purpose'
                label='Purpose'
                selected={record.purpose}
                values={[
                  { label: strings.PROPAGATION, value: 'Propagation' },
                  {
                    label: strings.OUTREACH_OR_EDUCATION,
                    value: 'Outreach or Education',
                  },
                  { label: strings.RESEARCH, value: 'Research' },
                  { label: strings.BROADCAST, value: 'Broadcast' },
                  {
                    label: strings.SHARE_WITH_ANOTHER_SITE,
                    value: 'Share with Another Site',
                  },
                  { label: strings.OTHER, value: 'Other' },
                ]}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          <Divisor />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextArea
                id='notes'
                value={record.notes}
                onChange={onChange}
                label={strings.NOTES}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='staffResponsible'
                value={record.staffResponsible}
                onChange={onChange}
                label={strings.WITHDRAWN_BY}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={record.id && '100%'} className={classes.actions}>
          {record.id && (
            <Link
              id='delete-withdrawn-button'
              color='secondary'
              href='#'
              onClick={(event: React.SyntheticEvent) => {
                preventDefault(event);
                onDelete(record);
              }}
            >
              <Typography component='p' variant='body2'>
                {strings.DELETE}
              </Typography>
            </Link>
          )}
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='save-withdrawn-button'
              className={classes.submit}
              label={submitText}
              clickable
              color='primary'
              disabled={errors.length > 0}
              onClick={onSubmitHandler}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
