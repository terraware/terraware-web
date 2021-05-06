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
import { Germination } from '../../api/types/tests';
import strings from '../../strings';
import preventDefault from '../../utils/preventDefaultEvent';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DatePicker from '../common/DatePicker';
import DialogCloseButton from '../common/DialogCloseButton';
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
        recordingDate: moment().format('YYYY-MM-DD'),
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
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
    >
      <DialogTitle>
        <Typography variant='h6'>{strings.NEW_ENTRY}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='seedsGerminated'
                value={record.seedsGerminated}
                onChange={onChange}
                label={strings.SEEDS_GERMINATED}
                type='number'
                endAdornment={
                  <InputAdornment position='end'>
                    {strings.SEED_COUNT.toLowerCase()}
                  </InputAdornment>
                }
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                id='recordingDate'
                value={record.recordingDate}
                onChange={onChange}
                label={strings.RECORDING_DATE}
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
                {strings.DELETE}
              </Typography>
            </Link>
          )}
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveGermination'
              className={classes.submit}
              label={props.value ? strings.SAVE_CHANGES : strings.CREATE_ENTRY}
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
