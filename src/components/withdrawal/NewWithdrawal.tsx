import DayJSUtils from '@date-io/dayjs';
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
import dayjs from 'dayjs';
import React from 'react';
import { AccessionWithdrawal } from '../../api/types/accessions';
import strings from '../../strings';
import preventDefault from '../../utils/preventDefaultEvent';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DatePicker from '../common/DatePicker';
import DialogCloseButton from '../common/DialogCloseButton';
import Divisor from '../common/Divisor';
import Dropdown from '../common/Dropdown';
import SummaryBox from '../common/SummaryBox';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';

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
      date: dayjs().format('YYYY-MM-DD'),
      purpose: 'Propagation',
    }
  );
}

export default function NewWithdrawalDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;

  const [record, setRecord, onChange] = useForm<AccessionWithdrawal>(
    initWithdrawal(props.value)
  );
  React.useEffect(() => {
    setRecord(initWithdrawal(props.value));
    setWithdrawalType(props.value?.gramsWithdrawn ? 'weight' : 'count');
  }, [props.open]);

  const [withdrawalType, setWithdrawalType] = React.useState(
    props.value?.gramsWithdrawn ? 'weight' : 'count'
  );

  const handleCancel = () => {
    setRecord(initWithdrawal(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const OnQuantityTypeChange = (id: string, value: string) => {
    const newRecord = {
      ...record,
      seedsWithdrawn: undefined,
      gramsWithdrawn: undefined,
    };

    setWithdrawalType(value);
    setRecord(newRecord);
  };

  const onQuantityChange = (id: string, _value: unknown) => {
    const value = _value ? parseInt(_value as string) : undefined;
    if (withdrawalType === 'weight') {
      setRecord({
        ...record,
        seedsWithdrawn: undefined,
        gramsWithdrawn: value,
      });
    } else {
      setRecord({
        ...record,
        gramsWithdrawn: undefined,
        seedsWithdrawn: value,
      });
    }
  };

  const withdrawalOptions = props.allowWithdrawalInGrams
    ? [
        { label: 'seed count', value: 'count' },
        {
          label: 'g (gram)',
          value: 'weight',
        },
      ]
    : [{ label: 'seed count', value: 'count' }];

  const schedule = new Date(record.date) > new Date();
  const dateSubtext = schedule
    ? strings.formatString(
        strings.SCHEDULING_FOR,
        dayjs(record.date).format('MMMM Do, YYYY')
      )
    : strings.SCHEDULE_DATE_INFO;
  const submitText = props.value
    ? strings.SAVE_CHANGES
    : schedule
    ? strings.SCHEDULE_WITHDRAWAL
    : strings.WITHDRAW_SEEDS;

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
        <MuiPickersUtilsProvider utils={DayJSUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <SummaryBox
                id='modal-seeds-available'
                title={strings.SEEDS_REMAINING}
                value={props.seedsAvailable}
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
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <Box display='flex'>
                <TextField
                  id='quantity'
                  value={record.gramsWithdrawn ?? record.seedsWithdrawn}
                  onChange={onQuantityChange}
                  label={strings.SEEDS_WITHDRAWN}
                  type='number'
                  endAdornment={
                    <InputAdornment position='end'>
                      <Dropdown
                        id='quantityType'
                        label=''
                        selected={withdrawalType}
                        values={withdrawalOptions}
                        onChange={OnQuantityTypeChange}
                      />
                    </InputAdornment>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={6}></Grid>

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
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
