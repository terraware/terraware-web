import DayJSUtils from '@date-io/dayjs';
import { Box, Chip, Grid } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession } from '../../api/types/accessions';
import useForm from '../../utils/useForm';
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
  accession: Accession;
  open: boolean;
  onClose: (value: Accession) => void;
}

export default function NewCutTest(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Accession>(props.accession);

  React.useEffect(() => {
    if (props.open) {
      setRecord(props.accession);
    }
  }, [props.open]);

  const handleCancel = () => {
    if (props.accession) {
      setRecord(props.accession);
    }
    onClose(props.accession);
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog disableBackdropClick disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>Cut test</DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={DayJSUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsFilled'
                value={record.cutTestSeedsFilled}
                onChange={onChange}
                label='Filled Seeds'
                aria-label='Filled seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsEmpty'
                value={record.cutTestSeedsEmpty}
                onChange={onChange}
                label='Empty seeds'
                aria-label='Empty seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsCompromised'
                value={record.cutTestSeedsCompromised}
                onChange={onChange}
                label='Compromised seeds'
                aria-label='Compromised seeds'
                type='number'
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
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
              label='Save changes'
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
