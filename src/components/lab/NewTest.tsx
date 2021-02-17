import DayJSUtils from '@date-io/dayjs';
import { Box, Chip, Grid, Link, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { GerminationTest } from '../../api/types/tests';
import useForm from '../../utils/useForm';
import DatePicker from '../common/DatePicker';
import Divisor from '../common/Divisor';
import Dropdown from '../common/Dropdown';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    cancel: {
      backgroundColor: theme.palette.grey[200],
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
    },
  })
);

export interface Props {
  value?: GerminationTest;
  open: boolean;
  onClose: (value?: GerminationTest) => void;
  onDelete: (value: GerminationTest) => void;
}

function initTest(test?: GerminationTest): GerminationTest {
  return (
    test ?? {
      testType: 'Lab',
    }
  );
}

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();
export default function NewTestDialog(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord, onChange] = useForm<GerminationTest>(
    initTest(props.value)
  );

  React.useEffect(() => {
    setRecord(initTest(props.value));
  }, [props.value]);

  const handleCancel = () => {
    setRecord(initTest(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>New test</DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={DayJSUtils}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <DatePicker
                id='startDate'
                value={record?.startDate}
                onChange={onChange}
                label='Start date'
                aria-label='Start date'
              />
              <Typography component='p' variant='caption'>
                You can schedule a date by selecting a future date.
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='seedType'
                label='Seed type'
                selected={record?.seedType || ''}
                values={[
                  { label: 'Fresh Seeds', value: 'Fresh' },
                  {
                    label: 'Stored Seeds',
                    value: 'Stored',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='substrate'
                label='Substrate'
                selected={record?.substrate || ''}
                values={[
                  { label: 'Nursery Media', value: 'Nursery Media' },
                  {
                    label: 'Agar Petri Dish',
                    value: 'Agar Petri Dish',
                  },
                  { label: 'Paper Petri Dish', value: 'Paper Petri Dish' },
                  {
                    label: 'Other',
                    value: 'Other',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Dropdown
                id='treatment'
                label='Treatment'
                selected={record?.treatment || ''}
                values={[
                  { label: 'Soak', value: 'Soak' },
                  {
                    label: 'Scarify',
                    value: 'Scarify',
                  },
                  {
                    label: 'GA3',
                    value: 'GA3',
                  },
                  {
                    label: 'Stratification',
                    value: 'Stratification',
                  },
                  {
                    label: 'Other',
                    value: 'Other',
                  },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='seedsSown'
                value={record?.seedsSown}
                onChange={onChange}
                label='Seeds sown'
                type='Number'
              />
            </Grid>
          </Grid>
          <Divisor />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextArea
                id='notes'
                value={record?.notes}
                onChange={onChange}
                label='Notes'
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id='staffResponsible'
                value={record?.staffResponsible}
                onChange={onChange}
                label='Staff responsible'
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={record?.id && '100%'} className={classes.actions}>
          {record?.id && (
            <Link
              color='secondary'
              href='#'
              onClick={(event: React.SyntheticEvent) => {
                preventDefault(event);
                onDelete(record);
              }}
            >
              <Typography component='p' variant='body2'>
                Delete
              </Typography>
            </Link>
          )}
          <Box>
            <Chip
              id='cancel'
              className={classes.cancel}
              label='Cancel'
              clickable
              onClick={handleCancel}
            />
            <Chip
              id='submit'
              className={classes.submit}
              label={props.value ? 'Save changes' : 'Create test'}
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
