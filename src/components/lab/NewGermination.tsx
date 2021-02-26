import DayJSUtils from '@date-io/dayjs';
import { Box, Chip, Grid, Link, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import dayjs from 'dayjs';
import React from 'react';
import { Germination } from '../../api/types/tests';
import preventDefault from '../../utils/preventDefaultEvent';
import useForm from '../../utils/useForm';
import DatePicker from '../common/DatePicker';
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
  value?: Germination;
  open: boolean;
  onClose: (value?: Germination) => void;
  onDelete: (value: Germination) => void;
}

export default function NewGermination(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord, onChange] = useForm<Germination>(
    initEntry(props.value)
  );

  function initEntry(entry?: Germination): Germination {
    return (
      entry ?? {
        seedsGerminated: 0,
        recordingDate: dayjs().format('YYYY-MM-DD'),
      }
    );
  }

  React.useEffect(() => {
    if (props.open) {
      setRecord(initEntry(props.value));
    }
  }, [props.open]);

  const handleCancel = () => {
    setRecord(initEntry(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>New entry</DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={DayJSUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='seedsGerminated'
                value={record.seedsGerminated}
                onChange={onChange}
                label='Seeds germinated'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                id='recordingDate'
                value={record.recordingDate}
                onChange={onChange}
                label='Recording date'
                aria-label='Recording date'
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={props.value && '100%'} className={classes.actions}>
          {props.value && (
            <Link
              id='deleteGermination'
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
              id='saveGermination'
              className={classes.submit}
              label={props.value ? 'Save changes' : 'Create entry'}
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
