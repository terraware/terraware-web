import { Dialog, DialogTitle, Typography, DialogContent, Grid, DialogActions, Box, Chip, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { Accession } from 'src/api/types/accessions';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Button from 'src/components/common/button/Button';

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
}));

export interface Props {
  accession: Accession;
  open: boolean;
  onClose: (value?: Accession) => void;
}

export default function NewCutTest(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Accession>(props.accession);

  React.useEffect(() => {
    if (props.open) {
      setRecord(props.accession);
    }
  }, [props.accession, props.open, setRecord]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6'>Cut test</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='viabilityTests_seedsFilled'
                value={record.viabilityTests_seedsFilled}
                onChange={onChange}
                label={strings.FILLED_SEEDS}
                aria-label='Filled seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='viabilityTests_seedsEmpty'
                value={record.viabilityTests_seedsEmpty}
                onChange={onChange}
                label={strings.EMPTY_SEEDS}
                aria-label='Empty seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='viabilityTests_seedsCompromised'
                value={record.viabilityTests_seedsCompromised}
                onChange={onChange}
                label={strings.COMPROMISED_SEEDS}
                aria-label='Compromised seeds'
                type='number'
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <Button
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              onClick={handleCancel}
              key='button-1'
              id='cancel'
            />
            <Chip
              id='saveCutTest'
              className={classes.submit}
              label={strings.SAVE_CHANGES}
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
