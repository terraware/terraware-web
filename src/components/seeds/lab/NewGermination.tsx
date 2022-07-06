import {
  Dialog,
  DialogTitle,
  Typography,
  DialogContent,
  Grid,
  InputAdornment,
  DialogActions,
  Box,
  Chip,
  Theme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Germination } from 'src/api/types/tests';
import strings from 'src/strings';
import preventDefault from 'src/utils/preventDefaultEvent';
import useForm from 'src/utils/useForm';
import CancelButton from '../../common/CancelButton';
import DatePicker from '../../common/DatePicker';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const useStyles = makeStyles((theme: Theme) => ({
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
  adornment: {
    marginRight: theme.spacing(1),
  },
}));

export interface Props {
  value?: Germination;
  open: boolean;
  onClose: (value?: Germination) => void;
  onDelete: (value: Germination) => void;
}

export default function NewGermination(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord, onChange] = useForm<Germination>(initEntry(props.value));

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
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initEntry(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6'>{strings.NEW_ENTRY}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='seedsGerminated'
                value={record.seedsGerminated}
                onChange={onChange}
                label={strings.SEEDS_GERMINATED}
                type='number'
                endAdornment={
                  <InputAdornment position='end' className={classes.adornment}>
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
        </LocalizationProvider>
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
              to=''
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
